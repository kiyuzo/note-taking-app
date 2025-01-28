import auth from "@/api/_util/middlewares/auth";
import { notesPermission } from "@/api/_util/middlewares/permission";
import { mysql } from "@/api/_util/mysql";
import { NextResponse } from "next/server";

export async function GET() {
    const [success, session] = await auth();
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 0);
    if(!_permSuccess) {return _errResponse;}

    let results;

    try {
        const sqlQuery = `select * from pinned where uID = ? and nID = ?;`;
        [results] = await mysql.query(sqlQuery, [session.uID, nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results ? true : false, { status: 200 });
}

export async function POST() {
    const [success, session] = await auth();
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 0);
    if(!_permSuccess) {return _errResponse;}

    let results;

    try {
        let sqlQuery = `select * from pinned where uID = ? and nID = ?;`;
        [results] = await mysql.query(sqlQuery, [session.uID, nID]);

        if(!results) {
            sqlQuery = `insert into pinned (nID, uID) values (?, ?);`;
            await mysql.query(sqlQuery, [nID, session.uID]);
        }
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("Notes pinned", { status: 200 });
}

export async function DELETE() {
    const [success, session] = await auth();
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 0);
    if(!_permSuccess) {return _errResponse;}

    try {
        const sqlQuery = `delete from pinned where uID = ? and nID = ?;`;
        await mysql.query(sqlQuery, [session.uID, nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("Notes unpinned", { status: 200 });
}