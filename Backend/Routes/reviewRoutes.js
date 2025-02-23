import express from "express";
import multer from "multer";
import { uploadCsV,updateReviewTags, fetchDashboardMetrics, allReviews } from "../Controllers/reviewController.js";
import { authorize, protect } from "../Middelware/authMiddleWare.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-csv", upload.single("file"), uploadCsV);

router.put("/:id", updateReviewTags);
router.get('/dashboard/metrics',protect, authorize(["admin", "user"]),fetchDashboardMetrics)
router.get('/data',allReviews)



export default router;
