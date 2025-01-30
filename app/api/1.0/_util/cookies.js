import { signJWT } from "./crypto";
export async function setSession(cookies, payload) {
    cookies.set("_Host-sessionJWT", signJWT(payload), {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        priority: "high",
        maxAge: parseInt(process.env.SESSION_MINUTES_EXPIRE) * 60 * 1000
    });
}

export async function resetSession(cookies) {
    cookies.set("_Host-sessionJWT", "", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        priority: "high",
        maxAge: 0
    });
}