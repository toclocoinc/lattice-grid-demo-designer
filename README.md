# Build a dashboard over your own data

A working dashboard builder over three related tables. Add widgets, drag them into place, switch
to view mode to see what your readers see, and save your layout. It is the Lattice Designer in
plain JavaScript: no framework and no build step.

| | |
| --- | --- |
| Lattice Designer | [latticegrid.dev/designer](https://www.latticegrid.dev/designer/) |
| Grid on npm | [@toclocoinc/lattice-grid](https://www.npmjs.com/package/@toclocoinc/lattice-grid) |
| Product site | [latticegrid.dev](https://www.latticegrid.dev) |

## What it shows

- **Related data.** Orders, products and customers, with the links between them declared once
  (`orders.customerId` to `customers.id`, `orders.productId` to `products.id`). The data panel
  lists every table and its fields, and the relationships.
- **A starter dashboard.** A revenue tile, the orders and customers grids, a bar chart of revenue
  by region, a statistics widget over order totals, and a top customers grid built from the
  orders grid and the customer names across the relationship.
- **Edit and view.** In edit mode you add widgets, drag and resize them, and change what each one
  shows in the properties panel. The **View mode** button shows the dashboard as a reader sees it.
- **Undo and redo.** Every change is one step.
- **Save and Load.** The buttons keep the dashboard in this browser (`localStorage`) and put it
  back, widgets, sizes and derived grids included.

## The setup

`index.html`, `app.js` (about 55 lines), `data.js` and a stylesheet. The grid and its modules load
from the published package, so there is nothing to install. The part that matters:

```js
const designer = createDesigner(document.getElementById('designer'), {
  mode: 'edit',
  sources: { orders, customers, products },   // your data, by name
  relationships,                               // how the tables link
  state: starter,                              // the dashboard to open with
  factories: { createGrid, createHeadlessGrid, createLayout, createKPI, createChart },
});
designer.on('state', ({ state }) => save(state));   // everything the author changes
```

## Run it

    python3 -m http.server 8000    # any static server will do; then open http://localhost:8000/

To use another copy of the grid, for example one you are testing, put the extracted package in
`./vendor` (the folder is ignored by git) and open `http://localhost:8000/?local=1`. The page then
loads the grid, its stylesheet and the modules from `./vendor` instead of the package CDN.

## Data

Generated sample data, from a fixed seed so every visit sees the same shop: 60 customers, 24
products and 1,500 orders (`data.js`). Nothing is fetched and nothing leaves your browser.

## Licence

Demo code: MIT, see `LICENSE`. Lattice Grid is loaded from the package CDN under its own
licence; the page carries the public-demo licence for `toclocoinc.github.io`, so no watermark
shows there. Keyless, no analytics.
