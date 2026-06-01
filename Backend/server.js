const express = require("express");
const cors = require("cors");
const pool = require("./db");
const userRoutes = require("./Routes/userRoutes");
const mineralsRoutes = require("./Routes/mineralsRoutes");
const countriesRoutes = require("./Routes/countriesRoutes");
const mineralProductionRoutes = require("./Routes/mineralProductionRoutes");
const tradePartnersRoutes = require("./Routes/tradePartnersRoutes");
const tradeTransactionsRoutes = require("./Routes/tradeTransactionsRoutes");

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
// Other API routes
app.use("/api/minerals", mineralsRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/mineral-production", mineralProductionRoutes);
app.use("/api/trade-partners", tradePartnersRoutes);
app.use("/api/trade-transactions", tradeTransactionsRoutes);


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