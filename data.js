// Sample retail data, generated from a fixed seed so every visit sees the same
// shop: 60 customers, 24 products and 1,500 orders linked by customerId and productId.
let seed = 20260101;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (list) => list[Math.floor(rand() * list.length)];

const regions = ['North', 'South', 'East', 'West'];
const segments = ['Consumer', 'Small business', 'Enterprise'];
const first = ['Ada', 'Ben', 'Cleo', 'Dev', 'Elif', 'Finn', 'Gia', 'Hugo', 'Isla', 'Jonas', 'Kira', 'Leo', 'Mina', 'Noah', 'Orla'];
const last = ['Adler', 'Baker', 'Cruz', 'Dunn', 'Evans', 'Fox', 'Grant', 'Hale'];
const categories = { Kitchen: ['Kettle', 'Toaster', 'Blender', 'Pan set', 'Knife block', 'Scales'],
  Garden: ['Spade', 'Hose', 'Planter', 'Shears', 'Lantern', 'Bench'],
  Office: ['Desk lamp', 'Chair', 'Notebook set', 'Monitor arm', 'Shelf', 'Keyboard'],
  Outdoor: ['Tent', 'Flask', 'Backpack', 'Torch', 'Stove', 'Hammock'] };

export const customers = Array.from({ length: 60 }, (_, i) => ({
  id: `C${String(i + 1).padStart(3, '0')}`, name: `${first[i % first.length]} ${last[Math.floor(i / first.length) % last.length]}`,
  region: pick(regions), segment: pick(segments), since: `20${19 + Math.floor(rand() * 6)}-0${1 + Math.floor(rand() * 9)}-15`,
}));

export const products = Object.entries(categories).flatMap(([category, names], c) => names.map((name, i) => ({
  id: `P${c * 6 + i + 1}`, name, category, price: Math.round((8 + rand() * 120) * 100) / 100,
})));

export const orders = Array.from({ length: 1500 }, (_, i) => {
  const product = pick(products), qty = 1 + Math.floor(rand() * 4);
  const month = 1 + Math.floor(rand() * 12), day = 1 + Math.floor(rand() * 28);
  return { id: `O${String(i + 1).padStart(4, '0')}`, customerId: pick(customers).id, productId: product.id,
    date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, qty,
    amount: Math.round(product.price * qty * 100) / 100, status: rand() < 0.07 ? 'Returned' : 'Shipped' };
});
