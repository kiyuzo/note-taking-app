import { NextResponse } from "next/server";
import { verifyJWT } from "@/api/_util/crypto";
import { resetSession } from "../cookies";

// ret: [true, JWT Object]
// err: [false, (403) No session] | [false, (403) Invalid Session]
export default async function auth(cookie) {
    const jwt = cookie.get("_Host-sessionJWT");
    if(!jwt) {
        const response = NextResponse.json("No session", { status: 403 });
        resetSession(cookie);
        return [false, response];
    }

    const results = await verifyJWT(jwt.value);
    if(!results) {
        const response = NextResponse.json("Invalid session", { status: 403 });
        resetSession(cookie);
        return [false, response];
    }

    return [true, results];
}