import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: ObjectId, ref: "User" },
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, default: "" },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    seating_capacity: { type: Number, required: true },
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    pricePerWeek: { type: Number, default: 0 },
    pricePerMonth: { type: Number, default: 0 },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
