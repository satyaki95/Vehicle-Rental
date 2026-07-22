import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

const calculatePrice = (vehicle, pickupDate, returnDate, rentalDuration) => {
  const pickup = new Date(pickupDate);
  const returned = new Date(returnDate);
  const totalDays = Math.max(
    1,
    Math.ceil((returned - pickup) / (1000 * 60 * 60 * 24)),
  );

  switch (rentalDuration) {
    case "weekly":
      return (
        vehicle.pricePerWeek || vehicle.pricePerDay * Math.ceil(totalDays / 7)
      );
    case "monthly":
      return (
        vehicle.pricePerMonth || vehicle.pricePerDay * Math.ceil(totalDays / 30)
      );
    default:
      return vehicle.pricePerDay * totalDays;
  }
};

// Function to Check Availability of vehicle for a given Date
const checkAvailability = async (vehicle, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    vehicle,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// API to Check Availability of Vehicles for the given Date and Location
export const checkAvailabilityOfVehicle = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    // Fetch all Available vehicles for the given location
    const vehicles = await Vehicle.find({ location, isAvailable: true });

    // Check Vehicle Availability for the given date range Using promise
    const availableVehiclesPromise = vehicles.map(async (vehicle) => {
      const isAvailable = await checkAvailability(
        vehicle._id,
        pickupDate,
        returnDate,
      );
      return { ...vehicle._doc, isAvailable: isAvailable };
    });

    let availableVehicles = await Promise.all(availableVehiclesPromise);
    availableVehicles = availableVehicles.filter(
      (vehicle) => vehicle.isAvailable === true,
    );

    res.json({ success: true, availableVehicles });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to create Booking
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      vehicle,
      pickupDate,
      returnDate,
      rentalDuration = "daily",
    } = req.body;
    const vehicleId = vehicle;

    const isAvailable = await checkAvailability(
      vehicleId,
      pickupDate,
      returnDate,
    );

    if (!isAvailable) {
      return res.json({ success: false, message: "Vehicle is not available" });
    }

    const vehicleData = await Vehicle.findById(vehicleId);

    if (!vehicleData || !vehicleData.isAvailable || !vehicleData.isApproved) {
      return res.json({
        success: false,
        message: "Vehicle is not available for booking",
      });
    }

    const price = calculatePrice(
      vehicleData,
      pickupDate,
      returnDate,
      rentalDuration,
    );

    await Booking.create({
      vehicle: vehicleId,
      owner: vehicleData.owner,
      user: _id,
      pickupDate,
      returnDate,
      rentalDuration,
      price,
    });

    res.json({ success: true, message: "Booking Created" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to List User Booking
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("vehicle")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate("vehicle user")
      .select("-user.password")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to Change Booking Status
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;

    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
