import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username : {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverimage: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
  

    }


,{timestamps:true})


export const User = mongoose.model("User", userSchema)