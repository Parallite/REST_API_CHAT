import express, { Request } from 'express';
import { User } from '../models/users';

export interface TypedRequestBody<T> extends Request {
    body: T;
}

export type SignUpBody = TypedRequestBody<{ email: string, password: string }>

const router = express.Router();

router
    .post("/signup", (req: SignUpBody, res, next) => {
        User.create(req.body)
            .then((newUser) => {
                const { _id, email } = newUser;
                res.status(201);
                res.json({ _id, email });
            })
            .catch((err: Error) => {
                console.log(req.body);
                next(err);
            })
    })

export default router