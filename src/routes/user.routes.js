import { Router } from "express";

import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateCoverImage, 
    updateUserAvatar 
} from "../controllers/user.controllers.js";

import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([ 
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    
    registerUser)

    router.route("/login").post(loginUser)

    router.route("/logout").post(verifyJwt ,logoutUser)

    router.route("/newaccesstoken").post(refreshAccessToken)

    router.route("/changepassword").post(verifyJwt,changeCurrentPassword)

    router.route("/currentuser").get(verifyJwt,getCurrentUser)

    router.route("/accountdetails").patch(verifyJwt,updateAccountDetails)

    router.route("/updateavatar").patch(verifyJwt,upload.single("avatar") ,updateUserAvatar)

    router.route("/updatecoverimage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)

    router.route("/c/:username").get(verifyJwt,getUserChannelProfile)

    router.route("/history").get(verifyJwt,getWatchHistory)


export default router