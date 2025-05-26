'use client';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';

type WEAPON_SKIN = {
  price: number;
};
//   {
//     [0]     price: 25,
//     [0]     skin_name: 'MP9 Superlight',
//     [0]     fill_style: 'rgb(77, 121, 255)',
//     [0]     image_url: 'blue3',
//     [0]     acquired_date: 2025-05-21T04:05:28.308Z
//     [0]   }

export default function Inventory({ initialInventory }) {
  //   console.log('Initial Inventory:', initialInventory);
  const [skinsInventory, setSkinsInventory] = useState(initialInventory);

  const inventory = skinsInventory.map((item, idx) => {
    return (
      <div key={`weapon_skin_inventory_${idx}`} style={{ margin: '10px', minWidth: '300px' }}>
        <h2>{item.skin_name}</h2>
        <p>Price: {(item.price / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
        <p>Rarity: {item.rarity}</p>
        <img src={item.image_url}></img>
      </div>
    );
  });
  return (
    <div>
      <h1>Inventory</h1>
      <Button
        onClick={() => {
          console.log('Sell all skins');

          // check if there are any skins to sell
          // if not, then return early (no-op)

          fetch('/api/counterstrike/inventory/sell', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })
            .then(response => {
              if (response.status === 200) {
                console.log('Sell all skins response:', response);
                // Assuming the response contains the updated inventory?
                // Need to get the updated user balance too

                setSkinsInventory([]);

                return response.json();
              } else if (response.status === 204) {
                return;
              } else {
                throw new Error('Failed to sell all skins');
              }
            })
            .catch(error => {
              console.error('Error selling all skins:', error);
            });
        }}
      >
        Sell all skins
      </Button>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>{inventory}</div>
    </div>
  );
}
