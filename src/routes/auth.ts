import express, { Request } from 'express';
import jwt from 'jsonwebtoken'
import { User } from '../models/users';
import bcrypt from 'bcrypt';
import { Token } from '../models/tokens';
import { body, validationResult } from 'express-validator'

export interface TypedRequestBody<T> extends Request {
    body: T;
}

export type SignUpBody = TypedRequestBody<{ email: string, password: string }>

const router = express.Router();

router
    .post("/signup",
        body('email').isEmail(),
        body('password').isLength({ min: 5, max: 32 }),
        (req: SignUpBody, res, next) => {
            const err = validationResult(req);
            if (!err.isEmpty()) {
                res.status(400).json(err)
                return
            }
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
    .post("/signin", async (req, res) => {
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

        const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
        const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

        await Token.findOne({ email: user.email }).updateOne({
            expiresIn: false,
        });

        Token.create({
            token: refreshToken,
            email: user.email
        })
            .then((token) => {
                res.status(200);
                res.cookie('refreshToken', refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                res.json({ "status": "Logged in", accessToken, refreshToken });
            })
            .catch((err: Error) => {
                res.status(500);
                res.json({ error: true, messages: "refresh token not be created" })
            })
    })
    .post('/token', async (req, res) => {
        const refreshToken = req.body.refreshToken;
        if (refreshToken) {

            const decode = jwt.decode(refreshToken) as {
                id: string;
                email: string
            }

            const user = { id: decode?.id, email: decode?.email }

            const expiresed = await Token.findOne({ token: refreshToken, expiresIn: true })
            if (expiresed) {
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_LIFE })
                const newRefreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_LIFE })

                // разобраться с  inspires in true false.. и обновлением рефреш токена

                await Token.findOne(user).updateOne(
                    { token: refreshToken }
                );
                // зачем
                res.cookie('refreshToken', newRefreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                res.status(200).json({ accessToken })
            } else {
                res.status(401).json({ error: true, message: "Unauthorized access" });
            }
        }
    })
    .delete('/logout', (req, res, next) => {
        const { token } = req.cookies;
        Token.findOneAndDelete(token)
            .then((token) => {
                res.clearCookie('refreshToken');
                res.status(200).json(token);
            })
            .catch((err: Error) => {
                console.log(err);
                next(err);
            })
    })

export default router
