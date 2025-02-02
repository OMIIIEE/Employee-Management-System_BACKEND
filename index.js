import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js"; // Import the MongoDB connection file
import {adminRoutes} from "./Routes/AdminRoute.js";
import { employeeRouter } from "./Routes/EmployeeRoute.js";
import bodyParser from "body-parser";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3003;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
// Define your frontend domain
const allowedOrigins = ['https://employee-management-system-frontend-livid.vercel.app',"https://employee-management-system-frontend-2527pugmf.vercel.app/"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // If you're using cookies or HTTP authentication
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("Public"));

// Middleware to verify user authentication
const verifyUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ Status: false, Error: "Not Authenticated" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ Status: false, Error: "Invalid Token" });
    }

    req.role = decoded.role;
    req.id = decoded.id;
    next();
  });
};

// Routes
app.use("/auth", adminRoutes);
app.use("/employee", employeeRouter);

app.get("/", (req, res) => {
  res.send("Backend is running with MongoDB");
});

// Verify route
app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
