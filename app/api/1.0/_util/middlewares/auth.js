import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/api/_util/crypto";

// ret: [true, JWT Object]
// err: [false, (403) No session] | [false, (403) Invalid Session]
export default async function auth() {
    const jwt = (await cookies()).get("_Host-sessionJWT");
    if(!jwt) {return [false, NextResponse.json("No session", { status: 403 })];}

    const results = await verifyJWT(jwt.value);
    if(!results) {return [false, NextResponse.json("Invalid session", { status: 403 })];}

    return [true, results];
}