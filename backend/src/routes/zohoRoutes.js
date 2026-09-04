const express = require("express");

const {
    getLeads,
    getPeopleEmployees
} = require("../controllers/zohoController");

const authenticateToken = require("../middlewares/authMiddleware");

const authorizePermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.get(
    "/leads",
    authenticateToken,
    authorizePermission("view_zoho_crm"),
    getLeads
);

router.get(
    "/people/employees",
    authenticateToken,
    authorizePermission("view_zoho_people"),
    getPeopleEmployees
);

module.exports = router;