// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
    image_url:
      'https://media.npr.org/assets/img/2023/01/14/this-is-fine_custom-dcb93e90c4e1548ffb16978a5a8d182270c872a9-s1100-c50.jpg'
  },
  {
    id: 'aaaabcb2-4001-4271-9855-fec4b6aaaaaa',
    name: 'User2',
    email: 'user222222222222@nextmail.com',
    password: '123456',
    image_url:
      'https://media.npr.org/assets/img/2023/01/14/this-is-fine_custom-dcb93e90c4e1548ffb16978a5a8d182270c872a9-s1100-c50.jpg'
  }
];

const accounts = [
  {
    user_id: users[0].id,
    balance: 30000
  },
  {
    user_id: users[1].id,
    balance: 450000
  }
];

// it should be a queue type thing?
// but we also need to save events for replay and auditing
const locationEvents = [
  {
    time: 1772474580,
    location: {
      longitude: 139.839478,
      latitude: 35.652832
    },
    user_id: '410544b2-4001-4271-9855-fec4b6a6442a'
  }
];

let bets = [
  {
    user_id: users[0].id,
    amount: 15795,
    status: 'submitted',
    date: '2022-12-06',
    expiration_date: '2026-03-02 18:03:00',
    location: '(35.652832,139.839478)'
  },
  {
    user_id: users[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
    expiration_date: '2222-02-02 07:02:00',
    location: '(35.5951,-82.5515)'
  },
  {
    user_id: users[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
    expiration_date: '2022-12-06',
    location: '(36,120)'
  },
  {
    user_id: users[0].id,
    amount: 20348,
    status: 'settled',
    date: '2022-11-14',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'won'
  },
  {
    user_id: users[0].id,
    amount: 3040,
    status: 'settled',
    date: '2022-10-29',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'won'
  },
  {
    user_id: users[0].id,
    amount: 44800,
    status: 'settled',
    date: '2023-09-10',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'lost'
  },
  {
    user_id: users[0].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'won'
  },
  {
    user_id: users[0].id,
    amount: 54246,
    status: 'pending',
    date: '2023-07-16',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'lost'
  },
  {
    // this bet has an outcome and is pending. waiting to be settled
    user_id: users[1].id,
    amount: 8945,
    status: 'pending',
    date: '2023-06-18',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'won'
  },
  {
    // this bet has an outcome and is pending. waiting to be settled
    user_id: users[1].id,
    amount: 1000,
    status: 'pending',
    date: '2022-06-05',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'lost'
  },
  {
    user_id: users[1].id,
    amount: 8945,
    status: 'settled',
    date: '2023-10-04',
    expiration_date: '2022-12-06',
    location: '(36, 100)',
    outcome: 'won'
  },
  {
    user_id: users[1].id,
    amount: 1250,
    status: 'settled',
    date: '2023-06-17',
    expiration_date: '2022-12-06',
    location: '(36, 100)'
  },
  {
    user_id: users[1].id,
    amount: 99999,
    status: 'settled',
    date: '2023-06-07',
    expiration_date: '2022-12-06',
    location: '(36, 100)'
  },
  {
    user_id: users[1].id,
    amount: 999,
    status: 'settled',
    date: '2023-08-19',
    expiration_date: '2022-12-06',
    location: '(36, 100)'
  }
];

// setting up a backlog of locations that need to be processed
// something like calculate the hash
// add it to a set
// when the value is processed - remove the hash from the set (periodically clean up)
// look at oldest in the queue - look at oldest in the set. remove already that's older from the set

// but i also want to limit the number of times a user can submit a recorded location

module.exports = {
  users,
  bets,
  accounts
};
