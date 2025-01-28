import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

export function hash(input) {
    return crypto.createHash("sha256")
           .update(input)
           .digest("base64");
}

export function signJWT(payload) {
    return jwt.sign(
        payload,
        Buffer.from(process.env.JWT_SECRET_KEY, "base64"),
        { algorithm: "HS256", expiresIn: process.env.SESSION_MINUTES_EXPIRE+"m" });
}

export async function verifyJWT(inputJWT) {
    try {
        return await jwt.verify(
            inputJWT,
            Buffer.from(process.env.JWT_SECRET_KEY, "base64"),
            { algorithm: "HS256", maxAge: process.env.SESSION_MINUTES_EXPIRE+"m" }
        );
    } catch(err) {
        return false;
    }
}