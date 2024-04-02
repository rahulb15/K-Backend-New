const redis = require('redis');
const client = redis.createClient({
  url: 'redis://localhost:6379',
});
import { promisify } from 'util';

(async () => {
  await client.connect();
  client.on('error', (err: Error) => console.log('Redis Client Error', err));
})();

class Redis {
  static async get(keyPattern: string) {
    const getPromisified = promisify(client.get).bind(client);
    return new Promise((resolve, reject) => {
      getPromisified(keyPattern).then(
        (result: string) => {
          resolve(result);
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }

  static async keys(keyPattern: string) {
    const getPromisified = promisify(client.keys).bind(client);
    return new Promise((resolve, reject) => {
      getPromisified(keyPattern).then(
        (result: string) => {
          resolve(result);
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }

  static async set(key: string, value: string) {
    const setPromisified = promisify(client.set).bind(client);
    return new Promise((resolve, reject) => {
      setPromisified(key, value).then(
        (result: string) => {
          resolve(result);
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }

  static async expire(key: string, seconds: number) {
    const expirePromisified = promisify(client.expire).bind(client);

    return new Promise((resolve, reject) => {
      expirePromisified(key, seconds).then(
        (result: string) => {
          resolve(result);
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }

  static async expireat(key: string, expireUnixTimestampSeconds: number) {
    const expireatPromisified = promisify(client.expireat).bind(client);
    // global.logger.info('setting expire unixtimestamp for', key);
    return new Promise(expireatPromisified(key, expireUnixTimestampSeconds));
  }

  static async del(key: string) {
    const deletePromisified = promisify(client.del).bind(client);
    // global.logger.info('deleting key', key);
    return new Promise((resolve, reject) => {
      deletePromisified(key).then(
        (result: string) => {
          resolve(result);
        },
        (error: Error) => {
          reject(error);
        },
      );
    });
  }
}

export default Redis;
