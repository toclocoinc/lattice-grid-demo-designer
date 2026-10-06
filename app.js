import { customers, products, orders } from './data.js';

// The grid comes from the published package. Add ?local=1 to use the copy in ./vendor instead.
const BASE = new URLSearchParams(location.search).has('local') ? './vendor' : 'https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.89.0';
const load = (path) => import(`${BASE}/${path}`);
document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${BASE}/lattice-grid.min.css` }));

const core = await load('lattice-grid.esm.min.js');
const [{ createLayout }, charts, { createKPI }, { createDesigner }] = await Promise.all(
  ['layout', 'charts', 'kpi', 'designer'].map((name) => load(`modules/${name}.esm.min.js`)));
// The public-demo licence for toclocoinc.github.io; localhost needs none.
core.setLicence('LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA');

// Three related tables: orders point at customers and products.
const source = (rows, fields) => ({ kind: 'rows', rows, rowKey: 'id', fields });
const sources = {
  orders: source(orders, [{ id: 'amount', label: 'Order total', type: 'currency', format: '$0,0.00' }, { id: 'date', type: 'date' }]),
  customers: source(customers), products: source(products, [{ id: 'price', type: 'currency', format: '$0,0.00' }]),
};
const relationships = [
  { from: 'orders.customerId', to: 'customers.id', type: 'many-to-one' },
  { from: 'orders.productId', to: 'products.id', type: 'many-to-one' },
];

// The starter dashboard: a KPI, the orders and customers grids, and what an author adds next.
const starter = { schemaVersion: 1, selectedPageId: 'overview', panels: {}, pages: [{ id: 'overview', title: 'Overview', spec: {
  layout: { columns: 12, rows: 10, windows: [{ id: 'revenue', xPos: 1, yPos: 1, xSize: 3, ySize: 2 }, { id: 'orders', xPos: 1, yPos: 3, xSize: 3, ySize: 4 },
    { id: 'customers', xPos: 9, yPos: 5, xSize: 4, ySize: 6 }] },
  panels: [
    { id: 'revenue', kind: 'kpi', title: 'Revenue', source: 'orders', options: { tiles: [{ id: 'sum', field: 'amount', aggregation: 'sum', label: 'Total revenue' }] } },
    { id: 'orders', kind: 'grid', title: 'Orders', source: 'orders', options: { columns: [{ field: 'id' }, { field: 'customerId' }, { field: 'amount' }] } },
    { id: 'customers', kind: 'grid', title: 'Customers', source: 'customers', options: { columns: [{ field: 'name' }, { field: 'region' }, { field: 'segment' }] } },
  ] } }] };

const designer = createDesigner(document.getElementById('designer'), {
  mode: 'edit', sources, relationships, state: starter,
  factories: { ...core, createLayout, createKPI, createChart: charts.createChart, chartEditorModel: charts.chartEditorModel, registeredChartTypes: charts.registeredChartTypes },
});
// Derived grids bring customer fields across the declared relationship, then rank.
const derived = (spec) => designer.commands.run('addDerivedGrid', { from: 'orders', fromLabel: 'Orders', ...spec });
const total = [{ id: 'amount', of: 'amount', fn: 'sum' }], biggest = [{ col: 'amount', dir: 'desc' }];
derived({ id: 'regions', title: 'Revenue by region', steps: [{ kind: 'join', to: 'customers', fields: ['region'] }, { kind: 'topN', by: 'region', measures: total, sort: biggest, limit: 4 }] });
derived({ id: 'top', title: 'Top customers', steps: [{ kind: 'join', to: 'customers', fields: ['name'] }, { kind: 'topN', by: 'name', measures: total, sort: biggest, limit: 8 }] });
designer.addWidget({ id: 'byRegion', kind: 'chart', title: 'Revenue by region', source: 'grid:regions', options: { type: 'bar', x: 'region', y: 'amount' } }, { xPos: 4, yPos: 1, xSize: 5, ySize: 4 });
designer.statisticsWidgets.add('columnProfile', 'profile', { title: 'Order totals', source: 'orders', options: { y: 'amount' }, placement: { xPos: 9, yPos: 1, xSize: 4, ySize: 4 } });
const state = designer.getState(); // derived grids arrive unplaced, so give them a home
state.pages[0].spec.layout.windows.push({ id: 'regions', xPos: 1, yPos: 7, xSize: 3, ySize: 4 }, { id: 'top', xPos: 4, yPos: 5, xSize: 5, ySize: 6 });
for (const id of ['regions', 'top']) state.pages[0].spec.panels.find((p) => p.id === id).options.columns.find((c) => c.field === 'amount').format = '$0,0.00';
designer.setState(state); // the starter dashboard is the first state, not an edit to undo

const $ = (id) => document.getElementById(id), say = (text) => { $('note').textContent = text; };
$('mode').onclick = () => { const view = designer.mode === 'edit'; designer.setMode(view ? 'view' : 'edit'); $('mode').textContent = view ? 'Edit mode' : 'View mode'; };
$('save').onclick = () => { try { localStorage.setItem('lattice-designer-demo', JSON.stringify(designer.getState())); say('Saved in this browser.'); } catch { say('Could not save here.'); } };
$('load').onclick = () => { try { const text = localStorage.getItem('lattice-designer-demo'); if (!text) return say('Nothing saved yet.'); designer.setState(JSON.parse(text)); say('Loaded.'); } catch { say('Could not load the saved layout.'); } };
window.designer = designer; // a handle for the browser console
