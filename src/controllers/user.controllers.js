import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser";
import jwt  from "jsonwebtoken";



const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generatreAccessToken();
    const refreshToken = user.generatreRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }; 
    
  } catch (error) {
    throw new ApiError(416, "refresh and access token not created", error);
    
  }
};



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
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(401, "user or email already exists");
  }

  // to get the path of images

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // let coverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {

  // }
  console.log("kvrrrrrr", coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(401, "avatar image is required");
  }

  const avatar = await uploadOncloudinary(avatarLocalPath);
  const coverImage = await uploadOncloudinary(coverImageLocalPath);

  console.log("coverrrrrr", coverImage);
  if (!avatar) {
    throw new ApiError(401, "avatar file is required");
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
  );

  if (!createdUser) {
    throw new ApiError(504, "something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "successfully registered"));
});



const loginUser = asyncHandler(async (req, res) => {
 
  const {userName , email , password} =  await req.body
  console.log("hulululu",userName)

  if (!(userName || email)) {
    throw new ApiError(405, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  console.log("userrrrrrr",user)
  if (!user) {
    throw new ApiError(402, "user des not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(407, "incorrect password");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: accessToken,
          refreshToken,
          loggedInUser,
        },
        "user loggedin successfully"
      )
    );
});



const logoutUser = asyncHandler(async(req,res)=>{

 await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {refreshToken: undefined}
    },
    {
      new: true
    }
  )
  options = {
    httpOnly:true,
    secure:true
  }

  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cooke("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,
      {},
      "user logged out successfully"
      )
  )



})



const refreshAccessToken = asyncHandler(async(req,res)=>{

  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"no tokens found")
  }

  const decodedTokens = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  if(!decodedTokens){
    throw new ApiError(401,"no decoded tokens found")
  }

  const user = await User.findById(decodedTokens?._id)
  if(!user){
    throw new ApiError(401,"no user tokens found")
  }

  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(201,"incorrect refresh token secret")
  }
  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

  options= {
    httpOnly: true,
    secure: true
  }

  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      201,
      {user: accessToken , refreshToken},
      "new access token created successfully"
    )
  )
})



const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword , newPassword} = req.body
  
  const user = await User.findById(req.user?._id)
  if(!user){
    throw new ApiError(401, "no user found")
  }
  const isPasswordCorrect = await user.isModified(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(401, "incorrect current password")
  }
  user.password = newPassword
  await user.save({validateBeforeSave: false})

  res.status(200)
  .json(new ApiResponse(201,
    {},"password changed successfully"))
})



const getCurrentUser = asyncHandler(async(req,res)=>{
  const user = req.user
  res.status(200)
  .json(new ApiResponse(201,
    user,"this is current user"))
})



const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {userName , email} = req.body

  if(!(userName || email)){
    throw new ApiError(402,"username or email cannot be empty")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        userName,
        email
      }
    },
    {new: true}
  ).select("-password")

  res.status(200)
  .json(
    new ApiResponse(
      201,
      user,
      "email or username changed successfully"
    )
  )
})



const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path 
  if(!avatarLocalPath){
    throw new ApiError(401,"image local path not found")
  }

  const avatar = await uploadOncloudinary(avatar)
  if(!avatar){
    throw new ApiError(401,"image not uploaded on cloudinary")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        avatar : avatar.url //hereee
      }
    },
    {new: true}
    ).select("-password")

    res.status(200)
.json(
  new ApiResponse(201,
    user,
    "avatar image updated successfully"
    )
)
})



const updateCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(402, "cover image path not found")
  }
  coverImage = uploadOncloudinary(coverImageLocalPath)
  if(!coverImage){
    throw new ApiError(402, "cover image not uploaded on cloudinary")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage : coverImage.url
      }
    }
  ).select("-password")

  res.status(200)
  .json(
    new ApiResponse(
      201,
      user,
      "cover image updated successfully"
    )
  )
})



const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {userName} = req.params

  if(!userName){
    throw new ApiError(401,"no user found")
  }
  
  const channel = await User.aggregate([
    {
      $match: {
        userName: userName
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscirbersCount: {
          $size: "$subscribers"
        },
          subscribedToCount: {
            $size :"$subscribedTo"
          },
          isSubscribed: {
            $cond: {
              if: {$in: [req.user?._id , "$subscriptions.subscriber"]},
              then: true,
              else: false
            }
          }
      }
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        email: 1,
        isSubscribed: 1,
        subscribedToCount: 1,
        subscribedToCount: 1,
        avatar: 1,
        coverImage: 1
      }
    }
  ])
  if(!channel?.length){
    throw new ApiError(404,"channel does not exist")
  }

  return res.status(200)
  .json(
    new ApiResponse(
      201,
      channel[0],
      "user channel fetched successfully"
    )
  )
})



const getWatchHistory = asyncHandler(async(req,res)=>{

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }

  ])
  if(!user){
    throw new ApiError(404, "no user found")
  }
  return res.status(200)
  .json(
    new ApiResponse(
      201,
      user[0].watchHistory,
      "history fetched successfully"
    )
  )
})


export { 
  registerUser, 
  loginUser, 
  logoutUser,
  refreshAccessToken, 
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
