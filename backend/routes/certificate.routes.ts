import express from "express";
import {
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificate.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/me", protect, getMyCertificates);
router.get("/verify/:certificateId", verifyCertificate);

export default router;
