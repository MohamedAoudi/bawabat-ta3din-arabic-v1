const express = require("express");
const cors = require("cors");
const pool = require("./db");
const userRoutes = require("./Routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// User routes (multilingual)
app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});