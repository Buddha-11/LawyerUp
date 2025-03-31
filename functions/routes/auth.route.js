const express = require("express");
const { registerUser, updateProfile, updateLawyerProfile } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/update-profile", updateProfile);
router.patch("/update-lawyer-profile/:firebaseId", updateLawyerProfile);

module.exports = router;
