import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _, res, next) => {
    res.status(err.status || 500)
    res.json({
        type: err.type || "error",
        status: err.status,
        message: err.message
    })
}