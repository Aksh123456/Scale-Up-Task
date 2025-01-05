const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userModel = require('../model/userModel');
const validations = require("../helper/validation");


const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
console.log(accountSid,  process.env.ACCOUNTSID, process.env.JWT_SECRET_KEY,"accountSid");
const client = require("twilio")(accountSid, authToken);


// Send otp Function by Twillio

// const twilioSendMessage = async (mobile_number, OTP, phone_code) => {
//   try {
//     const messageBody = `Your 316 secured code is ${OTP} . Do not share this code`;
//     const fromNumber = "+918370099316";
//     let phone = mobile_number;
//     console.log(mobile_number, "mob");
//     if (mobile_number.startsWith(0, 0)) {
//       phone = parseInt(mobile_number);
//     }
//     console.log(phone, "phone");
//     // const messagingServiceSid = 'MGc6aa81a6bf48ec28999b85115fc2c1df'
//     let toNumber = phone_code + mobile_number;
//     console.log(toNumber, "toNumber");
//     let result = await client.messages
//       .create({ body: messageBody, fromNumber: fromNumber, to: toNumber })
//       .then((message) => {
//         console.log(message.sid);
//         return true;
//       })
//       .catch((error) => {
//         throw error;
//         console.error(error, "eeeeeee");
//         // return false;
//       });
//     return result;
//   } catch (error) {
//     console.log("twilioSendMessage error", error);
//     return error.message;
//   }
// };/

const twilioSendMessage = async (mobile_number, OTP, phone_code) => {
  try {
    const messageBody = `Your 316 secured code is ${OTP} . Do not share this code`;
    const fromNumber = "+918370099316";
    let phone = mobile_number;
    console.log(mobile_number, "mob");
    if (mobile_number.startsWith(0, 0)) {
      phone = parseInt(mobile_number);
    }
    console.log(phone, "phone");
    let toNumber = phone_code + mobile_number;
    console.log(toNumber, "toNumber");
    let result = await client.messages
      .create({ body: messageBody, from: fromNumber, to: toNumber })
      .then((message) => {
        console.log(message.sid);
        return true;
      })
      .catch((error) => {
        throw error;
        console.error(error, "eeeeeee");
        // return false;
      });
    return result;
  } catch (error) {
    console.log("twilioSendMessage error", error);
    return error.message;
  }
};



// Function to generate OTP 
function OtpGenerate() {

  let digits = '0123456789';
  var OTP = ''
  let len = digits.length
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * len)];
  }

  return OTP;
}



exports.signUp = async (req, res) => {
  try {
    const { error } = validations.register.validate(req.body);
    if (error) return res.status(400).json({ status: false, message: error.details[0].message, data: {} });


    console.log(req.body, "body");
    const ONE_MINUTE = new Date(Date.now() + 3 * 60 * 1000);

    const userFind = await userModel.findOne({
      email: req.body.email,
      phone_code: req.body.phone_code,
      phone_no: req.body.phone_no,
      is_verified: true
    });
    if (userFind) {
      return res.status(400).json({
        status: false,
        message: "User account already exists",
        data: {}
      });
    }

    if (userFind && userFind.is_verified === false) {
      const OTP =  OtpGenerate();
      console.log(OTP, "ootp");
      let sendOtpStatus = await twilioSendMessage(
        req.body.phone_no,
        OTP,
        req.body.phone_code
      );
      console.log(sendOtpStatus, "sendOtpStatus");
      if (sendOtpStatus == false) {
        return res
          .status(500)
          .json({ status: "false", message: `Otp does not send successfully`, data: {} });
      }


      if (sendOtpStatus == true) {
        const savedUser = await userModel.updateOne(
          {
            phone_no: req.body.phone_no,
            phone_code: req.body.phone_code
          },
          {
            $set: {
              otp: OTP,
              otp_expiration: new Date(Date.now() + ONE_MINUTE),
              updatedAt: new Date(),
            },
          }
        );

        console.log(savedUser, "updateUser");
        return res
          .status(200)
          .json({ status: true, message: "OTP sent successfully", data: { otp: OTP } });
      }
    } else {
      const OTP =  OtpGenerate();
      console.log(OTP, "ootp");
      let sendOtpStatus = await twilioSendMessage(
        req.body.phone_no,
        OTP,
        req.body.phone_code
      );
      console.log(sendOtpStatus, "sendOtpStatus");

      if (sendOtpStatus == false) {
        return res
          .status(500)
          .json({ status: "false", message: `Otp does not send successfully`, data: {} });
      }

      if (sendOtpStatus == true) {
        const savedUser = await userModel.create({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_no: req.body.phone_no,
          phone_code: req.body.phone_code,
          email: req.body.email,
          date_of_birth: req.body.date_of_birth,
          otp: OTP,
          otp_expiration: new Date(Date.now() + ONE_MINUTE),
          createdAt: new Date(),
        });
        console.log(savedUser, "updateUser");
        return res
          .status(200)
          .json({ status: true, message: "OTP sent successfully", data: { otp: OTP } });
      }
    }

  } catch (err) {
    console.log(err, 'error')
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
      data: {}
    });
  }
};



exports.verifyOTP = async (req, res) => {
  try {
    const { error } = validations.verifyOtp.validate(req.body);
    if (error) return res.status(400).json({ status : false, message: error.details[0].message , data: {}});

    const { phone_no, otp } = req.body;
    const user = await userModelserModel.findOne({ phone_no });
    if (!user) return res.status(404).json({ status: false, message: "User not found." , data: {}});

    if (user.otp !== otp || user.otp_expiration < new Date()) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP.", data: {} });
    }

    user.is_verified = true;
    user.otp = null;
    user.otp_expiration = null;
    await user.save();

    res.status(200).json({ status: true, message: "User verified successfully." , data: {}});
  } catch (error) {
    res.status(500).json({status: false, message: error.message , data: {}});
  }
};


exports.loginUser = async (req, res) => {
  try {
    const ONE_MINUTE = new Date(Date.now() + 3 * 60 * 1000);

    const { error } = validations.login.validate(req.body);
    if (error) return res.status(400).json({ status :false, message: error.details[0].message , data: {}});

    const { phone_no, phone_code } = req.body;

    const user = await userModel.findOne({ phone_no, phone_code });
    if (!user) return res.status(404).json({ status: false, message: "Sorry! User not found. First Create your account", data: {} });



    const OTP =  OtpGenerate();
      console.log(OTP, "ootp");
      let sendOtpStatus = await twilioSendMessage(
        req.body.phone_no,
        OTP,
        req.body.phone_code
      );
      console.log(sendOtpStatus, "sendOtpStatus");
      if (sendOtpStatus == false) {
        return res
          .status(500)
          .json({ status: "false", message: `Otp does not send successfully`, data: {} });
      }


      if (sendOtpStatus == true) {
        const savedUser = await userModel.updateOne(
          {
            phone: req.body.phone,
            phone_code: req.body.phone_code
          },
          {
            $set: {
              otp: OTP,
              otp_expiration: new Date(Date.now() + ONE_MINUTE),
              updatedAt: new Date(),
            },
          }
        );

        console.log(savedUser, "updateUser");
        return res
          .status(200)
          .json({ status: true, message: "OTP sent successfully", data: { otp: OTP } });
      }

  
  } catch (error) {
    res.status(500).json({ status: false, message: error.message , data: {}});
  }
};

exports.loginVerifyOTP = async (req, res) => {
  try {
    const { error } = validations.verifyOtp.validate(req.body);
    if (error) return res.status(400).json({ status : false, message: error.details[0].message , data: {}});

    const { phone_no, otp } = req.body;
    const user = await userModel.findOne({ phone_no });
    if (!user) return res.status(404).json({ status: false, message: "User not found." , data: {}});

    if (user.otp !== otp || user.otp_expiration < new Date()) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP.", data: {} });
    }

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
      userId: user._id,
      email: user.email,

    };

    const token = jwt.sign(data, jwtSecretKey, { expiresIn: "60m" });

    res.status(200).json({ status: true, message: "User verified successfully." , data: {token: token}});
  } catch (error) {
    res.status(500).json({status: false, message: error.message , data: {}});
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    const userFind = await userModel.findOne({
      _id: req.user.userId
    })
    if(userFind)
    {
      res.status(200).json({ status: true, message: "Profile fetched successfully", data: userFind });

    }
    else{
      res.status(400).json({ status: false, message: "Profile fetched not successfully", data: {} });

    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to fetch profile", data: error.message });
  }
};