const express = require("express");
const cors = require("cors");
const pool = require("./db");


const path = require("path");
const { runMigrations } = require("./migrate");
const userRoutes = require("./Routes/userRoutes");
const countryRoutes = require("./Routes/countryRoutes");
const mineralProductionRoutes = require("./Routes/mineralProductionRoutes");
const tradePartnerRoutes = require("./Routes/tradePartnerRoutes");
const arabProductionRoutes = require("./Routes/arabProductionRoutes");
const worldProductionRoutes = require("./Routes/worldProductionRoutes");
const mineralTradeRoutes = require("./Routes/mineralTradeRoutes");
const tradeWorldRoutes = require("./Routes/tradeWorldRoutes");
const partnerTradeRoutes = require("./Routes/partnerTradeRoutes");


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
app.use("/api/countries", countryRoutes);
app.use("/api/minerals", mineralProductionRoutes);
app.use("/api/trade-partners", tradePartnerRoutes);
app.use("/api/arab-production", arabProductionRoutes);
app.use("/api/world-production", worldProductionRoutes);
app.use("/api/mineral-trade", mineralTradeRoutes);
app.use("/api/trade-world", tradeWorldRoutes);
app.use("/api/partner-trade", partnerTradeRoutes);




async function startServer() {
  try {
    await pool.query("SELECT 1");
    await runMigrations();

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur:", error.message);
    process.exit(1);
  }
}

startServer();