import { hash } from "@/api/_util/crypto";
import { validateUpdateUserBody } from "@/api/_util/jsonschema";
import { mysql } from "@/api/_util/mysql";
import { NextResponse } from "next/server";

export async function POST() {
    const [success, session] = await auth();
    if(!success) {return session;}

    let json;

    // Validate body
    try {
        json = await request.json();
        if(!validateUpdateUserBody(json)) {throw "Invalid request body";}
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Update DB
    try {
        const sqlQuery = `update user set username = ?, password = ? where uID = ?;`;
        await mysql.query(sqlQuery, [json.username, hash(json.password), session.uID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("User updated", { status: 200 });
}