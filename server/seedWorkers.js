// seedWorkers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./src/models/user.model.js"; // Adjust path if needed
import { hashPassword } from "./src/utils/password.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/work-junction";

const createDummyWorkers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear previous dummy workers
    await User.deleteMany({ role: "WORKER" });

    const workers = [];

    const names = [
      "Aarav Patel",
      "Rohan Mehta",
      "Krishna Shah",
      "Neha Desai",
      "Isha Bhatt",
      "Aditya Joshi",
      "Meera Chauhan",
      "Raj Singh",
      "Vikram Nair",
      "Priya Iyer",
    ];

    const cities = [
      "Ahmedabad",
      "Rajkot",
      "Surat",
      "Vadodara",
      "Bhavnagar",
      "Jamnagar",
      "Anand",
      "Junagadh",
      "Gandhinagar",
      "Navsari",
    ];

    for (let i = 0; i < 10; i++) {
      const name = names[i];
      const city = cities[i];
      const email = `worker${i + 1}@example.com`;
      
      const password = await hashPassword(`Worker${i + 1}@123`)

      const worker = {
        email,
        password,
        name,
        phone: `98765032${i.toString().padStart(2, "0")}`,
        role: "WORKER",
        isVerified: true,
        address: {
          houseNo: `${100 + i}`,
          street: "Main Street",
          area: "Central Zone",
          city,
          state: "Gujarat",
          pincode: "380001",
          coordinates: {
            latitude: "23.02",
            longitude: "72.57",
          },
        },
        workerProfile: {
          preferredLanguage: "English",
          verification: {
            status: "APPROVED",
            selfieUrl: `https://example.com/selfie/worker${i + 1}.jpg`,
            addharDocUrl: `https://example.com/aadhaar/worker${i + 1}.pdf`,
            policeVerificationDocUrl: `https://example.com/police/worker${i + 1}.pdf`,
            isSelfieVerified: true,
            isAddharDocVerified: true,
            isPoliceVerificationDocVerified: true,
            verifiedAt: new Date(),
          },
          bankDetails: {
            accountNumber: `100020003000${i}`,
            accountHolderName: name,
            IFSCCode: "HDFC0001234",
            bankName: "HDFC Bank",
          },
          timetable: {
            Monday: "9:00 AM - 6:00 PM",
            Tuesday: "9:00 AM - 6:00 PM",
            Wednesday: "9:00 AM - 6:00 PM",
            Thursday: "9:00 AM - 6:00 PM",
            Friday: "9:00 AM - 6:00 PM",
            Saturday: "10:00 AM - 4:00 PM",
            Sunday: "",
          },
          nonAvailability: [
            {
              date: new Date("2025-10-10"),
              timeSlot: "Full Day",
              reason: "Family Function",
            },
          ],
        },
      };

      workers.push(worker);
    }

    await User.insertMany(workers);

    console.log("✅ 10 dummy workers inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting dummy data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createDummyWorkers();
