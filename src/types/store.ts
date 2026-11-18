export type CurrencyCode = 'BDT' | 'USD';

export type WorkspaceTab = 'storefront' | 'orders' | 'inventory' | 'ai-studio';

export type ProductCategory = 'Audio' | 'Workspace' | 'Wearables' | 'Carry' | 'Living';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number; // Stored in BDT base units; converted cleanly for USD display
  cost: number; // Stored in BDT base units
  stock: number;
  lowStockThreshold: number;
  imageUrl: string;
  description: string;
  specs: string[];
  variants: string[];
  tag?: string;
}

export interface CartItem {
  productId: string;
  variant: string;
  quantity: number;
}

export type OrderChannel = 'Storefront' | 'Counter POS';
export type PaymentMethod = 'Cash on Delivery' | 'Cash' | 'bKash / Mobile Pay' | 'Card';
export type OrderStatus = 'Completed' | 'Pending COD' | 'Cancelled';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  postalCode?: string;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  discountPercent: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface GeneratedProductCopy {
  description: string;
  highlights: string[];
  facebookPost: string;
  whatsappMessage: string;
  seoTags: string[];
}

export interface BusinessInsightsReport {
  executiveSummary: string;
  restockAlerts: Array<{
    sku: string;
    productName: string;
    currentStock: number;
    recommendedOrderQty: number;
    reason: string;
  }>;
  marginOpportunities: Array<{
    title: string;
    detail: string;
    estimatedImpact: string;
  }>;
  bundleSuggestions: Array<{
    bundleName: string;
    items: string[];
    suggestedPriceNote: string;
    pitch: string;
  }>;
  actionChecklist: string[];
}
