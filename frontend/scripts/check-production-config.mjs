import { loadEnv } from "vite";

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const required = ["VITE_API_KEY", "VITE_AUTH_DOMAIN", "VITE_PROJECT_ID", "VITE_STORAGE_BUCKET",
  "VITE_MSG_SEND_ID", "VITE_APP_ID"];
const missing = required.filter((name) => !env[name]);
if (missing.length) throw new Error(`Missing production Firebase configuration: ${missing.join(", ")}`);

for (const name of ["VITE_CHATBOT_URL", "VITE_DOC_ANALYSER_URL", "VITE_PROACTIVE_AGENT_URL"]) {
  const url = new URL(env[name]);
  if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error(`${name} must point to an HTTPS production service.`);
  }
}
console.log("Production Firebase configuration and service URLs verified.");
