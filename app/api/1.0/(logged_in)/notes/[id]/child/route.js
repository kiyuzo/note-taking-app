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

    try {
        const sqlQuery = `select * from notes where parent_folder = ?;`;
        results = await mysql.query(sqlQuery, [nID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results, { status: 200 });
}