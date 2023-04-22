import mongoose, { CallbackError } from "mongoose";
import { MongoError } from 'mongodb';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

UserSchema.pre("save", async function (next) {
    // const user = this
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
})

// UserSchema.methods.isValidPassword = async function (password: string) {
//     const compare = await bcrypt.compare(password, this.password);
//     return compare
// }

// переделать валидатор ошибок
const handle11000 = <T>(error: Error, _: T, next: (error?: CallbackError) => void) => {
    if (error.name === "MongoServerError" && (error as MongoError).code === 11000) {
        next(new Error('User with this email already exists'));
    } else {
        next(error);
    }
}

UserSchema.post("save", handle11000);
UserSchema.post("update", handle11000);
UserSchema.post("findOneAndUpdate", handle11000);
UserSchema.post("insertMany", handle11000);

export const User = model("User", UserSchema, "User")