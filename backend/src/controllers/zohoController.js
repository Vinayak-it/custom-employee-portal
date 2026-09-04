const { getZohoAccessToken } = require("../services/zohoService");
const { createAuditLog } = require("../services/auditService");
const axios = require("axios");

const getLeads = async (req, res) => {
    try {
        const accessToken = await getZohoAccessToken();

        const response = await axios.get(
            "https://www.zohoapis.in/crm/v8/Leads",
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`
                },
                params: {
                    fields: "First_Name,Last_Name,Company,Email,Phone,Lead_Status"
                }
            }
        );

        await createAuditLog({
            userId: req.user.user_id,
            action: "VIEW",
            resource: "zoho_crm_leads",
            details: "Zoho CRM leads accessed",
            ipAddress: req.ip
        });

        res.json({
            message: "Zoho CRM leads retrieved successfully",
            data: response.data
        });

    } catch (error) {
        console.error(
            "Zoho CRM error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Unable to retrieve Zoho CRM leads"
        });
    }
};

const getPeopleEmployees = async (req, res) => {
    try {
        const accessToken = await getZohoAccessToken();

        const response = await axios.get(
            "https://people.zoho.in/people/api/forms/employee/getRecords",
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`
                }
            }
        );

        await createAuditLog({
            userId: req.user.user_id,
            action: "VIEW",
            resource: "zoho_people_employees",
            details: "Viewed Zoho People employee records",
            ipAddress: req.ip
        });

        if (response.data?.response?.status === 1) {
                return res.status(502).json({
                    message:
                        response.data.response.message ||
                        "Zoho People returned an error"
                });
            }

            res.json(response.data);

    } catch (error) {
        console.error(
            "Zoho People error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Unable to access Zoho People"
        });
    }
};

module.exports = {
    getLeads,
    getPeopleEmployees
};