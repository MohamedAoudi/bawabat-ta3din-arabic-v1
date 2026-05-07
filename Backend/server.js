const express = require("express");
const cors = require("cors");
const pool = require("./db");
const userRoutes = require("./Routes/userRoutes");
const countryRoutes = require("./Routes/countryRoutes");
const mineralRoutes = require("./Routes/mineralRoutes");
const hsProductRoutes = require("./Routes/hsProductRoutes");
const tradePartnerRoutes = require("./Routes/tradePartnerRoutes");
const yearRoutes = require("./Routes/yearRoutes");
const mineralProductionRoutes = require("./Routes/mineralProductionRoutes");
const tradeTransactionRoutes = require("./Routes/tradeTransactionRoutes");
const bilateralTradeRoutes = require("./Routes/bilateralTradeRoutes");
const countryProductionSummaryRoutes = require("./Routes/countryProductionSummaryRoutes");
const countryTradeSummaryRoutes = require("./Routes/countryTradeSummaryRoutes");
const path = require("path");
const { runMigrations } = require("./migrate");
const { seedOnStartup } = require("./seed");

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
app.use("/api/minerals", mineralRoutes);
app.use("/api/hs-products", hsProductRoutes);
app.use("/api/trade-partners", tradePartnerRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/mineral-production", mineralProductionRoutes);
app.use("/api/trade-transactions", tradeTransactionRoutes);
app.use("/api/bilateral-trade", bilateralTradeRoutes);
app.use("/api/country-production-summaries", countryProductionSummaryRoutes);
app.use("/api/country-trade-summaries", countryTradeSummaryRoutes);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await runMigrations();
    await seedOnStartup();

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur:", error.message);
    process.exit(1);
  }
}

startServer();