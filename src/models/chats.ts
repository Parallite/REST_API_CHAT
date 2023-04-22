import mongoose, { CallbackError } from "mongoose";
import { MongoError } from 'mongodb';

const { Schema, model } = mongoose;

const chatsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true,
});

const handle11000 = <T>(error: Error, _: T, next: (error?: CallbackError) => void) => {
    if (error.name === "MongoServerError" && (error as MongoError).code === 11000) {
        next(new Error('There was a dublicate key error'));
    } else {
        next(error);
    }
}


chatsSchema.post("save", handle11000);
chatsSchema.post("update", handle11000);
chatsSchema.post("findOneAndUpdate", handle11000);
chatsSchema.post("insertMany", handle11000);

export const Chats = model("Chats", chatsSchema, "Chats")