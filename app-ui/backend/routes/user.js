const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      roles: {
        User: 2015
      },
      password: hash,
      username: req.body.username,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      showLocation: req.body.showLocation,
      showCountry: req.body.showCountry,
      captions: req.body.captions
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: "User created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: "Simething ha'klasdj"
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            message: "Username or Password Incorrect"
          });
        }
        const roles = Object.values(fetchedUser.roles);
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id, roles: roles },
          "secret_this_should_be_longer",
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id,
          username: fetchedUser.username,
          roles: roles
        });
      })
      .catch(err => {
        return res.status(401).json({
          message: "Auth failed"
        });
      });
});

module.exports = router;