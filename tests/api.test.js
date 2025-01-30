import serverlessMysql from "serverless-mysql";
import fs from "fs/promises";
import path from "path";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from "axios";

const BASE_URL="http://localhost:3000/api/1.0/";

const publicAxios = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

/**
 * @type {Array<AxiosInstance>}
 */
let userAxios = [];
let notes = [];
let shares = [];

/**
 * 
 * @param {AxiosInstance} axiosInstance 
 * @param {Method} method 
 * @param {String} path 
 * @param {Object} data 
 * @param {AxiosRequestConfig} config 
 * @param {String} message 
 * @param {Number} statusCode 
 */
async function expectsError(axiosInstance, method, path, data, config, message, statusCode) {
    try {
        if(method === "put" || method === "PUT" || method === "post" || method === "POST" || data) {
            await axiosInstance[method](path, data, config);
        } else {
            await axiosInstance[method](path, config);
        }
    } catch (err) {
        expect(err.response.data).toBe(message);
        expect(err.response.status).toBe(statusCode);
        return err;
    }

    expect(false).toBe(true);
}

const userCredentials = [
    {username: "root", email: "root@gmail.com", password: "SIGMA"},
    {username: "0", email: "nol@gmail.com", password: "SIGMA"},
    {username: "1", email: "satu@gmail.com", password: "SIGMA"},
    {username: "2", email: "dua@gmail.com", password: "SIGMA"},
    {username: "3", email: "tiga@gmail.com", password: "SIGMA"}
];

const mysql = serverlessMysql();
mysql.config({
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT,
    database : process.env.DB_DATABASE,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    multipleStatements: true
});

describe("API Testing", ()=>{
    beforeAll(async ()=>{
        await mysql.connect();
        const sqlQuery = (await fs.readFile(path.resolve(__filename, "../../app/api/1.0/_dev/initDB.sql"))).toString("utf-8");
        await mysql.query(sqlQuery);
    });

    afterAll(async ()=>{
        await mysql.quit();
    });

    describe("(public)", ()=>{
        describe("POST /register", ()=>{
            it("Rejects invalid body", async ()=>{
                await expectsError(publicAxios, "post", "/register", {}, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/register",
                {
                    username: "Sigmaboi",
                    email: 123,
                    password: "Lol"
                }, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/register",
                {
                    username: "Sigmaboi",
                    email: "atila@gmail.com",
                    password: "Lol",
                    properti: "WEUOW"
                }, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/register",
                    {
                        username: "Sigmaboi",
                        password: "LOL"
                    }, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/register",
                userCredentials[0],
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }, "Invalid request body", 400);
            });

            it("Register a user", async ()=>{
                for (let i = 0; i < userCredentials.length; i++) {
                    const res = await publicAxios.post("/register", userCredentials[i]);                    
                    expect(res.data).toBe("User registered");
                }
            });

            it("Rejects duplicate user", async ()=>{
                await expectsError(publicAxios, "post", "/register", userCredentials[0], null, "User already registered", 409);
            });
        });

        describe("POST /login", ()=>{
            it("Rejects invalid body", async ()=>{
                await expectsError(publicAxios, "post", "/login", {}, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/login",
                {
                    email: 123,
                    password: "Lol"
                }, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/login",
                {
                    email: "atila@gmail.com",
                    password: "Lol",
                    properti: "WEUOW"
                }, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/login",
                {password: "LOL"}, {}, "Invalid request body", 400);
                await expectsError(publicAxios, "post", "/login",
                {email: userCredentials[0].email, password: userCredentials[0].password},
                {headers: {"Content-Type": "application/x-www-form-urlencoded"}}, "Invalid request body", 400);
            });

            it("Rejects no matching credentials", async ()=>{
                await expectsError(publicAxios, "post", "/login", {email: "abek@mail.com", password: "sigma"}, {}, "No matching credentials", 404);
            });

            it("Returns JWT session cookie", async ()=>{
                for (let i = 0; i < userCredentials.length; i++) {
                    const res = await publicAxios.post("/login", {email: userCredentials[i].email, password: userCredentials[i].password});
                    expect(res.headers["set-cookie"][0]).toMatch(/^_Host-sessionJWT=/);
                    userAxios.push(axios.create({
                        baseURL: BASE_URL,
                        withCredentials: true,
                        headers: {
                            "Cookie": res.headers["set-cookie"][0]
                        }
                    }));
                }
            });
        });
    });

    describe("(logged_in)", ()=>{
        // beforeEach check no session
        // beforeEach check invalid session
        let nowMethod = "get";
        let nowPath = "/user";

        beforeEach(async ()=>{
            /**
             * @type {[AxiosError]}
             */
            const res = [
                await expectsError(publicAxios, nowMethod, nowPath, null, {}, "No session", 403),
                await expectsError(publicAxios, nowMethod, nowPath, null, {headers: {"Cookie": "_Host-sessionJWT=sigmaa;"}}, "Invalid session", 403)
            ];

            // Expects Cookie reset
            for (let i = 0; i < res.length; i++) {
                expect(res[i].response.headers["set-cookie"][0]).toMatch(/^_Host-sessionJWT=.*Max-Age=0;/)                
            }
        });

        describe("GET /user", ()=>{
            afterAll(()=>{
                nowMethod = "post";
                nowPath = "/user";
            });

            it("Returns user credentials", async ()=>{
                const res = await userAxios[0].get("/user");
                expect(Object.keys(res.data)).toEqual(["uID", "username", "email", "created_at", "updated_at"]);
            });
        });

        describe("POST /user", ()=>{
            afterAll(()=>{
                nowMethod = "post";
                nowPath = "/notes";
            });

            it("Rejects invalid body", async ()=>{
                await expectsError(userAxios[0], "post", "/user", {}, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/user",
                {
                    username: 123,
                    password: userCredentials[0].password
                }, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/user",
                {
                    username: "Atilbek",
                    password: userCredentials[0].password,
                    properti: "WEUOW"
                }, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/user",
                {password: userCredentials[0].password}, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/user",
                {username: "Atilbek", password: userCredentials[0].password},
                {headers: {"Content-Type": "application/x-www-form-urlencoded"}}, "Invalid request body", 400); 
            });

            it("Update user information", async ()=>{
                await userAxios[0].post("/user", {username: "Atilbek", password: "akubeki"});
                const res = await publicAxios.post("/login", {email: userCredentials[0].email, password: "akubeki"});
                expect(res.data).toBeDefined();
                userCredentials[0].username = "Atilbek";
                userCredentials[0].password = "akubeki";
                userAxios[0] = axios.create({
                    baseURL: BASE_URL,
                    headers: {"Cookie": res.headers["set-cookie"][0]}
                });

                const res2 = await userAxios[0].get("/user");
                expect(res2.data.username).toEqual("Atilbek");
            });
        });

        describe("POST /notes", ()=>{
            afterAll(()=>{
                nowMethod = "get";
                nowPath = "/notes/1";
            });

            it("Rejects invalid request body", async ()=>{
                await expectsError(userAxios[0], "post", "/notes", {}, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/notes",
                {
                    title: 123,
                    tags: [],
                    content: "",
                    isFolder: true,
                    parentFolder: null
                }, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/notes",
                {
                    title: 123,
                    tags: [],
                    content: "",
                    isFolder: true,
                    parentFolder: null,
                    properti: "SIGMA"
                }, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/notes",
                {title: "LOL"}, {}, "Invalid request body", 400);
                await expectsError(userAxios[0], "post", "/notes",
                {
                    title: "Ini notesku",
                    tags: [],
                    content: "",
                    isFolder: true,
                    parentFolder: null
                },
                {headers: {"Content-Type": "application/x-www-form-urlencoded"}}, "Invalid request body", 400); 
                await expectsError(userAxios[0], "post", "/notes",
                {
                    title: "Ini notesku",
                    tags: [",,sim1"],
                    content: "",
                    isFolder: true,
                    parentFolder: null
                }, {}, "Invalid request body", 400); 
            });

            it("Create notes", async ()=>{
                notes = [
                    null,
                    (await userAxios[0].post("/notes", {
                        title: "Notes #1",
                        tags: [],
                        content: ""
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Notes #2",
                        tags: ["notes"],
                        content: "SIGMA",
                        isFolder: false
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Folder #3",
                        tags: ["folder"],
                        content: "SIGMA",
                        isFolder: true
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Notes #4",
                        tags: ["notes"],
                        content: "SIGMA",
                        parentFolder: 3
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Notes #5",
                        tags: ["notes"],
                        content: "SIGMA",
                        isFolder: true,
                        parentFolder: 3
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Folder #6",
                        tags: ["folder"],
                        content: "SIGMA",
                        isFolder: true,
                        parentFolder: null
                    })).data,
                    (await userAxios[0].post("/notes", {
                        title: "Notes #7",
                        tags: ["notes"],
                        content: "SIGMA",
                        isFolder: false,
                        parentFolder: null
                    })).data
                ];

                for (let i = 1; i < notes.length; i++) {
                    expect(notes[i]).toBeDefined();
                }
            });

            it("Neglects content on folder", async ()=>{
                expect(notes[3].content).toBe("");
                expect(notes[7].content).toBe("SIGMA");
            });
            
            it("Rejects creation of notes on not found notes parent folder", async ()=>{
                await expectsError(userAxios[1], "post", "/notes", {
                    title: "Notes #5",
                    tags: ["notes"],
                    content: "SIGMA",
                    isFolder: false,
                    parentFolder: 999
                }, {}, "You don't have the permission to edit this notes", 403);
            });

            it("Rejects creation of notes on no access parent folder", async ()=>{
                await expectsError(userAxios[1], "post", "/notes", {
                    title: "Notes #5",
                    tags: ["notes", "tapisigma"],
                    content: "SIGMA",
                    isFolder: false,
                    parentFolder: 3
                }, {}, "You don't have the permission to edit this notes", 403);
            });

            it("Rejects creation of notes on not folder parent folder", async ()=>{
                await expectsError(userAxios[1], "post", "/notes", {
                    title: "Notes #5",
                    tags: ["notes"],
                    content: "SIGMA",
                    isFolder: false,
                    parentFolder: 7
                }, {}, "You don't have the permission to edit this notes", 403);
            });
        });

        describe("/notes/{id}", ()=>{
            // beforeEach check randomNotesID
            // beforeEach check permission
            let permissionLevel = 0;
            let permissionText = "view";

            beforeEach(async ()=>{
                await expectsError(userAxios[4], nowMethod, nowPath, null, {}, `You don't have the permission to ${permissionText} this notes`, 403);
            });
            
            describe("GET /notes/{id}", ()=>{
                afterAll(()=>{
                    nowMethod = "put";
                    nowPath = "/notes/1";
                    permissionLevel = 1;
                    permissionText = "edit";
                });

                it("Returns NotesObject", async ()=>{
                    for (let i = 1; i <= 7; i++) {
                        expect( (await userAxios[0].get("/notes/"+i)).data ).toEqual(notes[i]);
                    }
                });
            });

            describe("PUT /notes/{id}", ()=>{
                afterAll(()=>{
                    nowMethod = "delete";
                    nowPath = "/notes/1";
                    permissionLevel = 3;
                    permissionText = "delete";
                });

                it("Rejects invalid request body", async ()=>{
                    await expectsError(userAxios[0], "put", "/notes/1", {}, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "put", "/notes/1",
                    {
                        title: 123,
                        tags: [],
                        content: "",
                        isFolder: true,
                        parentFolder: null
                    }, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "put", "/notes/1",
                    {
                        title: 123,
                        tags: [],
                        content: "",
                        isFolder: true,
                        parentFolder: null,
                        properti: "SIGMA"
                    }, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "put", "/notes/1",
                    {title: "LOL"}, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "put", "/notes/1",
                    {
                        title: "Ini notesku",
                        tags: [],
                        content: "",
                        isFolder: true,
                        parentFolder: null
                    },
                    {headers: {"Content-Type": "application/x-www-form-urlencoded"}}, "Invalid request body", 400); 
                });

                it("Update notes", async ()=>{
                    const updatedNotes = {
                        title: "Notes #3",
                        tags: ["notes", "updated"],
                        content: "Watdehohok",
                        isFolder: false,
                        parentFolder: 6
                    };

                    const crossCheck = {
                        title: "Notes #3",
                        tags: ["notes", "updated"],
                        content: "",
                        "is_folder": 1,
                        "parent_folder": 6,
                        owner: 1,
                        nID: 3
                    };
                    const {data} = await userAxios[0].put("/notes/3", updatedNotes, {});
                    delete data["created_at"];
                    delete data["updated_at"];
                    expect(data).toEqual(crossCheck);
                });

                it("Doesn't update child notes", async ()=>{
                    expect((await userAxios[0].get("/notes/4")).data).toEqual(notes[4]);
                });
            });

            describe("DELETE /notes/{id}", ()=>{
                afterAll(()=>{
                    nowMethod = "get";
                    nowPath = "/notes/1/child";
                    permissionLevel = 0;
                    permissionText = "view";
                });


                it("Delete notes", async ()=>{
                    await userAxios[0].post("/notes", {
                        title: "Coba coba",
                        tags: ["notes", "cobacoba"],
                        content: "sifhais",
                        isFolder: false,
                        parentFolder: null
                    });

                    await userAxios[0].post("/notes", {
                        title: "Coba coba",
                        tags: ["notes", "cobacoba"],
                        content: "sifhais",
                        isFolder: false,
                        parentFolder: 8
                    });
                    expect((await userAxios[0].delete("/notes/8")).data).toBe("Notes deleted");
                    await expectsError(userAxios[0], "get", "/notes/8", null, {}, "You don't have the permission to view this notes", 403);
                });

                it("Delete child notes", async ()=>{
                    await expectsError(userAxios[0], "get", "/notes/9", null, {}, "You don't have the permission to view this notes", 403);
                });
            });

            describe("GET /notes/{id}/child", ()=>{
                afterAll(()=>{
                    nowMethod = "post";
                    nowPath = "/notes/1/share";
                    permissionLevel = 2;
                    permissionText = "share";
                });

                it("Get child of a folder", async ()=>{
                    expect((await userAxios[0].get("/notes/3/child")).data.length).toBe(2);
                });
            });

            describe("POST /notes/{id}/share", ()=>{
                afterAll(()=>{
                    nowMethod = "get";
                    nowPath = "/notes/1/share";
                    permissionLevel = 0;
                    permissionText = "view";
                });

                it("Rejects invalid request body", async ()=>{
                    await expectsError(userAxios[0], "post", "/notes/3/share", {}, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "post", "/notes/3/share",
                    {
                        to: userCredentials[0].email,
                        permission: 9
                    }, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "post", "/notes/3/share",
                    {
                        to: userCredentials[0].email,
                        permission: 0,
                        properti: "SIGMA"
                    }, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "post", "/notes/3/share",
                    {permission: 0}, {}, "Invalid request body", 400);
                    await expectsError(userAxios[0], "post", "/notes/3/share",
                    {
                        to: userCredentials[0].email,
                        permission: 0
                    },
                    {headers: {"Content-Type": "application/x-www-form-urlencoded"}}, "Invalid request body", 400); 
                });

                it("Rejects invalid user", async ()=>{
                    await expectsError(userAxios[0], "post", "notes/3/share", {
                        to: "sigmaboiiiii@bebekiii.mail.com",
                        permission: 3
                    }, {}, "User not found", 404);
                });

                it("Share a notes with permission", async ()=>{
                    const permissionObj = await userAxios[0].post("/notes/3/share", {
                        to: userCredentials[1].email,
                        permission: 3
                    });

                    
                    expect(permissionObj.data).toBeDefined();
                    shares.push(permissionObj.data);
                    await userAxios[1].get("/notes/4");
                });

                it("Override the notes privilege", async ()=>{
                    await userAxios[0].post("/notes/3/share", {
                        to: userCredentials[2].email,
                        permission: 3
                    });

                    shares.push((await userAxios[1].post("/notes/3/share", {
                        to: userCredentials[2].email,
                        permission: 0
                    })).data );

                    await expectsError(userAxios[2], "post", "/notes/3/share", {
                        to: userCredentials[3].email,
                        permission: 3
                    }, {}, "You don't have the permission to share this notes", 403);
                });
            });

            describe("GET /notes/{id}/share", ()=>{
                afterAll(()=>{
                    nowMethod = "delete";
                    nowPath = "/notes/1/share/1";
                    permissionLevel = 2;
                    permissionText = "share";
                });

                it("Returns array of PermissionObject", async ()=>{
                    const { data } = await userAxios[2].get("/notes/3/share");
                    expect(data.length).toBe(2);
                });
            });

            describe("DELETE /notes/{id}/share/{share_id}", ()=>{
                afterAll(()=>{
                    nowMethod = "post";
                    nowPath = "/notes/1/pin";
                    permissionLevel = 0;
                    permissionText = "view";
                });

                it("Deletes shares", async ()=>{
                    let sID = await userAxios[0].post("/notes/3/share", {
                        to: userCredentials[3].email,
                        permission: 0
                    });
                    sID = sID.data.sID;
                    expect((await userAxios[0].delete("/notes/3/share/"+sID)).data).toBe("Share deleted");
                    await expectsError(userAxios[3], "get", "/notes/6", null, {}, "You don't have the permission to view this notes", 403);
                });
            });

            describe("POST /notes/{id}/pin", ()=>{
                afterAll(()=>{
                    nowMethod = "get";
                    nowPath = "/notes/1/pin";
                    permissionLevel = 0;
                    permissionText = "view";
                });

                it("It pins notes", async ()=>{
                    expect((await userAxios[0].post("/notes/1/pin")).data).toBe("Notes pinned");
                    expect((await userAxios[0].post("/notes/3/pin")).data).toBe("Notes pinned");
                });
            });

            describe("GET /notes/{id}/pin", ()=>{
                afterAll(()=>{
                    nowMethod = "delete";
                    nowPath = "/notes/1/pin";
                    permissionLevel = 0;
                    permissionText = "view";
                });

                it("Check if note is pinned", async ()=>{
                    expect((await userAxios[0].get("/notes/1/pin")).data).toBe(true);
                    expect((await userAxios[0].get("/notes/2/pin")).data).toBe(false);
                });

                it("Revert if pinned notes is no longer shared", async ()=>{
                    expect((await userAxios[2].post("/notes/3/pin")).data).toBe("Notes pinned");
                    expect((await userAxios[0].delete("/notes/3/share/"+2)).data).toBe("Share deleted");
                    expect((await userAxios[2].get("/notes/pin")).data.length).toBe(0);
                });
            });

            describe("DELETE /notes/{id}/pin", ()=>{
                afterAll(()=>{
                    nowMethod = "get";
                    nowPath = "/notes/shared";
                    permissionLevel = 0;
                    permissionText = "view";
                });

                it("Unpins note", async ()=>{
                    expect((await userAxios[0].delete("/notes/1/pin")).data).toBe("Notes unpinned");
                    expect((await userAxios[0].get("/notes/1/pin")).data).toBe(false);
                });
            });
        });

        describe("GET /notes/shared", ()=>{
            afterAll(()=>{
                nowMethod = "get";
                nowPath = "/notes/pin";
            });

            it("Returns array of PermissionObject", async ()=>{
                expect((await userAxios[1].get("/notes/shared")).data.length).toBe(1);
                expect((await userAxios[0].get("/notes/shared")).data.length).toBe(0);
            });
        });

        describe("GET /notes/pin", ()=>{
            afterAll(()=>{
                nowMethod = "get";
                nowPath = "/notes";
            });

            it("Returns array of NotesID", async ()=>{
                expect((await userAxios[0].get("/notes/pin")).data[0]).toBe(3);
            });
        });

        describe("GET /notes", ()=>{
            let createdNotes = [];
            beforeAll(async ()=>{
                createdNotes = [
                    (await userAxios[1].post("/notes", {
                        title: "Coba coba",
                        tags: ["notes", "cobacoba"],
                        content: "sifhais",
                        isFolder: false,
                        parentFolder: null
                    })).data
                ];

                await userAxios[1].post(`/notes/${createdNotes[0].nID}/share`, {
                    to: userCredentials[0].email,
                    permission: 3
                });
            });

            it("Returns all notes (including shared)", async ()=>{
                const res = await userAxios[0].get("/notes?shared=true");
                expect(res.data.length).toBe(8);
            });

            it("Returns owned notes", async () => {
                const res = await userAxios[0].get("/notes");
                expect(res.data.length).toBe(7);
            });

            it("Returns shared notes", async () => {
                const res = await userAxios[0].get("/notes?shared=true&notOwned=true");
                expect(res.data.length).toBe(1);
            });

            it("Returns 0 notes (on 3 cases)", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&limit=0");
                expect(res.data.length).toBe(0);

                res = await userAxios[0].get("/notes?limit=0");
                expect(res.data.length).toBe(0);

                res = await userAxios[0].get("/notes?shared=true&limit=0");
                expect(res.data.length).toBe(0);
            });

            it("Does pagination on owned notes", async () => {
                let res = await userAxios[0].get("/notes?lastId=1");
                expect(res.data.length).toBe(6);
            });

            it("Does pagination on all notes", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&lastId=1&limit=4");
                expect(res.data.length).toBe(4);
                expect(res.data[0].nID).toBe(2);
            });

            it("Does pagination on shared notes", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&notOwned=true&lastId="+createdNotes[0].nID);
                expect(res.data.length).toBe(0);
            });

            it("Show folder only", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&notNotes=true");
                expect(res.data.length).toBe(3);
            });

            it("Show notes only", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&notFolder=true");
                expect(res.data.length).toBe(5);
            });

            it("Show 0", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&notNotes=true&notFolder=true");
                expect(res.data.length).toBe(0);
            })

            it("Search title", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&title=coba coba");
                expect(res.data.length).toBe(1);

                res = await userAxios[0].get("/notes?shared=true&notNotes=true&title=coba coba&notNotes=true");
                expect(res.data.length).toBe(0);
            });

            it("Filter Tags", async ()=>{
                let res = await userAxios[0].get("/notes?shared=true&tags=notes");
                expect(res.data.length).toBe(6);

                res = await userAxios[0].get("/notes?shared=true&tags=");
                expect(res.data.length).toBe(8);

                res = await userAxios[0].get("/notes?shared=true&tags=notes,updated");
                expect(res.data.length).toBe(1);
            });

            it("Runs on invalid input", async () => {
                await userAxios[0].get("/notes?shared=e'2f.&notOwned=lpsl&lastId=aser&limi=9999&sigmaboii=sdad&tags=asd[a,s],,d,[&noFolder=asdasA!!!&noNotes=;;;'qw;&title=aku bebek!!:\"");
            });
        });
    });
});