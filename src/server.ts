import express from 'express';

import 'dotenv/config'

import ChatRouter from './routes/chats';
import MessageRouter from './routes/messages';
import AuthRouter from './routes/auth';

import mongoose from 'mongoose';
import cowsay from 'cowsay';
import { errorMiddleware } from './middlewares/error';

const URL = process.env.MONGODB_URI as string;
const PORT = process.env.PORT as string;

mongoose.connect(URL).then(() => {
    console.log(cowsay.say({
        text: "Mongoose connected",
        e: "oO",
        T: "U "
    }));
}).catch(error => console.log(error));

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/status', (_, res) => res.send('OK'));

app.use('/', AuthRouter);
app.use('/chats', ChatRouter);
app.use('/messages', MessageRouter);

app.use(errorMiddleware);

app.all("*", (_, res) => {
    res.status(404);
    res.json({ error: 404 })
})

app.listen(PORT || 5000, () => console.log(`server has been started to http://localhost:${PORT}`));