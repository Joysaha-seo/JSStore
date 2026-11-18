import { useState } from 'react';
import {
  Download,
  Edit3,
  Minus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { generateProductCopy } from '../services/aiService';
import { CurrencyCode, Product, ProductCategory } from '../types/store';
import { formatMoney } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface InventoryViewProps {
  products: Product[];
  currency: CurrencyCode;
  onAdjustStock: (productId: string, delta: number) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenAiCopyForProduct: (productId: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Audio',
  'Workspace',
  'Wearables',
  'Carry',
  'Living',
];

export function InventoryView({
  products,
  currency,
  onAdjustStock,
  onSaveProduct,
  onDeleteProduct,
  onOpenAiCopyForProduct,
}: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Workspace');
  const [priceBdt, setPriceBdt] = useState(0);
  const [costBdt, setCostBdt] = useState(0);
  const [stock, setStock] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [variantsText, setVariantsText] = useState('Standard');
  const [imageUrl, setImageUrl] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiDraftError, setAiDraftError] = useState('');

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const inventoryRetailValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const inventoryCostValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;

  const filteredProducts = products.filter((p) => {
    const matchesFilter =
      stockFilter === 'all'
        ? true
        : stockFilter === 'low'
          ? p.stock > 0 && p.stock <= p.lowStockThreshold
          : p.stock <= 0;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`JS-NEW-${Math.floor(100 + Math.random() * 899)}`);
    setCategory('Workspace');
    setPriceBdt(4500);
    setCostBdt(2800);
    setStock(12);
    setLowStockThreshold(5);
    setDescription('');
    setSpecsText('');
    setVariantsText('Matte Black, Silver');
    setImageUrl('');
    setAiDraftError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setPriceBdt(product.price);
    setCostBdt(product.cost);
    setStock(product.stock);
    setLowStockThreshold(product.lowStockThreshold);
    setDescription(product.description);
    setSpecsText(product.specs.join('\n'));
    setVariantsText(product.variants.join(', '));
    setImageUrl(product.imageUrl);
    setAiDraftError('');
    setIsModalOpen(true);
  };

  const handleDraftWithAi = async () => {
    if (!name.trim()) {
      setAiDraftError('Enter a product name first so AI can draft specs and description.');
      return;
    }
    setAiDraftError('');
    setIsDraftingAi(true);
    try {
      const result = await generateProductCopy({
        productName: name.trim(),
        category,
        price: priceBdt,
        currency: 'BDT',
        notes: description.trim() || undefined,
        language: 'en',
      });
      setDescription(result.description);
      setSpecsText(result.highlights.join('\n'));
    } catch (err) {
      setAiDraftError(
        err instanceof Error ? err.message : 'Unable to generate product description.'
      );
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const specs = specsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const variants = variantsText
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const saved: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      price: Math.max(0, Number(priceBdt) || 0),
      cost: Math.max(0, Number(costBdt) || 0),
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      lowStockThreshold: Math.max(1, Math.round(Number(lowStockThreshold) || 5)),
      imageUrl: imageUrl.trim(),
      description:
        description.trim() || `${name.trim()} available at JS Store with 1-year warranty.`,
      specs: specs.length > 0 ? specs : ['JS Store quality verified'],
      variants: variants.length > 0 ? variants : ['Standard'],
    };

    onSaveProduct(saved);
    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const header = ['SKU', 'Name', 'Category', 'Cost (BDT)', 'Price (BDT)', 'Margin %', 'Stock'];
    const rows = products.map((p) => {
      const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
      return [
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.cost,
        p.price,
        `${margin}%`,
        p.stock,
      ].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'js-store-inventory.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            Inventory & Margins
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage SKUs, unit costs, selling prices, stock counts, and AI-generated listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4-Column Inventory Valuation Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-zinc-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        <div className="p-5">
          <p className="text-xs text-zinc-500">Total Stock Units</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {totalUnits} <span className="text-xs font-sans font-normal text-zinc-500">across {products.length} SKUs</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Retail Stock Value</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {formatMoney(inventoryRetailValue, currency)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Cost Basis Value</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {formatMoney(inventoryCostValue, currency)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Low Stock Alerts</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-amber-700 tabular-nums">
            {lowStockCount} <span className="text-xs font-sans font-normal text-zinc-500">SKUs need reorder</span>
          </p>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All SKUs' },
                { id: 'low', label: 'Low Stock' },
                { id: 'out', label: 'Out of Stock' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStockFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  stockFilter === tab.id
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter SKU or product..."
              className="pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg w-56 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-zinc-900">No inventory items match this filter</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStockFilter('all');
              }}
              className="mt-3 px-3.5 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
            >
              Show All Inventory
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">SKU / Category</th>
                  <th className="py-2.5 px-4 text-right">Cost</th>
                  <th className="py-2.5 px-4 text-right">Price</th>
                  <th className="py-2.5 px-4 text-right">Margin</th>
                  <th className="py-2.5 px-4 text-center">Stock</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredProducts.map((product) => {
                  const marginPct =
                    product.price > 0
                      ? Math.round(((product.price - product.cost) / product.price) * 100)
                      : 0;
                  const isOut = product.stock <= 0;
                  const isLow =
                    product.stock > 0 && product.stock <= product.lowStockThreshold;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            title={product.name}
                            className="w-11 h-9 object-cover rounded-md border border-zinc-200 shrink-0"
                          />
                          <span className="font-medium text-zinc-950 truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-600">
                        <p className="font-mono text-zinc-900">{product.sku}</p>
                        <p className="text-zinc-500">{product.category}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-zinc-600 tabular-nums">
                        {formatMoney(product.cost, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-zinc-950 tabular-nums">
                        {formatMoney(product.price, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-zinc-700 tabular-nums">
                        {marginPct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center border border-zinc-200 rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => onAdjustStock(product.id, -1)}
                            disabled={product.stock <= 0}
                            aria-label={`Decrease stock for ${product.name}`}
                            className="p-1 text-zinc-600 hover:text-zinc-950 disabled:opacity-35 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-medium tabular-nums text-zinc-950">
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAdjustStock(product.id, 1)}
                            aria-label={`Increase stock for ${product.name}`}
                            className="p-1 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium whitespace-nowrap">
                        <span
                          className={
                            isOut
                              ? 'text-red-700'
                              : isLow
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                          }
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenAiCopyForProduct(product.id)}
                            title="Generate AI marketing copy"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-md cursor-pointer whitespace-nowrap"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Copy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            aria-label={`Edit ${product.name}`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-md cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product.id)}
                            aria-label={`Delete ${product.name}`}
                            className="p-1.5 text-zinc-400 hover:text-red-700 border border-zinc-200 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingProduct ? 'Edit Product' : 'Add New Product'}
            className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h2 className="font-display text-lg font-semibold text-zinc-950">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New JS Store Product'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close product modal"
                className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GaN 65W Travel Charger"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-2.5 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-700"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Cost (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={costBdt}
                    onChange={(e) => setCostBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Price (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Storefront Description
                  </label>
                  <button
                    type="button"
                    disabled={isDraftingAi}
                    onClick={() => void handleDraftWithAi()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDraftingAi ? 'Drafting...' : 'Draft Description & Specs with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe materials, key use case, and warranty..."
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
                {aiDraftError && (
                  <p className="mt-1 text-xs text-red-700">{aiDraftError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Specs (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    placeholder="USB-C PD 65W&#10;Foldable prongs"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Variants (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={variantsText}
                      onChange={(e) => setVariantsText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
