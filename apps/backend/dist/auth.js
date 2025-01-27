"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = exports.securityMiddleware = void 0;
const hono_1 = require("hono");
const factory_1 = require("hono/factory");
const env_1 = require("./config/env");
function generateJWT(payload, secret, expiresIn) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + parseExpiresIn(expiresIn);
    const fullPayload = { ...payload, iat: issuedAt, exp: expiration };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = sign(`${encodedHeader}.${encodedPayload}`, secret);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
function parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match)
        throw new Error('Invalid expiresIn format');
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: throw new Error('Invalid time unit');
    }
}
function base64UrlEncode(str) {
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sign(data, secret) {
    const key = parseKey(secret);
    const hmac = new Bun.CryptoHasher('sha256', key);
    hmac.update(data);
    const signature = hmac.digest('base64');
    return base64UrlEncode(signature);
}
function parseKey(key) {
    return new Bun.CryptoHasher('sha256').update(key).digest();
}
function parseCookie(cookieHeader, cookieName) {
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name.trim() === cookieName) {
            return value.trim();
        }
    }
    return null;
}
function decodeJWT(token) {
    const [encodedHeader, encodedPayload] = token.split('.');
    if (!encodedHeader || !encodedPayload)
        return null;
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && currentTime > payload.exp) {
        console.error('Token is expired');
        return null;
    }
    return { header, payload };
}
function base64UrlDecode(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
    const paddedBase64 = base64 + '==='.slice(0, padding);
    return atob(paddedBase64);
}
function createPayload(email, name, picture, given_name) {
    return { sub: email, name, picture, given_name };
}
const env = (0, env_1.validateEnv)();
const app = new hono_1.Hono();
// Google OAuth callback route
app.get('/callback/google', async (c) => {
    const code = new URL(c.req.url).searchParams.get('code');
    if (!code) {
        return new Response('Missing code parameter', { status: 400 });
    }
    try {
        // Exchange the code for an access token
        const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token');
        tokenEndpoint.searchParams.set('code', code);
        tokenEndpoint.searchParams.set('grant_type', 'authorization_code');
        tokenEndpoint.searchParams.set('client_id', env.GOOGLE_ID);
        tokenEndpoint.searchParams.set('client_secret', env.GOOGLE_SECRET);
        tokenEndpoint.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT);
        const tokenResponse = await fetch(tokenEndpoint.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenEndpoint.searchParams.toString(),
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        // Fetch user info using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoResponse.json();
        const { email, name, picture, given_name } = userInfo;
        // Create a JWT, store it in a cookie
        const tokenPayload = createPayload(email, name, picture, given_name);
        const cookie = generateJWT(tokenPayload, env.AUTH_SECRET, env.JWT_EXPIRATION);
        return new Response(null, {
            status: 302,
            headers: {
                Location: 'http://localhost:5173/', // TODO: CHANGE THIS TO THE FRONTEND URL
                'Set-Cookie': `custom_auth=${cookie}; Path=/; HttpOnly`,
            },
        });
    }
    catch (error) {
        console.error('Error fetching user info:', error);
        return new Response('Authentication error', { status: 500 });
    }
});
// Google OAuth login route
app.get('/google', (_) => {
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.searchParams.set('client_id', env.GOOGLE_ID);
    authorizationUrl.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT);
    authorizationUrl.searchParams.set('prompt', 'consent');
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', 'openid email profile');
    authorizationUrl.searchParams.set('access_type', 'offline');
    return new Response(null, {
        status: 302,
        headers: {
            Location: authorizationUrl.toString(),
        },
    });
});
exports.securityMiddleware = (0, factory_1.createMiddleware)(async (c, next) => {
    const cookieHeader = c.req.header('Cookie') ?? null;
    if (!cookieHeader) {
        return new Response('Unauthorized', { status: 401 });
    }
    const cookie = parseCookie(cookieHeader, 'custom_auth');
    if (!cookie) {
        return new Response('Unauthorized', { status: 401 });
    }
    const decodedToken = decodeJWT(cookie);
    if (!decodedToken) {
        return new Response('Unauthorized', { status: 401 });
    }
    c.set("token_json", JSON.stringify(decodedToken));
    await next();
});
exports.Auth = { endpoints: app, securityMiddleware: exports.securityMiddleware };
