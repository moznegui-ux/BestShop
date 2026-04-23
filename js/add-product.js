const SUPABASE_URL = 'https://mfgmyrdlojhecasbkqnb.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ215cmRsb2poZWNhc2JrcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODY5MjksImV4cCI6MjA5MjQ2MjkyOX0.Dh6XmdpiaJWHyA0jWPGV7iz6uUpowvNpEWaMSP8ZRgo';
// ===== IMAGE PREVIEW =====
function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('imgPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Product Image"/>`;
  };
  reader.readAsDataURL(file);
}

function previewUrl(url) {
  if (!url) return;
  const preview = document.getElementById('imgPreview');
  preview.innerHTML = `<img src="${url}" alt="Product Image" onerror="this.style.display='none'"/>`;
}

// ===== SPECS =====
function addSpec() {
  const list = document.getElementById('specsList');
  const row = document.createElement('div');
  row.className = 'spec-input-row';
  row.innerHTML = `
    <input type="text" placeholder="Spec name" class="spec-key"/>
    <input type="text" placeholder="Value" class="spec-val"/>
    <button class="del-spec-btn" onclick="removeSpec(this)">✕</button>
  `;
  list.appendChild(row);
}

function removeSpec(btn) {
  const rows = document.querySelectorAll('.spec-input-row');
  if (rows.length <= 1) {
    alert('You need at least one specification!');
    return;
  }
  btn.closest('.spec-input-row').remove();
}

// ===== SAVE PRODUCT =====
const SUPABASE_URL = 'https://mfgmyrdlojhecasbkqnb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ215cmRsb2poZWNhc2JrcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODY5MjksImV4cCI6MjA5MjQ2MjkyOX0.Dh6XmdpiaJWHyA0jWPGV7iz6uUpowvNpEWaMSP8ZRgo';
async function saveProduct() {
  // Collect basic info
  const name = document.getElementById('pName').value.trim();
  const desc = document.getElementById('pDesc').value.trim();
  const cat = document.getElementById('pCat').value;
  const brand = document.getElementById('pBrand').value.trim();
  const model = document.getElementById('pModel').value.trim();
  const rating = document.getElementById('pRating').value;
  const reviews = document.getElementById('pReviews').value;

  // Validate required fields
  if (!name) { alert('❌ Please enter a product name!'); document.getElementById('pName').focus(); return; }
  if (!desc) { alert('❌ Please enter a product description!'); document.getElementById('pDesc').focus(); return; }
  if (!cat) { alert('❌ Please select a category!'); document.getElementById('pCat').focus(); return; }

  // Collect prices
  const prices = {
    Amazon:       parseFloat(document.getElementById('prAmazon').value) || 0,
    Temu:         parseFloat(document.getElementById('prTemu').value) || 0,
    AliExpress:   parseFloat(document.getElementById('prAli').value) || 0,
    SHEIN:        parseFloat(document.getElementById('prShein').value) || 0,
    Walmart:      parseFloat(document.getElementById('prWalmart').value) || 0,
    Banggood:     parseFloat(document.getElementById('prBanggood').value) || 0,
    LightInTheBox:parseFloat(document.getElementById('prLight').value) || 0,
    Zaful:        parseFloat(document.getElementById('prZaful').value) || 0,
  };

  // Collect affiliate links
  const affiliates = {
    Amazon:       document.getElementById('affAmazon').value.trim(),
    Temu:         document.getElementById('affTemu').value.trim(),
    AliExpress:   document.getElementById('affAli').value.trim(),
    SHEIN:        document.getElementById('affShein').value.trim(),
    Walmart:      document.getElementById('affWalmart').value.trim(),
    Banggood:     document.getElementById('affBanggood').value.trim(),
    LightInTheBox:document.getElementById('affLight').value.trim(),
    Zaful:        document.getElementById('affZaful').value.trim(),
  };

  // Check at least one price
  const availablePrices = Object.entries(prices).filter(([k, v]) => v > 0);
  if (availablePrices.length === 0) {
    alert('❌ Please enter at least one price!');
    return;
  }

  // Find best price
  const best = availablePrices.reduce((a, b) => a[1] < b[1] ? a : b);
  const bestStore = best[0];
  const bestPrice = best[1];

  // Sort prices low to high
  const sorted = availablePrices.sort((a, b) => a[1] - b[1]);

  // Collect specs
  const specs = [];
  document.querySelectorAll('.spec-input-row').forEach(row => {
    const key = row.querySelector('.spec-key').value.trim();
    const val = row.querySelector('.spec-val').value.trim();
    if (key && val) specs.push({ key, val });
  });

  // Collect deal settings
  const original = parseFloat(document.getElementById('pOriginal').value) || 0;
  const expiry = document.getElementById('pExpiry').value;
  const isHot = document.getElementById('chkHot').checked;
  const isFeatured = document.getElementById('chkFeatured').checked;
  const isNew = document.getElementById('chkNew').checked;

  // Collect image
  const imgUrl = document.getElementById('pImgUrl').value.trim();
  const imgPreviewEl = document.getElementById('imgPreview').querySelector('img');
  const imgSrc = imgPreviewEl ? imgPreviewEl.src : imgUrl;

  // Build product object
  const product = {
    id: Date.now(),
    name, desc, cat, brand, model,
    rating: parseFloat(rating),
    reviews: parseInt(reviews) || 0,
    prices, affiliates, specs,
    bestStore, bestPrice,
    sortedPrices: sorted,
    original, expiry,
    isHot, isFeatured, isNew,
    image: imgSrc,
    addedAt: new Date().toISOString()
  };

  // Save to localStorage
 
const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({
    name: product.name,
    description: product.desc,
    category: product.cat,
    brand: product.brand,
    model: product.model,
    rating: product.rating,
    reviews: product.reviews,
    image_url: product.image,
    is_hot: product.isHot,
    is_featured: product.isFeatured,
    is_new: product.isNew,
    original_price: product.original || null,
    price_amazon: product.prices.Amazon || null,
    price_temu: product.prices.Temu || null,
    price_aliexpress: product.prices.AliExpress || null,
    price_shein: product.prices.SHEIN || null,
    price_walmart: product.prices.Walmart || null,
    price_banggood: product.prices.Banggood || null,
    price_lightinthebox: product.prices.LightInTheBox || null,
    price_zaful: product.prices.Zaful || null,
    aff_amazon: product.affiliates.Amazon || null,
    aff_temu: product.affiliates.Temu || null,
    aff_aliexpress: product.affiliates.AliExpress || null,
    aff_shein: product.affiliates.SHEIN || null,
    aff_walmart: product.affiliates.Walmart || null,
    aff_banggood: product.affiliates.Banggood || null,
    aff_lightinthebox: product.affiliates.LightInTheBox || null,
    aff_zaful: product.affiliates.Zaful || null,
  })
});

if (!response.ok) {
  alert('❌ Error saving product. Please try again.');
  return;
}
  // Show success
  showSuccess(name, bestStore, bestPrice);
}

// ===== SUCCESS MESSAGE =====
function showSuccess(name, bestStore, bestPrice) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;
  `;
  overlay.innerHTML = `
    <div style="
      background:#fff;border-radius:16px;padding:32px;
      text-align:center;max-width:380px;width:90%;
      box-shadow:0 20px 60px rgba(0,0,0,0.2);
    ">
      <div style="font-size:48px;margin-bottom:12px">✅</div>
      <h2 style="font-size:18px;font-weight:800;color:#1a1a2e;margin-bottom:8px">
        Product Saved!
      </h2>
      <p style="font-size:13px;color:#888;margin-bottom:6px">
        <strong style="color:#1a1a2e">${name}</strong>
      </p>
      <p style="font-size:12px;color:#16A472;font-weight:600;margin-bottom:20px">
        Best price: $${bestPrice} on ${bestStore}
      </p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="window.location='add-product.html'" style="
          background:#F2F4FA;color:#555;border:none;
          border-radius:8px;padding:10px 18px;
          font-size:13px;font-weight:600;cursor:pointer;
          font-family:'Inter',sans-serif;
        ">+ Add Another</button>
        <button onclick="window.location='admin.html'" style="
          background:linear-gradient(135deg,#2B7FDD,#16A472);
          color:#fff;border:none;border-radius:8px;
          padding:10px 18px;font-size:13px;font-weight:600;
          cursor:pointer;font-family:'Inter',sans-serif;
        ">← Back to Admin</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

console.log('Add Product page loaded ✅');
