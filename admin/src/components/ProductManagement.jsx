import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchProductsApi,
  updateProductApi,
  createProductApi,
  deleteProductApi,
  seedProductsApi
} from '../lib/api';
import {
  ShoppingBag, CheckCircle2, XCircle, Search, Plus,
  RefreshCw, Edit3, Trash2, Tag, AlertCircle, Loader2,
  Sparkles, Save, X, Layers, Upload, Image as ImageIcon
} from 'lucide-react';

const KITCHEN_PHOTO_PRESETS = [
  { label: 'Avakaya Pickle', path: '/images/avakaya.jpg' },
  { label: 'Gongura Pickle', path: '/images/gongura.jpg' },
  { label: 'Chicken Pickle', path: '/images/chicken-pickle.jpg' },
  { label: 'Prawns Pickle', path: '/images/prawn-pickle.jpg' },
  { label: 'Tomato Pickle', path: '/images/tomato.jpg' },
  { label: 'Allam Pickle', path: '/images/allam.jpg' },
  { label: 'Neethi Arisalu', path: '/images/arisalu.jpg' },
  { label: 'Bellam Sunnundalu', path: '/images/sunnundalu.jpg' },
  { label: 'Kajjikayalu', path: '/images/kajjikayalu.jpg' },
  { label: 'Pappu Chekkalu', path: '/images/chekkalu.jpg' },
  { label: 'Karapusa', path: '/images/karapusa.jpg' },
  { label: 'Karam Boondhi', path: '/images/karam-boondhi.jpg' }
];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Edit / Add modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // New product form
  const [newForm, setNewForm] = useState({
    name: '',
    teluguName: '',
    category: 'veg-pickles',
    pricePerKg: '',
    tagline: '',
    description: '',
    badge: 'Fresh Special',
    image: '/images/avakaya.jpg',
    inStock: true
  });

  // Handle local file upload (converts to base64 data URL)
  const handleFileUpload = (e, isEdit = false) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (isEdit) {
        setEditingProduct(prev => ({ ...prev, image: dataUrl }));
      } else {
        setNewForm(prev => ({ ...prev, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchProductsApi();
      if (data) setProducts(data);
    } catch (err) {
      setErrorMsg('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Temporary success banner dismiss
  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle inStock status
  const handleToggleStock = async (product) => {
    const newStatus = !product.inStock;
    setSavingId(product.id);
    try {
      await updateProductApi(product.id, { inStock: newStatus });
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, inStock: newStatus } : p)
      );
      showToast(`${product.name} is now ${newStatus ? 'IN STOCK' : 'OUT OF STOCK'}`);
    } catch (err) {
      alert('Error updating stock status: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Quick inline price update
  const handleQuickPriceSave = async (id, newPrice) => {
    const numPrice = Number(newPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    setSavingId(id);
    try {
      await updateProductApi(id, { pricePerKg: numPrice });
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, pricePerKg: numPrice } : p)
      );
      showToast(`Updated price to ₹${numPrice}/kg`);
    } catch (err) {
      alert('Error updating price: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    setSavingId(product.id);
    try {
      await deleteProductApi(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast(`Deleted ${product.name}`);
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Seed / Reset catalog
  const handleSeedCatalog = async () => {
    if (!window.confirm('Reset catalog to the 17 authentic Bramarambika products?')) return;
    setLoading(true);
    try {
      await seedProductsApi();
      await loadProducts();
      showToast('Catalog synchronized successfully!');
    } catch (err) {
      alert('Error resetting catalog: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.pricePerKg) {
      alert('Please provide product name and price');
      return;
    }

    setSavingId('new');
    try {
      const created = await createProductApi({
        ...newForm,
        image: newForm.image || '/images/avakaya.jpg',
        pricePerKg: Number(newForm.pricePerKg)
      });
      setProducts(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewForm({
        name: '',
        teluguName: '',
        category: 'veg-pickles',
        pricePerKg: '',
        tagline: '',
        description: '',
        badge: 'Fresh Special',
        image: '/images/avakaya.jpg',
        inStock: true
      });
      showToast(`Added new product: ${created.name}`);
    } catch (err) {
      alert('Failed to add product: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Save edit modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingId(editingProduct.id);
    try {
      const updated = await updateProductApi(editingProduct.id, editingProduct);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      setEditingProduct(null);
      showToast(`Saved changes for ${updated.name}`);
    } catch (err) {
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      // Stock filter
      if (stockFilter === 'in-stock' && !p.inStock) return false;
      if (stockFilter === 'out-of-stock' && p.inStock) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name && p.name.toLowerCase().includes(q);
        const matchesTelugu = p.teluguName && p.teluguName.toLowerCase().includes(q);
        const matchesBadge = p.badge && p.badge.toLowerCase().includes(q);
        if (!matchesName && !matchesTelugu && !matchesBadge) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, searchQuery]);

  const totalInStock = useMemo(() => products.filter(p => p.inStock).length, [products]);

  return (
    <div className="product-mgmt-container">
      {/* Top Banner Stats */}
      <div className="pm-stats-row">
        <div className="pm-stat-card">
          <div className="stat-label">Total Menu Items</div>
          <div className="stat-num">{products.length}</div>
        </div>
        <div className="pm-stat-card success">
          <div className="stat-label">In Stock & Ordering</div>
          <div className="stat-num">{totalInStock}</div>
        </div>
        <div className="pm-stat-card danger">
          <div className="stat-label">Sold Out / Hidden</div>
          <div className="stat-num">{products.length - totalInStock}</div>
        </div>
        <div className="pm-stat-card warning">
          <div className="stat-label">Storefront Status</div>
          <div className="stat-status">
            <span className="live-dot" /> LIVE & SYNCHRONIZED
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="pm-toast-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="pm-toast-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="pm-toolbar">
        <div className="pm-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search items by name, Telugu name, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="pm-filters">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pm-select"
          >
            <option value="all">All Categories</option>
            <option value="non-veg-pickles">Non-Veg Pickles</option>
            <option value="veg-pickles">Veg Pickles</option>
            <option value="pindi-vantalu">Pindi Vantalu (Sweets & Snacks)</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="pm-select"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock Only</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="pm-btn-primary"
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>

          <button
            onClick={handleSeedCatalog}
            title="Reload authentic default 17 dishes"
            className="pm-btn-secondary"
          >
            <RefreshCw size={15} />
            <span>Sync Default Menu</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="pm-loading">
          <Loader2 size={32} className="spin-icon" />
          <p>Loading kitchen product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="pm-empty-state">
          <ShoppingBag size={48} className="empty-icon" />
          <h3>No products match your filter</h3>
          <p>Try clearing your search query or category filters.</p>
        </div>
      ) : (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Item & Telugu Name</th>
                <th>Category</th>
                <th>Price / Kg</th>
                <th>Stock Status</th>
                <th>Badge / Highlight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className={!p.inStock ? 'row-out-of-stock' : ''}>
                  {/* Name & Telugu */}
                  <td>
                    <div className="pm-item-cell">
                      <div className="pm-item-img-wrap">
                        <img
                          src={p.image || '/images/avakaya.jpg'}
                          alt={p.name}
                          onError={(e) => { e.target.src = '/images/avakaya.jpg'; }}
                        />
                      </div>
                      <div>
                        <div className="pm-item-name">{p.name}</div>
                        {p.teluguName && (
                          <div className="pm-item-telugu">{p.teluguName}</div>
                        )}
                        <div className="pm-item-tagline">{p.tagline}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className={`pm-cat-badge ${p.category}`}>
                      {p.category === 'non-veg-pickles' ? '🍗 Non-Veg' :
                       p.category === 'veg-pickles' ? '🥬 Veg Pickle' : '🪔 Sweets & Snacks'}
                    </span>
                  </td>

                  {/* Price */}
                  <td>
                    <div className="pm-price-wrap">
                      <span className="currency">₹</span>
                      <input
                        type="number"
                        defaultValue={p.pricePerKg}
                        onBlur={(e) => {
                          if (Number(e.target.value) !== p.pricePerKg) {
                            handleQuickPriceSave(p.id, e.target.value);
                          }
                        }}
                        className="pm-price-input"
                        title="Click to change and click away to save"
                      />
                      <span className="per-kg">/kg</span>
                    </div>
                  </td>

                  {/* Stock Toggle */}
                  <td>
                    <button
                      onClick={() => handleToggleStock(p)}
                      disabled={savingId === p.id}
                      className={`pm-stock-toggle ${p.inStock ? 'in-stock' : 'out-of-stock'}`}
                    >
                      {savingId === p.id ? (
                        <Loader2 size={14} className="spin-icon" />
                      ) : p.inStock ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Badge */}
                  <td>
                    {p.badge ? (
                      <span className="pm-badge-chip">
                        <Sparkles size={12} /> {p.badge}
                      </span>
                    ) : (
                      <span className="pm-muted-text">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="pm-actions">
                      <button
                        onClick={() => setEditingProduct({ ...p })}
                        title="Edit Item Details"
                        className="pm-btn-icon"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        title="Delete Product"
                        className="pm-btn-icon danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-card">
            <div className="pm-modal-header">
              <h3>Add New Menu Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="pm-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="pm-form">
              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label>Item Name (English)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gongura Mutton Pickle"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  />
                </div>
                <div className="pm-form-group">
                  <label>Telugu Name</label>
                  <input
                    type="text"
                    placeholder="e.g. గోంగూర మటన్ పచ్చడి"
                    value={newForm.teluguName}
                    onChange={(e) => setNewForm({ ...newForm, teluguName: e.target.value })}
                  />
                </div>
              </div>

              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label>Category*</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  >
                    <option value="veg-pickles">Veg Pickles</option>
                    <option value="non-veg-pickles">Non-Veg Pickles</option>
                    <option value="pindi-vantalu">Pindi Vantalu (Sweets & Snacks)</option>
                  </select>
                </div>
                <div className="pm-form-group">
                  <label>Price per Kg (₹)*</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 599"
                    value={newForm.pricePerKg}
                    onChange={(e) => setNewForm({ ...newForm, pricePerKg: e.target.value })}
                  />
                </div>
              </div>

              <div className="pm-form-group">
                <label>Highlight Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Tender meat steeped in spicy Andhra masala"
                  value={newForm.tagline}
                  onChange={(e) => setNewForm({ ...newForm, tagline: e.target.value })}
                />
              </div>

              <div className="pm-form-group">
                <label>Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Hot Seller, Festival Special, Grandma Secret"
                  value={newForm.badge}
                  onChange={(e) => setNewForm({ ...newForm, badge: e.target.value })}
                />
              </div>

              {/* Photo Upload & Presets */}
              <div className="pm-form-group">
                <label>Dish Photo (Upload from Device or Select Kitchen Preset)</label>
                <div className="pm-image-picker-wrap">
                  <img
                    src={newForm.image || '/images/avakaya.jpg'}
                    alt="Preview"
                    className="pm-image-preview-thumb"
                    onError={(e) => { e.target.src = '/images/avakaya.jpg'; }}
                  />
                  <div className="pm-image-upload-controls">
                    <label className="pm-btn-upload">
                      <Upload size={14} />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, false)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter image URL (e.g. /images/avakaya.jpg)"
                      value={newForm.image}
                      onChange={(e) => setNewForm({ ...newForm, image: e.target.value })}
                      className="pm-image-url-input"
                    />
                    <div className="pm-preset-chips">
                      {KITCHEN_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`pm-preset-chip ${newForm.image === preset.path ? 'active' : ''}`}
                          onClick={() => setNewForm({ ...newForm, image: preset.path })}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pm-form-group">
                <label>Description & Ingredients</label>
                <textarea
                  rows={3}
                  placeholder="Describe the authentic taste, ingredients, and preparation method..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                />
              </div>

              <div className="pm-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="pm-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'new'}
                  className="pm-btn-primary"
                >
                  {savingId === 'new' ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Dish to Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="pm-modal-overlay">
          <div className="pm-modal-card">
            <div className="pm-modal-header">
              <h3>Edit {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="pm-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="pm-form">
              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label>Item Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="pm-form-group">
                  <label>Telugu Name</label>
                  <input
                    type="text"
                    value={editingProduct.teluguName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, teluguName: e.target.value })}
                  />
                </div>
              </div>

              <div className="pm-form-row">
                <div className="pm-form-group">
                  <label>Price per Kg (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.pricePerKg}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerKg: Number(e.target.value) })}
                  />
                </div>
                <div className="pm-form-group">
                  <label>Badge</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="pm-form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  value={editingProduct.tagline || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                />
              </div>

              {/* Photo Upload & Presets */}
              <div className="pm-form-group">
                <label>Dish Photo (Upload from Device or Select Kitchen Preset)</label>
                <div className="pm-image-picker-wrap">
                  <img
                    src={editingProduct.image || '/images/avakaya.jpg'}
                    alt="Preview"
                    className="pm-image-preview-thumb"
                    onError={(e) => { e.target.src = '/images/avakaya.jpg'; }}
                  />
                  <div className="pm-image-upload-controls">
                    <label className="pm-btn-upload">
                      <Upload size={14} />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="pm-image-url-input"
                    />
                    <div className="pm-preset-chips">
                      {KITCHEN_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`pm-preset-chip ${editingProduct.image === preset.path ? 'active' : ''}`}
                          onClick={() => setEditingProduct({ ...editingProduct, image: preset.path })}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pm-form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="pm-modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="pm-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingId === editingProduct.id}
                  className="pm-btn-primary"
                >
                  {savingId === editingProduct.id ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
