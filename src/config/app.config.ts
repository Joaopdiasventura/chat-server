interface IAppConfig {
  frontendUrl: string;
  port: number;
}

export const AppConfig = (): IAppConfig => ({
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});
