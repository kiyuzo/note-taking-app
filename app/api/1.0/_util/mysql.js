import serverlessMysql from "serverless-mysql";

const mysql = serverlessMysql();

mysql.config({
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    database : process.env.DB_DATABASE,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD
});

(async function connect() {
    try {
        await mysql.connect();
        console.log("MySQL Connected!");
    } catch (err) {
        console.error(err);
    }
})();

export { mysql };