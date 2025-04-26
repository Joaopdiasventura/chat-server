interface IDbConfig {
  mongo: {
    uri: string;
  };
}

export const DbConfig = (): IDbConfig => ({
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/chat",
  },
});
