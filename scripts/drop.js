const { db } = require('@vercel/postgres');

async function dropTables(client) {
  try {
    const dropUserTable = await client.sql`
    DROP TABLE IF EXISTS users;
    `;
    const dropBetsTable = await client.sql`
    DROP TABLE IF EXISTS bets;
    `;
    const dropAccountsTable = await client.sql`
    DROP TABLE IF EXISTS accounts;
    `;

    console.log(`dropped tables`);

    return {
      dropUserTable,
      dropAccountsTable,
      dropBetsTable
    };
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await dropTables(client);

  await client.end();
}

main().catch(err => {
  console.error('An error occurred while attempting to delete the database tables:', err);
});
