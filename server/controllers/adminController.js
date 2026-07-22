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
    const registeredUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const bookings = await Booking.find({})
      .populate("vehicle user owner")
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ status: "pending" });
    const completedBookings = await Booking.find({ status: "confirmed" });
    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed",
    );
    const totalConfirmedRevenue = bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0);
    const monthlyRevenue = totalConfirmedRevenue * 0.1;

    const bookingConversionRate = bookings.length
      ? (confirmedBookings.length / bookings.length) * 100
      : 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysInCurrentMonth = Math.round(
      (monthEnd - monthStart) / (1000 * 60 * 60 * 24),
    );
    const bookedDaysThisMonth = confirmedBookings.reduce((total, booking) => {
      const pickup = new Date(booking.pickupDate);
      const returned = new Date(booking.returnDate);
      const clippedStart = Math.max(pickup.getTime(), monthStart.getTime());
      const clippedEnd = Math.min(returned.getTime(), monthEnd.getTime());

      if (clippedEnd <= clippedStart) return total;
      return total + (clippedEnd - clippedStart) / (1000 * 60 * 60 * 24);
    }, 0);
    const vehicleUtilizationRate = vehicles.length
      ? Math.min(
          100,
          (bookedDaysThisMonth / (vehicles.length * daysInCurrentMonth)) * 100,
        )
      : 0;

    const bookingsByVehicle = bookings.reduce((groups, booking) => {
      const vehicleId =
        booking.vehicle?._id?.toString() || booking.vehicle?.toString();
      if (!vehicleId) return groups;
      groups[vehicleId] ??= [];
      groups[vehicleId].push(booking);
      return groups;
    }, {});
    const conflictingBookingIds = new Set();
    Object.values(bookingsByVehicle).forEach((vehicleBookings) => {
      vehicleBookings.forEach((booking, index) => {
        const pickup = new Date(booking.pickupDate).getTime();
        const returned = new Date(booking.returnDate).getTime();
        for (
          let nextIndex = index + 1;
          nextIndex < vehicleBookings.length;
          nextIndex += 1
        ) {
          const nextBooking = vehicleBookings[nextIndex];
          const nextPickup = new Date(nextBooking.pickupDate).getTime();
          const nextReturned = new Date(nextBooking.returnDate).getTime();
          if (pickup <= nextReturned && returned >= nextPickup) {
            conflictingBookingIds.add(booking._id.toString());
            conflictingBookingIds.add(nextBooking._id.toString());
          }
        }
      });
    });
    const bookingConflictRate = bookings.length
      ? (conflictingBookingIds.size / bookings.length) * 100
      : 0;

    const rentalDurations = bookings
      .map(
        (booking) =>
          (new Date(booking.returnDate) - new Date(booking.pickupDate)) /
          (1000 * 60 * 60 * 24),
      )
      .filter((duration) => Number.isFinite(duration) && duration > 0);
    const averageRentalDuration = rentalDurations.length
      ? rentalDurations.reduce((total, duration) => total + duration, 0) /
        rentalDurations.length
      : 0;

    const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyActiveUsers = new Set(
      bookings
        .filter((booking) => booking.createdAt >= activeSince)
        .map(
          (booking) =>
            booking.user?._id?.toString() || booking.user?.toString(),
        )
        .filter(Boolean),
    ).size;

    res.json({
      success: true,
      dashboardData: {
        totalVehicles: vehicles.length,

        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        recentBookings: bookings.slice(0, 3),
        monthlyRevenue,
        registeredUsers,
        bookingConversionRate,
        vehicleUtilizationRate,
        bookingConflictRate,
        averageRentalDuration,
        monthlyActiveUsers,
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

    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    const vehicleCounts = await Vehicle.aggregate([
      { $match: { owner: { $ne: null } } },
      { $group: { _id: "$owner", vehicleCount: { $sum: 1 } } },
    ]);
    const vehicleCountByOwner = new Map(
      vehicleCounts.map(({ _id, vehicleCount }) => [
        _id.toString(),
        vehicleCount,
      ]),
    );
    const usersWithStats = users.map((user) => ({
      ...user.toObject(),
      vehicleCount: vehicleCountByOwner.get(user._id.toString()) || 0,
    }));

    res.json({ success: true, users: usersWithStats });
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
