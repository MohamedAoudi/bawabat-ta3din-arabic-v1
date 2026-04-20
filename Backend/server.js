const express = require("express");
const cors = require("cors");
const pool = require("./db");
const userRoutes = require("./Routes/userRoutes");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// User routes (multilingual)
app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});