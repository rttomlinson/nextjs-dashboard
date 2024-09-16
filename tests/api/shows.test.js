/**
 * @jest-environment node
 */

import { createBet } from '../../app/lib/actions.ts';
import pg from 'pg';

const req = jest.fn();
const res = (() => {
  const mock = {};
  mock.status = jest.fn().mockReturnValue(mock);
  mock.json = jest.fn().mockReturnValue(mock);
  return mock;
})();

describe('/api/shows', () => {
  afterAll(() => {
    delete global.fetch;
  });

  // it('should call the external API', async () => {
  //   global.fetch = jest.fn().mockReturnValue({ json: () => Promise.resolve({ msg: 'Text' }) });
  //   const { Client } = pg;
  //   const client = new Client({
  //     user: 'postgres',
  //     password: 'mysecretpassword',
  //     host: 'localhost',
  //     database: 'betsapp'
  //   });
  //   try {
  //     await client.connect();

  //     const userId = '2248eb50-8912-4119-8a8b-ec6899b0722c';
  //     const account = await client.query(
  //       `
  //       SELECT balance from accounts WHERE user_id=$1;
  //       `,
  //       [userId]
  //     );
  //     console.log(account.rows[0].balance);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     await client.end();
  //   }

  //   expect(res.status).toBe(200);
  //   await expect(res.json()).resolves.toEqual({ msg: 'Text' });
  // });

  it('is just testing something', async () => {
    // global.fetch = jest.fn().mockReturnValue({ json: () => Promise.resolve({ msg: 'Text' }) });
    const { Client } = pg;
    const client = new Client({
      user: 'postgres',
      password: 'mysecretpassword',
      host: 'localhost',
      database: 'betsapp'
    });
    try {
      await client.connect();

      const userId = '2248eb50-8912-4119-8a8b-ec6899b0722c';
      const account = await client.query(
        `
        SELECT balance from accounts WHERE user_id=$1;
        `,
        [userId]
      );
      console.log(account.rows[0].balance);
    } catch (err) {
      console.error(err);
    } finally {
      await client.end();
    }

    expect(1).toBe(1);
    // await expect(res.json()).resolves.toEqual({ msg: 'Text' });
  });

  // it('should fail when the external API call fails', async () => {
  //   global.fetch = jest.fn().mockReturnValue({ json: () => Promise.reject(new Error('Error')) });

  //   const res = await shows(req);

  //   expect(res.status).toBe(500);
  //   await expect(res.json()).resolves.toEqual({ error: 'Error' });
  // });
});
