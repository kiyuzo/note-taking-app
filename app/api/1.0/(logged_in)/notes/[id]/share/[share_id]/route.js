import auth from "@/api/_util/middlewares/auth";
import { notesPermission } from "@/api/_util/middlewares/permission";
import { mysql } from "@/api/_util/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    const nID = (await params).id;
    const [_permSuccess, _errResponse] = await notesPermission(session.uID, nID, 2);
    if(!_permSuccess) {return _errResponse;}

    const sID = (await params).share_id;

    try {
        const sqlQuery = `delete from shared where nID = ? and sID = ?;`;
        await mysql.query(sqlQuery, [nID, sID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json("Share deleted", { status: 200 });
}