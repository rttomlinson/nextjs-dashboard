const { db } = require('@vercel/postgres');
const { accounts, users, bets } = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async user => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
        INSERT INTO users (id, name, email, password, image_url)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.image_url})
        ON CONFLICT (id) DO NOTHING;
      `;
      })
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// TIMESTAMP WITH TIME ZONE '2004-10-19 10:23:54+02'
async function seedBets(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.query(`CREATE EXTENSION IF NOT EXISTS Postgis;`);
    // Create the "bets" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS bets (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      expiration_date TIMESTAMP NOT NULL,
      location POINT NOT NULL,
      outcome VARCHAR(255)
    );
  `;

    console.log(`Created "bets" table`);

    // Insert data into the "bets" table
    const insertedBets = await Promise.all(
      bets.map(
        bet => client.sql`
          INSERT INTO bets (user_id, amount, status, date, expiration_date, location, outcome)
          VALUES (${bet.user_id}, ${bet.amount}, ${bet.status}, ${bet.date}, ${bet.expiration_date}, ${bet.location}, ${
            bet['outcome'] || null
          })
          ON CONFLICT (id) DO NOTHING;
        `
      )
    );

    console.log(`Seeded ${insertedBets.length} bets`);

    return {
      createTable,
      bets: insertedBets
    };
  } catch (error) {
    console.error('Error seeding bets:', error);
    throw error;
  }
}

async function seedAccounts(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "accounts" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL,
        balance INT NOT NULL
      );
    `;

    console.log(`Created "accounts" table`);

    const text = 'INSERT INTO accounts(user_id, balance) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;';

    // Insert data into the "accounts" table
    const insertedAccounts = await Promise.all(
      accounts.map(async account => {
        let values = [account.user_id, account.balance];
        return client.query(text, values);
      })
    );

    console.log(`Seeded ${insertedAccounts.length} accounts`);

    return {
      createTable,
      accounts: insertedAccounts
    };
  } catch (error) {
    console.error('Error seeding accounts:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await seedUsers(client);
  await seedBets(client);
  await seedAccounts(client);

  await client.end();
}

main().catch(err => {
  console.error('An error occurred while attempting to seed the database:', err);
});
