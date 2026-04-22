// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://mfgmyrdlojhecasbkqnb.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ215cmRsb2poZWNhc2JrcW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODY5MjksImV4cCI6MjA5MjQ2MjkyOX0.Dh6XmdpiaJWHyA0jWPGV7iz6uUpowvNpEWaMSP8ZRgo';

async function fetchProducts() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const products = await response.json();
  return products;
}

async function loadProducts() {
  const products = await fetchProducts();
  const grid = document.querySelector('.products-grid');
  const dealsRow = document.querySelector('.deals-row');

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="empty-state">🛍 No products yet.</div>';
    return;
  }

  // Clear existing content
  grid.innerHTML = '';
  dealsRow.innerHTML = '';

  products.forEach(p => {
    // Find best price
    const prices = {
      Amazon: p.price_amazon,
      Temu: p.price_temu,
      AliExpress: p.price_aliexpress,
      SHEIN: p.price_shein,
      Walmart: p.price_walmart,
      Banggood: p.price_banggood,
      LightInTheBox: p.price_lightinthebox,
      Zaful: p.price_zaful
    };

    const storeDots = {
      Amazon: '#2B7FDD',
      Temu: '#E24B4A',
      AliExpress: '#F09F2E',
      SHEIN: '#993556',
      Walmart: '#16A472',
      Banggood: '#BA7517',
      LightInTheBox: '#533AB7',
      Zaful: '#7B3FC4'
    };

    const storeAffs = {
      Amazon: p.aff_amazon,
      Temu: p.aff_temu,
      AliExpress: p.aff_aliexpress,
      SHEIN: p.aff_shein,
      Walmart: p.aff_walmart,
      Banggood: p.aff_banggood,
      LightInTheBox: p.aff_lightinthebox,
      Zaful: p.aff_zaful
    };

    const available = Object.entries(prices)
      .filter(([k, v]) => v && v > 0)
      .sort((a, b) => a[1] - b[1]);

    if (available.length === 0) return;

    const [bestStore, bestPrice] = available[0];
    const bestAff = storeAffs[bestStore];

    const catBg = {
      Phones: 'phone-bg',
      Electronics: 'elec-bg',
      Fashion: 'fashion-bg',
      Home: 'home-bg'
    }[p.category] || 'elec-bg';

    const priceRows = available.map(([store, price], i) => `
      <tr ${i === 0 ? 'class="best-row"' : ''}>
        <td>
          <div class="store-cell">
            <div class="dot" style="background:${storeDots[store]}"></div>
            <span ${i === 0 ? 'class="best-name"' : ''}>${store}</span>
            ${i === 0 ? '<span class="best-tag">Best</span>' : ''}
          </div>
        </td>
        <td class="price ${i === 0 ? 'best-price' : ''}" 
            onclick="window.open('${storeAffs[store] || '#'}', '_blank')"
            style="cursor:pointer">
          $${price}
        </td>
      </tr>
    `).join('');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img ${catBg}">
        ${p.image_url
          ? `<img src="${p.image_url}" style="width:80%;height:80%;object-fit:contain"/>`
          : `<span class="prod-emoji">📦</span>`}
        <span class="cat-tag" style="background:#D6E8FF;color:#1560A8">${p.category}</span>
        <div class="wish-btn">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        ${p.is_hot ? '<div class="hot-badge">🔥 HOT</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))} <small>(${p.reviews} reviews)</small></div>
        <table class="price-table">${priceRows}</table>
        <button class="buy-btn" onclick="window.open('${bestAff || '#'}', '_blank')">Compare & Buy →</button>
      </div>
    `;
    grid.appendChild(card);

    // Add to deals if hot or has discount
    if (p.is_hot && dealsRow.children.length < 5) {
      const deal = document.createElement('div');
      deal.className = 'deal-card';
      deal.innerHTML = `
        <div class="deal-accent" style="background:${storeDots[bestStore]}"></div>
        <div class="deal-img">${p.image_url ? `<img src="${p.image_url}" style="width:90%;height:90%;object-fit:contain"/>` : '📦'}</div>
        <div class="deal-name">${p.name}</div>
        <div class="deal-store">✓ ${bestStore}</div>
        <div class="deal-price">$${bestPrice}</div>
        ${p.original_price ? `
        <div class="deal-old-row">
          <span class="old-price">$${p.original_price}</span>
          <span class="discount">-${Math.round((1 - bestPrice/p.original_price)*100)}%</span>
        </div>` : ''}
      `;
      dealsRow.appendChild(deal);
    }
  });
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', loadProducts);
// ===== CATEGORIES =====
const cats = document.querySelectorAll('.cat');
cats.forEach(cat => {
  cat.addEventListener('click', () => {
    cats.forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
  });
});

// ===== SEARCH =====
function doSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    alert('Searching for: ' + query + '\n\n(Search results page coming soon!)');
  }
}
document.getElementById('searchInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') doSearch();
});

// ===== WISHLIST =====
const wishBtns = document.querySelectorAll('.wish-btn');
wishBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const svg = btn.querySelector('svg');
    const isWished = btn.classList.toggle('wished');
    svg.style.fill = isWished ? '#E84040' : 'none';
    const badge = document.querySelector('.notif-badge');
    let count = parseInt(badge.textContent);
    badge.textContent = isWished ? count + 1 : Math.max(0, count - 1);
  });
});

// ===== BUY BUTTONS =====
const buyBtns = document.querySelectorAll('.buy-btn');
buyBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.product-card');
    const name = card.querySelector('.product-name').textContent;
    const bestStore = card.querySelector('.best-name').textContent;
    const bestPrice = card.querySelector('.best-price').textContent;
    if (confirm(`Buy "${name}" from ${bestStore} for ${bestPrice}?\n\nYou will be redirected to ${bestStore}.`)) {
      alert('Redirecting to ' + bestStore + ' with your affiliate link...');
    }
  });
});

// ===== COUNTDOWN TIMERS =====
function startTimer(hours, minutes, seconds, cardIndex) {
  const tboxes = document.querySelectorAll('.deal-card')[cardIndex]
    ?.querySelectorAll('.tbox');
  if (!tboxes || tboxes.length < 3) return;

  let total = hours * 3600 + minutes * 60 + seconds;

  setInterval(() => {
    if (total <= 0) return;
    total--;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    tboxes[0].textContent = String(h).padStart(2, '0');
    tboxes[1].textContent = String(m).padStart(2, '0');
    tboxes[2].textContent = String(s).padStart(2, '0');
  }, 1000);
}

startTimer(4, 22, 9, 0);
startTimer(11, 45, 33, 1);
startTimer(2, 11, 58, 2);
startTimer(8, 3, 17, 3);
startTimer(6, 59, 41, 4);

// ===== PRODUCT CARD CLICK =====
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
  card.addEventListener('click', () => {
    const name = card.querySelector('.product-name').textContent;
    alert('Opening product page for:\n"' + name + '"\n\n(Product detail page coming soon!)');
  });
});

// ===== RECENTLY VIEWED CLICK =====
const rvCards = document.querySelectorAll('.rv-card');
rvCards.forEach(card => {
  card.addEventListener('click', () => {
    const name = card.querySelector('.rv-name').textContent;
    alert('Opening: ' + name);
  });
});

// ===== SMOOTH SCROLL CATEGORIES =====
const catsBar = document.querySelector('.categories');
let isDown = false, startX, scrollLeft;
catsBar.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - catsBar.offsetLeft;
  scrollLeft = catsBar.scrollLeft;
});
catsBar.addEventListener('mouseleave', () => isDown = false);
catsBar.addEventListener('mouseup', () => isDown = false);
catsBar.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - catsBar.offsetLeft;
  catsBar.scrollLeft = scrollLeft - (x - startX);
});

// ===== DARK MODE TOGGLE (future) =====
// Reserved for future dark mode implementation

console.log('BestShop loaded successfully ✅');