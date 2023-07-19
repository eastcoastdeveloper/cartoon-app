const express = require("express");
const CaptionData = require("../models/userData");
const UserSchema = require("../models/users");
const router = express.Router();

router.put("/:id", async (req, res, next) => {
  const creator = req.body.creator;
  const captionReference = req.body.captionReferenceID;
  const captionReferenceID = parseInt(req.body.captionsIndex);
  const outcome = req.body.outcome;
  const flagged = req.body.flagged;

  const doc = new CaptionData({
    _id: req.body._id,
    imageUrl: req.body.imageUrl,
    altText: req.body.altText,
    captions: req.body.captions,
    itemIndex: req.body.itemIndex,
  });
  doc.captions[captionReferenceID].flagged = flagged;

  const revisedCaption = doc.captions[captionReferenceID].caption;
  
  CaptionData.updateOne({ _id: req.params.id }, doc).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });

  await UserSchema.updateOne(
    { "_id": creator, "captions.id": captionReference },
    {
      $set: {
        "captions.$.status": outcome,
        "captions.$.caption": revisedCaption,
        "captions.$.flagged": flagged
      }
    }
  );
});
  
module.exports = router;
