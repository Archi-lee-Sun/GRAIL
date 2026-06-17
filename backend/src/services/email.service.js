const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationCode = async (toEmail, code) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'GRAIL — Your verification code',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`
    });
};

module.exports = {
    sendVerificationCode
};
