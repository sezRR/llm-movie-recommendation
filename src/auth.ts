import DecodedJWT from './schemas/auth/decoded-jwt'
import { Context } from 'hono/dist/types/context'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

function generateJWT(payload: string, secret: string, _expiresIn: string): string {
    // TODO: Implement expiresIn
    // FIX: field conventions
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(payload)
    const signature = sign(`${encodedHeader}.${encodedPayload}`, secret)
    return `${encodedHeader}.${encodedPayload}.${signature}`
}

function base64UrlEncode(str: string): string {
    const base64 = btoa(str)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sign(data: string, secret: string): string {
    const key = parseKey(secret)
    const hmac = new Bun.CryptoHasher('sha256', key)
    hmac.update(data)
    const signature = hmac.digest('base64')
    return base64UrlEncode(signature)
}

function parseKey(key: string): Buffer {
    return new Bun.CryptoHasher('sha256').update(key).digest()
}

function parseCookie(cookieHeader: string | null, cookieName: string): string | null {
    if (!cookieHeader) return null
    const cookies = cookieHeader.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=')
        if (name.trim() === cookieName) {
            return value.trim()
        }
    }
    return null
}

function decodeJWT(token: string): DecodedJWT | null {
    const [encodedHeader, encodedPayload] = token.split('.')
    if (!encodedHeader || !encodedPayload) return null
    const header = JSON.parse(base64UrlDecode(encodedHeader))
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    return { header, payload }
}

function base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4)
    const paddedBase64 = base64 + '==='.slice(0, padding)
    return atob(paddedBase64)
}

const app = new Hono();

// Google OAuth callback route
app.get('/callback/google', async (c: Context) => {
    const code = new URL(c.req.url).searchParams.get('code')
    if (!code) {
        return new Response('Missing code parameter', { status: 400 })
    }

    try {
        // Exchange the code for an access token
        const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token')
        tokenEndpoint.searchParams.set('code', code)
        tokenEndpoint.searchParams.set('grant_type', 'authorization_code')
        tokenEndpoint.searchParams.set('client_id', process.env.GOOGLE_ID)
        tokenEndpoint.searchParams.set('client_secret', process.env.GOOGLE_SECRET)
        tokenEndpoint.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT)

        const tokenResponse = await fetch(tokenEndpoint.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenEndpoint.searchParams.toString(),
        })
        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        // Fetch user info using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        const userInfo = await userInfoResponse.json()
        const { email, name, picture, given_name } = userInfo

        // Create a JWT, store it in a cookie
        const tokenPayload = JSON.stringify({ email, name, picture, given_name })
        const cookie = generateJWT(tokenPayload, process.env.AUTH_SECRET, '1h')

        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
                'Set-Cookie': `custom_auth=${cookie}; Path=/; HttpOnly`,
            },
        })
    } catch (error) {
        console.error('Error fetching user info:', error)
        return new Response('Authentication error', { status: 500 })
    }
})

// Google OAuth login route
app.get('/google', (_) => {
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authorizationUrl.searchParams.set('client_id', process.env.GOOGLE_ID)
    authorizationUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT)
    authorizationUrl.searchParams.set('prompt', 'consent')
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', 'openid email profile')
    authorizationUrl.searchParams.set('access_type', 'offline')

    return new Response(null, {
        status: 302,
        headers: {
            Location: authorizationUrl.toString(),
        },
    })
})

export const securityMiddleware = createMiddleware<{
    Variables: {
        token_json: string
    }
}>(async (c, next) => {
    const cookieHeader = c.req.header('Cookie') ?? null
    if (!cookieHeader) {
        return new Response('Unauthorized', { status: 401 })
    }

    const cookie = parseCookie(cookieHeader, 'custom_auth')
    if (!cookie) {
        return new Response('Unauthorized', { status: 401 })
    }

    const decodedToken = decodeJWT(cookie)
    if (!decodedToken) {
        return new Response('Unauthorized', { status: 401 })
    }

    c.set("token_json", JSON.stringify(decodedToken))

    await next();
})

export const Auth = { endpoints: app, securityMiddleware };