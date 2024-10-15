const { createClient } = require("redis");

export const redis = createClient();

const connect = async () => {
  redis.on("connect", (err) => console.log("DB Redis connect whit success"));
  redis.on("error", (err) => console.log("Redis Client Error", err));
  await redis.connect();
};

connect();
