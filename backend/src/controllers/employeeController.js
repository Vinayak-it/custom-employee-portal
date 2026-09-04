const pool = require("../config/db");
const { createAuditLog } = require("../services/auditService");

const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                employee_id,
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status
            FROM employees
            ORDER BY employee_id
        `);

        res.json({
            message: "Employees retrieved successfully",
            count: result.rows.length,
            employees: result.rows
        });

    } catch (error) {
        console.error("Get employees error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                employee_id,
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status
            FROM employees
            WHERE employee_id = $1
            `,
            [employeeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            message: "Employee retrieved successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Get employee error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const createEmployee = async (req, res) => {
    try {
        const {
            employee_code,
            full_name,
            email,
            department,
            designation,
            phone,
            joining_date,
            employment_status
        } = req.body;

        if (!employee_code || !full_name || !email) {
            return res.status(400).json({
                message: "Employee code, full name and email are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO employees (
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                employee_id,
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status
            `,
            [
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status || "Active"
            ]
        );

        await createAuditLog({
            userId: req.user.user_id,
            action: "CREATE",
            resource: "employee",
            details: `Employee ${result.rows[0].employee_code} created`,
            ipAddress: req.ip
        });

        res.status(201).json({
            message: "Employee created successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Create employee error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Employee code or email already exists"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const {
            employee_code,
            full_name,
            email,
            department,
            designation,
            phone,
            joining_date,
            employment_status
        } = req.body;

        if (!employee_code || !full_name || !email) {
            return res.status(400).json({
                message: "Employee code, full name and email are required"
            });
        }

        const result = await pool.query(
            `
            UPDATE employees
            SET
                employee_code = $1,
                full_name = $2,
                email = $3,
                department = $4,
                designation = $5,
                phone = $6,
                joining_date = $7,
                employment_status = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = $9
            RETURNING
                employee_id,
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status
            `,
            [
                employee_code,
                full_name,
                email,
                department,
                designation,
                phone,
                joining_date,
                employment_status || "Active",
                employeeId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        await createAuditLog({
            userId: req.user.user_id,
            action: "UPDATE",
            resource: "employee",
            details: `Employee ${result.rows[0].employee_code} updated`,
            ipAddress: req.ip
        });

        res.json({
            message: "Employee updated successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Update employee error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Employee code or email already exists"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM employees
            WHERE employee_id = $1
            RETURNING
                employee_id,
                employee_code,
                full_name,
                email
            `,
            [employeeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        await createAuditLog({
            userId: req.user.user_id,
            action: "DELETE",
            resource: "employee",
            details: `Employee ${result.rows[0].employee_code} deleted`,
            ipAddress: req.ip
        });

        res.json({
            message: "Employee deleted successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Delete employee error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};