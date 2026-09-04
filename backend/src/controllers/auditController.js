const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.log_id,
                a.user_id,
                u.full_name AS user_name,
                u.email AS user_email,
                a.action,
                a.resource,
                a.details,
                a.ip_address,
                a.created_at
            FROM audit_logs a
            LEFT JOIN users u
                ON a.user_id = u.user_id
            ORDER BY a.created_at DESC
        `);

        res.json({
            message: "Audit logs retrieved successfully",
            count: result.rows.length,
            logs: result.rows
        });

    } catch (error) {
        console.error("Get audit logs error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getAuditLogs
};