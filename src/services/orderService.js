// Charm 3D orders. Today: saved in localStorage (+ optional POST to an endpoint).
// Tomorrow: replace `submitOrder` with your e-commerce integration
// (Shopify Storefront API cart, WooCommerce REST, Stripe Checkout session…).

const STORAGE_KEY = 'sticker-builder:orders';
const ENDPOINT = import.meta.env.VITE_ORDER_ENDPOINT;

export function listOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteOrder(id) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listOrders().filter((o) => o.id !== id)));
}

function orderCode() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `CH-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * @param payload {customer, product, design, preview}
 * @returns the saved order (with id and status)
 */
export async function submitOrder(payload) {
  const order = { id: orderCode(), createdAt: new Date().toISOString(), status: 'bozza', ...payload };

  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
    order.status = 'inviato';
  }

  const orders = listOrders();
  orders.unshift(order);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 50)));
  } catch {
    // preview images can exceed the quota: keep the order without it
    orders[0] = { ...order, preview: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 50)));
  }
  return order;
}
