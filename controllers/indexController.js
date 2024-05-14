const { catchAsyncErrors } = require('../middlewares/catchAsyncError')
const User=require('../models/indexModel')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const ErrorHandler = require('../utils/ErrorHandler')
// const imagekit=require('../utils/imagekit').initimagekit()
// const Product=require('../models/product')
const { v4: uuidv4 } = require('uuid');
const {sendmail} =require('../utils/nodemailer')
// const User=require('../models/userModel');
// const Order = require('../models/orderModel');


exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log(req.body)
        // const authorizedSources = process.env.AUTHORIZED_EMAIL.split(',');
        const { email } = req.body;
        // if (!authorizedSources.includes(email)) {
        //     return res.status(403).json({ success: false, message: 'Unauthorized registration' });
        // }
        console.log(req.body)
        const { password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        const newUser = new User({
            email, 
            password,
        });

        await newUser.save();  
        sendToken(newUser, 201, res);
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

exports. signInUser = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body)
        const { email, password } = req.body;

        // Find the admin by email
        const user = await User.findOne({ email });

        // If admin n found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // If password does not match, return 401
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If everything is correct, send token
        sendToken(user, 200, res);
    } catch (error) {
        console.error('Error in loginAdmin controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("======", req.id)
        const user = await User.findById(req.id).exec();
        console.log("=====:", user)
        user.isAuth = true
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

exports.signOutUser= catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token")
    res.json({ message: "Successfully User Signout" })

})


exports.userSendmail = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec()
    if (!user) {
        return next(
            new ErrorHandler("User Not Found with this email address", 404)
        )
    }
    const url1 = `${req.protocol}://${req.get("host")}/user/forget-link/${user._id}`
    const url = `http://localhost:5173/user/forget-link/${user._id}`
    sendmail(req, url1, res, url, next)
    res.json({ user, url1 })
    user.resetPassword = "1"
    await user.save()
})


exports.userResetPassword=catchAsyncErrors(async(req,res,next)=>{
    console.log(req.body);
    const user = await User.findById(req.params.id).exec();
    console.log(req.body.password);
    if (!user) {
      return next(new ErrorHandler("user Not Found with this email address", 404));
    }
  
    if (user.resetPassword === "1") {
      user.resetPassword = "0";
      user.password = req.body.password;
      await user.save();
      res.status(200).json({ message: "Password Updated Successfully" });
    } else {
      return next(new ErrorHandler("Link Expired", 404));
    }
  
})



