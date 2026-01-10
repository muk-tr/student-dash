import { AUTH_TOKEN_KEY, AUTH_ADMIN_KEY, API_BASE_URL as BASE_URL } from "./constants";

const API_BASE_URL = BASE_URL;

const getHeaders = () => {
    let token = "";
    if (typeof window !== "undefined") {
        token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
    }
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           
            if (typeof window !== "undefined") {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_ADMIN_KEY);
                
            }
            throw new Error("Session expired. Please login again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
};

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    post: async (endpoint: string, data: any, customHeaders: any = {}) => {
        const headers: any = { ...getHeaders(), ...customHeaders };

        let body;
        if (data instanceof FormData) {
            delete headers["Content-Type"]; // Let browser set multipart/form-data with boundary
            body = data;
        } else {
            body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body,
        });
        return handleResponse(response);
    },
    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    patch: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    delete: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};
