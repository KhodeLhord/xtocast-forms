import express from "express";
import { submitForm, upload , getForms } from "../controllers/formsController.js";

const router = express.Router();

// Define the route for submitting the form
router.post("/submit-form", upload.array("images", 2), submitForm);
router.get('/forms', getForms)

export default router;
