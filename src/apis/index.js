import axios from "axios";
import config from "../config/config";

const http = axios.create({
    baseURL: config.API_URL,
});

const toolsProcbee = axios.create({
    baseURL: "https://tools.procbee.in",
});

const toolsTrending = axios.create({
    baseURL: "https://tools.trending-trends.com",
});

const devAPI = axios.create({ baseURL: "http://13.234.159.105" });

http.defaults.withCredentials = false;

toolsProcbee.defaults.withCredentials = false;

// Interceptor for all outgoing api calls
http.interceptors.request.use((config, _onReject) => {
    return config;
});

toolsProcbee.interceptors.request.use((config, _onReject) => {
    return config;
});

// dashboard data APIs

export const showAllLeads = (data, params, headers) => http.post("/dashboard/showAllLeads2", data, { params, headers });

export const uploadCSVToDashboard = (data, params, headers) =>
    http.post("/dashboard/uploadCSVToDashboard", data, { params, headers });

export const getUserUploadedCSVData = (data, params, headers) =>
    http.post("/dashboard/getUserUploadedCSVData", data, { params, headers });

export const registerUserIndiamart = (data, params, headers) =>
    toolsProcbee.post("/integrations/registerUserIndiamart", data, { params, headers });

export const showIndiamartData = (data, params, headers) =>
    toolsProcbee.post("/integrations/showIndiamartData", data, { params, headers });

export const showFacebookData = (data, params, headers) =>
    toolsProcbee.post("/integrations/showFbFormwise", data, { params, headers });

export const registerUserTradeIndia = (data, params, headers) =>
    toolsProcbee.post("/integrations/registerUserTradeIndia", data, { params, headers });

export const showTradeIndiaData = (data, params, headers) =>
    toolsProcbee.post("/integrations/showTradeIndia", data, { params, headers });

// global search APIs

export const getJumku = (data, params, headers) => http.post("/global/get_jumku", data, { params, headers });

export const getGstDirector = (data, params, headers) =>
    toolsTrending.post("/api/gstToDirectorUser", data, { params, headers });

// call handling APIs

export const callingHistory = (data, params, headers) =>
    http.post("/dashboard/callingHistory", data, { params, headers });

export const allocateCall = (data, params, headers) =>
    http.post("/dashboard/newAllocateCall", data, { params, headers });

export const callingUpdate = (data, params, headers) =>
    http.post("/dashboard/callingUpdate", data, { params, headers });

export const leadStatusUpdate = (data, params, headers) =>
    http.post("/dashboard/leadStatusUpdate", data, { params, headers });

export const logCallDashboard = (data, params, headers) =>
    http.post("/dashboard/logCallDashboard", data, { params, headers });

// dashboard reporting APIs

export const dashboardReport = (data, params, headers) =>
    http.post("/dashboard/dashboardReport", data, { params, headers });

export const pendingLeads = (data, params, headers) => http.post("/dashboard/pendingLeads", data, { params, headers });

export const whatsappReport = (data, params, headers) =>
    http.post("/dashboard/whatsappDetailReport", data, { params, headers });

export const emailReport = (data, params, headers) =>
    http.post("https://api.procbee.in/global/emailReport", data, { params, headers });

export const leadbotReport = (data, params, headers) =>
    http.post("/dashboard/leadBotReport", data, { params, headers });

// dashboard data options APIs

export const addOwnLead = (data, params, headers) => http.post("/dashboard/addYourOwnLead", data, { params, headers });

export const editOwnLead = (data, params, headers) => http.post("/dashboard/editYourLead", data, { params, headers });

export const deleteLeads = (data, params, headers) =>
    http.post("/dashboard/deleteFromGetB2b", data, { params, headers });

export const editIndiamartLead = (data, params, headers) =>
    http.post("/dashboard/editLeadIndiamart", data, { params, headers });

export const editFacebookLead = (data, params, headers) =>
    http.post("/dashboard/editLeadFacebook", data, { params, headers });

export const editTradeIndiaLead = (data, params, headers) =>
    toolsProcbee.post("integrations/editLeadTradeIndia", data, { params, headers });

// user handling (admin only) APIs

export const checkUsers = (data, params, headers) => http.post("/dashboard/checkUsers", data, { params, headers });

export const getUserInformation = (data, params, headers) =>
    http.post("/dashboard/getUserInformation", data, { params, headers });

export const updateUserCredit = (data, params, headers) =>
    http.post("/dashboard/updateUserCredit", data, { params, headers });

// new whatsapp APIS

export const getWhatsappTemplate = (data, params, headers) =>
    http.post("/tools/getTemplate", data, { params, headers });

export const insertWhatsappTemplate = (data, params, headers) =>
    http.post("/tools/insertTemplate", data, { params, headers });

export const editWhatsappTemplate = (data, params, headers) =>
    http.post("/tools/editTemplate", data, { params, headers });

export const getContactList = (data, params, headers) => http.post("/tools/getContactList", data, { params, headers });

export const createContactList = (data, params, headers) =>
    http.post("/tools/newContactList", data, { params, headers });

export const updateContactList = (data, params, headers) =>
    http.post("/tools/updateContactList", data, { params, headers });

// settings APIs

export const setCustomTags = (data, params, headers) => http.post("/global/set_data", data, { params, headers });

export const getCustomTags = (data, params, headers) => http.post("/global/get_data", data, { params, headers });

// dialer APIs

export const dialNumber = (data, params, headers) => http.post("/global/callingDialer", data, { params, headers });
