const nodemailer = require('nodemailer');
const ErrorHandler = require('../utils/errorHandler');

exports.sendmail = (req, url1, res, url, next) => {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.MAIL_EMAIL,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailoptions = {
        from: 'Pranjal PVT LTD. <pranjalshukla245@gmail.com>',
        to: req.body.email,
        subject: 'Password Reset Link',
        html: `<h1>Hello,</h1>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${url}" style="display:inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,<br/>Pranjal PVT LTD.</p>
        `
    };

    transport.sendMail(mailoptions, (err, info) => {
        if (err) {
            return next(new ErrorHandler(err, 500));
        }

        console.log(info);
        return res.status(200).json({
            message: 'Email sent successfully',
            url
        });
    });
};