import mongoose from "mongoose";
import colors from 'colors';
import { exit } from 'node:process';

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.host}:${connection.port}`
        console.log(colors.magenta.bold(`MongoDB Connected on: ${url}`))
        
    } catch (error) {
        console.log(colors.red.bold('Error Connecting to MongoDB'))
        //console.log(error.message)
        exit(1)
    }
}