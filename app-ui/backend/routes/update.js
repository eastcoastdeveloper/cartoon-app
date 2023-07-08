const express = require("express");
const CaptionData = require("../models/userData");
const UserSchema = require("../models/users");
const router = express.Router();

router.put("/:id", async (req, res, next) => {
  const creator = req.body.creator;
  const captionReferenceID = req.body.captionReferenceID;
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
  
    await UserSchema.updateOne(
      { "_id": creator, "captions.id": captionReferenceID },
      { $set: { "captions.$.status": 'Approved' } }
    );
});
  
module.exports = router;
