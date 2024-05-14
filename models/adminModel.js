const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['Admin'],
        default: "Admin"
    },
    otp: {
        type: Number,
        default: -1
    },
    isAuth: {
        type: Boolean,
        default: false
    },
    resetPassword: {
        type: String,
        default: "0"

    },
    email: {
        type: String,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        minlength: [8, "Password should be at least 8 characters long"],
    },
    lastLogin: {
        type: Date,
        default: null
    },
    // store: {
    //     type: String,
    // }
}, { timestamps: true });

adminSchema.pre("save", function () {
    if (!this.isModified("password")) {
        return;
    }
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt)
});

adminSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

adminSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;