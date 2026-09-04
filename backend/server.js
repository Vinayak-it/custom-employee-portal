const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const auditRoutes = require("./src/routes/auditRoutes");
const userRoutes = require("./src/routes/userRoutes");
const zohoRoutes = require("./src/routes/zohoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/zoho", zohoRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "BrainWave Employee Portal API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM roles ORDER BY role_id");

        res.json({
            message: "Database connection successful",
            roles: result.rows
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});