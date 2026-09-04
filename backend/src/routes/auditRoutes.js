const express = require("express");

const { getAuditLogs } = require("../controllers/auditController");

const authenticateToken = require("../middlewares/authMiddleware");

const authorizePermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizePermission("view_audit_logs"),
    getAuditLogs
);

module.exports = router;