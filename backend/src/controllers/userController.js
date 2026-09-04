const pool = require("../config/db");

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.is_active,
                u.created_at,
                r.role_id,
                r.role_name
            FROM users u
            LEFT JOIN user_roles ur
                ON u.user_id = ur.user_id
            LEFT JOIN roles r
                ON ur.role_id = r.role_id
            ORDER BY u.user_id
        `);

        res.json({
            message: "Users retrieved successfully",
            count: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error("Get users error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getUsers
};