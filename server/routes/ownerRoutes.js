import express from "express";
import {
  addCar,
  deleteCar,
  getDashBoardData,
  getOwnerCarById,
  getOwnerCars,
  toggleCarAvailability,
  updateCar,
  updateUserImage,
} from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/add-car", upload.single("image"), protect, addCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.get("/car/:carId", protect, getOwnerCarById);
ownerRouter.put("/update-car/:carId", upload.single("image"), protect, updateCar);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.post(
  "/update-image",
  upload.single("image"),
  protect,
  updateUserImage,
);

ownerRouter.get("/dashboard", protect, getDashBoardData);

export default ownerRouter;
