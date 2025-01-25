const {
  createProfile,
  updateProfile,
} = require("./../controllers/profile-controllers");
const express = require("express");
const profileRouter = express.Router();

profileRouter.post("/profile/create-profile", createProfile);
profileRouter.put("/profile/update-profile", updateProfile);

module.exports = profileRouter;
