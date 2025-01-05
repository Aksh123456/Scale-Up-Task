const express = require("express");
const { signUp, verifyOTP, loginUser,loginVerifyOTP, getProfile } = require("../controller/userController");
const decodeToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/signUp", signUp);
router.post("/verifyOtp", verifyOTP);
router.post("/login", loginUser);
router.post("/login/verifyOtp", loginVerifyOTP);

router.get("/getProfile", decodeToken.decodeUserJWTToken, getProfile);

module.exports = router;
