import auth from "@/api/_util/middlewares/auth";
import { mysql } from "@/api/_util/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const [success, session] = await auth(await cookies());
    if(!success) {return session;}

    let results;

    try {
        const sqlQuery = `select nID from pinned where uID = ?;`;
        results = await mysql.query(sqlQuery, [session.uID]);
    } catch (err) {
        return NextResponse.json("Server down", { status: 500 });
    }

    return NextResponse.json(results.map(obj => {return obj.nID}), { status: 200 });
}