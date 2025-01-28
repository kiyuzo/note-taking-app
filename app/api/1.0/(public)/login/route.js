import { NextResponse } from "next/server";
import { validateLoginBody } from "@/api/_util/jsonschema";
import { mysql } from "@/api/_util/mysql";
import { hash, signJWT } from "@/api/_util/crypto";
import { cookies } from "next/headers";

export async function POST(request) {
    let json, results;

    // Validate Input
    try {
        json = await request.json();
        if(!validateLoginBody(json)) {throw "Invalid request body";}        
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Search database
    try {
        const sqlQuery = `select * from user where email = ? and password = ?;`;
        [results] = await mysql.query(sqlQuery, [json.email, hash(json.password)]);
        if(!results) {throw {code: "ER_NO_MATCH_CRED"};}
    } catch (err) {
        if (err.code === "ER_NO_MATCH_CRED") {
            return NextResponse.json("No matching credentials", { status: 404 });
        }
        return NextResponse.json("Server down", { status: 500 });
    }

    // Set JWT (exclude password)
    const payload = {...results};
    payload.password = undefined;
    delete payload.password;

    const response = NextResponse.json(payload, { status: 200 });
    (await cookies()).set("_Host-sessionJWT", signJWT(payload), {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        priority: "high",
        maxAge: parseInt(process.env.SESSION_MINUTES_EXPIRE) * 60 * 1000
    });

    return response;
}