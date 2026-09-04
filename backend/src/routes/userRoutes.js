const express = require("express");

const { getUsers } = require("../controllers/userController");

const authenticateToken = require("../middlewares/authMiddleware");

const authorizePermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizePermission("manage_users"),
    getUsers
);

module.exports = router;