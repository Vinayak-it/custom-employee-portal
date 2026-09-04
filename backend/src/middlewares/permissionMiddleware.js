const pool = require("../config/db");

const authorizePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // Authentication must happen first
            if (!req.user) {
                return res.status(401).json({
                    message: "Authentication required"
                });
            }

            const userId = req.user.user_id;

            // Check whether the user's role has the required permission
            const result = await pool.query(
                `
                SELECT p.permission_name
                FROM user_roles ur
                JOIN role_permissions rp
                    ON ur.role_id = rp.role_id
                JOIN permissions p
                    ON rp.permission_id = p.permission_id
                WHERE ur.user_id = $1
                  AND p.permission_name = $2
                `,
                [userId, requiredPermission]
            );

            // Permission not found
            if (result.rows.length === 0) {
                return res.status(403).json({
                    message: "Permission denied"
                });
            }

            // Permission exists
            next();

        } catch (error) {
            console.error("Permission authorization error:", error.message);

            return res.status(500).json({
                message: "Server error"
            });
        }
    };
};

module.exports = authorizePermission;