import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for seeding Admin...");

    // Clear existing admins
    await Admin.deleteMany({});

    // Create new admin
    const password = "adminpassword123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const rootAdmin = new Admin({
      username: "admin",
      passwordHash,
    });

    await rootAdmin.save();
    console.log("✅ Admin user created successfully.");
    console.log("Username: admin");
    console.log("Password: adminpassword123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
