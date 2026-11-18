import { useState } from 'react';
import { CheckCircle2, Minus, Plus, Trash2, X } from 'lucide-react';
import { CartItem, CurrencyCode, Order, PaymentMethod, Product } from '../types/store';
import {
  formatMoney,
  getFreeDeliveryThresholdBdt,
  getStandardDeliveryFeeBdt,
} from '../utils/currency';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  currency: CurrencyCode;
  onUpdateQty: (productId: string, variant: string, delta: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onPlaceOrder: (payload: {
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    postalCode: string;
    paymentMethod: PaymentMethod;
  }) => Order;
  onViewOrders: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  products,
  currency,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  onViewOrders,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const detailedItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartItem & { product: Product } => item !== null);

  const subtotal = detailedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const freeThreshold = getFreeDeliveryThresholdBdt();
  const qualifiesFreeDelivery = subtotal >= freeThreshold || subtotal === 0;
  const deliveryFee = qualifiesFreeDelivery ? 0 : getStandardDeliveryFeeBdt();
  const total = subtotal + deliveryFee;
  const amountRemainingForFree = Math.max(0, freeThreshold - subtotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detailedItems.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setFormError('Please provide customer name, phone number, and delivery address.');
      return;
    }

    setFormError('');
    const created = onPlaceOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      postalCode: postalCode.trim(),
      paymentMethod,
    });
    setConfirmedOrder(created);
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setPostalCode('');
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setFormError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 backdrop-blur-[2px]">
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className="relative w-full max-w-md bg-white h-full border-l border-zinc-200 flex flex-col z-10"
        aria-label="Shopping Bag and Checkout"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-zinc-950">
              {confirmedOrder ? 'Order Confirmation' : 'Shopping Bag'}
            </h2>
            {!confirmedOrder && (
              <p className="text-xs text-zinc-500 tabular-nums">
                {detailedItems.reduce((acc, i) => acc + i.quantity, 0)} items selected
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bag drawer"
            className="p-2 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>
                  Order #{confirmedOrder.id} Confirmed — Preparing Shipment
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Stock has been reserved and logged in Orders & POS under{' '}
                <span className="font-medium">{confirmedOrder.paymentMethod}</span>.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-200">
              <div className="p-4 space-y-1 text-sm">
                <p className="font-medium text-zinc-950">{confirmedOrder.customerName}</p>
                <p className="text-zinc-600 tabular-nums">{confirmedOrder.customerPhone}</p>
                <p className="text-zinc-600">
                  {confirmedOrder.shippingAddress}
                  {confirmedOrder.postalCode ? ` · ${confirmedOrder.postalCode}` : ''}
                </p>
              </div>
              <div className="p-4 space-y-2.5">
                {confirmedOrder.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="text-zinc-900 font-medium">
                        {item.quantity}x {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">{item.variant}</p>
                    </div>
                    <span className="font-mono text-xs text-zinc-900 tabular-nums">
                      {formatMoney(item.unitPrice * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-zinc-50 flex items-center justify-between text-sm font-semibold text-zinc-950">
                <span>Total Payable</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(confirmedOrder.total, currency)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewOrders();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                View in Orders & POS
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : detailedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <p className="font-display text-base font-semibold text-zinc-900">
              Your bag is empty
            </p>
            <p className="mt-1 text-sm text-zinc-500 max-w-xs">
              Explore curated tech and everyday carry items from JS Store to begin an order.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
              <span>
                {qualifiesFreeDelivery
                  ? 'Free nationwide delivery unlocked'
                  : `Add ${formatMoney(amountRemainingForFree, currency)} more for free delivery`}
              </span>
              <span className="font-mono tabular-nums text-zinc-900">
                Threshold: {formatMoney(freeThreshold, currency)}
              </span>
            </div>

            <div className="divide-y divide-zinc-200 px-6">
              {detailedItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variant}`}
                  className="py-4 flex gap-4"
                >
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    title={item.product.name}
                    className="w-20 h-16 object-cover rounded-lg border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-950 truncate">
                        {item.product.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId, item.variant)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-zinc-400 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.variant}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center border border-zinc-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variant, -1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-mono tabular-nums text-zinc-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.variant, 1)}
                          disabled={item.quantity >= item.product.stock}
                          aria-label="Increase quantity"
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-mono font-medium text-zinc-950 tabular-nums">
                        {formatMoney(item.product.price * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 border-t border-zinc-200 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-zinc-900">
                  Delivery & Payment Verification
                </h3>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Mahmud"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1212"
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Full Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House, Road, Area, City"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cash on Delivery', 'bKash / Mobile Pay', 'Card'] as PaymentMethod[]).map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            paymentMethod === method
                              ? 'border-blue-700 bg-blue-50 text-blue-800'
                              : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          {method === 'Cash on Delivery'
                            ? 'COD'
                            : method === 'bKash / Mobile Pay'
                              ? 'Mobile Pay'
                              : 'Card'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Confirm Order · {formatMoney(total, currency)}
              </button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
