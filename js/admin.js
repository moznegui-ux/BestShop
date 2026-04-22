// ===== LOGIN =====
const ADMIN_EMAIL = 'admin@bestshop.com';
const ADMIN_PASS = 'bestshop2025';

function doLogin() {
  const email = document.getElementById('adminEmail').value;
  const pass = document.getElementById('adminPass').value;
  const error = document.getElementById('loginError');

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDash').style.display = 'flex';
    setDate();
  } else {
    error.style.display = 'block';
    setTimeout(() => error.style.display = 'none', 3000);
  }
}

// Allow Enter key on login
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen.style.display !== 'none') doLogin();
  }
});

// ===== LOGOUT =====
function doLogout() {
  if (confirm('Are you sure you want to logout?')) {
    document.getElementById('adminDash').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPass').value = '';
  }
}

// ===== TABS =====
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  // Remove active from sidebar
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));

  // Show selected tab
  document.getElementById('tab-' + tabName).classList.add('active');

  // Set active sidebar item
  const items = document.querySelectorAll('.sb-item');
  const tabIndex = ['dashboard','products','deals','stores','stats'];
  const idx = tabIndex.indexOf(tabName);
  if (items[idx]) items[idx].classList.add('active');
}

// ===== DATE =====
function setDate() {
  const now = new Date();
  const options = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const el = document.getElementById('currentDate');
  if (el) el.textContent = now.toLocaleDateString('en-US', options);
}

// ===== ADD PRODUCT FORM =====
function showAddProduct() {
  document.getElementById('addProductForm').style.display = 'block';
}
function hideAddProduct() {
  document.getElementById('addProductForm').style.display = 'none';
  clearForm();
}

function clearForm() {
  document.getElementById('newName').value = '';
  document.getElementById('newAmazon').value = '';
  document.getElementById('newTemu').value = '';
  document.getElementById('newAli').value = '';
  document.getElementById('newShein').value = '';
  document.getElementById('newWalmart').value = '';
  document.getElementById('newBanggood').value = '';
}

// ===== SAVE PRODUCT =====
function saveProduct() {
  const name = document.getElementById('newName').value.trim();
  const cat = document.getElementById('newCat').value;
  const amazon = parseFloat(document.getElementById('newAmazon').value) || 0;
  const temu = parseFloat(document.getElementById('newTemu').value) || 0;
  const ali = parseFloat(document.getElementById('newAli').value) || 0;
  const shein = parseFloat(document.getElementById('newShein').value) || 0;
  const walmart = parseFloat(document.getElementById('newWalmart').value) || 0;
  const banggood = parseFloat(document.getElementById('newBanggood').value) || 0;

  if (!name) {
    alert('Please enter a product name!');
    return;
  }

  // Find best price
  const prices = {
    Amazon: amazon, Temu: temu, AliExpress: ali,
    SHEIN: shein, Walmart: walmart, Banggood: banggood
  };
  const filtered = Object.entries(prices).filter(([k,v]) => v > 0);
  if (filtered.length === 0) {
    alert('Please enter at least one price!');
    return;
  }
  const best = filtered.reduce((a,b) => a[1] < b[1] ? a : b);
  const bestStore = best[0];
  const bestPrice = best[1];

  // Add to table
  const tbody = document.getElementById('productsTableBody');
  const tagColor = cat === 'Fashion' ? 'pink' : 'blue';
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><strong>${name}</strong></td>
    <td><span class="tag ${tagColor}">${cat}</span></td>
    <td class="green">$${bestPrice}</td>
    <td>${bestStore}</td>
    <td>
      <button class="edit-btn">Edit</button>
      <button class="del-btn" onclick="deleteRow(this)">Delete</button>
    </td>
  `;
  tbody.appendChild(row);

  // Bind delete button
  row.querySelector('.del-btn').addEventListener('click', function() {
    deleteRow(this);
  });

  hideAddProduct();
  alert(`✅ Product "${name}" added successfully!`);
}

// ===== DELETE ROW =====
function deleteRow(btn) {
  const row = btn.closest('tr');
  const name = row.querySelector('strong').textContent;
  if (confirm(`Delete "${name}"?`)) {
    row.remove();
  }
}

// Bind existing delete buttons
document.querySelectorAll('.del-btn').forEach(btn => {
  btn.addEventListener('click', function() { deleteRow(this); });
});

// ===== AFFILIATE LINKS SAVE =====
document.querySelectorAll('.store-card .save-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.store-card');
    const storeName = card.querySelector('.store-name').textContent;
    const link = card.querySelector('.aff-input').value.trim();
    if (!link) {
      alert('Please enter an affiliate link first!');
      return;
    }
    alert(`✅ Affiliate link for ${storeName} saved!\n\n${link}`);
  });
});

console.log('BestShop Admin loaded ✅');
