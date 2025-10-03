import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

config();
import authRoutes from "./routes/auth.route.js";
import otpRoutes from "./routes/otp.routes.js";

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration (if needed)
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        process.env.CLIENT_URL || "http://localhost:3000"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Database connection
connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// Health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
