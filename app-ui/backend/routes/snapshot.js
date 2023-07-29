const express = require("express");
const UserSchema = require("../models/users");
const router = express.Router();
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

router.get("/generate", async (req, res, next) => {
    const result = [];
    let uuid = otpGenerator.generate(10, { upperCaseAlphabets: true, specialChars: false });
    const username = req.query.id;
    let user;

    await UserSchema.findOneAndUpdate({ username: username }, { $set: { verify: uuid } }).then((val) => {
        user = val;
    })

    main(user, uuid).catch(e => console.log(e))    
    res.send()
})

router.get("/compare", async (req, res, next) => {
    console.log(req);
    const otp = req.query.otp;
    const email = req.query.email;

    await UserSchema.findOne({ email: email }).then((item) => {
        if (null != item) {
            bcrypt.compare(req.query.passcode, item.password).then((val) => {
                if (item.verify === otp && item.email === email && val) {
                    console.log('Match')
                    res.send({message: 'Success'})
                } else {
                    console.log('Denied');
                    res.send({ message: 'Not found'});
                }
            })
        } else {
            res.send({ message: 'Not found'});
       }
    })
})

router.get("/data", (req, res) => {
    let result = [];
    UserSchema.find({}).then((users) => {
        users.forEach(element => {
            result.push({
                username: element.username,
                location: element.location,
                email: element.email
            })
        });
        res.send(result)
    })
})

async function main(user, code) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'cartoon.caption.reset@gmail.com',
            pass: 'hdnsjetpitoalkbh'
        }
    })

    const info = await transporter.sendMail({
        from: 'Cartoon Caption Contest <cartoon.caption.reset@gmail.com>',
        to: user.email,
        subject: 'Admin Notification',
        html: `The admin route was hit. Access was not granted.<br>OTP: ${code}<br>Email: ${user.email}<br>Username: ${user.username}`
    })
}

module.exports = router;
