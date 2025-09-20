/***********************************
 * Sweet Slac E-Commerce App (vanilla JS)
 ***********************************/

// ------- State Management -------
let products = [];
let cart = [];
let currentUser = null;
let contactSubmissions = [];

// ------- DOM References -------
const header = document.querySelector("header.navbar");
const pages = {
  signin: document.getElementById("page-signin"),
  register: document.getElementById("page-register"),
  adminLogin: document.getElementById("page-admin-login"),
  dashboard: document.getElementById("page-dashboard"),
  products: document.getElementById("page-products"),
  admin: document.getElementById("page-admin"),
  contact: document.getElementById("page-contact"),
};
const productGrid = document.getElementById("product-grid");
const cartBadge = document.getElementById("cart-badge");
const cartPanel = document.getElementById("cart-panel");
const cartItemsNode = document.getElementById("cart-items");
const cartEmptyMsg = document.getElementById("cart-empty");
const cartSubtotal = document.getElementById("cart-subtotal");
const sortSelect = document.getElementById("sort-select");
const adminMessagesList = document.getElementById("admin-messages-list");
const adminProductsList = document.getElementById("admin-products-list");
const toastContainer = document.getElementById("toast-container");

// ------- Utilities -------
function formatPrice(num) {
  return Number(num).toLocaleString("en-IN");
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 4000);
}

// ------- Local Storage Functions -------
function saveState() {
  localStorage.setItem("sweetSlacProducts", JSON.stringify(products));
  localStorage.setItem("sweetSlacCart", JSON.stringify(cart));
  localStorage.setItem("sweetSlacUser", JSON.stringify(currentUser));
  localStorage.setItem(
    "sweetSlacSubmissions",
    JSON.stringify(contactSubmissions)
  );
}

function loadState() {
  const defaultProducts = [
    {
      id: "a1",
      name: "Radiant Dew Serum",
      price: 2499,
      img: "https://images.unsplash.com/photo-1627811015433-368c148f6c3c?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "a2",
      name: "Velvet Night Cream",
      price: 3199,
      img: "https://images.unsplash.com/photo-1575410229391-19b4da01cc94?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "a3",
      name: "Gentle Glow Cleanser",
      price: 1199,
      img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "a4",
      name: "Platinum Eye Serum",
      price: 1999,
      img: "https://images.unsplash.com/photo-1617804439343-1b9a84a7a0a4?w=600&auto=format&fit=crop&q=60",
    },
  ];
  const productsFromStorage = JSON.parse(
    localStorage.getItem("sweetSlacProducts")
  );
  products =
    productsFromStorage && productsFromStorage.length > 0
      ? productsFromStorage
      : defaultProducts;

  cart = JSON.parse(localStorage.getItem("sweetSlacCart")) || [];
  currentUser = JSON.parse(localStorage.getItem("sweetSlacUser")) || null;
  contactSubmissions =
    JSON.parse(localStorage.getItem("sweetSlacSubmissions")) || [];
}

// ------- Page & Content Visibility -------
function showPage(key) {
  if (!currentUser && !["signin", "register", "adminLogin"].includes(key)) {
    key = "signin";
  }

  for (const pageId in pages) {
    if (pages[pageId]) pages[pageId].classList.remove("active");
  }

  const targetPage = pages[key] || pages.signin;
  targetPage.classList.add("active");

  header.style.display = ["signin", "register", "adminLogin"].includes(key)
    ? "none"
    : "flex";

  const isLoggedIn = !!currentUser;
  document.getElementById("nav-signin").style.display = isLoggedIn
    ? "none"
    : "inline-flex";
  document.getElementById("nav-signup").style.display = isLoggedIn
    ? "none"
    : "inline-flex";
  document.getElementById("nav-signout").style.display = isLoggedIn
    ? "inline-flex"
    : "none";

  targetPage.querySelectorAll(".reveal").forEach((el) => {
    el.classList.remove("visible");
    setTimeout(() => el.classList.add("visible"), 50);
  });
}

// ------- Render Functions -------
function renderProducts(list = products) {
  if (!productGrid) return;
  productGrid.innerHTML = "";
  list.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <img loading="lazy" src="${prod.img}" alt="${escapeHtml(
      prod.name
    )}" class="product-thumb">
        <div>
            <div class="prod-name">${escapeHtml(prod.name)}</div>
            <div class="prod-price">₹${formatPrice(prod.price)}</div>
            <div class="prod-actions">
            <button class="btn btn-add" data-id="${
              prod.id
            }">Add to Cart</button>
            </div>
        </div>`;
    productGrid.appendChild(card);
  });
}

function updateCartUI() {
  const totalCount = cart.reduce((s, c) => s + c.qty, 0);
  cartBadge.textContent = totalCount;
  cartBadge.classList.toggle("hidden", totalCount === 0);

  cartItemsNode.innerHTML = "";
  cartEmptyMsg.style.display = cart.length === 0 ? "flex" : "none";

  if (cart.length > 0) {
    cart.forEach((ci) => {
      const p = products.find((pr) => pr.id === ci.id);
      if (!p) {
        cart = cart.filter((item) => item.id !== ci.id);
        saveState();
        return;
      }
      const node = document.createElement("div");
      node.className = "cart-item";
      node.innerHTML = `
            <img src="${p.img}" alt="${escapeHtml(p.name)}">
            <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="font-weight:700">${escapeHtml(p.name)}</div>
                <button class="icon-btn remove-btn" title="Remove" data-id="${
                  ci.id
                }">
                <svg class="trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="#222" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>
                </button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                <div style="color:var(--muted)">₹${formatPrice(p.price)}</div>
                <div class="qty-controls">
                <button class="icon-btn dec-btn" data-id="${ci.id}">−</button>
                <div style="padding:6px 10px;border-radius:8px;border:1px solid #eee">${
                  ci.qty
                }</div>
                <button class="icon-btn inc-btn" data-id="${ci.id}">+</button>
                </div>
            </div>
            </div>`;
      cartItemsNode.appendChild(node);
    });
  }

  const subtotal = cart.reduce((sum, it) => {
    const p = products.find((pr) => pr.id === it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
  cartSubtotal.textContent = `₹${formatPrice(subtotal)}`;
  saveState();
}

function renderAdminMessages() {
  adminMessagesList.innerHTML = "";
  if (contactSubmissions.length === 0) {
    adminMessagesList.innerHTML = `<p class="muted">No customer messages yet.</p>`;
    return;
  }
  [...contactSubmissions].reverse().forEach((msg) => {
    const card = document.createElement("div");
    card.className = "message-card";
    card.innerHTML = `
            <div class="message-header">
                <strong>From: ${escapeHtml(msg.name)}</strong>
                <span class="muted">${escapeHtml(msg.email)}</span>
            </div>
            <p class="message-body">${escapeHtml(msg.message)}</p>
            <span class="muted" style="font-size: 12px; margin-top: 0.5rem;">Sent on: ${
              msg.date
            }</span>
        `;
    adminMessagesList.appendChild(card);
  });
}

function renderAdminProducts() {
  adminProductsList.innerHTML = "";
  if (products.length === 0) {
    adminProductsList.innerHTML = `<p class="muted">No products to display. Add one above.</p>`;
    return;
  }
  products.forEach((prod) => {
    const item = document.createElement("div");
    item.className = "admin-product-item";
    item.innerHTML = `
            <img src="${prod.img}" alt="${escapeHtml(prod.name)}">
            <div class="admin-product-info">
                <div class="prod-name">${escapeHtml(prod.name)}</div>
                <div class="prod-price muted">₹${formatPrice(prod.price)}</div>
            </div>
            <button class="btn btn-delete" data-id="${prod.id}">Delete</button>
        `;
    adminProductsList.appendChild(item);
  });
}

// ------- Cart Logic -------
function openCart() {
  cartPanel.classList.add("open");
}
function closeCartPanel() {
  cartPanel.classList.remove("open");
}

function addToCart(productId) {
  const existing = cart.find((c) => c.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  updateCartUI();
  openCart();
  cartBadge.classList.remove("pop");
  void cartBadge.offsetWidth;
  cartBadge.classList.add("pop");
}
function updateCartQty(productId, change) {
  const item = cart.find((c) => c.id === productId);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter((c) => c.id !== productId);
    }
    updateCartUI();
  }
}

// ------- Central Event Listener for all clicks -------
document.addEventListener("click", function (e) {
  const target = e.target;
  const targetId = target.id;

  if (target.closest(".btn-add"))
    addToCart(target.closest(".btn-add").dataset.id);
  if (target.closest(".inc-btn"))
    updateCartQty(target.closest(".inc-btn").dataset.id, 1);
  if (target.closest(".dec-btn"))
    updateCartQty(target.closest(".dec-btn").dataset.id, -1);
  if (target.closest(".remove-btn"))
    updateCartQty(target.closest(".remove-btn").dataset.id, -Infinity);
  if (target.closest(".btn-delete")) {
    const prodId = target.closest(".btn-delete").dataset.id;
    if (confirm("Are you sure you want to delete this product?")) {
      products = products.filter((p) => p.id !== prodId);
      saveState();
      renderProducts();
      renderAdminProducts();
      showToast("Product deleted successfully.", "success");
    }
  }
  if (target.closest("#btn-cart")) openCart();
  if (target.closest("#close-cart")) closeCartPanel();

  const navLinks = {
    "to-register": "register",
    "to-signin": "signin",
    "nav-signin": "signin",
    "nav-signup": "register",
    "nav-home": "dashboard",
    "link-home": "dashboard",
    "link-products": "products",
    "link-contact": "contact",
    "hero-shop": "products",
    "footer-link-products": "products",
    "footer-link-contact": "contact",
    "to-admin-login-page": "adminLogin",
    "to-signin-from-admin": "signin",
  };
  if (navLinks[targetId]) {
    e.preventDefault();
    showPage(navLinks[targetId]);
  }

  if (targetId === "nav-signout") {
    currentUser = null;
    cart = [];
    saveState();
    showPage("signin");
  }

  switch (targetId) {
    case "btn-register":
      const name = document.getElementById("reg-name").value.trim();
      const emailReg = document.getElementById("reg-email").value.trim();
      const passReg = document.getElementById("reg-password").value.trim();
      if (!name || !emailReg || !passReg)
        return showToast("Please fill out all fields.", "error");
      if (!/\S+@\S+\.\S+/.test(emailReg))
        return showToast("Please enter a valid email.", "error");

      currentUser = { name, email: emailReg };
      cart = [];
      saveState();
      updateCartUI();
      showPage("dashboard");
      showToast(`Welcome, ${name}!`, "success");
      break;

    case "btn-signin":
      const emailSig = document.getElementById("signin-email").value.trim();
      const passSig = document.getElementById("signin-password").value.trim();
      if (!emailSig || !passSig)
        return showToast("Please enter email and password.", "error");

      currentUser = { email: emailSig, name: emailSig.split("@")[0] };
      saveState();
      loadState();
      updateCartUI();
      showPage("dashboard");
      showToast(`Welcome back, ${currentUser.name}!`, "success");
      break;

    case "btn-admin-login":
      const passAdm = document.getElementById("admin-password").value;
      if (passAdm === "admin123") {
        currentUser = { name: "Admin", isAdmin: true };
        saveState();
        renderAdminMessages();
        renderAdminProducts();
        showPage("admin");
        showToast("Admin login successful.", "success");
      } else {
        showToast("Incorrect password.", "error");
      }
      break;

    case "btn-add-product":
      const prodName = document.getElementById("admin-name").value.trim();
      const img = document.getElementById("admin-image").value.trim();
      const priceRaw = document.getElementById("admin-price").value.trim();
      if (!prodName || !img || !priceRaw)
        return showToast("Please fill all product fields.", "error");
      const price = Math.abs(parseInt(priceRaw, 10) || 0);
      products.unshift({ id: "p" + Date.now(), name: prodName, price, img });
      renderProducts();
      renderAdminProducts();
      saveState();
      showToast("Product added successfully.", "success");
      document.getElementById("admin-name").value = "";
      document.getElementById("admin-image").value = "";
      document.getElementById("admin-price").value = "";
      break;

    case "btn-checkout":
      if (cart.length === 0) {
        showToast("Your cart is empty.", "error");
        cartBadge.classList.add("shake");
        setTimeout(() => cartBadge.classList.remove("shake"), 500);
        return;
      }
      showToast("Checkout successful! Thank you for your order.", "success");
      cart = [];
      updateCartUI();
      closeCartPanel();
      break;

    case "btn-contact-submit":
      const contactName = document.getElementById("contact-name").value.trim();
      const contactEmail = document
        .getElementById("contact-email")
        .value.trim();
      const contactMessage = document
        .getElementById("contact-message")
        .value.trim();
      if (!contactName || !contactEmail || !contactMessage)
        return showToast("Please fill out all fields.", "error");

      contactSubmissions.push({
        id: Date.now(),
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        date: new Date().toLocaleString(),
      });
      saveState();
      showToast("Thank you for your message!", "success");
      document.getElementById("contact-name").value = "";
      document.getElementById("contact-email").value = "";
      document.getElementById("contact-message").value = "";
      showPage("dashboard");
      break;
  }
});

sortSelect.addEventListener("change", (e) => {
  const val = e.target.value;
  let sortedProducts = [...products];
  if (val === "low") sortedProducts.sort((a, b) => a.price - b.price);
  else if (val === "high") sortedProducts.sort((a, b) => b.price - a.price);
  renderProducts(sortedProducts);
});

// ------- App Initialization -------
function init() {
  loadState();
  renderProducts();
  updateCartUI();
  showPage(currentUser ? "dashboard" : "signin");
}
init();

// ------- Global Listeners -------
document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "c" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    openCart();
  }
});
document.addEventListener("click", (e) => {
  if (
    cartPanel.classList.contains("open") &&
    !cartPanel.contains(e.target) &&
    !e.target.closest("#btn-cart")
  ) {
    closeCartPanel();
  }
});

// ------- Homepage Slider Logic -------
const sliderTrack = document.querySelector(".slider-track");
if (sliderTrack) {
  const slides = Array.from(sliderTrack.children);
  const nextButton = document.getElementById("slider-next");
  const prevButton = document.getElementById("slider-prev");
  let slideWidth = 0,
    currentSlide = 0;

  const moveToSlide = (track, currentSlide, targetSlide) => {
    if (track)
      track.style.transform = "translateX(-" + slideWidth * targetSlide + "px)";
    return targetSlide;
  };
  const updateSlider = () => {
    slideWidth =
      slides.length > 0 ? slides[0].getBoundingClientRect().width : 0;
    moveToSlide(sliderTrack, currentSlide, currentSlide);
  };

  prevButton.addEventListener("click", () => {
    let targetSlide = currentSlide - 1;
    if (targetSlide < 0) targetSlide = slides.length - 1;
    currentSlide = moveToSlide(sliderTrack, currentSlide, targetSlide);
  });
  nextButton.addEventListener("click", () => {
    let targetSlide = currentSlide + 1;
    if (targetSlide >= slides.length) targetSlide = 0;
    currentSlide = moveToSlide(sliderTrack, currentSlide, targetSlide);
  });

  setInterval(() => nextButton.click(), 5000);
  window.addEventListener("resize", updateSlider);

  new MutationObserver(() => {
    if (pages.dashboard.classList.contains("active")) updateSlider();
  }).observe(pages.dashboard, { attributes: true, attributeFilter: ["class"] });
}
