import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
