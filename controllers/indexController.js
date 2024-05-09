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
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
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
        const { email, password } = req.body.formData;

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
        sendToken(admin, 200, res);
    } catch (error) {
        console.error('Error in loginAdmin controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// exports.currentAdmin = catchAsyncErrors(async (req, res, next) => {
//     try {
//         console.log("======", req.id)
//         const admin = await Admin.findById(req.id).exec();
//         console.log("=====:", admin)
//         admin.isAuth = true
//         if (!admin) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }
//         res.json({ success: true, admin });
//     } catch (error) {
//         console.error("Error fetching current user:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// });

// exports.signOutAdmin= catchAsyncErrors(async (req, res, next) => {
//     res.clearCookie("token")
//     res.json({ message: "Successfully Signout" })

// })
