import "dotenv/config";
import { config } from "./src/config/dotenv";

async function startApplication() {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = config;

  try {
    console.log("🚀 Application starting...");

    // Validate required environment variables
    const missingVars: string[] = [];
    
    if (!TWILIO_ACCOUNT_SID) missingVars.push("TWILIO_ACCOUNT_SID");
    if (!TWILIO_AUTH_TOKEN) missingVars.push("TWILIO_AUTH_TOKEN");
    if (!TWILIO_PHONE_NUMBER) missingVars.push("TWILIO_PHONE_NUMBER");

    if (missingVars.length > 0) {
      console.error("❌ Missing required environment variables:");
      missingVars.forEach((v) => console.error(`   - ${v}`));
      process.exit(1);
    }

    // Import and start the Express app
    await require("./app");

    console.log("✅ Application started successfully");
  } catch (err) {
    console.error("❌ Application failed to start:", err);
    process.exit(1);
  }
}

startApplication();