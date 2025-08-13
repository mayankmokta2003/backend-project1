import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
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

  const { userName, email, fullName, password } = req.body;
  console.log("email: ", email);

  // if(userName === ""){
  //   throw new ApiError(400 , "some field is empty")
  // }
  // instead of giving indivisual the logic

  if ([email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // to find existing user
  // this or is user if we want any one of it to be correct or both as well
  // or we could have written User.findOne({userName})
  const existedUser = User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(401, "user or email already exists");
  }

  // to get the path of images

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImagePath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "avatar image is required");
  }

  const avatar = await uploadOncloudinary(avatarLocalPath);
  const coverImage = await uploadOncloudinary(coverImagePath);

  if (!avatar) {
    throw new ApiError(401, "avatar is required");
  }

  // create entry in database

  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    password,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // remove password refreshtoken
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)

if(!createdUser){
  throw new ApiError(504 , "something went wrong")
}

return res.status(201).json(
  new ApiResponse(200 , createdUser , "successfully registered")
)


});



export { registerUser };
