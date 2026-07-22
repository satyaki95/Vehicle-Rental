import express from "express";
import {
  addVehicle,
  deleteVehicle,
  getDashBoardData,
  getOwnerVehicleById,
  getOwnerVehicles,
  toggleVehicleAvailability,
  updateVehicle,
  updateUserImage,
} from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

// Vehicle routes
ownerRouter.post("/add-vehicle", upload.single("image"), protect, addVehicle);

ownerRouter.get("/vehicles", protect, getOwnerVehicles);

ownerRouter.get("/vehicle/:vehicleId", protect, getOwnerVehicleById);

ownerRouter.put(
  "/update-vehicle/:vehicleId",
  upload.single("image"),
  protect,
  updateVehicle,
);

ownerRouter.post("/toggle-vehicle", protect, toggleVehicleAvailability);

ownerRouter.post("/delete-vehicle", protect, deleteVehicle);

ownerRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  updateUserImage,
);

ownerRouter.get("/dashboard", protect, getDashBoardData);

export default ownerRouter;
