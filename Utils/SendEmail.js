const nodemailer = require("nodemailer");

//this will not work easily , watch again 3:10:00

const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
        service:process.env.SMPT_SERVICE,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        }
    })

    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        message:options.message,
    }

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;