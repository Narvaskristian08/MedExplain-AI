import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Custom Logging Middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    endpoint: req.url,
    timestamp: new Date().toISOString(),
    status: res.statusCode,
  });
  next();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// === Routes ===
import userRoutes from "./modules/auth/routes/user.routes.js";
app.use("/api/users", userRoutes);

import documentRoutes from "./modules/documents/routes/document.routes.js";
app.use("/api/documents", documentRoutes);

// 404 Error Handler
app.use((req, res) => {
  logger.warn({
    method: req.method,
    endpoint: req.url,
    message: `404 - Route not found`,
    status: res.statusCode,
    timestamp: new Date().toISOString(),
  });
  res.status(404).send(`<h1>404 - Route not found</h1><p>${req.method} ${req.url}</p>`);
});

// Default route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// === Database + Server Start ===
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
  });

export default app;
