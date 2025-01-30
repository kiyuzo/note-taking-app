import serverlessMysql from "serverless-mysql";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(import.meta.filename, "../../../../../.env");
dotenv.config({path: envPath});

(async function main(){
    const mysql = serverlessMysql();
    mysql.config({
        host     : process.env.DB_HOST,
        port     : process.env.DB_PORT,
        database : process.env.DB_DATABASE,
        user     : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        multipleStatements: true
    });

    await mysql.connect();
    const sqlQuery = (await fs.readFile(path.resolve(import.meta.filename, "../initDB.sql"))).toString("utf-8");
    await mysql.query(sqlQuery);
    await mysql.quit();
    console.log("DB Initiated!");
    return ;
})();