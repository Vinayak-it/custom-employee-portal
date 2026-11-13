import { useEffect, useState } from "react";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [leads, setLeads] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [peopleEmployees, setPeopleEmployees] = useState([]);

    // Controls which Admin table is currently visible.
    // null means no Admin table is open.
    const [activeAdminSection, setActiveAdminSection] = useState(null);

  

    const [showEmployeeForm, setShowEmployeeForm] = useState(false);

    const [employeeForm, setEmployeeForm] = useState({
        employee_code: "",
        full_name: "",
        email: "",
        department: "",
        designation: "",
        phone: "",
        joining_date: "",
        employment_status: "Active"
    });

    const [editingEmployeeId, setEditingEmployeeId] = useState(null);

    const resetEmployeeForm = () => {
        setEmployeeForm({
            employee_code: "",
            full_name: "",
            email: "",
            department: "",
            designation: "",
            phone: "",
            joining_date: "",
            employment_status: "Active"
        });

        setEditingEmployeeId(null);
    };

    // Load Employees
    const loadEmployees = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/employees`,
                {
                    headers: {
                    Authorization: `Bearer ${token}`
                    }
                }
                );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    data.message ||
                    "Unable to load employees"
                );
                return;
            }

            setEmployees(
                data.employees || data.data || []
            );

        } catch (error) {
            console.error(
                "Employee loading error:",
                error
            );
        }
    };

    const loadPeopleEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/zoho/people/employees`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (!response.ok) {
                alert("Unable to load Zoho People employees");
                return;
            }

            const data = await response.json();

            const records = data.response?.result || [];

            const employeeList = records
            .flatMap((record) => Object.values(record))
            .flat();

            setPeopleEmployees(employeeList);

        } catch (error) {
            console.error("Zoho People error:", error);
            alert("Unable to connect to Zoho People");
        }
    };

    // Load Users
    const loadUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    data.message ||
                    "Unable to load users"
                );
                return;
            }

            setUsers(
                data.users || data.data || []
            );

        } catch (error) {
            console.error(
                "User loading error:",
                error
            );
        }
    };

    // Load Audit Logs
    const loadAuditLogs = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/audit-logs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    data.message ||
                    "Unable to load audit logs"
                );
                return;
            }

            setAuditLogs(
                data.logs || data.data || []
            );

        } catch (error) {
            console.error(
                "Audit log loading error:",
                error
            );
        }
    };

    // Load all Admin dashboard data
    const loadAdminData = async () => {
        await loadEmployees();
        await loadUsers();
        await loadAuditLogs();
    };

    // Check existing login after page refresh
    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            try {
                const response = fetch(`${API_BASE_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    localStorage.removeItem("token");
                    return;
                }

                setUser(data.user);

                if (data.user.role_name === "Admin") {
                    await loadAdminData();
                }

            } catch (error) {
                console.error(
                    "Session check error:",
                    error
                );
            }
        };

        checkLogin();
    }, []);

    // Login
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Login failed"
                );
                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            setUser(data.user);

            // Automatically load Admin dashboard data
            if (data.user.role_name === "Admin") {
                await loadAdminData();
            }

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            alert(
                "Unable to connect to server"
            );
        }
    };

    // Add Employee
    const addEmployee = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/employees`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(employeeForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to add employee"
                );
                return;
            }

            setEmployees([
                ...employees,
                data.employee || data.data
            ]);

            resetEmployeeForm();
            setShowEmployeeForm(false);

        } catch (error) {
            console.error(
                "Add employee error:",
                error
            );

            alert(
                "Unable to connect to server"
            );
        }
    };

    // Update Employee
    const updateEmployee = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/employees/${editingEmployeeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(employeeForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to update employee"
                );
                return;
            }

            setEmployees(
                employees.map((employee) =>
                    employee.employee_id === editingEmployeeId
                        ? data.employee || data.data
                        : employee
                )
            );

            resetEmployeeForm();
            setShowEmployeeForm(false);

        } catch (error) {
            console.error(
                "Update employee error:",
                error
            );

            alert(
                "Unable to connect to server"
            );
        }
    };

    return (
        <>
            {user ? (
                <div className="dashboard">

                    {/* Dashboard Header */}
                    <div className="dashboard-header">
                        <div>
                            <h1>BrainWave</h1>
                            <p>Employee Portal</p>
                        </div>

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                setUser(null);
                                setLeads([]);
                                setEmployees([]);
                                setUsers([]);
                                setAuditLogs([]);
                                setActiveAdminSection(null);
                                resetEmployeeForm();
                                setShowEmployeeForm(false);
                            }}
                        >
                            Logout
                        </button>
                    </div>


                    {/* Welcome Card */}
                    <div className="welcome-card">
                        <h2>
                            Welcome, {user.full_name}
                        </h2>

                        <p>
                            Email: {user.email}
                        </p>

                        <p>
                            Role: {user.role_name}
                        </p>
                    </div>


                    {/* Dashboard Summary */}
                    {user.role_name === "Admin" && (
                        <div className="summary-container">

                            <div className="summary-card">
                                <h3>
                                    Total Employees
                                </h3>

                                <p>
                                    {employees.length}
                                </p>
                            </div>

                            <div className="summary-card">
                                <h3>
                                    Total Users
                                </h3>

                                <p>
                                    {users.length}
                                </p>
                            </div>

                            <div className="summary-card">
                                <h3>
                                    Total Audit Logs
                                </h3>

                                <p>
                                    {auditLogs.length}
                                </p>
                            </div>

                        </div>
                    )}


                    {/* Authorized Services */}
<div className="dashboard-card">
    <h2>
        Authorized Services
    </h2>

   <div className="admin-button-group">

    {user.role_name === "Admin" ||
    user.role_name === "Sales" ? (
        <button
            className="service-button"
            onClick={async () => {
                setActiveAdminSection("zoho");

                try {
                    const token =
                        localStorage.getItem("token");

                    const response =
                        await fetch(`${API_BASE_URL}/api/zoho/leads`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        alert(
                            data.message ||
                            "Unable to access Zoho CRM"
                        );
                        return;
                    }

                    setLeads(
                        data.data?.data ||
                        []
                    );

                } catch (error) {
                    console.error(
                        "Zoho CRM error:",
                        error
                    );

                    alert(
                        "Unable to connect to Zoho CRM"
                    );
                }
            }}
        >
            Zoho CRM
        </button>
    ) : null}

    {user.role_name === "Admin" ||
    user.role_name === "HR" ? (
        <button
            className="service-button"
            onClick={() => {
                setActiveAdminSection("people");
                loadPeopleEmployees();
            }}
        >
            Zoho People
        </button>
    ) : null}

</div>


    {/* CRM Leads Table */}
    {activeAdminSection === "zoho" && leads.length > 0 && (
        <div className="leads-section">
            <h3>
                CRM Leads
            </h3>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>
                                Lead Name
                            </th>
                            <th>
                                Email
                            </th>
                            <th>
                                Company
                            </th>
                            <th>
                                Phone
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {leads.map(
                            (lead) => (
                                <tr
                                    key={
                                        lead.id
                                    }
                                >
                                    <td>
                                        {lead.Full_Name ||
                                            [
                                                lead.First_Name,
                                                lead.Last_Name
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    " "
                                                ) ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {lead.Email ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {lead.Company ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {lead.Phone ||
                                            "N/A"}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )}


    {/* Zoho People Employees Table */}
    {activeAdminSection === "people" &&
    peopleEmployees.length > 0 && (
        <div className="leads-section">
            <h3>
                Zoho People Employees
            </h3>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Email</th>
                            <th>Designation</th>
                        </tr>
                    </thead>

                    <tbody>
                        {peopleEmployees.map(
                            (employee, index) => (
                                <tr key={index}>
                                    <td>
                                        {employee.Employeeno ||
                                            employee.EmployeeID ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {employee.FirstName ||
                                        employee.LastName
                                            ? `${employee.FirstName || ""} ${employee.LastName || ""}`.trim()
                                            : employee.EmployeeName ||
                                              "N/A"}
                                    </td>

                                    <td>
                                        {employee.EmailID || "N/A"}
                                    </td>

                                    <td>
                                        {employee.Designation ||
                                            "N/A"}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )}

    {user.role_name !== "Admin" &&
    user.role_name !== "Sales" &&
    user.role_name !== "HR" ? (
        <p>
            No Zoho services are available for your role.
        </p>
    ) : null}
</div>


                    {/* Admin Management */}
                    {user.role_name === "Admin" && (
                        <div className="dashboard-card">
                            <h2>
                                Admin Management
                            </h2>

                            <p>
                                Manage employees and user access.
                            </p>


                            {/* Admin Buttons */}
                            <div className="admin-button-group">

                                <button
                                    className="service-button"
                                    onClick={() => {
                                        if (showEmployeeForm) {
                                            resetEmployeeForm();
                                            setShowEmployeeForm(
                                                false
                                            );
                                        } else {
                                            resetEmployeeForm();
                                            setShowEmployeeForm(
                                                true
                                            );
                                        }
                                    }}
                                >
                                    {showEmployeeForm
                                        ? "Cancel"
                                        : "Add Employee"}
                                </button>

                                <button
                                    className="service-button"
                                    onClick={() => {
                                        setActiveAdminSection("employees");
                                        loadEmployees();
                                    }}
                                >
                                    Load Employees
                                </button>

                            </div>


                            {/* Add / Edit Employee Form */}
                            {showEmployeeForm && (
                                <div className="employee-form">

                                    <h3>
                                        {editingEmployeeId
                                            ? "Edit Employee"
                                            : "Add New Employee"}
                                    </h3>

                                    <input
                                        type="text"
                                        placeholder="Employee Code"
                                        value={
                                            employeeForm.employee_code
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                employee_code:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={
                                            employeeForm.full_name
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                full_name:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={
                                            employeeForm.email
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                email:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="text"
                                        placeholder="Department"
                                        value={
                                            employeeForm.department
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                department:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="text"
                                        placeholder="Designation"
                                        value={
                                            employeeForm.designation
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                designation:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <input
                                        type="text"
                                        placeholder="Phone"
                                        value={
                                            employeeForm.phone
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                phone:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <label>
                                        Joining Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            employeeForm.joining_date
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                joining_date:
                                                    e.target.value
                                            })
                                        }
                                    />

                                    <label>
                                        Employment Status
                                    </label>

                                    <select
                                        value={
                                            employeeForm.employment_status
                                        }
                                        onChange={(e) =>
                                            setEmployeeForm({
                                                ...employeeForm,
                                                employment_status:
                                                    e.target.value
                                            })
                                        }
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    <button
                                        className="service-button"
                                        onClick={
                                            editingEmployeeId
                                                ? updateEmployee
                                                : addEmployee
                                        }
                                    >
                                        {editingEmployeeId
                                            ? "Update Employee"
                                            : "Save Employee"}
                                    </button>

                                </div>
                            )}


                            {/* Employee List */}
                            {activeAdminSection === "employees" && (
                                <div className="employees-section">
                                    <h3>
                                        Employee List
                                    </h3>

                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Employee Code
                                                    </th>
                                                    <th>
                                                        Full Name
                                                    </th>
                                                    <th>
                                                        Email
                                                    </th>
                                                    <th>
                                                        Department
                                                    </th>
                                                    <th>
                                                        Designation
                                                    </th>
                                                    <th>
                                                        Phone
                                                    </th>
                                                    <th>
                                                        Status
                                                    </th>
                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {employees.map(
                                                    (employee) => (
                                                        <tr
                                                            key={
                                                                employee.employee_id
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    employee.employee_code
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.full_name
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.email
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.department ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.designation ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.phone ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    employee.employment_status
                                                                }
                                                            </td>

                                                            <td>
                                                                {/* Edit */}
                                                                <button
                                                                    className="edit-button"
                                                                    onClick={() => {
                                                                        setEmployeeForm(
                                                                            {
                                                                                employee_code:
                                                                                    employee.employee_code,
                                                                                full_name:
                                                                                    employee.full_name,
                                                                                email:
                                                                                    employee.email,
                                                                                department:
                                                                                    employee.department ||
                                                                                    "",
                                                                                designation:
                                                                                    employee.designation ||
                                                                                    "",
                                                                                phone:
                                                                                    employee.phone ||
                                                                                    "",
                                                                                joining_date:
                                                                                    employee.joining_date
                                                                                        ? employee.joining_date.substring(
                                                                                            0,
                                                                                            10
                                                                                        )
                                                                                        : "",
                                                                                employment_status:
                                                                                    employee.employment_status ||
                                                                                    "Active"
                                                                            }
                                                                        );

                                                                        setEditingEmployeeId(
                                                                            employee.employee_id
                                                                        );

                                                                        setShowEmployeeForm(
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>


                                                                {/* Delete */}
                                                                <button
                                                                    className="delete-button"
                                                                    onClick={async () => {
                                                                        const confirmDelete =
                                                                            window.confirm(
                                                                                `Are you sure you want to delete ${employee.full_name}?`
                                                                            );

                                                                        if (
                                                                            !confirmDelete
                                                                        ) {
                                                                            return;
                                                                        }

                                                                        try {
                                                                            const token =
                                                                                localStorage.getItem(
                                                                                    "token"
                                                                                );

                                                                            const response =
                                                                                await fetch(`${API_BASE_URL}/api/employees/${employee.employee_id}`,
                                                                                    {
                                                                                        method: "DELETE",
                                                                                        headers: {
                                                                                            Authorization: `Bearer ${token}`
                                                                                        }
                                                                                    }
                                                                                );

                                                                            const data =
                                                                                await response.json();

                                                                            if (
                                                                                !response.ok
                                                                            ) {
                                                                                alert(
                                                                                    data.message ||
                                                                                    "Unable to delete employee"
                                                                                );
                                                                                return;
                                                                            }

                                                                            setEmployees(
                                                                                employees.filter(
                                                                                    (
                                                                                        item
                                                                                    ) =>
                                                                                        item.employee_id !==
                                                                                        employee.employee_id
                                                                                )
                                                                            );

                                                                        } catch (
                                                                            error
                                                                        ) {
                                                                            console.error(
                                                                                "Delete employee error:",
                                                                                error
                                                                            );

                                                                            alert(
                                                                                "Unable to connect to server"
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>

                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* User Management */}
                    {user.role_name === "Admin" && (
                        <div className="dashboard-card">
                            <h2>
                                User Management
                            </h2>

                            <p>
                                View portal users and their assigned roles.
                            </p>

                            <button
                                className="service-button"
                                onClick={() => {
                                    setActiveAdminSection("users");
                                    loadUsers();
                                }}
                            >
                                Load Users
                            </button>

                            {activeAdminSection === "users" && users.length > 0 && (
                                <div className="users-section">
                                    <h3>
                                        Portal Users
                                    </h3>

                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Name
                                                    </th>
                                                    <th>
                                                        Email
                                                    </th>
                                                    <th>
                                                        Role
                                                    </th>
                                                    <th>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {users.map(
                                                    (portalUser) => (
                                                        <tr
                                                            key={
                                                                portalUser.user_id
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    portalUser.full_name
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    portalUser.email
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    portalUser.role_name ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    portalUser.is_active
                                                                        ? "Active"
                                                                        : "Inactive"
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Audit Logs */}
                    {user.role_name === "Admin" && (
                        <div className="dashboard-card">
                            <h2>
                                Audit Logs
                            </h2>

                            <p>
                                View important activities performed in the portal.
                            </p>

                            <button
                                className="service-button"
                                onClick={() => {
                                    setActiveAdminSection("audit");
                                    loadAuditLogs();
                                }}
                            >
                                Load Audit Logs
                            </button>

                            {activeAdminSection === "audit" && auditLogs.length > 0 && (
                                <div className="audit-section">
                                    <h3>
                                        Activity History
                                    </h3>

                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        User
                                                    </th>
                                                    <th>
                                                        Action
                                                    </th>
                                                    <th>
                                                        Resource
                                                    </th>
                                                    <th>
                                                        Details
                                                    </th>
                                                    <th>
                                                        IP Address
                                                    </th>
                                                    <th>
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {auditLogs.map(
                                                    (log) => (
                                                        <tr
                                                            key={
                                                                log.log_id
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    log.user_name ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    log.action
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    log.resource
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    log.details ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    log.ip_address ||
                                                                    "N/A"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    log.created_at
                                                                        ? new Date(
                                                                            log.created_at
                                                                        ).toLocaleString()
                                                                        : "N/A"
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            ) : (
                /* Login Page */
                <div className="login-page">
                    <div className="login-card">

                        <h1>
                            BrainWave
                        </h1>

                        <p className="subtitle">
                            Employee Portal
                        </p>

                        <form onSubmit={handleLogin}>

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />


                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />


                            <button type="submit">
                                Login
                            </button>

                        </form>

                    </div>
                </div>
            )}
        </>
    );
}

export default App;