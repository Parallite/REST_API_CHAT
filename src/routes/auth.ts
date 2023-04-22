import express, { Request } from 'express';
import jwt from 'jsonwebtoken'
import { User } from '../models/users';
import bcrypt from 'bcrypt';
import { Token } from '../models/tokens';

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
    }).post("/signin", async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email })
        if (!user) {
            res.status(400);
            res.json({ message: 'User or password is wrong' })
            return
        }

        const compare = await bcrypt.compare(password, user?.password);

        if (!compare) {
            res.status(400);
            res.json({ message: 'User or password is wrong' })
            return
        }
        const data = {
            _id: user._id,
            email: user.email
        }

        const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' });
        const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1d' });

        await Token.findOne({ email: user.email }).updateOne({
            expiresIn: false,
        });

        Token.create({
            token: refreshToken,
            email: user.email
        })
            .then((token) => {
                res.status(200);
                res.json({ accessToken, refreshToken });
            })
            .catch((err: Error) => {
                res.status(500);
                res.json({ error: true, messages: "refresh token not be created" })
            })
    })
    .post('/token', async (req, res) => {
        const refreshToken = req.body.refreshToken;
        if (refreshToken) {
            const decode = jwt.decode(refreshToken)
            const expiresed = await Token.findOne({ token: refreshToken, expiresIn: true })
            if (expiresed) {
                //@ts-ignore
                const accessToken = jwt.sign({ id: decode?.id, email: decode?.email }, process.env.ACCESS_TOKEN_SECRET as string)
                res.status(200).json({ accessToken })
            } else {
                res.status(401).json({ error: true, message: "Unauthorized access" });
            }
        }
    })

export default router