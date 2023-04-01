import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatsShema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});


export const Chats = model("Chats", chatsShema, "Chats")