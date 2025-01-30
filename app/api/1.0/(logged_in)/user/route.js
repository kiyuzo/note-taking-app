import { validateUpdateUserBody } from "@/api/_util/jsonschema";
import { setSession } from "@/api/_util/cookies";
import { hash } from "@/api/_util/crypto";
import auth from "@/api/_util/middlewares/auth";
import { mysql } from "@/api/_util/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookie = await cookies();
    const [success, session] = await auth(cookie);
    if(!success) {return session;}

    let results;

    // Search database
    try {
        const sqlQuery = `select * from user where uID = ?;`;
        [results] = await mysql.query(sqlQuery, [session.uID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    // Set JWT (exclude password)
    const payload = {...results};
    payload.password = undefined;
    delete payload.password;

    const response = NextResponse.json(payload, { status: 200 });
    setSession(cookie, payload);

    return response;
}

export async function POST(request) {
    const cookie = await cookies();
    const [success, session] = await auth(cookie);
    if(!success) {return session;}

    let json, results;

    // Validate body
    try {
        json = await request.json();
        if(!validateUpdateUserBody(json)) {throw "Invalid request body";}
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Update DB
    try {
        let sqlQuery = `update user set username = ?, password = ? where uID = ?;`;
        await mysql.query(sqlQuery, [json.username, hash(json.password), session.uID]);

        sqlQuery = `select * from user where uID = ?;`;
        [results] = await mysql.query(sqlQuery, [session.uID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    const response = NextResponse.json("User updated", { status: 200 });
    const payload = {...results};
    payload.password = undefined;
    delete payload.password;
    setSession(cookie, payload);
    return response;
}