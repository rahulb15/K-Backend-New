import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379",
  socket:{
    connectTimeout: 60000
  }
});

(async () => {
  await client.connect();
  client.on("error", (err: Error) => console.log("Redis Client Error", err));
})();

class Redis {
  static async get(key: string) {
    return client.get(key);
  }

  static async keys(keyPattern: string) {
    return client.keys(keyPattern);
  }

  static async set(key: string, value: string) {
    return client.set(key, value);
  }

  static async expire(key: string, seconds: number) {
    return client.expire(key, seconds);
  }

  static async expireat(key: string, expireUnixTimestampSeconds: number) {
    return client.expireAt(key, expireUnixTimestampSeconds);
  }

  static async del(key: string) {
    return client.del(key);
  }
}

export default Redis;
