import { useEffect, useState } from 'react';
import { AiConciergeDrawer } from './components/AiConciergeDrawer';
import { AiStudioView } from './components/AiStudioView';
import { CartDrawer } from './components/CartDrawer';
import { Header } from './components/Header';
import { InventoryView } from './components/InventoryView';
import { OrdersPosView } from './components/OrdersPosView';
import { StorefrontView } from './components/StorefrontView';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from './data/initialStoreData';
import {
  CartItem,
  CurrencyCode,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  WorkspaceTab,
} from './types/store';
import {
  getFreeDeliveryThresholdBdt,
  getStandardDeliveryFeeBdt,
} from './utils/currency';

const STORAGE_KEYS = {
  products: 'js_store_products_v1',
  orders: 'js_store_orders_v1',
  cart: 'js_store_cart_v1',
  currency: 'js_store_currency_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('storefront');
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    loadFromStorage<CurrencyCode>(STORAGE_KEYS.currency, 'BDT')
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>(STORAGE_KEYS.products, INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>(STORAGE_KEYS.orders, INITIAL_ORDERS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(STORAGE_KEYS.cart, [])
  );

  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerPrompt, setAiDrawerPrompt] = useState<string | undefined>(undefined);
  const [preselectedCopyProductId, setPreselectedCopyProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // ignore storage quota
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {
      // ignore storage quota
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // ignore storage quota
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.currency, JSON.stringify(currency));
    } catch {
      // ignore storage quota
    }
  }, [currency]);

  const bagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToBag = (productId: string, variant: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && item.variant === variant
      );
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === productId && item.variant === variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, variant, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, variant: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || item.variant !== variant) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (product && nextQty > product.stock) return item;
          return { ...item, quantity: nextQty };
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variant === variant))
    );
  };

  const deductStock = (items: Array<{ productId: string; quantity: number }>) => {
    setProducts((prev) =>
      prev.map((p) => {
        const orderedQty = items
          .filter((i) => i.productId === p.id)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (orderedQty === 0) return p;
        return { ...p, stock: Math.max(0, p.stock - orderedQty) };
      })
    );
  };

  const handlePlaceStorefrontOrder = (payload: {
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    postalCode: string;
    paymentMethod: PaymentMethod;
  }): Order => {
    const orderItems = cart
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          variant: item.variant,
          quantity: item.quantity,
          unitPrice: prod.price,
          unitCost: prod.cost,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const deliveryFee =
      subtotal >= getFreeDeliveryThresholdBdt() || subtotal === 0
        ? 0
        : getStandardDeliveryFeeBdt();

    const nextNumber = 1042 + orders.length;
    const newOrder: Order = {
      id: `JS-${nextNumber}`,
      createdAt: new Date().toISOString(),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      shippingAddress: payload.shippingAddress,
      postalCode: payload.postalCode,
      channel: 'Storefront',
      paymentMethod: payload.paymentMethod,
      status: payload.paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Completed',
      discountPercent: 0,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: orderItems,
    };

    deductStock(orderItems);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const handleCreatePosOrder = (payload: {
    customerName: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    discountPercent: number;
    items: Array<{ productId: string; variant: string; quantity: number }>;
  }): Order => {
    const orderItems = payload.items
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          sku: prod.sku,
          name: prod.name,
          variant: item.variant,
          quantity: item.quantity,
          unitPrice: prod.price,
          unitCost: prod.cost,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const discountAmount = Math.round((subtotal * payload.discountPercent) / 100);
    const total = Math.max(0, subtotal - discountAmount);

    const nextNumber = 1042 + orders.length;
    const newOrder: Order = {
      id: `JS-${nextNumber}`,
      createdAt: new Date().toISOString(),
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      shippingAddress: 'Walk-in Showroom Counter',
      channel: 'Counter POS',
      paymentMethod: payload.paymentMethod,
      status: payload.paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Completed',
      discountPercent: payload.discountPercent,
      subtotal,
      deliveryFee: 0,
      total,
      items: orderItems,
    };

    deductStock(orderItems);
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleApplyDescriptionToProduct = (
    productId: string,
    description: string,
    specs: string[]
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              description,
              specs: specs.length > 0 ? specs : p.specs,
            }
          : p
      )
    );
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-950">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bagCount={bagCount}
        onOpenBag={() => setIsBagOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'storefront' && (
          <StorefrontView
            products={products}
            currency={currency}
            onAddToBag={handleAddToBag}
            onOpenAiConcierge={(prompt) => {
              setAiDrawerPrompt(prompt);
              setIsAiDrawerOpen(true);
            }}
            onGoToBusinessHub={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPosView
            products={products}
            orders={orders}
            currency={currency}
            onCreatePosOrder={handleCreatePosOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            currency={currency}
            onAdjustStock={handleAdjustStock}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenAiCopyForProduct={(productId) => {
              setPreselectedCopyProductId(productId);
              setActiveTab('ai-studio');
            }}
          />
        )}

        {activeTab === 'ai-studio' && (
          <AiStudioView
            products={products}
            orders={orders}
            currency={currency}
            preselectedProductId={preselectedCopyProductId}
            onConsumePreselectedProduct={() => setPreselectedCopyProductId(null)}
            onApplyDescriptionToProduct={handleApplyDescriptionToProduct}
          />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-semibold text-zinc-900">JS Store</span>
            <span aria-hidden="true">·</span>
            <span>Dhaka Showroom & Nationwide Delivery</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} JS Store</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
              <button
                type="button"
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                  currency === 'BDT'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                BDT ৳
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                USD $
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              Reset Store Data
            </button>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        cart={cart}
        products={products}
        currency={currency}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceStorefrontOrder}
        onViewOrders={() => setActiveTab('orders')}
      />

      <AiConciergeDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        initialPrompt={aiDrawerPrompt}
        onConsumeInitialPrompt={() => setAiDrawerPrompt(undefined)}
        products={products}
        orders={orders}
        currency={currency}
        onOpenFullStudio={() => setActiveTab('ai-studio')}
      />
    </div>
  );
}
