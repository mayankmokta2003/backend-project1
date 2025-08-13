// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from './app.js'

dotenv.config({
  path: "./env",
});



connectDb()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`the port is running at: ${process.env.PORT}`);
    });
  })

  .catch((err) => {
    console.log("MONGO CONNECTION FAILED", err);
  });




// import express from 'express'
// import mongoose from 'mongoose'
// import { DB_NAME } from './constants'

// const app = express()

// (async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGOOSE_URI}/${DB_NAME}`)
//        app.listen(process.env.PORT , ()=>{
//         console.log(`the port is: ${process.env.PORT}`)
//         app.on("errrr" , (err)=>{
//             console.log(err)
//             throw err
//         })
//     })
//     app.listen(process.env.PORT , ()=>{
//         console.log(`the port is: ${process.env.PORT}`)
//     })
//     }
//     catch(error){
//         console.log(error)
//         throw err
//     }
// })()
