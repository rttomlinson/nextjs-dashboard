'use client';

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
  console.log('Initial Inventory:', initialInventory);

  const inventory = initialInventory.map((item, idx) => {
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
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>{inventory}</div>
    </div>
  );
}
