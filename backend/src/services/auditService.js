const pool = require("../config/db");

const createAuditLog = async ({
    userId,
    action,
    resource,
    details,
    ipAddress
}) => {
    try {
        await pool.query(
            `
            INSERT INTO audit_logs (
                user_id,
                action,
                resource,
                details,
                ip_address
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                userId,
                action,
                resource,
                details,
                ipAddress
            ]
        );
    } catch (error) {
        console.error("Audit log error:", error.message);
    }
};

module.exports = {
    createAuditLog
};