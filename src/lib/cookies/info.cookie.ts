import type { CookieSerializeOptions } from "cookie";

export const InfoCookie = 'info';

export const InfoCookieOptions: CookieSerializeOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 30,
    secure: false
};