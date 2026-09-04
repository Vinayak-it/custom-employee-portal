const express = require("express");

const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const authenticateToken = require("../middlewares/authMiddleware");
const authorizePermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizePermission("manage_users"),
    getEmployees
);

router.get(
    "/:id",
    authenticateToken,
    authorizePermission("manage_users"),
    getEmployeeById
);

router.post(
    "/",
    authenticateToken,
    authorizePermission("manage_users"),
    createEmployee
);

router.put(
    "/:id",
    authenticateToken,
    authorizePermission("manage_users"),
    updateEmployee
);

router.delete(
    "/:id",
    authenticateToken,
    authorizePermission("manage_users"),
    deleteEmployee
);

module.exports = router;