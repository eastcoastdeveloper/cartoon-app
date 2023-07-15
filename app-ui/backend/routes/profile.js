const express = require("express");
const UserSchema = require("../models/users");
const router = express.Router();

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  
  UserSchema.findOne({ _id: id }).then((user) => {
    res.status(200).send(user.captions)
  })
});

router.post('/location', async (req, res, next) => {
  const city = req.body.city;
  const country = req.body.country;
  const id = req.body.id;
  if (city.length > 0) {
    await UserSchema.findOneAndUpdate({ _id: id }, { location: `${city}, ${country}` });
    res.status(200).send({ city: city, country: country });
    return
  }

  res.status(200).send({ city: "", country: "" });
});

module.exports = router;
