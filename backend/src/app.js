import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// === Routes ===
import userRoutes from "./modules/auth/routes/user.routes.js";
app.use("/api/users", userRoutes);

import documentRoutes from "./modules/documents/routes/document.routes.js";
app.use("/api/documents", documentRoutes);

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
