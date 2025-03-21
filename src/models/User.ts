import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User', userSchema)
export default User