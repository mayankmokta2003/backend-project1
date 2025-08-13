import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"


const registerUser = asyncHandler( async (req , res)=>{
    // res.status(200).json({
    //     message: "ok"
    // })

      // take all the data from user frontend
  // verify if the data is not empty anywhere
  // if he is already a user
  // check for avatar img
  // save the img to cloudinary
  // create entry in database
  // remove password
  // check user creation
  // return the user response


  const{userName , email , fullName , password} = req.body
  console.log("email: " , email)
  

  // if(userName === ""){
  //   throw new ApiError(400 , "some field is empty")
  // }
  // instead of giving indivisual the logic 

  if(
    [email , fullName , password].some((field)=>
    field?.trim() === ""
    )
  ){
    throw new ApiError(400 , "All fields are required")
  }

  // to find existing user
  // this or is user if we want any one of it to be correct or both as well
  // or we could have written User.findOne({userName})
  const existedUser = User.findOne({
    $or: [{ email } , { userName }]
  })

  if(existedUser){
    throw new ApiError(401 , "user or email already exists")
  }

 


})

export {registerUser}