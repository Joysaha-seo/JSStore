import { useState } from 'react';
import { ArrowRight, MessageSquare, Plus, Search, X } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/initialStoreData';
import { CurrencyCode, Product, ProductCategory } from '../types/store';
import { formatMoney, getFreeDeliveryThresholdBdt } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface StorefrontViewProps {
  products: Product[];
  currency: CurrencyCode;
  onAddToBag: (productId: string, variant: string) => void;
  onOpenAiConcierge: (initialPrompt?: string) => void;
  onGoToBusinessHub: () => void;
}

const CATEGORIES: Array<'All' | ProductCategory> = [
  'All',
  'Audio',
  'Workspace',
  'Wearables',
  'Carry',
  'Living',
];

export function StorefrontView({
  products,
  currency,
  onAddToBag,
  onOpenAiConcierge,
  onGoToBusinessHub,
}: StorefrontViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const handleQuickAdd = (product: Product, variant?: string) => {
    if (product.stock <= 0) return;
    const chosenVariant = variant || product.variants[0] || 'Standard';
    onAddToBag(product.id, chosenVariant);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  const openProductModal = (product: Product) => {
    setActiveProduct(product);
    setSelectedVariant(product.variants[0] || 'Standard');
  };

  return (
    <div>
      {/* Section 1: Hero Split */}
      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-zinc-500 tracking-wide mb-3">
                JS Store · Curated Hardware & Everyday Carry
              </p>
              <h1
                className="font-display font-bold tracking-tight text-zinc-950 leading-[1.08]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  textWrap: 'balance',
                }}
              >
                Precision Gear for Focused Work and Daily Carry.
              </h1>
              <p className="mt-5 text-base text-zinc-600 leading-relaxed max-w-xl">
                Acoustic headphones, anodized mechanical keyboards, titanium wearables, and weatherproof travel gear—backed by direct showroom support, Cash on Delivery, and an AI shopping advisor.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Browse Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onOpenAiConcierge()}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span>Ask AI Shopper</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] lg:min-h-[400px] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                <ProductImage
                  src={HERO_IMAGE_URL}
                  alt="JS Store showroom counter displaying matte black headphones, mechanical keyboard, and tech accessories"
                  title="JS Store Showroom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column Service Strip */}
          <div className="mt-10 pt-8 border-t border-zinc-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-semibold text-zinc-950">Same-Day Dispatch</p>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                Orders placed before 3 PM ship the same business day across major hubs.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">Cash on Delivery</p>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed tabular-nums">
                Free nationwide delivery on orders above{' '}
                {formatMoney(getFreeDeliveryThresholdBdt(), currency)}.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">1-Year Store Warranty</p>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                Direct hardware replacement and diagnostics at JS Store showroom.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">AI Guided Selection</p>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                Compare specs or ask budget questions in English, Bangla, or Banglish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Featured Product Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
              Featured Collection
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Live showroom inventory synced with counter POS and online orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or SKU..."
                aria-label="Search store catalog"
                className="pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg w-56 sm:w-64 focus:outline-none focus:border-blue-700"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              aria-label="Sort products"
              className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-700 focus:outline-none focus:border-blue-700 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-10 py-16 text-center bg-white border border-zinc-200 rounded-xl">
            <p className="text-base font-semibold text-zinc-900">No matching products found</p>
            <p className="mt-1 text-sm text-zinc-500">
              Try clearing your search filter or ask our AI Shopper for an alternative.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenAiConcierge(
                    searchQuery
                      ? `Do you have anything similar to "${searchQuery}"?`
                      : undefined
                  )
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Ask AI Shopper
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock <= 0;
              const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
              const isJustAdded = recentlyAddedId === product.id;

              return (
                <article
                  key={product.id}
                  className="group bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <button
                    type="button"
                    onClick={() => openProductModal(product)}
                    className="block w-full aspect-[4/3] bg-zinc-100 overflow-hidden text-left cursor-pointer"
                  >
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      title={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                      <span>
                        {product.category} <span aria-hidden="true">·</span>{' '}
                        <span className="font-mono">{product.sku}</span>
                      </span>
                      <span
                        className={`font-medium tabular-nums ${
                          outOfStock
                            ? 'text-red-700'
                            : lowStock
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }`}
                      >
                        {outOfStock
                          ? 'Out of Stock'
                          : lowStock
                            ? `Only ${product.stock} left`
                            : 'In Stock'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openProductModal(product)}
                      className="mt-2 text-left font-display text-base font-semibold text-zinc-950 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {product.name}
                    </button>

                    <p className="mt-1.5 text-sm text-zinc-600 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                      <span className="font-mono text-base font-semibold text-zinc-950 tabular-nums">
                        {formatMoney(product.price, currency)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openProductModal(product)}
                          className="px-3 py-2 text-xs font-medium text-zinc-700 border border-zinc-200 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => handleQuickAdd(product)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            outOfStock
                              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                              : isJustAdded
                                ? 'bg-emerald-700 text-white'
                                : 'bg-zinc-950 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isJustAdded ? 'Added' : 'Add to Bag'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Business & Corporate Supply Callout */}
      <section className="border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium text-zinc-500">
              JS Store Operations & Wholesale
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-950">
              Run Your Showroom Counter, Inventory, and AI Marketing in One Place.
            </h2>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed max-w-2xl">
              Every customer order from this storefront automatically syncs with JS Store’s POS ledger and inventory stock levels. Need bundle pricing, Bengali or Banglish social captions, or restock forecasting? Open the AI Studio.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
            <button
              type="button"
              onClick={onGoToBusinessHub}
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Business POS & Orders
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenAiConcierge(
                  'Suggest a corporate gift bundle from JS Store inventory under ৳15,000 per kit.'
                )
              }
              className="px-5 py-2.5 text-sm font-medium text-zinc-800 border border-zinc-200 hover:border-zinc-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ask AI for Bulk Quote
            </button>
          </div>
        </div>
      </section>

      {/* Product Detail Modal (Contiguous Purchase Module) */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setActiveProduct(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeProduct.name}
            className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12"
          >
            <button
              type="button"
              onClick={() => setActiveProduct(null)}
              aria-label="Close product details"
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 border border-zinc-200 rounded-lg text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="md:col-span-6 bg-zinc-100 min-h-[260px]">
              <ProductImage
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                title={activeProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{activeProduct.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{activeProduct.sku}</span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold text-zinc-950">
                  {activeProduct.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-mono text-xl font-semibold text-zinc-950 tabular-nums">
                    {formatMoney(activeProduct.price, currency)}
                  </span>
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      activeProduct.stock <= 0
                        ? 'text-red-700'
                        : activeProduct.stock <= activeProduct.lowStockThreshold
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  >
                    {activeProduct.stock <= 0
                      ? 'Out of Stock'
                      : `${activeProduct.stock} units available`}
                  </span>
                </div>

                <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
                  {activeProduct.description}
                </p>

                {activeProduct.variants.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-medium text-zinc-700 mb-2">
                      Finish / Variant
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeProduct.variants.map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            selectedVariant === variant
                              ? 'border-blue-700 bg-blue-50 text-blue-800'
                              : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeProduct.specs.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-zinc-200">
                    <p className="text-xs font-semibold text-zinc-900 mb-2.5">
                      Key Specifications
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-600">
                      {activeProduct.specs.map((spec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-zinc-400 select-none">—</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={activeProduct.stock <= 0}
                  onClick={() => {
                    handleQuickAdd(activeProduct, selectedVariant);
                    setActiveProduct(null);
                  }}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-500 rounded-lg transition-colors cursor-pointer"
                >
                  {activeProduct.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = activeProduct.name;
                    setActiveProduct(null);
                    onOpenAiConcierge(
                      `Tell me more about ${name}—who is it best suited for, and how does it compare with other options at JS Store?`
                    );
                  }}
                  className="py-2.5 px-4 text-sm font-medium text-zinc-800 border border-zinc-200 hover:border-zinc-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Ask AI About This
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
