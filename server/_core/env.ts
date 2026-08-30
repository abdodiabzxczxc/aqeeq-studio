export const ENV = {
  cookieSecret: process.env.JWT_SECRET || "aqeeq-studio-jwt-secret-default-key-2026",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "aqeeq2026",
  adminName: process.env.ADMIN_NAME || "مدير استوديو العقيق",
  adminEmail: process.env.ADMIN_EMAIL || "admin@alaqeeq.edu.sa",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};


