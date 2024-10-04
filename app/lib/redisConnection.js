import { createClient } from 'redis';
const redisUrl = process.env.KV_URL || 'redis://localhost:6379';

async function createRedisClient() {
  const client = createClient({
    url: redisUrl,
    socket: {
      tls: process.env.KV_USE_TLS ? true : false
    }
  });

  client.on('error', err => {
    console.log('Redis Client Error', err);
    //   console.log('Shutting down Redis Client connection');
    // await client.quit();
    if (err.code == 'ECONNREFUSED') {
      console.log(`Unable to connect with redis at ${redisUrl}.`);
      process.exit();
    }
  });

  process.on('SIGINT', async () => await client.quit());
  process.on('SIGTERM', async () => await client.quit());
  return client;
}

export { createRedisClient };
