const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');
const JWT_SECRET = 'some secret stored in env file';
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

router.post('/forgot', (req, res, next) => {
  const { email } = req.body;
   
  User.findOne({ email: email }).then((user) => {
    if (!user) {
        return res.status(401).json({
            message: "User not registered"
          });
    }
      
    if (user) {
        const secret = JWT_SECRET + user.password;
        const payload = {
            email: user.email,
            id: user.id
        }
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        const link = `http://localhost:4200/reset-password/${user.id}/${token}`;

      main(link).catch(e => console.log(e))
      res.send({message: "Password link has been sent to your email."});
    }     
  })
})

async function main(url) {
  const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'efeldberg22204@gmail.com',
        pass: 'dtkviivvylnpdbnc'
      }
  })
  
  const info = await transporter.sendMail({
    from: 'Cartoon Caption Contest <efeldberg22204@gmail.com>',
    to: 'uxdeveloper@protonmail.com',
    subject: 'Password Reset',
    html: `Please reset your password with the link below:<br /><br /><a href="${url}">${url}</a>`
  })

  console.log("Message sent: " + info.messageId);
}

router.get('/:id/:token', (req, res, next) => {
  const { id, token } = req.params;
  User.findOne({ _id: id }).then((user) => {
    if (!user) {
      return res.status(401).json({
        message: "User not registered"
      });
    }
      
    const secret = JWT_SECRET + user.password;
    try {
      const payload = jwt.verify(token, secret);
      res.send({
        username: user.username,
        password: null,
        email: user.email
      })
    } catch (error) {
      console.log(error.message);
      res.send(error.message);
    }
  })
});

router.post('/:id/:token', (req, res, next) => {
  const { id, token } = req.params;
  bcrypt.hash(req.body.password, 10).then(async hash => { 
    const filter = { _id: id };
    const update = { password: hash };
    try {
      const doc = await User.findOneAndUpdate(filter, update, {
        new: true
      });
      res.send(doc);
    } catch (error) {
      res.send(error.message);
   }
  })
})

module.exports = router;