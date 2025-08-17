import { Router } from "express";

import { 
    changeCurrentPassword, 
    getCurrentUser, 
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

    router.route("/currentuser").post(verifyJwt,getCurrentUser)



export default router