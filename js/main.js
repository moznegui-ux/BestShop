// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://mfgmyrdlojhecasbkqnb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ215cmRsb2poZWNhc2JrcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODY5MjksImV4cCI6MjA5MjQ2MjkyOX0.Dh6XmdpiaJWHyA0jWPGV7iz6uUpowvNpEWaMSP8ZRgo';

// ===== AUTH STATE =====
let currentUser = null;
try { currentUser = JSON.parse(localStorage.getItem('bs_user')); } catch(e) {}

// ===== WISHLIST STATE =====
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

function updateWishBadge() {
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.textContent = wishlist.length;
}

function updateAccountBtn() {
  const accountIcon = document.querySelector('.nav-icon.account-icon small');
  if (accountIcon && currentUser) {
    accountIcon.textContent = currentUser.name?.split(' ')[0] || 'Account';
  }
}

// ===== FETCH PRODUCTS =====
async function fetchProducts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  return await res.json();
}

// ===== LOAD PRODUCTS =====
async function loadProducts(filterCategory = 'All') {
  const grid     = document.querySelector('.products-grid');
  const dealsRow = document.querySelector('.deals-row');
  if (!grid) return;

  grid.innerHTML = '<div class="empty-state">⏳ Loading products...</div>';

  const products = await fetchProducts();

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="empty-state">🛍 No products yet. <a href="pages/add-product.html">Add first product →</a></div>';
    if (dealsRow) dealsRow.innerHTML = '';
    return;
  }

  const filtered = filterCategory === 'All'
    ? products
    : products.filter(p => p.category === filterCategory);

  grid.innerHTML = '';
  if (dealsRow) dealsRow.innerHTML = '';

  const storeDots = {
    Amazon:'#2B7FDD', Temu:'#E24B4A', AliExpress:'#F09F2E',
    SHEIN:'#993556', Walmart:'#16A472', Banggood:'#BA7517',
    LightInTheBox:'#533AB7', Zaful:'#7B3FC4'
  };

  filtered.forEach(p => {
    const prices = {
      Amazon:p.price_amazon, Temu:p.price_temu, AliExpress:p.price_aliexpress,
      SHEIN:p.price_shein, Walmart:p.price_walmart, Banggood:p.price_banggood,
      LightInTheBox:p.price_lightinthebox, Zaful:p.price_zaful
    };
    const storeAffs = {
      Amazon:p.aff_amazon, Temu:p.aff_temu, AliExpress:p.aff_aliexpress,
      SHEIN:p.aff_shein, Walmart:p.aff_walmart, Banggood:p.aff_banggood,
      LightInTheBox:p.aff_lightinthebox, Zaful:p.aff_zaful
    };

    const available = Object.entries(prices).filter(([k,v])=>v&&v>0).sort((a,b)=>a[1]-b[1]);
    if (available.length === 0) return;

    const [bestStore, bestPrice] = available[0];
    const bestAff = storeAffs[bestStore] || '#';
    const isWished = wishlist.includes(String(p.id));

    const priceRows = available.map(([store, price], i) => `
      <tr ${i===0?'class="best-row"':''}>
        <td>
          <div class="store-cell">
            <div class="dot" style="background:${storeDots[store]}"></div>
            <span ${i===0?'class="best-name"':''}>${store}</span>
            ${i===0?'<span class="best-tag">Best</span>':''}
          </div>
        </td>
        <td class="price ${i===0?'best-price':''}"
            onclick="event.stopPropagation();openAff('${storeAffs[store]||'#'}')"
            style="cursor:pointer">$${price}</td>
      </tr>`).join('');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="product-img">
        ${p.image_url
          ? `<img src="${p.image_url}" style="width:80%;height:80%;object-fit:contain" onerror="this.style.display='none'"/>`
          : `<span class="prod-emoji">📦</span>`}
        <span class="cat-tag" style="background:#D6E8FF;color:#1560A8">${p.category||''}</span>
        <div class="wish-btn ${isWished?'wished':''}" data-id="${p.id}">
          <svg viewBox="0 0 24 24" style="fill:${isWished?'#E84040':'none'}">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        ${p.is_hot?'<div class="hot-badge">🔥 HOT</div>':''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="stars">${'★'.repeat(Math.floor(p.rating||4))}${'☆'.repeat(5-Math.floor(p.rating||4))} <small>(${p.reviews||0} reviews)</small></div>
        <table class="price-table">${priceRows}</table>
        <button class="buy-btn" data-url="${bestAff}">Compare & Buy →</button>
      </div>`;

    // Wishlist
    card.querySelector('.wish-btn').addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.currentTarget;
      const id  = String(btn.dataset.id);
      const svg = btn.querySelector('svg');
      if (wishlist.includes(id)) {
        wishlist = wishlist.filter(x=>x!==id);
        btn.classList.remove('wished');
        svg.style.fill = 'none';
      } else {
        wishlist.push(id);
        btn.classList.add('wished');
        svg.style.fill = '#E84040';
      }
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      updateWishBadge();
    });

    // Buy button
    card.querySelector('.buy-btn').addEventListener('click', e => {
      e.stopPropagation();
      const url = e.currentTarget.dataset.url;
      if (url && url !== '#') window.open(url, '_blank');
    });

    grid.appendChild(card);

    // Deals
    if (p.is_hot && dealsRow && dealsRow.children.length < 5) {
      const deal = document.createElement('div');
      deal.className = 'deal-card';
      deal.style.cursor = 'pointer';
      deal.innerHTML = `
        <div class="deal-accent" style="background:${storeDots[bestStore]}"></div>
        <div class="deal-img">${p.image_url?`<img src="${p.image_url}" style="width:90%;height:90%;object-fit:contain"/>`:'📦'}</div>
        <div class="deal-name">${p.name}</div>
        <div class="deal-store">✓ ${bestStore}</div>
        <div class="deal-price">$${bestPrice}</div>
        ${p.original_price?`<div class="deal-old-row"><span class="old-price">$${p.original_price}</span><span class="discount">-${Math.round((1-bestPrice/p.original_price)*100)}%</span></div>`:''}`;
      deal.addEventListener('click', () => { if(bestAff!=='#') window.open(bestAff,'_blank'); });
      dealsRow.appendChild(deal);
    }
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">🛍 No ${filterCategory} products yet.</div>`;
  }
}

function openAff(url) { if(url&&url!=='#') window.open(url,'_blank'); }

// ===== SEARCH =====
function doSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (!q) return;
  // Filter products by name
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
    card.style.display = name.includes(q.toLowerCase()) ? '' : 'none';
  });
}

// ===== CATEGORIES =====
document.addEventListener('DOMContentLoaded', () => {
  updateWishBadge();
  updateAccountBtn();
  loadProducts();

  // Wishlist icon → open wishlist page
  const wishIcon = document.querySelector('.nav-icon:first-child');
  if (wishIcon) {
    wishIcon.style.cursor = 'pointer';
    wishIcon.addEventListener('click', () => window.location.href = 'pages/wishlist.html');
  }

  // Account icon → open auth page
  const accountIcon = document.querySelector('.nav-icon.account-icon');
  if (accountIcon) {
    accountIcon.style.cursor = 'pointer';
    accountIcon.addEventListener('click', () => {
      window.location.href = currentUser ? 'pages/profile.html' : 'pages/auth.html';
    });
  }

  // Categories
  const cats = document.querySelectorAll('.cat');
  cats.forEach(cat => {
    cat.addEventListener('click', () => {
      cats.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      const text = cat.textContent.replace(/[^\w\s]/g,'').trim();
      const catMap = {
        'All':'All','Phones':'Phones','Electronics':'Electronics',
        'Fashion':'Fashion','Home':'Home','Sports':'Sports',
        'Beauty':'Beauty','Toys':'Toys','Deals':'All'
      };
      loadProducts(catMap[text] || 'All');
    });
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') doSearch();
  });

  // Smooth scroll categories
  const catsBar = document.querySelector('.categories');
  if (catsBar) {
    let isDown=false, startX, scrollLeft;
    catsBar.addEventListener('mousedown', e => { isDown=true; startX=e.pageX-catsBar.offsetLeft; scrollLeft=catsBar.scrollLeft; });
    catsBar.addEventListener('mouseleave', () => isDown=false);
    catsBar.addEventListener('mouseup', () => isDown=false);
    catsBar.addEventListener('mousemove', e => { if(!isDown)return; e.preventDefault(); catsBar.scrollLeft=scrollLeft-(e.pageX-catsBar.offsetLeft-startX); });
  }
});

console.log('BestShop loaded ✅');