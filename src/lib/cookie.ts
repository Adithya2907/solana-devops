import type { CookieSerializeOptions } from "cookie";
import type { Cookies } from "@sveltejs/kit";

export function setCookie(cookies: Cookies, key: string, value: object, options: CookieSerializeOptions | undefined = undefined) {
    cookies.set(key, JSON.stringify(value), options);
}

export function getCookie<T>(cookies: Cookies, key: string): T | undefined {
    const value = cookies.get(key);

    if (value !== undefined)
        return JSON.parse(value) as T;
    else
        return undefined;
}