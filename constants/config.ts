// configuration page to hold: API URL for the backend, environment flags, if needed, feature toggles, if needed, default settings (like timeouts, retries, etc)

// Later add option e.g. process.env.BACKEND_URL || "http://192.168.101.72:8000" -- will need a .env file for that
export const BACKEND_URL = "http://doc.gold.ac.uk/usr/320/"; 

// Optional future values
export const DEFAULT_TIMEOUT = 5000;
export const IS_PRODUCTION = false;