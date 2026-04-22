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