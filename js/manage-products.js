// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://mfgmyrdlojhecasbkqnb.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ215cmRsb2poZWNhc2JrcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODY5MjksImV4cCI6MjA5MjQ2MjkyOX0.Dh6XmdpiaJWHyA0jWPGV7iz6uUpowvNpEWaMSP8ZRgo';

let allProducts = [];
let filteredProducts = [];

// ===== FETCH ALL PRODUCTS =====
async function fetchProducts() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return await response.json();
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  const products = await fetchProducts();
  allProducts = products;
  filteredProducts = products;
  renderTable(products);
  updateStats(products);
  document.getElementById('productCount').textContent = `${products.length} products total`;
}

// ===== RENDER TABLE =====
function renderTable(products) {
  const tbody = document.getElementById('productsBody');
  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-row">🛍 No products yet. <a href="add-product.html">Add your first product →</a></td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
    const prices = [
      p.price_amazon, p.price_temu, p.price_aliexpress,
      p.price_shein, p.price_walmart, p.price_banggood,
      p.price_lightinthebox, p.price_zaful
    ].filter(x => x && x > 0);
    const bestPrice = prices.length > 0 ? Math.min(...prices) : null;

    const stores = [
      p.price_amazon && 'Amazon',
      p.price_temu && 'Temu',
      p.price_aliexpress && 'AliExpress',
      p.price_shein && 'SHEIN',
      p.price_walmart && 'Walmart',
      p.price_banggood && 'Banggood',
      p.price_lightinthebox && 'LightInBox',
      p.price_zaful && 'Zaful'
    ].filter(Boolean);

    const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <tr>
        <td><input type="checkbox" class="row-check" data-id="${p.id}"/></td>
        <td>
          <div class="prod-cell">
            <div class="prod-thumb">
              ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}"/>` : '📦'}
            </div>
            <div class="prod-cell-info">
              <div class="prod-cell-name">${p.name}</div>
              <div class="prod-cell-brand">${p.brand || '—'}</div>
            </div>
          </div>
        </td>
        <td><span class="tag blue">${p.category || '—'}</span></td>
        <td class="green">${bestPrice ? '$' + bestPrice : '—'}</td>
        <td>
          <div class="stores-chips">
            ${stores.map(s => `<span class="store-chip">${s}</span>`).join('')}
          </div>
        </td>
        <td>
          <div class="status-badges">
            ${p.is_hot ? '<span class="status-badge badge-hot">🔥 Hot</span>' : ''}
            ${p.is_featured ? '<span class="status-badge badge-featured">⭐ Featured</span>' : ''}
            ${p.is_new ? '<span class="status-badge badge-new">🆕 New</span>' : ''}
            ${!p.is_hot && !p.is_featured && !p.is_new ? '<span style="color:#ccc;font-size:11px">—</span>' : ''}
          </div>
        </td>
        <td style="font-size:11px;color:#aaa">${date}</td>
        <td>
          <button class="edit-btn" onclick="openEdit('${p.id}')">✏️ Edit</button>
          <button class="del-btn" onclick="deleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')">🗑</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ===== UPDATE STATS =====
function updateStats(products) {
  document.getElementById('totalCount').textContent = products.length;
  document.getElementById('hotCount').textContent = products.filter(p => p.is_hot).length;
  document.getElementById('featCount').textContent = products.filter(p => p.is_featured).length;
  document.getElementById('newCount').textContent = products.filter(p => p.is_new).length;
}

// ===== FILTER PRODUCTS =====
function filterProducts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('catFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let results = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || (p.brand || '').toLowerCase().includes(search);
    const matchCat = !cat || p.category === cat;
    return matchSearch && matchCat;
  });

  if (sort === 'newest') results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sort === 'oldest') results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price_low') results.sort((a, b) => Math.min(a.price_amazon || 9999, a.price_temu || 9999) - Math.min(b.price_amazon || 9999, b.price_temu || 9999));
  if (sort === 'price_high') results.sort((a, b) => Math.max(b.price_amazon || 0, b.price_temu || 0) - Math.max(a.price_amazon || 0, a.price_temu || 0));

  filteredProducts = results;
  renderTable(results);
}

// ===== SELECT ALL =====
function toggleSelectAll() {
  const checked = document.getElementById('selectAll').checked;
  document.querySelectorAll('.row-check').forEach(cb => cb.checked = checked);
}

// ===== DELETE SELECTED =====
async function deleteSelected() {
  const selected = [...document.querySelectorAll('.row-check:checked')].map(cb => cb.dataset.id);
  if (selected.length === 0) { alert('Please select products to delete!'); return; }
  if (!confirm(`Delete ${selected.length} selected product(s)?`)) return;

  for (const id of selected) {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
  }
  alert(`✅ ${selected.length} product(s) deleted!`);
  loadProducts();
}

// ===== DELETE SINGLE =====
async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"?`)) return;
  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  alert(`✅ "${name}" deleted!`);
  loadProducts();
}

// ===== OPEN EDIT MODAL =====
function openEdit(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('editId').value = p.id;
  document.getElementById('editName').value = p.name || '';
  document.getElementById('editCat').value = p.category || '';
  document.getElementById('editDesc').value = p.description || '';
  document.getElementById('editBrand').value = p.brand || '';
  document.getElementById('editImg').value = p.image_url || '';
  document.getElementById('eAmazon').value = p.price_amazon || '';
  document.getElementById('eTemu').value = p.price_temu || '';
  document.getElementById('eAli').value = p.price_aliexpress || '';
  document.getElementById('eShein').value = p.price_shein || '';
  document.getElementById('eWalmart').value = p.price_walmart || '';
  document.getElementById('eBanggood').value = p.price_banggood || '';
  document.getElementById('eLight').value = p.price_lightinthebox || '';
  document.getElementById('eZaful').value = p.price_zaful || '';
  document.getElementById('affEditAmazon').value = p.aff_amazon || '';
  document.getElementById('affEditTemu').value = p.aff_temu || '';
  document.getElementById('affEditAli').value = p.aff_aliexpress || '';
  document.getElementById('affEditShein').value = p.aff_shein || '';
  document.getElementById('affEditWalmart').value = p.aff_walmart || '';
  document.getElementById('affEditBanggood').value = p.aff_banggood || '';
  document.getElementById('editHot').checked = p.is_hot || false;
  document.getElementById('editFeatured').checked = p.is_featured || false;
  document.getElementById('editNew').checked = p.is_new || false;

  document.getElementById('editModal').style.display = 'flex';
}

// ===== CLOSE MODAL =====
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

// ===== UPDATE PRODUCT =====
async function updateProduct() {
  const id = document.getElementById('editId').value;
  const updated = {
    name: document.getElementById('editName').value.trim(),
    category: document.getElementById('editCat').value,
    description: document.getElementById('editDesc').value.trim(),
    brand: document.getElementById('editBrand').value.trim(),
    image_url: document.getElementById('editImg').value.trim(),
    price_amazon: parseFloat(document.getElementById('eAmazon').value) || null,
    price_temu: parseFloat(document.getElementById('eTemu').value) || null,
    price_aliexpress: parseFloat(document.getElementById('eAli').value) || null,
    price_shein: parseFloat(document.getElementById('eShein').value) || null,
    price_walmart: parseFloat(document.getElementById('eWalmart').value) || null,
    price_banggood: parseFloat(document.getElementById('eBanggood').value) || null,
    price_lightinthebox: parseFloat(document.getElementById('eLight').value) || null,
    price_zaful: parseFloat(document.getElementById('eZaful').value) || null,
    aff_amazon: document.getElementById('affEditAmazon').value.trim(),
    aff_temu: document.getElementById('affEditTemu').value.trim(),
    aff_aliexpress: document.getElementById('affEditAli').value.trim(),
    aff_shein: document.getElementById('affEditShein').value.trim(),
    aff_walmart: document.getElementById('affEditWalmart').value.trim(),
    aff_banggood: document.getElementById('affEditBanggood').value.trim(),
    is_hot: document.getElementById('editHot').checked,
    is_featured: document.getElementById('editFeatured').checked,
    is_new: document.getElementById('editNew').checked,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(updated)
  });

  if (response.ok) {
    alert('✅ Product updated successfully!');
    closeModal();
    loadProducts();
  } else {
    alert('❌ Error updating product. Please try again.');
  }
}

// Close modal on overlay click
document.getElementById('editModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== INIT =====
loadProducts();