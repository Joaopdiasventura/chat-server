interface IAppConfig {
  salts: number;
  port: number;
  app: { url: string };
  client: { url: string };
  jwt: { secret: string };
  email: { account: string; password: string };
}

export const AppConfig = (): IAppConfig => ({
  salts: process.env.SALTS ? parseInt(process.env.SALTS) : 5,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  app: { url: process.env.APP_URL || "http://localhost:3000" },
  client: { url: process.env.CLIENT_URL || "http://localhost:4200" },
  jwt: { secret: process.env.JWT_SECRET || "chat" },
  email: {
    account: process.env.EMAIL_ACCOUNT,
    password: process.env.EMAIL_PASSWORD,
  },
});
