import express, { Request } from 'express';
import { Chats } from '../models/chats';

export interface TypedRequestBody<T> extends Request {
    body: T;
}

const router = express.Router();

router
    .get('/', async (_, res) => {
        const chats = await Chats.find();
        res.json(chats);
    })
    .post("/", (req: TypedRequestBody<{ name: string }>, res, next) => {
        Chats.create(req.body)
            .then((newChat) => {
                res.status(201);
                res.json(newChat);
            })
            .catch((err: Error) => {
                next(err);
            })
    })
    .delete('/:id', (req: TypedRequestBody<{ id: string }>, res, next) => {
        Chats.findByIdAndDelete(req.params.id)
            .then((deletedChat) => {
                res.status(200);
                res.json(deletedChat);
            })
            .catch((err: Error) => {
                console.log(err);
                next(err);
            })
    })
    .put('/:id', async (req, res) => {
        const updatedChat = await Chats.findByIdAndUpdate(req.params.id, req.body);
        res.send(updatedChat)
    })

export default router