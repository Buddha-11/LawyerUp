import express from "express";
import { registerUser, updateProfile,updateLawyerProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/update-profile", updateProfile);
router.patch("/update-lawyer-profile/:firebaseId", updateLawyerProfile);
export default router;
