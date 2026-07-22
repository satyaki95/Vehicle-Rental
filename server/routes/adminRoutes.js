import express from "express";
import {
  changeBookingStatus,
  deleteVehicle,
  getAdminBookings,
  getAdminVehicles,
  getAdminDashboardData,
  getAdminUsers,
  toggleVehicleAvailability,
  updateVehicleApproval,
  updateUserImage,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", protect, getAdminDashboardData);

adminRouter.get("/vehicles", protect, getAdminVehicles);

adminRouter.post("/toggle-vehicle", protect, toggleVehicleAvailability);

adminRouter.post("/approve-vehicle", protect, updateVehicleApproval);

adminRouter.post("/delete-vehicle", protect, deleteVehicle);

adminRouter.get("/bookings", protect, getAdminBookings);
adminRouter.get("/users", protect, getAdminUsers);
adminRouter.post("/change-booking-status", protect, changeBookingStatus);
adminRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  updateUserImage,
);

export default adminRouter;
