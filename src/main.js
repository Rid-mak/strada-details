// ─── CURSOR ──────────────────────────────────────────────
const cur  = document.querySelector('.cursor');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function loop() {
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.srv-item,.p-step,.ba-card,.gal-item').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.classList.add('big'); ring.classList.add('big'); });
  el.addEventListener('mouseleave', () => { cur.classList.remove('big'); ring.classList.remove('big'); });
});

// ─── LOADER ──────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('out');
  }, 1800);
});

// ─── NAV ─────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 60);
}, { passive: true });

// ─── MOBILE NAV ──────────────────────────────────────────
const ham        = document.getElementById('ham');
const mobNav     = document.getElementById('mob-nav');
const mobNavClose= document.getElementById('mobNavClose');

function closeMenu() {
  ham.classList.remove('x');
  mobNav.classList.remove('open');
}

ham.addEventListener('click', () => {
  ham.classList.toggle('x');
  mobNav.classList.toggle('open');
});
mobNavClose.addEventListener('click', closeMenu);
document.querySelectorAll('.mm-l').forEach(l => l.addEventListener('click', closeMenu));

// ─── VIDEO PLAY ───────────────────────────────────────────
const heroVid = document.querySelector('.hero-vid');
if (heroVid) {
  heroVid.play().catch(() => {});
}

// ─── REVEAL ON SCROLL ────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv, .rv-l, .rv-r').forEach(el => obs.observe(el));

// ─── COUNTER ANIMATION ────────────────────────────────────
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.to, sfx = el.dataset.sfx || '';
    let n = 0; const inc = end / (1500 / 16);
    const t = setInterval(() => {
      n = Math.min(n + inc, end);
      el.textContent = Math.floor(n) + (n >= end ? sfx : '');
      if (n >= end) clearInterval(t);
    }, 16);
    cObs.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-to]').forEach(el => cObs.observe(el));

// ─── CART ─────────────────────────────────────────────────
const cart = {};
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartFooter  = document.getElementById('cartFooter');
const cartFab     = document.getElementById('cartFab');
const cartFabCount= document.getElementById('cartFabCount');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

function updateCardButtons() {
  document.querySelectorAll('.prod-card').forEach(card => {
    const key = card.dataset.code;
    const btn = card.querySelector('.prod-add-btn');
    if (!btn) return;
    if (cart[key]) {
      btn.textContent = `In cart (${cart[key].qty}) →`;
      btn.classList.add('in-cart');
    } else {
      btn.textContent = 'Add to order →';
      btn.classList.remove('in-cart');
    }
  });
}

function renderCart() {
  const keys = Object.keys(cart);
  const totalQty = keys.reduce((s, k) => s + cart[k].qty, 0);
  const totalPrice = keys.reduce((s, k) => s + cart[k].price * cart[k].qty, 0);

  cartCountEl.textContent = totalQty === 0 ? '0 items' : `${totalQty} item${totalQty > 1 ? 's' : ''}`;
  cartFabCount.textContent = totalQty;
  cartFab.style.display = totalQty > 0 ? 'flex' : 'none';
  cartFooter.style.display = totalQty > 0 ? 'block' : 'none';

  if (keys.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your order is empty.<br>Add products to get started.</p>';
    document.getElementById('cartTotal').textContent = 'Rs 0';
    return;
  }

  cartItemsEl.innerHTML = keys.map(k => {
    const { name, size, price, qty } = cart[k];
    return `<div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-meta">Rs ${price.toLocaleString()} · ${size}</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" data-key="${k}" data-action="dec">−</button>
        <span class="cart-qty">${qty}</span>
        <button class="cart-qty-btn" data-key="${k}" data-action="inc">+</button>
      </div>
      <div class="cart-item-price">Rs ${(price * qty).toLocaleString()}</div>
    </div>`;
  }).join('');

  document.getElementById('cartTotal').textContent = `Rs ${totalPrice.toLocaleString()}`;

  // WhatsApp message
  const lines = keys.map(k => {
    const { name, size, price, qty } = cart[k];
    return `  • ${name} — ${size}${qty > 1 ? ` x${qty}` : ''} (Rs ${(price * qty).toLocaleString()})`;
  }).join('\n');
  const msg =
    `Hi Strada Details! 👋\n\n` +
    `I'd like to place an order:\n\n` +
    `${lines}\n\n` +
    `Total: Rs ${totalPrice.toLocaleString()}\n\n` +
    `Could you confirm availability and delivery? Thank you! 🙏`;
  document.getElementById('cartCheckout').href =
    'https://wa.me/23057000000?text=' + encodeURIComponent(msg);

  updateCardButtons();
}

// ─── PRODUCT FILTER + PAGINATION ─────────────────────────
const filterBtns   = document.querySelectorAll('.prod-filter-btn');
const prodCards    = document.querySelectorAll('.prod-card');
const prodShowing  = document.getElementById('prodShowing');
const prodEmpty    = document.getElementById('prodEmpty');
const viewMoreBtn  = document.getElementById('prodViewMore');
const viewLessBtn  = document.getElementById('prodViewLess');
const PAGE_SIZE    = 4;

let currentFilter  = 'all';
let visibleCount   = PAGE_SIZE; // how many to show in current filter

function getMatchingCards() {
  return [...prodCards].filter(c =>
    currentFilter === 'all' || c.dataset.cat === currentFilter
  );
}

function applyPagination() {
  const matching = getMatchingCards();
  const total    = matching.length;

  // Hide all cards first
  prodCards.forEach(c => { c.style.display = 'none'; c.classList.remove('filtered-out'); });

  // Show up to visibleCount of matching
  matching.slice(0, visibleCount).forEach(c => { c.style.display = ''; });

  const showing = Math.min(visibleCount, total);
  if (prodShowing) prodShowing.textContent = `Showing ${showing} of ${total} product${total !== 1 ? 's' : ''}`;
  if (prodEmpty)   prodEmpty.style.display = total === 0 ? 'block' : 'none';

  // View More / Less visibility
  viewMoreBtn.style.display = showing < total   ? '' : 'none';
  viewLessBtn.style.display = visibleCount > PAGE_SIZE ? '' : 'none';
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    visibleCount  = PAGE_SIZE;
    applyPagination();
  });
});

viewMoreBtn.addEventListener('click', () => {
  visibleCount += PAGE_SIZE;
  applyPagination();
  // Scroll to newly revealed cards
  const matching = getMatchingCards();
  const nextCard = matching[visibleCount - PAGE_SIZE];
  if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

viewLessBtn.addEventListener('click', () => {
  visibleCount = PAGE_SIZE;
  applyPagination();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Init
applyPagination();

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.prod-card');
    const key  = card.dataset.code;
    if (cart[key]) {
      cart[key].qty++;
    } else {
      cart[key] = {
        name: card.dataset.name,
        size: card.dataset.size,
        code: card.dataset.code,
        price: parseInt(card.dataset.price),
        qty: 1
      };
    }
    renderCart();
    openCart();
  });
});

// Cart controls (qty / remove) — delegated
cartItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const key = btn.dataset.key;
  const action = btn.dataset.action;
  if (action === 'inc') { cart[key].qty++; }
  else if (action === 'dec') { cart[key].qty--; if (cart[key].qty <= 0) delete cart[key]; }
  else if (action === 'remove') { delete cart[key]; }
  renderCart();
});

document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
cartFab.addEventListener('click', openCart);

// ─── BEFORE / AFTER SLIDER ────────────────────────────────
function initBASlider(sliderId, beforeId, handleId) {
  const slider = document.getElementById(sliderId);
  const before = document.getElementById(beforeId);
  const handle = document.getElementById(handleId);
  if (!slider) return;

  let dragging = false;

  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.min(Math.max(pct, 2), 98);
    before.style.width = pct + '%';
    handle.style.left  = pct + '%';
  }

  slider.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('mouseup',    () => { dragging = false; });

  slider.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',   () => { dragging = false; });
}

initBASlider('baSlider',  'baBefore',  'baHandle');
initBASlider('baSlider2', 'baBefore2', 'baHandle2');

// ─── SMOOTH ANCHOR LINKS ──────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
