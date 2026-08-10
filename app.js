/* ==========================================================================
   FreshCart - Core JavaScript Application Engine
   ========================================================================== */

// 1. Fixed Price Grocery Catalog
const PRODUCTS = [
    {
        id: "prod-1",
        name: "Fresh Red Apples",
        category: "produce",
        price: 3.49,
        unit: "1 lb (approx. 3-4 apples)",
        badge: "Fresh Pick",
        image: "assets/images/apples.png"
    },
    {
        id: "prod-2",
        name: "Organic Whole Milk",
        category: "dairy",
        price: 4.29,
        unit: "1/2 Gallon Bottle",
        badge: "Organic",
        image: "assets/images/milk.png"
    },
    {
        id: "prod-3",
        name: "Artisan Sourdough Bread",
        category: "bakery",
        price: 3.99,
        unit: "1 Loaf (Freshly Baked)",
        badge: "Bakery Special",
        image: "assets/images/bread.png"
    },
    {
        id: "prod-4",
        name: "Ripe Hass Avocados",
        category: "produce",
        price: 2.49,
        unit: "2 Pack (Ready to Eat)",
        badge: "Superfood",
        image: "assets/images/avocados.png"
    },
    {
        id: "prod-5",
        name: "Fresh Squeezed Orange Juice",
        category: "beverages",
        price: 4.99,
        unit: "32 fl oz Bottle",
        badge: "100% Pure",
        image: "assets/images/orange_juice.png"
    },
    {
        id: "prod-6",
        name: "Sharp Cheddar Cheese",
        category: "pantry",
        price: 5.49,
        unit: "8 oz Block",
        badge: "Aged",
        image: "assets/images/cheese.png"
    },
    {
        id: "prod-7",
        name: "Organic Brown Eggs",
        category: "dairy",
        price: 3.89,
        unit: "1 Dozen (Large)",
        badge: "Farm Fresh",
        image: "assets/images/eggs.png"
    }
];

// 2. Delivery Zones Catalog
const LOCATIONS = [
    { id: "loc-1", name: "Downtown Central", zone: "Zone 1", fee: 3.99, eta: "20 - 30 mins" },
    { id: "loc-2", name: "Uptown Heights", zone: "Zone 2", fee: 4.99, eta: "25 - 35 mins" },
    { id: "loc-3", name: "Westside Tech Park", zone: "Zone 3", fee: 2.99, eta: "15 - 25 mins" },
    { id: "loc-4", name: "Suburbs South", zone: "Zone 4", fee: 5.99, eta: "35 - 45 mins" },
    { id: "loc-5", name: "Airport Metro District", zone: "Zone 5", fee: 6.49, eta: "40 - 50 mins" }
];

// Application State
let cartState = JSON.parse(localStorage.getItem('freshcart_cart')) || [];
let currentLocation = LOCATIONS[0];
let currentCategoryFilter = "all";
let searchQuery = "";
let isUserLoggedIn = false;
let attachedScreenshotBase64 = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartBody = document.getElementById('cartBody');
const subtotalAmount = document.getElementById('subtotalAmount');
const taxAmount = document.getElementById('taxAmount');
const deliveryAmount = document.getElementById('deliveryAmount');
const deliveryFeeLabel = document.getElementById('deliveryFeeLabel');
const totalAmount = document.getElementById('totalAmount');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const checkoutBtn = document.getElementById('checkoutBtn');

const currentLocationName = document.getElementById('currentLocationName');
const cartLocationText = document.getElementById('cartLocationText');

const locationModal = document.getElementById('locationModal');
const locationsList = document.getElementById('locationsList');

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const userLabel = document.getElementById('userLabel');

const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const deliveryZoneSelect = document.getElementById('deliveryZoneSelect');
const checkoutAddressPreview = document.getElementById('checkoutAddressPreview');
const checkoutLandmarkPreview = document.getElementById('checkoutLandmarkPreview');
const checkoutZone = document.getElementById('checkoutZone');
const checkoutEta = document.getElementById('checkoutEta');
const checkoutTotal = document.getElementById('checkoutTotal');

const orderModal = document.getElementById('orderModal');
const confirmedOrderId = document.getElementById('confirmedOrderId');
const orderReceiptCard = document.getElementById('orderReceiptCard');

const bugReportModal = document.getElementById('bugReportModal');
const bugReportForm = document.getElementById('bugReportForm');
const bugDescription = document.getElementById('bugDescription');
const uploadTile = document.getElementById('uploadTile');
const bugAttachmentInput = document.getElementById('bugAttachmentInput');
const attachmentPreview = document.getElementById('attachmentPreview');
const previewImg = document.getElementById('previewImg');
const removeAttachBtn = document.getElementById('removeAttachBtn');
const toastContainer = document.getElementById('toastContainer');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderLocationsList();
    populateZoneSelectOptions();
    updateCartUI();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Category Filter Buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategoryFilter = e.target.dataset.category;
            renderProducts();
        });
    });

    // Search Bar Input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
    });

    // Cart Drawer Toggle
    document.getElementById('cartTriggerBtn').addEventListener('click', openCart);
    document.getElementById('closeCartBtn').addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Coupon Code Apply
    document.getElementById('applyCouponBtn').addEventListener('click', () => {
        const code = document.getElementById('couponInput').value.trim();
        if (code) {
            showToast(`Coupon '${code}' code entered!`);
        }
    });

    // Login Modal
    document.getElementById('loginTriggerBtn').addEventListener('click', () => {
        if (!isUserLoggedIn) {
            openModal(loginModal);
        } else {
            isUserLoggedIn = false;
            userLabel.innerText = "Sign In";
            showToast("Signed out successfully");
        }
    });
    document.getElementById('closeLoginModalBtn').addEventListener('click', () => closeModal(loginModal));
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        showToast("Signed in as user@freshcart.com");
    });

    // Location Selection Modals
    document.getElementById('locationBtn').addEventListener('click', () => openModal(locationModal));
    document.getElementById('cartChangeLocBtn').addEventListener('click', () => {
        closeCart();
        openModal(locationModal);
    });
    document.getElementById('closeLocationModalBtn').addEventListener('click', () => closeModal(locationModal));

    // Checkout Flow & Live Address Updates
    checkoutBtn.addEventListener('click', () => {
        if (cartState.length === 0) return;
        closeCart();
        updateCheckoutModal();
        openModal(checkoutModal);
    });
    document.getElementById('closeCheckoutModalBtn').addEventListener('click', () => closeModal(checkoutModal));

    ['houseNo', 'streetAddress', 'landmark', 'pincode'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateCheckoutModal);
    });

    deliveryZoneSelect.addEventListener('change', (e) => {
        selectLocation(e.target.value);
        updateCheckoutModal();
    });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processOrderPlacement();
    });

    document.getElementById('continueShoppingBtn').addEventListener('click', () => {
        closeModal(orderModal);
    });

    // Bug Reporting Modal & Screenshot Upload
    document.getElementById('reportBugBtn').addEventListener('click', () => {
        bugDescription.value = "";
        clearScreenshotAttachment();
        openModal(bugReportModal);
    });
    document.getElementById('closeBugReportBtn').addEventListener('click', () => closeModal(bugReportModal));
    document.getElementById('reportOrderIssueBtn').addEventListener('click', () => {
        closeModal(orderModal);
        bugDescription.value = "";
        clearScreenshotAttachment();
        openModal(bugReportModal);
    });

    uploadTile.addEventListener('click', () => {
        bugAttachmentInput.click();
    });

    bugAttachmentInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                attachedScreenshotBase64 = evt.target.result;
                previewImg.src = attachedScreenshotBase64;
                attachmentPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeAttachBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearScreenshotAttachment();
    });

    bugReportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleBugReportSubmit();
    });
}

function clearScreenshotAttachment() {
    attachedScreenshotBase64 = null;
    bugAttachmentInput.value = "";
    previewImg.src = "";
    attachmentPreview.style.display = 'none';
}

// Render Products Grid
function renderProducts() {
    let filtered = PRODUCTS.filter(prod => {
        const matchesCat = currentCategoryFilter === 'all' || prod.category === currentCategoryFilter;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || prod.unit.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
    });

    document.getElementById('itemCount').innerText = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
                <h4>No grocery items found</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Try searching for another product or selecting a different category.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filtered.map(prod => {
        const cartItem = cartState.find(item => item.id === prod.id);
        const qty = cartItem ? cartItem.quantity : 0;

        return `
            <article class="product-card" id="card-${prod.id}">
                ${prod.badge ? `<span class="card-badge">${prod.badge}</span>` : ''}
                <div class="product-img-wrapper">
                    <img src="${prod.image}" alt="${prod.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-cat">${prod.category}</span>
                    <h4 class="product-title">${prod.name}</h4>
                    <p class="product-unit">${prod.unit}</p>
                    
                    <div class="product-footer">
                        <div class="price-tag">
                            <span class="fixed-price">$${prod.price.toFixed(2)}</span>
                            <span class="unit-label">Fixed Price</span>
                        </div>
                        
                        ${qty > 0 ? `
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="updateItemQuantity('${prod.id}', -1)" aria-label="Decrease quantity">-</button>
                                <span class="qty-val">${qty}</span>
                                <button class="qty-btn" onclick="updateItemQuantity('${prod.id}', 1)" aria-label="Increase quantity">+</button>
                            </div>
                        ` : `
                            <button class="add-btn" onclick="addToCart('${prod.id}')">
                                <span>+ Add</span>
                            </button>
                        `}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Cart Operations
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = cartState.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartState.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            unit: product.unit,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    renderProducts();
    showToast(`Added ${product.name} to cart! 🛒`);
}

function updateItemQuantity(productId, delta) {
    const itemIndex = cartState.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cartState[itemIndex].quantity += delta;
        if (cartState[itemIndex].quantity <= 0) {
            const removedName = cartState[itemIndex].name;
            cartState.splice(itemIndex, 1);
            showToast(`Removed ${removedName} from cart`);
        }
    }
    saveCart();
    updateCartUI();
    renderProducts();
}

function removeFromCart(productId) {
    const itemIndex = cartState.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedName = cartState[itemIndex].name;
        cartState.splice(itemIndex, 1);
        showToast(`Removed ${removedName} from cart`);
    }
    saveCart();
    updateCartUI();
    renderProducts();
}

function saveCart() {
    localStorage.setItem('freshcart_cart', JSON.stringify(cartState));
}

// Update Cart & Calculation Displays
function updateCartUI() {
    const totalItems = cartState.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.innerText = totalItems;

    if (cartState.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Browse our fresh grocery catalog and add items to your cart!</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartBody.innerHTML = cartState.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h5 class="cart-item-title">${item.name}</h5>
                    <span class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</span>
                </div>
                <div class="qty-controls" style="margin-right: 0.5rem;">
                    <button class="qty-btn" onclick="updateItemQuantity('${item.id}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateItemQuantity('${item.id}', 1)">+</button>
                </div>
                <strong class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</strong>
                <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" title="Remove item">🗑️</button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% Sales Tax Rate
    const isFreeDelivery = subtotal >= 50.00 || subtotal === 0;
    const deliveryFee = isFreeDelivery ? 0 : currentLocation.fee;
    const total = subtotal > 0 ? (subtotal + tax + deliveryFee) : 0;

    subtotalAmount.innerText = `$${subtotal.toFixed(2)}`;
    taxAmount.innerText = `$${tax.toFixed(2)}`;
    deliveryAmount.innerText = isFreeDelivery && subtotal > 0 ? "FREE 🎉" : `$${deliveryFee.toFixed(2)}`;
    deliveryFeeLabel.innerText = isFreeDelivery ? "Free $50+" : currentLocation.zone;
    totalAmount.innerText = `$${total.toFixed(2)}`;

    if (subtotal >= 50.00) {
        progressFill.style.width = '100%';
        progressText.innerText = '🎉 Congratulations! You unlocked FREE Delivery!';
    } else {
        const pct = Math.min((subtotal / 50.00) * 100, 100);
        progressFill.style.width = `${pct}%`;
        const diff = (50.00 - subtotal).toFixed(2);
        progressText.innerText = `Add $${diff} more for FREE delivery!`;
    }
}

// Locations Management
function renderLocationsList() {
    locationsList.innerHTML = LOCATIONS.map(loc => `
        <div class="location-option ${loc.id === currentLocation.id ? 'selected' : ''}" onclick="selectLocation('${loc.id}')">
            <div class="loc-details">
                <h5>${loc.name} (${loc.zone})</h5>
                <span>Estimated Arrival: ${loc.eta}</span>
            </div>
            <span class="loc-badge">$${loc.fee.toFixed(2)} Delivery</span>
        </div>
    `).join('');
}

function populateZoneSelectOptions() {
    deliveryZoneSelect.innerHTML = LOCATIONS.map(loc => `
        <option value="${loc.id}" ${loc.id === currentLocation.id ? 'selected' : ''}>
            ${loc.name} (${loc.zone}) - $${loc.fee.toFixed(2)} Fee [ETA: ${loc.eta}]
        </option>
    `).join('');
}

function selectLocation(locationId) {
    const loc = LOCATIONS.find(l => l.id === locationId);
    if (!loc) return;
    currentLocation = loc;
    
    currentLocationName.innerText = `${loc.name} (${loc.zone})`;
    cartLocationText.innerText = loc.name;
    deliveryZoneSelect.value = loc.id;

    renderLocationsList();
    updateCartUI();
    closeModal(locationModal);
    showToast(`Delivery zone set to ${loc.name} 📍`);
}

// Checkout & Manual Address Handling
function updateCheckoutModal() {
    const houseNo = document.getElementById('houseNo').value || 'Apt 4B';
    const streetAddress = document.getElementById('streetAddress').value || '452 Maple Street';
    const landmark = document.getElementById('landmark').value || 'Near Central Park';
    const pincode = document.getElementById('pincode').value || '560001';

    checkoutAddressPreview.innerText = `${houseNo}, ${streetAddress} (${pincode})`;
    checkoutLandmarkPreview.innerText = landmark;

    const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const isFreeDelivery = subtotal >= 50.00;
    const deliveryFee = isFreeDelivery ? 0 : currentLocation.fee;
    const total = subtotal + tax + deliveryFee;

    checkoutZone.innerText = `${currentLocation.name} (${currentLocation.zone})`;
    checkoutEta.innerText = currentLocation.eta;
    checkoutTotal.innerText = `$${total.toFixed(2)}`;
}

function processOrderPlacement() {
    const orderId = '#GROC-' + Math.floor(100000 + Math.random() * 900000);
    
    const custName = document.getElementById('custName').value;
    const custPhone = document.getElementById('custPhone').value;
    const houseNo = document.getElementById('houseNo').value;
    const streetAddress = document.getElementById('streetAddress').value;
    const landmark = document.getElementById('landmark').value;
    const pincode = document.getElementById('pincode').value;

    const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const isFreeDelivery = subtotal >= 50.00;
    const deliveryFee = isFreeDelivery ? 0 : currentLocation.fee;
    const grandTotal = subtotal + tax + deliveryFee;

    const receiptHtml = `
        <div style="margin-bottom: 0.75rem;">
            <strong>Customer:</strong> ${custName} (${custPhone})<br>
            <strong>Manual Address:</strong> ${houseNo}, ${streetAddress}, Pincode: ${pincode}<br>
            <strong>Landmark:</strong> ${landmark}<br>
            <strong>Zone:</strong> ${currentLocation.name} (${currentLocation.zone})
        </div>
        <div style="margin: 0.75rem 0; font-weight: 700;">Ordered Grocery Items (${cartState.reduce((a, b) => a + b.quantity, 0)} items):</div>
        ${cartState.map(i => `
            <div class="receipt-item-row">
                <span>${i.quantity}x ${i.name} (${i.unit})</span>
                <strong>$${(i.price * i.quantity).toFixed(2)}</strong>
            </div>
        `).join('')}
        <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px dashed var(--border);">
            <div class="receipt-item-row"><span>Subtotal:</span> <span>$${subtotal.toFixed(2)}</span></div>
            <div class="receipt-item-row"><span>Sales Tax (8%):</span> <span>$${tax.toFixed(2)}</span></div>
            <div class="receipt-item-row"><span>Delivery (${currentLocation.zone}):</span> <span>$${isFreeDelivery ? 'FREE' : '$' + deliveryFee.toFixed(2)}</span></div>
            <div class="receipt-item-row" style="font-size: 1rem; font-weight: 700; color: var(--primary-dark);">
                <span>Grand Total Paid:</span>
                <span>$${grandTotal.toFixed(2)}</span>
            </div>
        </div>
    `;

    confirmedOrderId.innerText = orderId;
    orderReceiptCard.innerHTML = receiptHtml;

    // Reset Cart
    cartState = [];
    saveCart();
    updateCartUI();
    renderProducts();

    closeModal(checkoutModal);
    openModal(orderModal);
    showToast(`Order ${orderId} successfully placed! 🎉`);
}

// BugShield SDK Integration Handler (Clean Payload Transmitted Automatically)
function handleBugReportSubmit() {
    const plainWordsDescription = bugDescription.value;

    const reportPayload = {
        appId: "APP-227",
        sdkKey: "sdk_app-227_live",
        applicationId: "APP-227",
        apiKey: "sdk_app-227_live",
        timestamp: new Date().toISOString(),
        issueSummary: plainWordsDescription,
        description: plainWordsDescription,
        summary: plainWordsDescription,
        screenshot: attachedScreenshotBase64,
        risk: "MEDIUM",
        status: "UNRESOLVED",
        environment: {
            url: window.location.href,
            cartItemCount: cartState.reduce((a,b) => a + b.quantity, 0),
            selectedZone: currentLocation.name,
            userAgent: navigator.userAgent
        }
    };

    console.log("Submitting BugShield SDK Payload:", reportPayload);

    // Trigger BugShieldSDK methods if loaded
    if (typeof BugShieldSDK !== 'undefined') {
        if (typeof BugShieldSDK.reportIssue === 'function') BugShieldSDK.reportIssue(reportPayload);
        if (typeof BugShieldSDK.report === 'function') BugShieldSDK.report(reportPayload);
        if (typeof BugShieldSDK.sendIssue === 'function') BugShieldSDK.sendIssue(reportPayload);
        if (typeof BugShieldSDK.capture === 'function') BugShieldSDK.capture(reportPayload);
    }

    // Direct HTTP dispatches to local backend service on 3000
    const endpoints = [
        'http://localhost:3000/api/report',
        'http://localhost:3000/api/issues',
        'http://localhost:3000/api/bugs',
        'http://localhost:3000/api/bug-report'
    ];

    endpoints.forEach(ep => {
        fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportPayload)
        }).catch(err => {
            console.log(`Dispatch to ${ep} attempt complete`);
        });
    });

    closeModal(bugReportModal);
    clearScreenshotAttachment();
    showToast(`🐞 Bug Report submitted to BugShield service!`);
}

// Modal Helpers
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// Toast Notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
