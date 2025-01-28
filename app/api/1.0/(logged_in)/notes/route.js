import { validateNotesBody, validateNumber } from "@/api/_util/jsonschema";
import auth from "@/api/_util/middlewares/auth";
import { mysql } from "@/api/_util/mysql";
import { NextRequest, NextResponse } from "next/server";

/**
 * 
 * @param {NextRequest} request 
 * @returns 
 */
export async function GET(request) {
    const [success, session] = await auth();
    if(!success) {return session;}

    let limit = request.nextUrl.searchParams.get("limit");
    let lastId = request.nextUrl.searchParams.get("lastId");
    limit = validateNumber(limit) ? parseInt(limit) : parseInt(process.env.MYSQL_DEFAULT_LIMIT);
    lastId = validateNumber(lastId) ? parseInt(lastId) : 0;

    const shared = request.nextUrl.searchParams.get("shared") === "true" || false;
    const notOwned = request.nextUrl.searchParams.get("notOwned") === "true" || false;

    let results;
    // Query DB
    try {
        let sqlQuery = [], sqlInput = [];

        const sqlQueryO = `select * from notes where owner = ? and nID > ?`;
        const sqlQueryS = `select n.* from notes n inner join shared s on
                           s.user_to = ? and n.nID = s.nID and n.nID > ?`;
        const sqlQueryEnd = ` order by nID limit ?;`;

        if (!notOwned) {
            sqlQuery.push(sqlQueryO);
            sqlInput.push(...[session.uID, lastId]);
        }

        if (shared) {
            sqlQuery.push(sqlQueryS);
            sqlInput.push(...[session.uID, lastId]);
        }

        sqlQuery = sqlQuery.join(" union ") + sqlQueryEnd;
        sqlInput.push(limit);

        results = await mysql.query(sqlQuery, sqlInput);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}

export async function POST(request) {
    const [success, session] = await auth();
    if(!success) {return session;}

    let json, results;

    // Validate body
    try {
        json = await request.json();
        if(!validateNotesBody(json)) {throw "Invalid request body";}        
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Add to db
    try {
        let sqlQuery = `insert into notes (title, content, tags, is_folder, parent_folder, owner)
                        values (?, ?, ?, ?, ?, ?);`;
        results = await mysql.query(sqlQuery, [json.title, json.content, JSON.stringify(json.tags), json.isFolder || false, json.parentFolder || null, session.uID]);

        sqlQuery = `select * from notes where nID = ?`;
        [results] = await mysql.query(sqlQuery, [results.insertId]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}