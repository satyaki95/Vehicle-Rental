import express from "express";
import {
  changeBookingStatus,
  deleteCar,
  getAdminBookings,
  getAdminCars,
  getAdminDashboardData,
  toggleCarAvailability,
  updateUserImage,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", protect, getAdminDashboardData);
adminRouter.get("/cars", protect, getAdminCars);
adminRouter.post("/toggle-car", protect, toggleCarAvailability);
adminRouter.post("/delete-car", protect, deleteCar);
adminRouter.get("/bookings", protect, getAdminBookings);
adminRouter.post("/change-booking-status", protect, changeBookingStatus);
adminRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  updateUserImage,
);

export default adminRouter;
