import { validateNotesBody } from "@/api/_util/jsonschema";
import auth from "@/api/_util/middlewares/auth";
import { notesPermission } from "@/api/_util/middlewares/permission";
import { mysql } from "@/api/_util/mysql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const [_authSuccess, session] = await auth();
    if(!_authSuccess) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 0);
    if(!_permSuccess) {return _errResponse;}
    
    let results;

    // Query DB
    try {
        const sqlQuery = `select * from notes where nID = ?;`;
        [results] = await mysql.query(sqlQuery, [session.uID, nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results || null, { status: 200 });
}

export async function PUT(request, { params }) {
    const [success, session] = await auth();
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 1);
    if(!_permSuccess) {return _errResponse;}

    let json, results;

    // Validate body
    try {
        json = await request.json();
        if(!validateNotesBody(json)) {throw "Invalid request body";}        
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Query DB
    try {
        let sqlQuery = `select is_folder from notes where nID = ?`;
        [results] = await mysql.query(sqlQuery, [nID]);

        sqlQuery = `update notes set title = ?, content = ?, tags = ?, parent_folder = ?
                          where nID = ?;`;
        await mysql.query(sqlQuery, [json.title, results ? "" : json.content, JSON.stringify(json.tags), json.parentFolder, nID]);

        sqlQuery = `select * from notes where nID = ?`;
        [results] = await mysql.query(sqlQuery, [nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}

export async function DELETE(request, { params }) {
    const [success, session] = await auth();
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 2);
    if(!_permSuccess) {return _errResponse;}

    // Query DB
    try {
        const sqlQuery = `delete from notes where nID = ?;`;
        await mysql.query(sqlQuery, [nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("Notes deleted", { status: 200 });
}