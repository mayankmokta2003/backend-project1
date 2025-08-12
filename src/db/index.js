import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const realDbData = await mongoose.connect
    (`${process.env.MONGOOSE_URI}/${DB_NAME}`)
    console.log(`/n blablablabla ${realDbData.connection.host}`);
    return realDbData
  } catch (error) {
    console.log("MAYANK MOKTA DUMB", error);
    process.exit(1);
  }
};

export default connectDb
