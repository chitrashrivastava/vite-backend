const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const indexSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['User'],
        default: "User"
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

indexSchema.pre("save", function () {
    if (!this.isModified("password")) {
        return;
    }
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt)
});

indexSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

indexSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}




const User = mongoose.model("User", indexSchema);
module.exports = User;