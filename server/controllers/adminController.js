import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import { toFile } from "@imagekit/nodejs";

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.json({ success: false, message: "Unauthorized" });
    return false;
  }
  return true;
};

export const getAdminDashboardData = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const vehicles = await Vehicle.find({});
    const bookings = await Booking.find({})
      .populate("vehicle user owner")
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ status: "pending" });
    const completedBookings = await Booking.find({ status: "confirmed" });
    const totalConfirmedRevenue = bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0);
    const monthlyRevenue = totalConfirmedRevenue * 0.1;

    res.json({
      success: true,
      dashboardData: {
        totalVehicles: vehicles.length,

        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        recentBookings: bookings.slice(0, 3),
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAdminVehicles = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const vehicles = await Vehicle.find({})
      .populate("owner")
      .sort({ createdAt: -1 });
    res.json({ success: true, vehicles });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const updateVehicleApproval = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { vehicleId, isApproved } = req.body;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    vehicle.isApproved = Boolean(isApproved);
    await vehicle.save();

    res.json({ success: true, message: "Vehicle approval updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const users = await User.find({ role: { $ne: "admin" } }).sort({
      createdAt: -1,
    });
    res.json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const toggleVehicleAvailability = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { vehicleId } = req.body;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();

    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { vehicleId } = req.body;
    const id = vehicleId;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
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

export const getAdminBookings = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const bookings = await Booking.find({})
      .populate("vehicle user owner")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const changeBookingStatus = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const updateUserImage = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { _id } = req.user;
    const imageFile = req.file;

    const filebuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.files.upload({
      file: await toFile(filebuffer),
      fileName: imageFile.originalname,
      folder: "/user",
    });

    const optimizedImageUrl = imagekit.helper.buildSrc({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      src: response.filePath,
      transformation: [
        {
          width: "400",
          quality: "auto",
          format: "webp",
        },
      ],
    });

    await User.findByIdAndUpdate(_id, { image: optimizedImageUrl });

    res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
