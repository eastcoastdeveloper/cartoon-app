const mongoose = require('mongoose');
const userData = mongoose.Schema({
    imageUrl: { type: String },
    altText: { type: String },
    totalCaptions: { type: Number },
    captions: { type: Array },
    cached: { type: Boolean },
    itemIndex: { type: Number },
    date: {type: Number}
});

module.exports = mongoose.model('Post', userData);

/*
captions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]



    router.post('/', async function (req, res, next) {
    const formData = await CaptionData.create({
      caption: req.body.caption,
      email: req.body.email,
      firstname: req.body.firstname,
      lastName: req.body.lastname,
      city: req.body.city,
      state: req.body.state
    })
    await Other.findByIdAndUpdate(<id-of-other>, { $push: { captions: formData._id }});
    res.status(201).json({
      message: 'Form submission added successfully'
    });
  });
  
  module.exports = router;
*/