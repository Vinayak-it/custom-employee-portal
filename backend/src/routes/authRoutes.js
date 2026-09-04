const express = require("express");
const { login } = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");
const authorizePermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
    res.json({
        message: "Authentication successful",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticateToken,
    authorizePermission("manage_users"),
    (req, res) => {
        res.json({
            message: "Permission granted: manage_users",
            user: req.user
        });
    }
);

router.get(
    "/permission-test",
    authenticateToken,
    authorizePermission("manage_users"),
    (req, res) => {
        res.json({
            message: "Permission granted: manage_users",
            user: req.user
        });
    }
);

module.exports = router;