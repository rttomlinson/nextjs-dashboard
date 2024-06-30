const pg = require('pg');
const dayjs = require('dayjs');

// Bets that have been placed need to be 'validated'
// Determined to be in good standing

// 'closed' bet

// Anything that is 'placed'
// Anything that is also more than 12 hours before the expiration_date

// What happens if the system goes down and something get gain pending status

async function bets() {
  // update db
  const { Client } = pg;
  let client = new Client({
    user: 'postgres', // default process.env.PGUSER || process.env.USER
    password: 'mysecretpassword', //default process.env.PGPASSWORD
    host: 'localhost', // default process.env.PGHOST
    port: 5432, // default process.env.PGPORT
    database: 'betsapp'
  });
  try {
    await client.connect();

    let text = `SELECT
          id,
          amount,
          date,
          expiration_date,
          location,
          status,
          user_id,
        ST_Distance(ST_MakePoint(location[1], location[0])::geography,
              ST_MakePoint($2, $3)::geography)
        FROM bets
        WHERE user_id=$1
        AND TO_TIMESTAMP($4) <= expiration_date - INTERVAL '12 hour' -- minus 12 hours i.e. must be before 12 hours of bet expiration -- 
        `;
    // is the user's bet
    // distance is within 100 meters
    // time is not after the bet
    // time is not greater than 30 minutes before the event
    // status is ?
    user_id = '410544b2-4001-4271-9855-fec4b6a6442a';
    const epochSeconds = 1772474580; // dayjs().unix();

    let values = [user_id, time];

    const bets = await client.query(text, values);

    console.log(bets.rows);

    // the bet needs to be pending
    // the bet needs to be within the hour

    // how do i update bets that are lost?
    // it's gotta be a different process

    // is the location within a range?

    // what time did it happen?
    // is it in the past?

    // check the placed bets

    // don't need to check reconciled ones
    // what are the different states of a bet?

    // placed
    // won
    // lost
    // pending
    // settled
    // refunded
    // cancelled
    // voided

    // state machine for a bet?

    let updateText = `UPDATE bets
      SET status = 'pending'
      WHERE user_id=$1
        AND status = 'submitted'
        AND TO_TIMESTAMP($4) <= expiration_date - INTERVAL '12 hour' -- minus 12 hours i.e. must be before 12 hours of bet expiration -- 
    `;
    // is the user's bet
    // distance is within 100 meters
    // time is not after the bet
    // time is not greater than 30 minutes before the event
    // status is ?

    values = [user_id, time];
    const updateBets = await client.query(updateText, values);

    console.log(updateBets.rowCount);

    // the bet needs to be pending
    // the bet needs to be within the hour

    // how do i update bets that are lost?
    // it's gotta be a different process

    // is the location within a range?

    // what time did it happen?
    // is it in the past?

    // check the placed bets

    // don't need to check reconciled ones
    // what are the different states of a bet?

    // placed
    // won
    // lost
    // pending
    // settled
    // refunded
    // cancelled
    // voided

    // state machine for a bet?
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }

  // respond to queue
}

bets(); // you could also clean up the existing ones?
// like check to see if there's anything in the queue
// can you sort the queue?
