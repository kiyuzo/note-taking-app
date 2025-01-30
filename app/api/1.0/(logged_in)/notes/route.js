import { validateNotesBody, validateTags } from "@/api/_util/jsonschema";
import auth from "@/api/_util/middlewares/auth";
import { notesPermission } from "@/api/_util/middlewares/permission";
import { mysql } from "@/api/_util/mysql";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function sqlFilterToString(arr) {
    if(arr.length === 0) {
        return "";
    }

    return "and " + arr.join(" and ");
}

/**
 * 
 * @param {NextRequest} request 
 * @returns 
 */
export async function GET(request) {
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    let limit = parseInt(request.nextUrl.searchParams.get("limit"), 10);
    let lastId = parseInt(request.nextUrl.searchParams.get("lastId"), 10);
    let tags = request.nextUrl.searchParams.get("tags");
    let title = request.nextUrl.searchParams.get("title");

    limit = isNaN(limit) ? parseInt(process.env.MYSQL_DEFAULT_LIMIT) : limit;
    lastId = isNaN(lastId) ? 0 : lastId;
    tags = validateTags(tags) ? tags.split(",") : null;
    title = title ? title.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") : null;

    const shared = request.nextUrl.searchParams.get("shared") === "true" || false;
    const notOwned = request.nextUrl.searchParams.get("notOwned") === "true" || false;
    const notFolder = request.nextUrl.searchParams.get("notFolder") === "true" || false;
    const notNotes = request.nextUrl.searchParams.get("notNotes") === "true" || false;

    let results;
    // Query DB
    try {
        let sqlQuery = [], sqlInput = [], sqlFilter = [];

        const sqlNotFolder = `is_folder != 1`;
        const sqlNotNotes= `is_folder != 0`;
        const sqlTags = `json_contains(tags, ?)`;
        const sqlTitle = `title regexp ?`;

        if(notFolder) {sqlFilter.push(sqlNotFolder);}
        if(notNotes) {sqlFilter.push(sqlNotNotes);}
        if(tags) {sqlFilter.push(sqlTags);}
        if(title) {sqlFilter.push(sqlTitle);}

        const sqlQueryO = `select * from notes where owner = ? and nID > ? ${sqlFilterToString(sqlFilter)}`;
        const sqlQueryS = `select n.* from notes n inner join shared s on
                           s.user_to = ? and n.nID = s.nID and n.nID > ? ${sqlFilterToString(sqlFilter)}`;
        const sqlQueryEnd = ` order by nID limit ?;`;

        if (!notOwned) {
            sqlQuery.push(sqlQueryO);
            sqlInput.push(...[session.uID, lastId]);

            if(tags) {sqlInput.push(JSON.stringify(tags));}
            if(title) {sqlInput.push(title);};
        }

        if (shared) {
            sqlQuery.push(sqlQueryS);
            sqlInput.push(...[session.uID, lastId]);

            if(tags) {sqlInput.push(JSON.stringify(tags));}
            if(title) {sqlInput.push(title);};
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
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    let json, results;

    // Validate body
    try {
        json = await request.json();
        if(!validateNotesBody(json)) {throw "Invalid request body";}
        if(json.parentFolder) {
            const [_permSuccess, _errResponse] = await notesPermission(session.uID, json.parentFolder, 1);
            if(!_permSuccess) {return _errResponse;}
        }
    } catch (err) {
        return NextResponse.json("Invalid request body", { status: 400 })
    }

    // Add to db
    try {
        let sqlQuery = `insert into notes (title, content, tags, is_folder, parent_folder, owner)
                        values (?, ?, ?, ?, ?, ?);`;
        results = await mysql.query(sqlQuery, [json.title, json.isFolder === true ? "" : json.content, JSON.stringify(json.tags), json.isFolder || false, json.parentFolder || null, session.uID]);

        sqlQuery = `select * from notes where nID = ?`;
        [results] = await mysql.query(sqlQuery, [results.insertId]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}