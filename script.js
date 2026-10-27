'use strict';

// Catálogo de demonstração. Troque estes dados por uma API quando criar o backend.
const PRODUCTS = [
  { id: 1, name: 'Fone Atmos Pro', category: 'Áudio', description: 'Som imersivo, sem fios e sem limites.', details: 'Fone de ouvido sem fio com design confortável, controle de reprodução e estojo compacto. Ideal para música, estudos e trabalho.', price: 349.90, oldPrice: 429.90, badge: 'Destaque', image: 'headphones.svg' },
  { id: 2, name: 'Teclado KeyOne', category: 'Periféricos', description: 'Precisão e conforto a cada tecla.', details: 'Teclado mecânico compacto, formato ergonômico e iluminação discreta para o seu setup.', price: 289.90, oldPrice: null, badge: 'Novo', image: 'keyboard.svg' },
  { id: 3, name: 'Mouse Flow Wireless', category: 'Periféricos', description: 'Liberdade para criar e produzir.', details: 'Mouse sem fio de perfil anatômico, com rolagem suave e conexão prática para sua rotina.', price: 139.90, oldPrice: 179.90, badge: '-22%', image: 'mouse.svg' },
  { id: 4, name: 'Smartwatch Pulse', category: 'Smart', description: 'Seu dia conectado ao seu ritmo.', details: 'Relógio inteligente com tela colorida, mostradores personalizáveis e design para uso diário.', price: 499.90, oldPrice: 579.90, badge: 'Destaque', image: 'watch.svg' },
  { id: 5, name: 'Speaker Echo Mini', category: 'Áudio', description: 'Muita música em qualquer lugar.', details: 'Caixa de som portátil de tamanho compacto, com controles simples e acabamento moderno.', price: 219.90, oldPrice: null, badge: '', image: 'speaker.svg' },
  { id: 6, name: 'Carregador Boost', category: 'Acessórios', description: 'Energia extra, sem complicação.', details: 'Base de carregamento sem fio, minimalista e prática para manter sua mesa organizada.', price: 129.90, oldPrice: 159.90, badge: '-19%', image: 'charger.svg' },
  { id: 7, name: 'Headset Wave', category: 'Áudio', description: 'Conforto para longas sessões.', details: 'Headset com conchas acolchoadas e microfone ajustável, perfeito para chamadas e jogos.', price: 279.90, oldPrice: null, badge: 'Novo', image: 'headset.svg' },
  { id: 8, name: 'Câmera Home View', category: 'Smart', description: 'Um novo olhar para o seu espaço.', details: 'Câmera inteligente demonstrativa com visual clean, base articulada e lente grande-angular.', price: 319.90, oldPrice: null, badge: '', image: 'camera.svg' },
  { id: 9, name: 'Luminária Desk Glow', category: 'Acessórios', description: 'Luz certa para boas ideias.', details: 'Luminária de mesa articulada com visual contemporâneo, pensada para estudos e projetos.', price: 189.90, oldPrice: 229.90, badge: '-17%', image: 'lamp.svg' },
  { id: 10, name: 'Suporte Notebook Lift', category: 'Acessórios', description: 'Um setup mais leve e organizado.', details: 'Suporte para notebook com design elevado, ideal para deixar sua estação de trabalho funcional.', price: 159.90, oldPrice: null, badge: '', image: 'stand.svg' },
];

const SHIPPING_THRESHOLD = 299;
const SHIPPING_FEE = 19.90;
const MAX_QUANTITY = 5;
const STORAGE_CART = 'orbit-demo-cart-v1';
const STORAGE_FAVORITES = 'orbit-demo-favorites-v1';
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const byId = id => document.getElementById(id);
const productById = id => PRODUCTS.find(product => product.id === id);
const imagePath = product => `assets/${product.image}`;
const simplify = str => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function getStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

const state = {
  cart: getStoredArray(STORAGE_CART)
    .filter(item => item && Number.isInteger(item.id) && productById(item.id))
    .map(item => ({ id: item.id, qty: Math.min(MAX_QUANTITY, Math.max(1, Number(item.qty) || 1)) })),
  favorites: new Set(getStoredArray(STORAGE_FAVORITES).filter(id => Number.isInteger(id) && productById(id))),
  category: 'Todos',
  query: '',
  sort: 'featured',
  onlyFavorites: false,
  couponApplied: false,
  selectedProduct: null,
};

'/* Limpa o carrinho e reseta o cupom aplicado e pergunta se o cliente deseja limpar o carrinho. */'
function clearCart() {
  if (confirm('Tem certeza de que deseja limpar o carrinho?')) {
    state.cart = [];
    state.couponApplied = false;
    byId('coupon-input').value = '';
    byId('coupon-feedback').textContent = 'Experimente o cupom BEMVINDO10';
    byId('coupon-feedback').className = '';
    saveState();
    renderCart();
    notify('Carrinho limpo com sucesso!');
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_CART, JSON.stringify(state.cart));
    localStorage.setItem(STORAGE_FAVORITES, JSON.stringify([...state.favorites]));
  } catch {
    // A loja continua funcionando quando o armazenamento estiver desativado.
  }
}

function getVisibleProducts() {
  const results = PRODUCTS.filter(product =>
    (state.category === 'Todos' || product.category === state.category) &&
    (!state.onlyFavorites || state.favorites.has(product.id)) &&
    simplify(`${product.name} ${product.category} ${product.description}`).includes(simplify(state.query.trim()))
  );
  if (state.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (state.sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return results;
}

function renderProducts() {
  const products = getVisibleProducts();
  byId('product-count').textContent = `${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`;
  byId('empty-state').hidden = products.length > 0;
  byId('product-grid').innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-visual">
        <img src="${imagePath(product)}" alt="Ilustração do produto ${product.name}" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <button class="wish-button ${state.favorites.has(product.id) ? 'is-favorite' : ''}" type="button" data-action="favorite" data-id="${product.id}" aria-pressed="${state.favorites.has(product.id)}" aria-label="${state.favorites.has(product.id) ? 'Remover' : 'Adicionar'} ${product.name} ${state.favorites.has(product.id) ? 'dos' : 'aos'} favoritos">${state.favorites.has(product.id) ? '♥' : '♡'}</button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="price-line"><span class="price">${money(product.price)}</span>${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
        <div class="card-actions"><button type="button" class="add-button" data-action="add" data-id="${product.id}" aria-label="Adicionar ${product.name} ao carrinho"><span class="add-long">Adicionar ao carrinho</span><span class="add-short">Adicionar</span> +</button><button type="button" class="details-button" data-action="details" data-id="${product.id}" aria-label="Ver detalhes de ${product.name}">↗</button></div>
      </div>
    </article>`).join('');
}

function resetFilters() {
  state.category = 'Todos'; state.query = ''; state.sort = 'featured'; state.onlyFavorites = false;
  byId('search-input').value = '';
  byId('sort-select').value = 'featured';
  byId('favorites-filter').classList.remove('active');
  byId('favorites-filter').setAttribute('aria-pressed', 'false');
  document.querySelectorAll('.filter-chip').forEach(button => {
    const active = button.dataset.category === 'Todos';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderProducts();
}

let toastTimer;
function notify(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2900);
}

function addToCart(id) {
  const product = productById(id);
  if (!product) return;
  const existing = state.cart.find(item => item.id === id);
  if (existing) {
    if (existing.qty >= MAX_QUANTITY) { notify(`Limite de ${MAX_QUANTITY} unidades por produto.`); return; }
    existing.qty++;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  saveState();
  renderCart();
  notify(`${product.name} adicionado ao carrinho!`);
}

function toggleFavorite(id) {
  if (!productById(id)) return;
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  saveState();
  renderProducts();
}

function subtotal() {
  return state.cart.reduce((sum, item) => sum + (productById(item.id)?.price || 0) * item.qty, 0);
}

function calculateTotal() {
  const sub = subtotal();
  const discount = state.couponApplied ? Math.round(sub * 10) / 100 : 0;
  const shipping = sub === 0 || sub >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { sub, discount, shipping, total: Math.max(0, sub - discount + shipping) };
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  byId('cart-count').textContent = count > 99 ? '99+' : count;
  byId('open-cart').setAttribute('aria-label', `Abrir carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`);
  byId('drawer-count').textContent = `(${count})`;
  const empty = !state.cart.length;
  byId('cart-bottom').hidden = empty;
  if (empty) {
    byId('cart-items').innerHTML = `<div class="cart-empty"><span aria-hidden="true">◇</span><h3>Seu carrinho está vazio</h3><p>Explore nossa coleção e encontre algo que combine com você.</p><button type="button" class="button button-dark" id="continue-shopping">Ver produtos</button></div>`;
    return;
  }
  byId('cart-items').innerHTML = state.cart.map(item => {
    const product = productById(item.id);
    return `<div class="cart-item"><img src="${imagePath(product)}" alt="" /><div class="cart-item-details"><h3>${product.name}</h3><strong>${money(product.price * item.qty)}</strong><div class="cart-item-bottom"><div class="quantity-control"><button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade de ${product.name}">−</button><span>${item.qty}</span><button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade de ${product.name}">+</button></div><button type="button" class="remove-item" data-cart-action="remove" data-id="${item.id}">Remover</button></div></div></div>`;
  }).join('');
  const { sub, discount, shipping, total } = calculateTotal();
  const missing = Math.max(0, SHIPPING_THRESHOLD - sub);
  byId('shipping-message').textContent = missing > 0 ? `Faltam ${money(missing)} para ganhar frete grátis!` : 'Parabéns! Você ganhou frete grátis ✦';
  byId('shipping-fill').style.width = `${Math.min(100, sub / SHIPPING_THRESHOLD * 100)}%`;
  byId('subtotal').textContent = money(sub);
  byId('discount').textContent = discount ? `− ${money(discount)}` : money(0);
  byId('shipping-cost').textContent = shipping ? money(shipping) : 'Grátis';
  byId('total').textContent = money(total);
  if (state.couponApplied) {
    byId('coupon-feedback').textContent = 'Cupom BEMVINDO10 aplicado: 10% de desconto!';
    byId('coupon-feedback').className = 'success';
  }
}

function changeQuantity(id, action) {
  const item = state.cart.find(entry => entry.id === id);
  if (!item) return;
  if (action === 'remove') state.cart = state.cart.filter(entry => entry.id !== id);
  else if (action === 'increase') {
    if (item.qty >= MAX_QUANTITY) { notify(`Limite de ${MAX_QUANTITY} unidades por produto.`); return; }
    item.qty++;
  } else if (action === 'decrease') {
    item.qty--;
    if (item.qty <= 0) state.cart = state.cart.filter(entry => entry.id !== id);
  }
  saveState(); renderCart();
}

const cartDrawer = byId('cart-drawer');
let previouslyFocused = null;
function syncScrollLock() {
  document.body.classList.toggle('no-scroll', cartDrawer.classList.contains('open') || !byId('product-modal').hidden || !byId('checkout-modal').hidden);
}
function openCart() {
  previouslyFocused = document.activeElement;
  byId('cart-overlay').hidden = false;
  cartDrawer.inert = false;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  syncScrollLock();
  byId('close-cart').focus();
}
function closeCart(returnFocus = true) {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartDrawer.inert = true;
  byId('cart-overlay').hidden = true;
  syncScrollLock();
  if (returnFocus) previouslyFocused?.focus?.();
}
function openProductModal(id) {
  const product = productById(id);
  if (!product) return;
  previouslyFocused = document.activeElement;
  state.selectedProduct = id;
  byId('product-modal-body').innerHTML = `<div class="product-modal-layout"><img src="${imagePath(product)}" alt="Ilustração do produto ${product.name}" /><div class="modal-information"><span class="section-label">${product.category.toUpperCase()}</span><h2 id="modal-title">${product.name}</h2><p>${product.details}</p><span class="modal-price">${money(product.price)}</span><button type="button" class="button button-dark" id="modal-add">Adicionar ao carrinho +</button></div></div>`;
  byId('product-modal').hidden = false;
  syncScrollLock();
  byId('close-product-modal').focus();
}
function closeProductModal() {
  byId('product-modal').hidden = true;
  state.selectedProduct = null;
  syncScrollLock();
  previouslyFocused?.focus?.();
}
function openCheckout() {
  if (state.cart.length === 0) return;
  closeCart(false);
  byId('checkout-content').innerHTML = `<span class="section-label">QUASE LÁ</span><h2 id="checkout-title">Finalizar pedido</h2><p>Este formulário simula uma compra. Nenhum dado é enviado a um servidor ou serviço de pagamento.</p><form id="checkout-form"><label for="customer-name">Nome completo</label><input id="customer-name" name="name" required minlength="2" autocomplete="name" placeholder="Seu nome" /><label for="customer-email">E-mail</label><input id="customer-email" name="email" type="email" required autocomplete="email" placeholder="voce@exemplo.com" /><label for="customer-address">Endereço de entrega</label><input id="customer-address" name="address" required minlength="5" autocomplete="street-address" placeholder="Rua, número e complemento" /><div class="checkout-summary" id="checkout-summary"><strong>Total demonstrativo</strong><strong>${money(calculateTotal().total)}</strong></div><button type="submit" class="button button-dark checkout-button">Simular pedido <span aria-hidden="true">→</span></button></form>`;
  byId('checkout-modal').hidden = false;
  syncScrollLock();
  byId('close-checkout-modal').focus();
}
function closeCheckout() {
  byId('checkout-modal').hidden = true;
  syncScrollLock();
  byId('open-cart').focus();
}
function finishDemoOrder() {
  // Não armazenamos nem transmitimos os dados informados no formulário.
  const fakeOrderNumber = String(Math.floor(Math.random() * 900000) + 100000);
  state.cart = [];
  state.couponApplied = false;
  byId('coupon-input').value = '';
  byId('coupon-feedback').textContent = 'Experimente o cupom BEMVINDO10';
  byId('coupon-feedback').className = '';
  saveState(); renderCart();
  byId('checkout-content').innerHTML = `<div class="checkout-success"><span aria-hidden="true">✓</span><h2 id="checkout-title">Simulação concluída!</h2><p>Pedido fictício <strong>#${fakeOrderNumber}</strong> criado para demonstração.<br>Nenhuma compra ou pagamento foi realizado.</p><button class="button button-dark" type="button" id="finish-shopping">Voltar para a loja</button></div>`;
  byId('finish-shopping').focus();
}

// Delegação de eventos: os cards e itens do carrinho são recriados após cada atualização.
byId('product-grid').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === 'add') addToCart(id);
  if (button.dataset.action === 'favorite') toggleFavorite(id);
  if (button.dataset.action === 'details') openProductModal(id);
});
byId('cart-items').addEventListener('click', event => {
  const button = event.target.closest('button[data-cart-action]');
  if (button) changeQuantity(Number(button.dataset.id), button.dataset.cartAction);
  if (event.target.closest('#continue-shopping')) { closeCart(); byId('produtos').scrollIntoView(); }
});
byId('category-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const active = chip === button;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  renderProducts();
});
byId('search-input').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
byId('sort-select').addEventListener('change', event => { state.sort = event.target.value; renderProducts(); });
byId('favorites-filter').addEventListener('click', event => {
  state.onlyFavorites = !state.onlyFavorites;
  event.currentTarget.classList.toggle('active', state.onlyFavorites);
  event.currentTarget.setAttribute('aria-pressed', String(state.onlyFavorites));
  renderProducts();
});
byId('reset-filters').addEventListener('click', resetFilters);
byId('open-cart').addEventListener('click', openCart);
byId('clear-cart').addEventListener('click', clearCart);
byId('close-cart').addEventListener('click', () => closeCart());
byId('cart-overlay').addEventListener('click', () => closeCart());
byId('checkout-button').addEventListener('click', openCheckout);
byId('coupon-form').addEventListener('submit', event => {
  event.preventDefault();
  const feedback = byId('coupon-feedback');
  const coupon = byId('coupon-input').value.trim().toUpperCase();
  if (coupon === 'BEMVINDO10') {
    state.couponApplied = true;
    feedback.textContent = 'Cupom BEMVINDO10 aplicado: 10% de desconto!';
    feedback.className = 'success';
    renderCart();
  } else {
    feedback.textContent = 'Cupom inválido. Tente BEMVINDO10.';
    feedback.className = 'error';
  }
});
byId('close-product-modal').addEventListener('click', closeProductModal);
byId('product-modal').addEventListener('click', event => { if (event.target.id === 'product-modal') closeProductModal(); });
byId('product-modal-body').addEventListener('click', event => {
  if (event.target.closest('#modal-add')) { addToCart(state.selectedProduct); closeProductModal(); openCart(); }
});
byId('close-checkout-modal').addEventListener('click', closeCheckout);
byId('checkout-modal').addEventListener('click', event => {
  if (event.target.id === 'checkout-modal') closeCheckout();
  if (event.target.closest('#finish-shopping')) closeCheckout();
});
byId('checkout-content').addEventListener('submit', event => {
  if (event.target.id === 'checkout-form') { event.preventDefault(); finishDemoOrder(); }
});

// Escape fecha diálogos; Tab permanece no diálogo ativo.
document.addEventListener('keydown', event => {
  const activeDialog = !byId('checkout-modal').hidden ? byId('checkout-modal').querySelector('[role="dialog"]')
    : !byId('product-modal').hidden ? byId('product-modal').querySelector('[role="dialog"]')
    : cartDrawer.classList.contains('open') ? cartDrawer : null;
  if (!activeDialog) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (!byId('checkout-modal').hidden) closeCheckout();
    else if (!byId('product-modal').hidden) closeProductModal();
    else closeCart();
  }
  if (event.key === 'Tab') {
    const focusable = [...activeDialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const menuToggle = byId('menu-toggle');
menuToggle.addEventListener('click', () => {
  const menu = byId('mobile-nav');
  menu.hidden = !menu.hidden;
  menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
  menuToggle.setAttribute('aria-label', menu.hidden ? 'Abrir menu' : 'Fechar menu');
});
byId('mobile-nav').addEventListener('click', event => {
  if (event.target.closest('a')) { byId('mobile-nav').hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menu'); }
});

cartDrawer.inert = true;
renderProducts();
renderCart();


