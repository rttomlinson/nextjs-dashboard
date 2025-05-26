import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { getApplicationUserSessionData } from '@/app/lib/actions';
import { pool } from '@/app/lib/postgresConnection';

export async function POST(request: Request) {
  const payload = await request.json();
  console.log('payload', payload);

  const cookieStore = await cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    return NextResponse.json({ error: 'Session not found. Reauthenciation recommended.' }, { status: 400 });
  }
  const sessionData = await getApplicationUserSessionData(sessionIdCookie.value);
  let userId = sessionData['user_id'];
  if (!userId) {
    return NextResponse.json({ error: 'Session not found. Reauthenciation recommended.' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // get all the items for a user
    // total the prices
    let text = `SELECT SUM(weapon_skins.price)
    FROM user_skins_inventory 
    INNER JOIN weapon_skins ON weapon_skins.skin_id = user_skins_inventory.skin_id
    WHERE user_skins_inventory.user_id = $1;`;
    let values = [userId];
    const total = await client.query(text, values);
    const totalValueInCents = parseInt(total.rows[0].sum);
    if (!totalValueInCents || totalValueInCents <= 0) {
      throw new Error('No items to sell or total value is zero.');
    }
    console.log('total', totalValueInCents);

    // add the total to the user balance
    let updateBalanceText = `
    UPDATE accounts
    SET balance = balance + $1
    WHERE user_id = $2;
    `;
    let updateBalanceValues = [totalValueInCents, userId];
    await client.query(updateBalanceText, updateBalanceValues);
    // delete the items from the inventory
    let deleteInventoryText = `
    DELETE FROM user_skins_inventory
    WHERE user_id = $1;
    `;
    let deleteInventoryValues = [userId];
    await client.query(deleteInventoryText, deleteInventoryValues);
    await client.query('COMMIT');
  } catch (err) {
    console.error(err);
    await client.query('ROLLBACK');
    if (err instanceof Error && err.message.includes('No items to sell or total value is zero.')) {
      return new Response(null, {
        status: 204
      });
    }
    return NextResponse.json({ error: 'Something bad happened on the server.' }, { status: 500 });
  } finally {
    await client.release();
  }

  return NextResponse.json({
    message: 'Hello from the inventory/sell route'
  });
}
