import { NextResponse } from "next/server";
import { validateRegisterBody } from "@/api/_util/jsonschema";
import { mysql } from "@/api/_util/mysql";
import { hash } from "@/api/_util/crypto";

export async function POST(request) {
    let json;

    // Validate Input
    try {
        json = await request.json();
        if(!validateRegisterBody(json)) {throw "Invalid request body";}        
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Add to database
    try {
        const sqlQuery = `insert into user (username, email, password) values (?, ?, ?);`;
        await mysql.query(sqlQuery, [json.username, json.email, hash(json.password)]);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return NextResponse.json("User already registered", { status: 409 });
        }
        console.log(err);
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("User registered", { status: 200 });
}