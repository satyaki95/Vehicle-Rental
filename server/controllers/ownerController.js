import path from "path";
import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";
import Vehicle from "../models/Vehicle.js";
import { toFile } from "@imagekit/nodejs";
import Booking from "../models/Booking.js";
import { log } from "console";

// API to list vehicle
export const addVehicle = async (req, res) => {
  try {
    const { _id } = req.user;
    let vehicleData = JSON.parse(req.body.vehicleData);
    const imageFile = req.file;

    // Upload Image to ImageKit
    const filebuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.files.upload({
      file: await toFile(filebuffer),
      fileName: imageFile.originalname,
      folder: "/vehicles",
    });

    // Optimization through imagekit URL transformation
    var optimizedImageUrl = imagekit.helper.buildSrc({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      src: response.filePath,
      transformation: [
        {
          width: "1280", // Width resizing
          quality: "auto", // Auto Compression
          format: "webp", // Convert to modern format
        },
      ],
    });

    const image = optimizedImageUrl;
    await Vehicle.create({ ...vehicleData, owner: _id, image });

    res.json({ success: true, message: "Vehicle Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to List Owner Vehicles
export const getOwnerVehicles = async (req, res) => {
  try {
    const { _id } = req.user;
    const vehicles = await Vehicle.find({ owner: _id });

    res.json({ success: true, vehicles });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to Toggle Vehicle Availability
export const toggleVehicleAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { vehicleId } = req.body;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    // Checking if vehicle belongs to the user
    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    vehicle.isAvailable = !vehicle.isAvailable;

    await vehicle.save();

    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { _id } = req.user;
    const { vehicleId } = req.body;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    // Checking if vehicle belongs to the user
    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    vehicle.owner = null;
    vehicle.isAvailable = false;

    await vehicle.save();

    res.json({ success: true, message: "Vehicle Removed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get owner vehicle by id
export const getOwnerVehicleById = async (req, res) => {
  try {
    const { _id } = req.user;
    const { vehicleId } = req.params;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update owner vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { _id } = req.user;
    const { vehicleId } = req.params;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    let updatedData = {};

    if (req.body.vehicleData) {
      updatedData = JSON.parse(req.body.vehicleData);
    }

    if (req.file) {
      const imageFile = req.file;
      const filebuffer = fs.readFileSync(imageFile.path);
      const response = await imagekit.files.upload({
        file: await toFile(filebuffer),
        fileName: imageFile.originalname,
        folder: "/vehicles",
      });

      updatedData.image = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [
          {
            width: "1280",
            quality: "auto",
            format: "webp",
          },
        ],
      });
    }

    Object.assign(vehicle, updatedData);
    await vehicle.save();

    res.json({ success: true, message: "Vehicle Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get Dashboard Data
export const getDashBoardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const vehicles = await Vehicle.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("vehicle")
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({
      owner: _id,
      status: "pending",
    });

    const completedBookings = await Booking.find({
      owner: _id,
      status: "confirmed",
    });

    // Calculate monthly Revenue from booking where status is confirmed
    const monthlyRevenue = bookings
      .slice()
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0) * 0.9;

    const dashboardData = {
      totalVehicles: vehicles.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update user image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;

    const imageFile = req.file;

    // Upload Image to ImageKit
    const filebuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.files.upload({
      file: await toFile(filebuffer),
      fileName: imageFile.originalname,
      folder: "/user",
    });

    // Optimization through imagekit URL transformation
    var optimizedImageUrl = imagekit.helper.buildSrc({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      src: response.filePath,
      transformation: [
        {
          width: "400", // Width resizing
          quality: "auto", // Auto Compression
          format: "webp", // Convert to modern format
        },
      ],
    });

    const image = optimizedImageUrl;

    await User.findByIdAndUpdate(_id, { image });

    res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
