import jwt from "jsonwebtoken"

export const jwt_sign = (object) => {
    return jwt.sign(object, process.env.JWT_SECRETE);
}

export const jwt_verify = (token) => {
    return jwt.verify(token, process.env.JWT_SECRETE)
}