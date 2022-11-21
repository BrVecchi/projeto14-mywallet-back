import express from "express";
import { signIn, signUp } from "../controllers/authController.js";
import { newInput, newOutput } from "../controllers/newPutControllers.js";
import { getRecords } from "../controllers/recordsController.js";

const router = express.Router();
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/new-input", newInput);
router.post("/new-output", newOutput);
router.get("/records", getRecords);
export default router;
