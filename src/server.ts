import express from 'express';
import bodyParser from 'body-parser';

import ChatRouter from './routes/chats';
import MessageRouter from './routes/messages';
import mongoose from 'mongoose';
import cowsay from 'cowsay';

import * as dotenv from 'dotenv'
dotenv.config()

mongoose.connect(`mongodb://localhost:${process.env.MONGODB_PORT}/React-ChatProject`).then(() => {
    console.log(cowsay.say({
        text: "Mongoose connected",
        e: "oO",
        T: "U "
    }));
}).catch(error => console.log(error));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/status', (_, res) => res.send('OK'));

app.use('/chats', ChatRouter);
app.use('/messages', MessageRouter);

app.listen(process.env.LOCAL_PORT, () => console.log(`server has been started to http://localhost:${process.env.LOCAL_PORT}`));