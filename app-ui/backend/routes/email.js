const express = require("express");
const router = express.Router();
const User = require('../models/users');
const nodemailer = require("nodemailer");

router.post('/', async function (req, res, next) {
  const user = req.body.userReference;
  const message = req.body.message;

  await User.findOne({ username: user }).then((val) => {
    const contact = val.email;
    contactFn(contact, message, user);
  });
  
  res.send();
});
  
function mailSettings() {
  const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
          user: 'cartoon.caption.reset@gmail.com',
          pass: 'hdnsjetpitoalkbh'
      }
  })
  return transporter
}

async function contactFn(contact, message, username) {
  const config = mailSettings();
  const info = await config.sendMail({
      from: contact,
      to: 'Cartoon Caption Contest <cartoon.caption.reset@gmail.com>',
      subject: 'Message from User Profile',
      html: `email: ${contact}<br>username: ${username}<br>message: ${message}`
  })
}

module.exports = router;