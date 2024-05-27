const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SuperAdminSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['SuperAdmin'],
        default: "SuperAdmin"
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
   
}, { timestamps: true });

SuperAdminSchema.pre("save", function () {
    if (!this.isModified("password")) {
        return;
    }
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt)
});

SuperAdminSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

SuperAdminSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


const SuperAdmin = mongoose.model("SuperAdmin",SuperAdminSchema);
module.exports = SuperAdmin;