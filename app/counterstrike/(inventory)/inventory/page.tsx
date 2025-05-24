import { cookies } from 'next/headers';
import { createRedisClient } from '@/app/lib/redisConnection';
import { redirect } from 'next/navigation';
import { getInventoryItems } from '@/app/lib/actions';

import Inventory from '@/app/ui/inventory';

const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export default async function Page() {
  // get inventory data from the server
  const cookieStore = cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }
  const redisClient = await createRedisClient();
  let value;
  try {
    await redisClient.connect();
    value = await redisClient.hGetAll(sessionIdCookie.value);
    if (!value['user_id']) {
      redirect('/');
    }
  } finally {
    await redisClient.quit();
  }
  let inventory;
  try {
    inventory = await getInventoryItems(value['user_id']);
  } catch (err) {
    console.log(err);
  }
  console.log(inventory);

  return <Inventory initialInventory={inventory}></Inventory>;
}
