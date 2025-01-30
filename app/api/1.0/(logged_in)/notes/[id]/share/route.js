import { validateShareBody } from "@/api/_util/jsonschema";
import auth from "@/api/_util/middlewares/auth";
import { notesPermission } from "@/api/_util/middlewares/permission";
import { mysql } from "@/api/_util/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 0);
    if(!_permSuccess) {return _errResponse;}

    let results;

    // Check DB
    try {
        const sqlQuery = `select * from shared where nID = ?;`;
        results = await mysql.query(sqlQuery, [nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}

export async function POST(request, { params }) {
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 2);
    if(!_permSuccess) {return _errResponse;}

    let json, uID, results;

    // Validate body
    try {
        json = await request.json();
        if(!validateShareBody(json)) {throw "Invalid request body";}        
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Insert to DB
    try {
        // Get uID
        let sqlQuery = `select uID from user where email = ?;`;
        [results] = await mysql.query(sqlQuery, [json.to]);
        if(!results) {throw {code: "ER_NO_USER"};}
        uID = results.uID;

        sqlQuery = `select nID from notes where nID = ?;`;
        [results] = await mysql.query(sqlQuery, [nID]);
        if(!results) {throw {code: "ER_NO_NOTES"};}

        sqlQuery = `select sID from shared where nID = ? and user_to = ?;`;
        [results] = await mysql.query(sqlQuery, [nID, uID]);
        if(!results) {
            // Create
            sqlQuery = `insert into shared (nID, user_from, user_to, permission)
                        values (?, ?, ?, ?);`;
            await mysql.query(sqlQuery, [nID, session.uID, uID, json.permission]);
        } else {
            // Update
            sqlQuery = `update shared set user_from = ?, permission = ? where sID = ?;`;
            await mysql.query(sqlQuery, [session.uID, json.permission, results.sID]);
        }

        sqlQuery = `select * from shared where nID = ? and user_to = ?;`;
        [results] = await mysql.query(sqlQuery, [nID, uID]);
    } catch (err) {
        if(err.code === "ER_NO_USER") {
            return NextResponse.json("User not found", { status: 404 });
        }

        if(err.code === "ER_NO_NOTES") {
            return NextResponse.json("Notes not found", { status: 404 });
        }

        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}