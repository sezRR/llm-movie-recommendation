import { swaggerUI } from '@hono/swagger-ui';
import recommendations from './endpoints/recommendations';
import { openAPISpecs } from 'hono-openapi';
import { Hono, type Context } from 'hono';
import * as crypto from 'crypto'
import { log } from 'console';

/**
 * If btoa and atob are not available in your environment,
 * you can define them via Buffer (Node / Bun).
 */
if (typeof btoa === 'undefined') {
  globalThis.btoa = (str: string): string =>
    Buffer.from(str, 'binary').toString('base64')
}
if (typeof atob === 'undefined') {
  globalThis.atob = (b64Encoded: string): string =>
    Buffer.from(b64Encoded, 'base64').toString('binary')
}


const app = new Hono({ strict: false }).basePath("/");

app.get(
  '/openapi',
  openAPISpecs(app, {
    documentation: {
      info: { title: 'Hono API', version: '1.0.0', description: 'Greeting API' },
      servers: [{ url: 'http://localhost:3000', description: 'Local Server' }],
    },
  })
);

app.get('/docs', swaggerUI({ url: '/openapi' }));

app.route("/recommendations", recommendations)

/////////////////////////////////
//////// AUTHENTICATION  ////////
/////////////////////////////////

function generateJWT(payload: string, secret: string, _expiresIn: string): string {
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
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(data)
  const signature = hmac.digest('base64')
  return base64UrlEncode(signature)
}

function parseKey(key: string): Buffer {
  return crypto.createHash('sha256').update(key).digest()
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

interface DecodedJWT {
  header: Record<string, unknown>
  payload: Record<string, unknown>
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

// Google OAuth callback route
app.get('/auth/callback/google', async (c: Context) => {
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
    const { email, name, picture } = userInfo

    // Create a JWT, store it in a cookie
    const tokenPayload = JSON.stringify({ email, name, picture })
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
app.get('/auth/google', (c: Context) => {
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

app.get('/', (c: Context) => {
  const cookieHeader = c.req.header('Cookie') ?? null
  const cookie = parseCookie(cookieHeader, 'custom_auth')
  if (cookie) {
    const decodedToken = decodeJWT(cookie)
    if (decodedToken) {
      return new Response(JSON.stringify(decodedToken), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  })
})


export default app;
