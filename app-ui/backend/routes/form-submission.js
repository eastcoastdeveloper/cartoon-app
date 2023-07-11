const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const CaptionData = require('../models/userData'); 
const checkAuth = require('../middleware/check-auth');
const User = require('../models/users');
const { v4: uuidv4 } = require('uuid');

router.use(bodyParser.json());

router.post('/', checkAuth, async function (req, res, next) {
  const formData = {
    caption: req.body.formData.caption,
    creator: req.userData.userId,
    approved: false,
    id: uuidv4()
  };
  let username;

  await User.findById({ _id: formData.creator}).then((val) => {
    username = val.username;
    formData.username = username;
  })

  const id = req.body.currentDataObject._id;
  await CaptionData.findOneAndUpdate(
    { _id: id },
    { $push: { captions: formData }}
  )
  res.status(201).json({
    message: 'Form submission added successfully'
  });

  await User.findOneAndUpdate(
    { _id: formData.creator },
    {
      $push: {
        captions: {
          imageUrl: req.body.currentDataObject.imageUrl,
          caption: formData.caption,
          id: formData.id,
          status: 'pending'
        }
      }
    }
  )

  console.log(formData)

});

module.exports = router;