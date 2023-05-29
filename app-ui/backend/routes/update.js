const express = require("express");
const CaptionData = require("../models/userData");
const router = express.Router();

router.put("/:id", (req, res, next) => {
    const doc = new CaptionData({
      _id: req.body._id,
      imageUrl: req.body.imageUrl,
      altText: req.body.altText,
      captions: req.body.captions,
      itemIndex: req.body.itemIndex
    });
    CaptionData.updateOne({ _id: req.params.id }, doc).then(result => {
      res.status(200).json({ message: "Update successful!" });
    });
});
  
module.exports = router;
