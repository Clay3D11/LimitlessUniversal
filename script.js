const page = document.documentElement;
const body = document.body;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const cartDrawer = document.querySelector('[data-cart-drawer]');
const cartContent = document.querySelector('[data-cart-content]');
const cartTotal = document.querySelector('[data-cart-total]');
const cartCount = document.querySelector('[data-cart-count]');
const checkoutButton = document.querySelector('[data-checkout]');
const consultationModal = document.querySelector('[data-consultation-modal]');
const legalModal = document.querySelector('[data-legal-modal]');
const leadForm = document.querySelector('[data-lead-form]');
const toastBox = document.querySelector('[data-toast-box]');

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const currentServicePrices = {
  'data-foundation': 1800,
  'commerce-launch': 3500,
  'automation-engine': 2200,
  'brand-content': 1500,
  'data-command-center': 5500
};

let cart = readCart();
let lastFocusedElement = null;
let toastTimer;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('universal-limitless-cart'));
    return Array.isArray(saved)
      ? saved.map((item) => ({ ...item, price: currentServicePrices[item.id] ?? item.price }))
      : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('universal-limitless-cart', JSON.stringify(cart));
}

function lockPage(locked) {
  body.classList.toggle('is-locked', locked);
}

function setNavigation(open) {
  header.classList.toggle('is-menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => {
  setNavigation(navToggle.getAttribute('aria-expanded') !== 'true');
});

nav.addEventListener('click', ({ target }) => {
  if (target.closest('a')) setNavigation(false);
});

document.addEventListener('click', ({ target }) => {
  if (header.classList.contains('is-menu-open') && !header.contains(target)) setNavigation(false);
});

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.primary-nav a')];

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
  });
}, { rootMargin: '-25% 0px -65%', threshold: [0, .25, .6] });

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .1, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
    document.querySelectorAll('[data-category]').forEach((card) => {
      card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter);
    });
  });
});

function serviceFromElement(element) {
  const source = element.closest('[data-service-id]');
  return {
    id: source.dataset.serviceId,
    name: source.dataset.serviceName,
    price: Number(source.dataset.servicePrice)
  };
}

function addService(service, openDrawer = false) {
  const exists = cart.some((item) => item.id === service.id);
  if (!exists) {
    cart.push(service);
    saveCart();
    renderCart();
    showToast(`${service.name} added to your project.`);
  } else {
    showToast(`${service.name} is already in your project.`);
  }

  if (openDrawer) openCart();
}

document.querySelectorAll('[data-add-service]').forEach((button) => {
  button.addEventListener('click', () => addService(serviceFromElement(button)));
});

document.querySelectorAll('[data-add-direct]').forEach((button) => {
  button.addEventListener('click', () => addService(serviceFromElement(button), true));
});

function removeService(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = String(cart.length);
  cartTotal.textContent = money.format(total);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <span aria-hidden="true">◇</span>
        <h3>Your project is ready to take shape.</h3>
        <p>Add services as you explore. We’ll use them to prepare a tailored project scope.</p>
      </div>`;
  } else {
    cartContent.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <div><strong>${escapeHtml(item.name)}</strong><small>Starting at ${money.format(item.price)}</small></div>
        <button type="button" data-remove-service="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
      </div>`).join('');
  }

  document.querySelectorAll('[data-service-id]').forEach((card) => {
    const added = cart.some((item) => item.id === card.dataset.serviceId);
    card.classList.toggle('is-added', added);
    const button = card.querySelector('[data-add-service]');
    if (button) {
      button.classList.toggle('is-added', added);
      button.textContent = added ? 'Added ✓' : 'Add to project';
    }
  });
}

cartContent.addEventListener('click', ({ target }) => {
  const removeButton = target.closest('[data-remove-service]');
  if (removeButton) removeService(removeButton.dataset.removeService);
});

function openCart() {
  lastFocusedElement = document.activeElement;
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  lockPage(true);
  requestAnimationFrame(() => cartDrawer.querySelector('[data-cart-close]').focus());
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  lockPage(false);
  lastFocusedElement?.focus();
}

document.querySelectorAll('[data-cart-open]').forEach((button) => button.addEventListener('click', openCart));
document.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', closeCart));

function openConsultation(plan = '') {
  if (cartDrawer.classList.contains('is-open')) closeCart();
  lastFocusedElement = document.activeElement;
  const selected = leadForm.querySelector('[data-selected-services]');
  const message = leadForm.elements.message;
  selected.value = cart.map((item) => item.name).join(', ');
  if (plan) message.value = `I'm interested in the ${plan} partnership. `;
  consultationModal.showModal();
  lockPage(true);
  requestAnimationFrame(() => leadForm.elements.firstName.focus());
}

function closeConsultation() {
  consultationModal.close();
  lockPage(false);
  lastFocusedElement?.focus();
}

document.querySelectorAll('[data-open-consultation]').forEach((button) => button.addEventListener('click', () => openConsultation()));
document.querySelectorAll('[data-close-consultation]').forEach((button) => button.addEventListener('click', closeConsultation));
checkoutButton.addEventListener('click', () => openConsultation('custom project'));
document.querySelectorAll('[data-plan]').forEach((button) => button.addEventListener('click', () => openConsultation(button.dataset.plan)));

consultationModal.addEventListener('click', ({ target }) => {
  if (target === consultationModal) closeConsultation();
});

leadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...leadForm.querySelectorAll('input, select, textarea')].filter((field) => field.type !== 'hidden');
  fields.forEach((field) => field.setAttribute('aria-invalid', String(!field.checkValidity())));
  const firstInvalid = fields.find((field) => !field.checkValidity());
  if (firstInvalid) {
    firstInvalid.focus();
    showToast('Please complete the required fields.');
    return;
  }

  const submission = Object.fromEntries(new FormData(leadForm));
  localStorage.setItem('universal-limitless-latest-inquiry', JSON.stringify({ ...submission, submittedAt: new Date().toISOString() }));
  leadForm.hidden = true;
  consultationModal.querySelector('.modal-copy').hidden = true;
  consultationModal.querySelector('[data-form-success]').hidden = false;
  cart = [];
  saveCart();
  renderCart();
});

consultationModal.addEventListener('close', () => {
  lockPage(false);
  window.setTimeout(() => {
    leadForm.reset();
    leadForm.hidden = false;
    consultationModal.querySelector('.modal-copy').hidden = false;
    consultationModal.querySelector('[data-form-success]').hidden = true;
    leadForm.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
  }, 200);
});

consultationModal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeConsultation();
});

document.querySelectorAll('.faq-item > button').forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const answer = button.nextElementSibling;
    button.setAttribute('aria-expanded', String(!expanded));
    answer.hidden = expanded;
  });
});

document.querySelectorAll('[data-period]').forEach((button) => {
  button.addEventListener('click', () => {
    const period = button.dataset.period;
    document.querySelectorAll('[data-period]').forEach((item) => item.classList.toggle('is-active', item === button));
    document.querySelectorAll('[data-project-price]').forEach((price) => {
      price.textContent = period === 'monthly' ? price.dataset.monthlyPrice : price.dataset.projectPrice;
    });
    document.querySelectorAll('[data-price-suffix]').forEach((suffix) => {
      suffix.textContent = period === 'monthly' ? 'per month · 3 month minimum' : (suffix.closest('.price-card').querySelector('h3').textContent === 'Custom' ? 'built around your operation' : 'starting project');
    });
  });
});

const legalCopy = {
  privacy: `
    <span class="kicker">Legal</span><h2>Privacy overview</h2>
    <p>Universal Limitless respects your privacy. This preview stores your project cart and draft inquiry only in your browser. Before public launch, connect the form to an approved provider and replace this overview with a jurisdiction-specific privacy policy reviewed by qualified counsel.</p>
    <h3>Information collected</h3><p>When the live form is connected, submitted contact details, company information, project requirements, and technical analytics may be processed to respond to inquiries and improve the service.</p>
    <h3>Your choices</h3><p>You may request access, correction, or deletion of personal information using the contact details published on the final site.</p>`,
  terms: `
    <span class="kicker">Legal</span><h2>Terms overview</h2>
    <p>Website content is provided for general information. Pricing shown is a starting estimate and does not constitute a binding offer. Every paid engagement requires a separate written proposal or service agreement.</p>
    <h3>Intellectual property</h3><p>Universal Limitless brand assets and original site content may not be reproduced commercially without permission. Client ownership and licensing are defined in each project agreement.</p>
    <h3>Important</h3><p>This placeholder is not legal advice. Replace it with final terms reviewed for your business, services, location, and payment practices before accepting transactions.</p>`
};

document.querySelectorAll('[data-legal]').forEach((button) => {
  button.addEventListener('click', () => {
    lastFocusedElement = button;
    legalModal.querySelector('[data-legal-content]').innerHTML = legalCopy[button.dataset.legal];
    legalModal.showModal();
    lockPage(true);
  });
});

function closeLegal() {
  legalModal.close();
  lockPage(false);
  lastFocusedElement?.focus();
}

document.querySelector('[data-close-legal]').addEventListener('click', closeLegal);
legalModal.addEventListener('click', ({ target }) => {
  if (target === legalModal) closeLegal();
});

legalModal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeLegal();
});

document.addEventListener('keydown', ({ key }) => {
  if (key !== 'Escape') return;
  setNavigation(false);
  if (cartDrawer.classList.contains('is-open')) closeCart();
});

function showToast(message) {
  window.clearTimeout(toastTimer);
  toastBox.textContent = message;
  toastBox.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toastBox.classList.remove('is-visible'), 2600);
}

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();
renderCart();
