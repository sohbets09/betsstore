let allApps = [];
let currentCategory = 'all';
let searchTerm = '';

const appsList = document.getElementById('apps-list');
const featuredList = document.getElementById('featured-list');
const searchInput = document.getElementById('search');
const catBtns = document.querySelectorAll('.cat-btn');

async function loadApps() {
  try {
    const res = await fetch('apps.json');
    const data = await res.json();
    allApps = data.apps;
    render();
  } catch (e) {
    console.error('apps.json ýüklenmedi:', e);
    appsList.innerHTML = '<p style="color:#d4af37;text-align:center;">apps.json faýly tapylmady!</p>';
  }
}

function createCard(app, index) {
  const div = document.createElement('div');
  div.className = 'app-card';
  div.style.animationDelay = `${index * 0.05}s`;
  div.innerHTML = `
    <span class="dl-badge">APK</span>
    <div class="app-icon">${app.icon}</div>
    <div class="app-name">${app.name}</div>
    <div class="app-desc">${app.desc}</div>
    <span class="app-cat">${app.category}</span>
    <div class="app-size">v${app.version} · ${app.size}</div>
  `;
  div.onclick = () => openModal(app);
  return div;
}

function createFeatured(app, index) {
  const div = document.createElement('div');
  div.className = 'featured-card';
  div.style.animationDelay = `${index * 0.1}s`;
  div.innerHTML = `
    <div class="app-icon" style="width:60px;height:60px;font-size:28px;margin:0;">${app.icon}</div>
    <div style="text-align:left;position:relative;z-index:1;flex:1;">
      <div class="app-name" style="font-size:16px;">${app.name}</div>
      <div class="app-desc" style="margin-bottom:4px;">${app.desc}</div>
      <div class="app-size" style="margin-top:4px;">v${app.version} · ${app.size}</div>
    </div>
    <div style="color:#d4af37;font-size:22px;position:relative;z-index:1;">↓</div>
  `;
  div.onclick = () => openModal(app);
  return div;
}

function render() {
  const filtered = allApps.filter(a => {
    const matchCat = currentCategory === 'all' || a.category === currentCategory;
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  appsList.innerHTML = '';
  featuredList.innerHTML = '';

  filtered.forEach((a, i) => appsList.appendChild(createCard(a, i)));

  const featured = allApps.filter(a => a.featured);
  featured.forEach((a, i) => featuredList.appendChild(createFeatured(a, i)));
}

function downloadApk(app) {
  const a = document.createElement('a');
  a.href = app.apk;
  a.download = `${app.name.replace(/\s+/g, '_')}_v${app.version}.apk`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`⬇ ${app.name} ýüklenýär...`);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position: fixed;
    bottom: 40px; left: 50%;
    transform: translateX(-50%) translateY(120px);
    background: linear-gradient(160deg, #1a1a1a, #0d0d0d);
    color: #d4af37;
    padding: 16px 40px;
    border-radius: 2px;
    border: 1px solid #d4af37;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-size: 12px;
    font-family: 'Cinzel', serif;
    box-shadow: 0 0 40px rgba(212,175,55,0.35);
    z-index: 9999;
    transition: 0.5s cubic-bezier(.2,.8,.2,1);
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.style.transform = 'translateX(-50%) translateY(0)');
  setTimeout(() => {
    t.style.transform = 'translateX(-50%) translateY(150px)';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 500);
  }, 2500);
}

function openModal(app) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <button class="close-btn">×</button>
      <div class="modal-icon">${app.icon}</div>
      <h2>${app.name}</h2>
      <p>${app.desc}</p>

      <div class="modal-meta">
        <span>Wersiýa<strong>${app.version}</strong></span>
        <span>Ölçeg<strong>${app.size}</strong></span>
        <span>Paket<strong style="font-size:11px;">${app.package}</strong></span>
      </div>

      <button class="download-btn" id="dl-btn"><span>APK ÝÜKLE</span></button>

      <p class="install-hint">
        Gurmak üçin: <strong>Settings → Security → Unknown sources</strong> açyň.
      </p>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#dl-btn').onclick = () => {
    downloadApk(app);
    overlay.remove();
  };

  overlay.querySelector('.close-btn').onclick = () => overlay.remove();
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}

searchInput.addEventListener('input', e => {
  searchTerm = e.target.value;
  render();
});

catBtns.forEach(btn => {
  btn.onclick = () => {
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    render();
  };
});

loadApps();