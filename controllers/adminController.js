const { catchAsyncErrors } = require('../middlewares/catchAsyncError')
const Admin=require('../models/adminModel')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const ErrorHandler = require('../utils/ErrorHandler')
// const imagekit=require('../utils/imagekit').initimagekit()
// const Product=require('../models/product')
const { v4: uuidv4 } = require('uuid');
const {sendmail} =require('../utils/nodemailer')
// const User=require('../models/userModel');
// const Order = require('../models/orderModel');


exports.registerAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log(req.body)
        // const authorizedSources = process.env.AUTHORIZED_EMAIL.split(',');
        const { email } = req.body;
        // if (!authorizedSources.includes(email)) {
        //     return res.status(403).json({ success: false, message: 'Unauthorized registration' });
        // }
        console.log(req.body)
        const { password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }
        const newAdmin = new Admin({
            email,
            password,
        });

        await newAdmin.save();  
        sendToken(newAdmin, 201, res);
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

exports.signinAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body)
        const { email, password } = req.body.formData;

        // Find the admin by email
        const admin = await Admin.findOne({ email });

        // If admin not found, return 404
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }


        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, admin.password);

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

exports.currentAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("======", req.id)
        const admin = await Admin.findById(req.id).exec();
        console.log("=====:", admin)
        admin.isAuth = true
        if (!admin) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

exports.signOutAdmin= catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token")
    res.json({ message: "Successfully Signout" })

})
