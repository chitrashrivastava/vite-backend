const { catchAsyncErrors } = require('../middlewares/catchAsyncError')
const SuperAdmin = require('../models/SuperAdminModel')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const ErrorHandler = require('../utils/errorHandler')
const Product=require('../models/productModel')
const { v4: uuidv4 } = require('uuid');
const {sendmail} =require('../utils/nodemailer')
exports.registerSuperAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log(req.body)
        // const authorizedSources = process.env.AUTHORIZED_EMAIL.split(',');
        const { email } = req.body;
       
        console.log(req.body)
        const { password } = req.body;
        const existingSuperAdmin = await SuperAdmin.findOne({ email });
        if (existingSuperAdmin) {
            return res.status(400).json({ success: false, message: 'SuperAdmin with this email already exists' });
        }
        const newSuperAdmin = new SuperAdmin({
            email,
            password,
        });

        await newSuperAdmin.save();  
        sendToken(newSuperAdmin, 201, res);
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
