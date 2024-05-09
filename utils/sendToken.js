exports.sendToken = (user, statusCode, res) => {
    const token = user.getjwttoken()
    console.log("users", user)
    const expiresInMilliseconds = process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + expiresInMilliseconds);

    const options = {
        
        exipres: expirationDate,
        httpOnly: true,
        secure: true,
        sameSite: 'none' // Allow cross-site usage

    }
    console.log(options)
    console.log(token)
    res.status(statusCode).cookie("token", token, options).json({ success: true, id: user._id, token, expiresIn: expiresInMilliseconds })

}