import express from "express";
import { signIn, signUp } from "../controllers/authController.js";
import { newInput, newOutput } from "../controllers/newPutControllers.js";
import { getRecords } from "../controllers/recordsController.js";
import { newPutsSchemaValidation } from "../middlewares/newPutSchemaMiddleware.js";
import { newUserSchemaValidation } from "../middlewares/newUserSchemaMiddleware.js";
import { tokenMiddleware } from "../middlewares/tokenValidationMiddleware.js";
import { userAuthMiddleware } from "../middlewares/userAuthValidationMiddleware.js";
import { userConflictMiddleware } from "../middlewares/userConflictValidationMiddleware.js";
import { userSchemaValidation } from "../middlewares/userSchemaMiddleware.js";

const router = express.Router();
router.post("/sign-up",newUserSchemaValidation, userConflictMiddleware, signUp);
router.post("/sign-in",userSchemaValidation, userAuthMiddleware, signIn);
router.post("/new-input", newPutsSchemaValidation, tokenMiddleware, newInput);
router.post("/new-output",newPutsSchemaValidation, tokenMiddleware, newOutput);
router.get("/records",tokenMiddleware, getRecords);
export default router;
