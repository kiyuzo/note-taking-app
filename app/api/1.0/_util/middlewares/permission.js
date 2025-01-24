import { NextResponse } from "next/server";
import { mysql } from "../mysql";

function getPermissionString(level) {
    switch (level) {
        case 0:
            return "view";
        case 1:
            return "edit";
        case 2:
            return "share";
        case 3:
            return "delete";
    }
    return "";
}

// ret: [true, true]
// err:
// [false, (403) You don't have the permission to [ACTION] this notes]
export async function notesPermission(uID, nID, minLevel) {
    let results;

    try {
        let sqlQuery = `select owner from notes where nID = ?`;
        [results] = await mysql.query(sqlQuery, [nID]);
        if(!results) {throw "Notes not found";}
        if(results.owner === uID) {return [true, true];}

        sqlQuery = `select permission from shared where nID = ? and user_to = ?`;
        [results] = await mysql.query(sqlQuery, [nID, uID]);
        if(!results || results.permission < minLevel) {throw "No permission";}
    } catch (err) {
        return [false, NextResponse.json(`You don't have the permission to ${getPermissionString(minLevel)} this notes`)];
    }
    return [true, true];
}