import path from "path";
import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";
import Car from "../models/Car.js";
import { toFile } from "@imagekit/nodejs";

// API to Change Role of User
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list vehicle" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to list vehicle
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    let car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    // Upload Image to ImageKit
    const filebuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.files.upload({
      file: await toFile(filebuffer),
      fileName: imageFile.originalname,
      folder: "/vehicles",
    });

    // Optimization through imagekit URL transformation

    // w-width=1280 (Width resizing), q-quality=auto (Auto Compression), f-format=webp (Convert to modern format)
    var optimizedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/${response.filePath}?tr=w-1280,q-auto,f-webp`;

    const image = optimizedImageUrl;
    await Car.create({ ...car, owner: _id, image });

    res.json({ success: true, message: "Car Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
