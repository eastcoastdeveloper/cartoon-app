const express = require("express");
const UserSchema = require("../models/users");
const router = express.Router();

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    UserSchema.findOne({ _id: id }).then((user) => {
        res.status(200).send(user.captions)
      })
});
  
module.exports = router;
