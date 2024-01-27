import jwt from "jsonwebtoken"
import { unlink, unlinkSync } from "node:fs";

export const jwt_sign = (object) => {
    return jwt.sign(object, process.env.JWT_SECRETE);
}

export const jwt_verify = (token) => {
    return jwt.verify(token, process.env.JWT_SECRETE)
}

export const delete_file = (file_path) => {
    return unlinkSync(file_path);
}