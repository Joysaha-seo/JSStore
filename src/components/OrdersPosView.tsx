import { useState } from 'react';
import { Check, Minus, Plus, Printer, Search, Trash2, X } from 'lucide-react';
import {
  CurrencyCode,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
} from '../types/store';
import { formatMoney } from '../utils/currency';

interface OrdersPosViewProps {
  products: Product[];
  orders: Order[];
  currency: CurrencyCode;
  onCreatePosOrder: (payload: {
    customerName: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    discountPercent: number;
    items: Array<{ productId: string; variant: string; quantity: number }>;
  }) => Order;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export function OrdersPosView({
  products,
  orders,
  currency,
  onCreatePosOrder,
  onUpdateOrderStatus,
}: OrdersPosViewProps) {
  const [posItems, setPosItems] = useState<
    Array<{ productId: string; variant: string; quantity: number }>
  >([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [posSearch, setPosSearch] = useState('');

  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const pendingCodTotal = orders
    .filter((o) => o.status === 'Pending COD')
    .reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

  const filteredPosProducts = products.filter((p) => {
    const q = posSearch.trim().toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  const addPosProduct = (product: Product) => {
    if (product.stock <= 0) return;
    const defaultVariant = product.variants[0] || 'Standard';
    setPosItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.variant === defaultVariant
      );
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product.id && i.variant === defaultVariant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { productId: product.id, variant: defaultVariant, quantity: 1 }];
    });
  };

  const updatePosQty = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    setPosItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (prod && nextQty > prod.stock) return item;
          return { ...item, quantity: nextQty };
        })
        .filter((i): i is { productId: string; variant: string; quantity: number } => i !== null)
    );
  };

  const posDetailed = posItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is { productId: string; variant: string; quantity: number; product: Product } => item !== null);

  const posSubtotal = posDetailed.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const safeDiscount = Math.max(0, Math.min(50, discountPercent));
  const posDiscountAmount = Math.round((posSubtotal * safeDiscount) / 100);
  const posTotal = Math.max(0, posSubtotal - posDiscountAmount);

  const handleCompletePosSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (posDetailed.length === 0) return;
    const created = onCreatePosOrder({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'Counter Sale',
      paymentMethod,
      discountPercent: safeDiscount,
      items: posItems,
    });
    setPosItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setDiscountPercent(0);
    setReceiptOrder(created);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const q = orderSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            Orders & Counter POS
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Process walk-in counter sales, manage Cash on Delivery settlements, and print receipts.
          </p>
        </div>
      </div>

      {/* 4-Column Business Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-zinc-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        <div className="p-5">
          <p className="text-xs text-zinc-500">Gross Revenue (Active)</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {formatMoney(totalRevenue, currency)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Completed Orders</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {completedCount} <span className="text-xs font-sans font-normal text-zinc-500">/ {orders.length} total</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Average Order Value</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {formatMoney(avgOrderValue, currency)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Pending COD Collection</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-amber-700 tabular-nums">
            {formatMoney(pendingCodTotal, currency)}
          </p>
        </div>
      </div>

      {/* Split Workspace: Counter POS (left) + Orders Table (right/below) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Counter POS Panel */}
        <section className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-zinc-950">
              Quick Counter POS
            </h2>
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              {posItems.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="Tap or search SKU to add..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            <div className="max-h-52 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              {filteredPosProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => addPosProduct(product)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-50 disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono tabular-nums">
                      {product.sku} · {product.stock} in stock
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                      {formatMoney(product.price, currency)}
                    </span>
                    <Plus className="w-4 h-4 text-blue-700" />
                  </div>
                </button>
              ))}
            </div>

            {/* Active Ticket Lines */}
            <div className="border-t border-zinc-200 pt-4 space-y-2.5">
              {posDetailed.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2 text-center">
                  Select items above to build a showroom counter ticket.
                </p>
              ) : (
                posDetailed.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono tabular-nums">
                        {formatMoney(item.product.price, currency)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updatePosQty(item.productId, -1)}
                        className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 cursor-pointer"
                        aria-label="Decrease POS item quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePosQty(item.productId, 1)}
                        className="p-1 border border-zinc-200 rounded hover:bg-zinc-50 cursor-pointer"
                        aria-label="Increase POS item quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePosQty(item.productId, -item.quantity)}
                        className="p-1 text-zinc-400 hover:text-red-700 cursor-pointer"
                        aria-label="Remove POS item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCompletePosSale} className="border-t border-zinc-200 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+880..."
                    className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-700"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash / Mobile Pay">bKash / Mobile Pay</option>
                    <option value="Card">Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-1 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(posSubtotal, currency)}
                  </span>
                </div>
                {posDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({safeDiscount}%)</span>
                    <span className="font-mono tabular-nums">
                      -{formatMoney(posDiscountAmount, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-zinc-950 text-base pt-1.5 border-t border-zinc-200">
                  <span>Payable Total</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(posTotal, currency)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={posDetailed.length === 0}
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-500 rounded-lg transition-colors cursor-pointer"
              >
                Complete Sale & Issue Receipt
              </button>
            </form>
          </div>
        </section>

        {/* Orders Ledger */}
        <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-zinc-950">
              Orders Ledger
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Order # or customer"
                  className="pl-8 pr-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg w-44 focus:outline-none focus:border-blue-700"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | OrderStatus)}
                aria-label="Filter orders by status"
                className="px-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:border-blue-700"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending COD">Pending COD</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-zinc-900">No matching orders</p>
              <p className="mt-1 text-xs text-zinc-500">
                Adjust your search or record a counter sale using the POS panel.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
                    <th className="py-2.5 px-4">Order</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Channel & Pay</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/70">
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono text-xs font-semibold text-zinc-950 tabular-nums">
                          #{order.id}
                        </span>
                        <p className="text-[11px] text-zinc-500 tabular-nums mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <p className="text-sm font-medium text-zinc-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} items ·{' '}
                          {order.customerPhone}
                        </p>
                      </td>
                      <td className="py-3 px-4 align-top text-xs text-zinc-600">
                        <p>{order.channel}</p>
                        <p className="text-zinc-500">{order.paymentMethod}</p>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span
                          className={`text-xs font-medium ${
                            order.status === 'Completed'
                              ? 'text-emerald-700'
                              : order.status === 'Pending COD'
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top text-right font-mono text-xs font-semibold text-zinc-950 tabular-nums">
                        {formatMoney(order.total, currency)}
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {order.status === 'Pending COD' && (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                              title="Mark COD as Paid"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-md cursor-pointer whitespace-nowrap"
                            >
                              <Check className="w-3 h-3" />
                              <span>Mark Paid</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-700 border border-zinc-200 hover:border-zinc-400 rounded-md cursor-pointer whitespace-nowrap"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setReceiptOrder(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Receipt ${receiptOrder.id}`}
            className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold text-zinc-950">JS Store</p>
                <p className="text-xs text-zinc-500 font-mono tabular-nums">
                  Invoice #{receiptOrder.id} ·{' '}
                  {new Date(receiptOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                aria-label="Close receipt"
                className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-600 space-y-1 py-3 border-y border-zinc-200">
              <p>
                <span className="text-zinc-400">Customer:</span>{' '}
                <span className="font-medium text-zinc-900">
                  {receiptOrder.customerName}
                </span>{' '}
                ({receiptOrder.customerPhone})
              </p>
              <p>
                <span className="text-zinc-400">Address:</span>{' '}
                {receiptOrder.shippingAddress}
              </p>
              <p>
                <span className="text-zinc-400">Payment:</span>{' '}
                {receiptOrder.paymentMethod} ·{' '}
                <span className="font-medium text-zinc-900">
                  {receiptOrder.status}
                </span>
              </p>
            </div>

            <div className="space-y-2.5">
              {receiptOrder.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {item.sku} · {item.variant}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-medium text-zinc-900 tabular-nums">
                    {formatMoney(item.unitPrice * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 space-y-1 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(receiptOrder.subtotal, currency)}
                </span>
              </div>
              {receiptOrder.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({receiptOrder.discountPercent}%)</span>
                  <span className="font-mono tabular-nums">
                    -
                    {formatMoney(
                      Math.round(
                        (receiptOrder.subtotal * receiptOrder.discountPercent) / 100
                      ),
                      currency
                    )}
                  </span>
                </div>
              )}
              {receiptOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(receiptOrder.deliveryFee, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Total</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(receiptOrder.total, currency)}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Print Invoice
              </button>
              {receiptOrder.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(receiptOrder.id, 'Cancelled');
                    setReceiptOrder({ ...receiptOrder, status: 'Cancelled' });
                  }}
                  className="py-2 px-4 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
