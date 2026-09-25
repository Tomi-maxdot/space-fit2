// SpaceFit Core Script - Shared Interactivity, Global Cart, Favorites & Smart Search
(function () {
  'use strict';

  var CART_STORAGE_KEY = 'spacefitCart';
  var FAVORITES_STORAGE_KEY = 'spacefitSavedItemIds';
  var AUTH_PERSIST_KEY = 'spacefitAuthToken';
  var AUTH_SESSION_KEY = 'spacefitAuthSession';
  var USER_PROFILE_KEY = 'spacefitUserProfile';
  var CART_PAGE = 'cart.html';
  var FAVORITES_PAGE = 'favourite.html';
  var SHOP_PAGE = 'shop.html';
  var AUTH_PAGE = 'auth.html';
  var HOME_CATEGORY_IDS = ['beds', 'wardrobes', 'desks', 'nightstands', 'mattresses', 'rugs'];

  /* ==========================================================================
     0. USER AUTHENTICATION STATE & REGISTRATION GUARD
     ========================================================================== */

  function isUserRegistered() {
    try {
      return localStorage.getItem(AUTH_PERSIST_KEY) === 'signed-in' || sessionStorage.getItem(AUTH_SESSION_KEY) === 'signed-in';
    } catch (e) {
      return false;
    }
  }

  function setRegistered(status, remember) {
    localStorage.removeItem('spacefitIsRegistered');
    localStorage.removeItem(AUTH_PERSIST_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    if (status) {
      if (remember !== false) localStorage.setItem(AUTH_PERSIST_KEY, 'signed-in');
      else sessionStorage.setItem(AUTH_SESSION_KEY, 'signed-in');
    }
    window.dispatchEvent(new CustomEvent('auth:updated', { detail: { isRegistered: !!status } }));
  }

  function getUserProfile() {
    try { return JSON.parse(localStorage.getItem(USER_PROFILE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  function saveUserProfile(profile) {
    var current = getUserProfile();
    var next = Object.assign({}, current, profile || {});
    delete next.password;
    delete next.confirmPassword;
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('profile:updated', { detail: next }));
    return next;
  }

  function syncProfileIcons() {
    var signedIn = isUserRegistered();
    var profile = getUserProfile();
    document.querySelectorAll('a[aria-label="User profile"], #shopProfileButton').forEach(function (link) {
      if (!link.dataset.defaultProfileMarkup) link.dataset.defaultProfileMarkup = link.innerHTML;
      link.href = signedIn ? 'profile.html' : AUTH_PAGE + '?mode=register';
      link.title = signedIn ? 'Open profile' : 'Register';
      if (signedIn) {
        link.classList.add('border', 'border-[#F38B00]', 'rounded-full');
        if (profile.photo) link.innerHTML = '<img src="' + profile.photo + '" alt="Profile photo" class="h-5 w-5 rounded-full object-cover">';
        else link.innerHTML = link.dataset.defaultProfileMarkup;
      } else {
        link.classList.remove('border', 'border-[#F38B00]');
        link.innerHTML = link.dataset.defaultProfileMarkup;
      }
    });
  }

  function logout() {
    setRegistered(false);
    window.location.href = 'index.html';
  }

  function showRegisterModal(returnUrl, pendingAction) {
    var existing = document.getElementById('spacefitRegisterModal');
    if (existing) existing.remove();

    var currentPath = returnUrl || window.location.pathname.split('/').pop() || 'index.html';
    if (!returnUrl && window.location.search) currentPath += window.location.search;

    var overlay = document.createElement('div');
    overlay.id = 'spacefitRegisterModal';
    // Flat dark overlay at 50% opacity, no blur
    overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50';

    var modal = document.createElement('div');
    modal.className = 'w-full max-w-[400px] bg-white border border-[#E7E3DC] rounded-2xl p-6 sm:p-7 shadow-xl relative text-left';

    modal.innerHTML = [
      '<button type="button" id="closeRegisterModalBtn" class="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-2xl leading-none p-1 focus:outline-none" aria-label="Close">×</button>',
      '<h2 class="text-xl sm:text-[22px] font-bold text-stone-900 leading-tight">Register to continue</h2>',
      '<p class="mt-2 text-sm text-stone-600 leading-relaxed">You have not registered yet. Create an account or sign in to save items, shop, sell and use the AI assistant.</p>',
      '<div class="mt-6 space-y-2.5">',
      '  <a href="' + AUTH_PAGE + '?mode=register&returnUrl=' + encodeURIComponent(currentPath) + (pendingAction ? '&pendingAction=' + encodeURIComponent(pendingAction) : '') + '" class="w-full py-3 px-4 rounded-lg bg-[#543A23] hover:bg-[#3d2919] text-white text-sm font-semibold text-center block transition-colors shadow-sm">Register</a>',
      '  <a href="' + AUTH_PAGE + '?mode=login&returnUrl=' + encodeURIComponent(currentPath) + (pendingAction ? '&pendingAction=' + encodeURIComponent(pendingAction) : '') + '" class="w-full py-2.5 px-4 rounded-lg border border-[#E7E3DC] hover:bg-stone-50 text-stone-800 text-sm font-semibold text-center block transition-colors">Sign in</a>',
      '</div>'
    ].join('');

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var closeBtn = modal.querySelector('#closeRegisterModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        overlay.remove();
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  function requireAuth(callback, returnUrl) {
    if (isUserRegistered()) {
      if (typeof callback === 'function') callback();
      return true;
    } else {
      showRegisterModal(returnUrl);
      return false;
    }
  }

  window.SpaceFitAuth = {
    isRegistered: isUserRegistered,
    setRegistered: setRegistered,
    showRegisterModal: showRegisterModal,
    requireAuth: requireAuth,
    logout: logout,
    getProfile: getUserProfile,
    saveProfile: saveUserProfile
  };
  window.logout = logout;

  // Master product catalogue for universal search, recommendations & cart metadata
  var PRODUCTS_CATALOGUE = window.SPACEFIT_PRODUCTS || [];

  window.SPACEFIT_PRODUCTS = PRODUCTS_CATALOGUE;

  /* ==========================================================================
     1. GLOBAL CART MANAGEMENT & SYNCHRONIZATION
     ========================================================================== */

  function getCartItems() {
    try {
      var cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  function saveCartItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: items } }));
    syncCartBadges();
  }

  function getCartCount() {
    return getCartItems().reduce(function (sum, item) {
      return sum + (Number(item.quantity) || 1);
    }, 0);
  }

  function formatBadgeCount(count) {
    if (count > 9) return '9+';
    return String(count);
  }

  function syncCartBadges() {
    var total = getCartCount();
    var badges = document.querySelectorAll('.cart-badge');
    badges.forEach(function (badge) {
      badge.textContent = formatBadgeCount(total);
      // Ensure identical 18px circle, 11px bold, 4px/4px offset
      badge.className = 'cart-badge absolute -top-1 -right-1 w-[18px] h-[18px] min-w-[18px] bg-[#F38B00] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs leading-none';
      if (total > 0) {
        badge.classList.remove('hidden');
        badge.style.display = 'flex';
      } else {
        badge.classList.add('hidden');
        badge.style.display = 'none';
      }
    });

    var cartPageTitle = document.getElementById('cartTitleCount');
    if (cartPageTitle) {
      cartPageTitle.textContent = total > 0 ? ' (' + total + ')' : '';
    }
  }

  function parseNumericPrice(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    var cleaned = String(value).replace(/[^0-9.]/g, '');
    return Number(cleaned) || 0;
  }

  function findProductDetails(identifier) {
    if (!identifier) return null;
    var normalized = String(identifier).toLowerCase().trim();
    for (var i = 0; i < PRODUCTS_CATALOGUE.length; i++) {
      var p = PRODUCTS_CATALOGUE[i];
      if (p.id === normalized || p.title.toLowerCase() === normalized || p.fullTitle.toLowerCase() === normalized) {
        return p;
      }
    }
    for (var j = 0; j < PRODUCTS_CATALOGUE.length; j++) {
      var prod = PRODUCTS_CATALOGUE[j];
      if (normalized.indexOf(prod.title.toLowerCase()) !== -1 || prod.title.toLowerCase().indexOf(normalized) !== -1) {
        return prod;
      }
    }
    return null;
  }

  function addToCart(itemOrTitle, qty) {
    if (!isUserRegistered()) { showRegisterModal(null, 'cart:' + (typeof itemOrTitle === 'string' ? itemOrTitle : (itemOrTitle && (itemOrTitle.id || itemOrTitle.title)) || '')); return null; }
    var quantityToAdd = Number(qty) || 1;
    var cart = getCartItems();
    var itemObj = {};

    if (typeof itemOrTitle === 'string') {
      var found = findProductDetails(itemOrTitle);
      if (found) {
        itemObj = {
          id: found.id,
          name: found.title,
          title: found.title,
          price: found.price,
          image: found.image,
          category: found.category,
          condition: found.condition,
          location: found.location,
          quantity: quantityToAdd
        };
      } else {
        itemObj = {
          id: itemOrTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: itemOrTitle,
          title: itemOrTitle,
          price: 150000,
          quantity: quantityToAdd
        };
      }
    } else if (typeof itemOrTitle === 'object' && itemOrTitle !== null) {
      itemObj = {
        id: itemOrTitle.id || (itemOrTitle.title || itemOrTitle.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: itemOrTitle.name || itemOrTitle.title || 'Furniture Piece',
        title: itemOrTitle.title || itemOrTitle.name || 'Furniture Piece',
        price: parseNumericPrice(itemOrTitle.price),
        image: itemOrTitle.image || itemOrTitle.img || '',
        category: itemOrTitle.category || 'Furniture',
        condition: itemOrTitle.condition || 'Good',
        location: itemOrTitle.location || 'Lagos',
        quantity: Number(itemOrTitle.quantity) || quantityToAdd
      };
    }

    var existingIndex = cart.findIndex(function (i) {
      return (i.id && i.id === itemObj.id) || (i.name && i.name.toLowerCase() === itemObj.name.toLowerCase()) || (i.title && i.title.toLowerCase() === itemObj.title.toLowerCase());
    });

    if (existingIndex !== -1) {
      cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + quantityToAdd;
      if (itemObj.image && !cart[existingIndex].image) cart[existingIndex].image = itemObj.image;
      if (itemObj.price && !cart[existingIndex].price) cart[existingIndex].price = itemObj.price;
    } else {
      cart.push(itemObj);
    }

    saveCartItems(cart);
    showCartToast(itemObj.title || itemObj.name || 'Item');
    return itemObj;
  }

  /* ==========================================================================
     2. "ADDED TO CART" FLAT TOAST POP-UP
     ========================================================================== */

  function showCartToast(itemTitle) {
    var existingToast = document.getElementById('spacefitCartToast');
    if (existingToast) {
      existingToast.remove();
    }

    var toast = document.createElement('div');
    toast.id = 'spacefitCartToast';
    toast.className = 'fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9999] rounded-lg border border-[#E7E3DC] bg-white px-4 py-3 shadow-md min-w-[300px] max-w-[92vw] flex items-center justify-between gap-3 text-stone-900 transition-all';
    toast.style.bottom = window.innerWidth < 768 ? '88px' : '24px';

    var displayTitle = 'Added to cart';
    var subtext = itemTitle ? '<span class="text-xs text-stone-500 block truncate max-w-[180px] sm:max-w-[240px]">' + itemTitle + '</span>' : '';

    toast.innerHTML = [
      '<div class="flex items-center gap-2.5 min-w-0">',
      '  <svg class="w-4 h-4 text-[#543A23] shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
      '  <div class="min-w-0">',
      '    <span class="text-xs sm:text-sm font-semibold text-stone-900 block">' + displayTitle + '</span>',
      '    ' + subtext,
      '  </div>',
      '</div>',
      '<div class="flex items-center gap-3 shrink-0">',
      '  <a href="' + CART_PAGE + '" class="text-[#543A23] hover:text-[#F38B00] underline text-xs font-bold transition-colors">View cart</a>',
      '  <button type="button" aria-label="Close" class="text-stone-400 hover:text-stone-700 text-lg leading-none p-1 focus:outline-none" id="closeCartToastBtn">×</button>',
      '</div>'
    ].join('');

    document.body.appendChild(toast);

    var closeBtn = toast.querySelector('#closeCartToastBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        toast.remove();
      });
    }

    clearTimeout(window.spacefitCartToastTimer);
    window.spacefitCartToastTimer = setTimeout(function () {
      if (document.getElementById('spacefitCartToast')) {
        document.getElementById('spacefitCartToast').remove();
      }
    }, 3000);
  }

  window.addToCart = addToCart;
  window.triggerAddToCart = function (title) { addToCart(title, 1); };
  window.showCartToast = showCartToast;
  window.getCartCount = getCartCount;
  window.getCartItems = getCartItems;

  /* ==========================================================================
     3. FAVORITES STORAGE & SYNCHRONIZATION
     ========================================================================== */

  function getSavedItemIds() {
    try {
      var raw = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      var canonical = new Map();
      PRODUCTS_CATALOGUE.forEach(function (product) {
        canonical.set(normalizeItemId(product.id), product.id);
        canonical.set(normalizeItemId(product.title), product.id);
        canonical.set(normalizeItemId(product.fullTitle), product.id);
      });
      var valid = Array.from(new Set(raw.filter(Boolean).map(function (id) {
        return canonical.get(normalizeItemId(id));
      }).filter(Boolean)));
      if (JSON.stringify(valid) !== JSON.stringify(raw)) localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(valid));
      return valid;
    } catch (error) {
      return [];
    }
  }

  function setSavedItemIds(ids) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    updateFavoritesBadge();
    syncFavoriteButtons();
    window.dispatchEvent(new CustomEvent('favorites:updated', { detail: { ids: ids } }));
  }

  function normalizeItemId(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function canonicalProductId(value) {
    var normalized = normalizeItemId(value);
    var product = PRODUCTS_CATALOGUE.find(function (item) {
      return normalizeItemId(item.id) === normalized || normalizeItemId(item.title) === normalized || normalizeItemId(item.fullTitle) === normalized;
    });
    return product ? product.id : normalized;
  }

  function getItemId(button) {
    if (!button) return '';
    var directId = button.getAttribute('data-item-id') || button.dataset.itemId || button.getAttribute('data-product-id');
    if (directId) return canonicalProductId(directId);

    var productCard = button.closest('article, .product-card, [data-purpose="product-card"]');
    if (productCard) {
      var cardId = productCard.getAttribute('data-item-id') || productCard.dataset.itemId || productCard.getAttribute('data-product-id');
      if (cardId) return canonicalProductId(cardId);
      var productLink = productCard.querySelector('a[href*="product-details"]');
      if (productLink) { var productId = new URL(productLink.href, window.location.href).searchParams.get('id'); if (productId) return canonicalProductId(productId); }
      var titleEl = productCard.querySelector('h3, h2, .product-title, a[href*="product-details"]') || productCard.querySelector('a');
      var titleText = titleEl ? (titleEl.textContent || '').trim() : '';
      if (titleText) return normalizeItemId(titleText);
    }

    if ((window.location.pathname.split('/').pop() || '') === 'product-details.html') {
      var pageProductId = new URLSearchParams(window.location.search).get('id');
      if (pageProductId) return canonicalProductId(pageProductId);
    }
    var text = (button.closest('article') || button.parentElement || button).textContent || '';
    var fallback = text.replace(/\s+/g, ' ').trim();
    return fallback ? canonicalProductId(fallback) : '';
  }

  function updateFavoritesBadge() {
    var count = getSavedItemIds().length;
    document.querySelectorAll('[data-favorites-count], #favoritesHeaderBadge, #shopWishlistBadge').forEach(function (badge) {
      badge.textContent = String(count);
      badge.className = 'absolute -top-1 -right-1 w-[18px] h-[18px] min-w-[18px] rounded-full bg-[#F38B00] text-white text-[11px] font-bold flex items-center justify-center shadow-xs leading-none';
      if (count > 0) {
        badge.classList.remove('hidden');
        badge.style.display = 'flex';
      } else {
        badge.classList.add('hidden');
        badge.style.display = 'none';
      }
    });
  }

  function syncFavoriteButtons() {
    var saved = new Set(getSavedItemIds());
    document.querySelectorAll('[data-favorite-toggle], .favorite-toggle, button[aria-label="Add to wishlist"], button[aria-label="Remove from favorites"], button[aria-label="Save to favorites"], button[onclick*="toggleFavorite"]').forEach(function (button) {
      if (!button) return;
      button.setAttribute('data-favorite-toggle', 'true');
      var itemId = getItemId(button);
      if (itemId) button.setAttribute('data-item-id', itemId);

      var isActive = !!itemId && saved.has(itemId);
      
      // Update SVG heart if present
      var svg = button.querySelector('svg');
      if (svg) {
        if (isActive) {
          svg.setAttribute('fill', '#543A23');
          svg.setAttribute('stroke', '#543A23');
          button.classList.add('text-[#543A23]');
          button.classList.remove('text-stone-400', 'text-stone-600', 'text-stone-700');
        } else {
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          button.classList.remove('text-[#543A23]');
        }
      }

      // Update Material Symbols if present
      var materialIcon = button.querySelector('.material-symbols-outlined, span.material-symbols-outlined');
      if (materialIcon) {
        materialIcon.style.fontVariationSettings = isActive ? "'FILL' 1" : "'FILL' 0";
        if (isActive) {
          materialIcon.classList.add('text-[#543A23]');
        } else {
          materialIcon.classList.remove('text-[#543A23]');
        }
      }

      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('aria-label', isActive ? 'Remove from favorites' : 'Add to wishlist');
    });
  }

  function showFavoriteToast(message, options) {
    options = options || {};
    var existing = document.getElementById('spacefitFavoritesToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'spacefitFavoritesToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] rounded-lg border border-[#E7E3DC] bg-white px-4 py-3 shadow-md min-w-[280px] max-w-[90vw] flex items-center justify-between gap-3 text-stone-900';
    var action = options.showUndo && options.undoItemId
      ? '<button type="button" id="undoFavBtn" class="text-[#543A23] font-bold text-xs underline">Undo</button>'
      : '<a href="' + FAVORITES_PAGE + '" class="text-[#543A23] underline text-xs font-bold">View favorites</a>';
    toast.innerHTML = '<span class="text-sm font-semibold">' + message + '</span><span class="flex items-center gap-3">' + action + '<button type="button" aria-label="Close" id="closeFavToastBtn">×</button></span>';
    document.body.appendChild(toast);
    var undo = toast.querySelector('#undoFavBtn');
    if (undo) undo.addEventListener('click', function () {
      toggleSavedItem(options.undoItemId, { notify: false });
      showFavoriteToast('Added to favorites');
      toast.remove();
    });
    toast.querySelector('#closeFavToastBtn').addEventListener('click', function () { toast.remove(); });
    clearTimeout(window.spacefitFavoritesToastTimer);
    window.spacefitFavoritesToastTimer = setTimeout(function () { if (toast.isConnected) toast.remove(); }, 3000);
  }

  function toggleSavedItem(itemId, options) {
    options = options || {};
    var normalizedId = normalizeItemId(itemId);
    if (!normalizedId) return;
    if (!isUserRegistered()) {
      showRegisterModal(null, 'favorite:' + normalizedId);
      return false;
    }
    var ids = getSavedItemIds();
    var isNowSaved = false;
    var index = ids.indexOf(normalizedId);
    if (index === -1) { ids.push(normalizedId); isNowSaved = true; }
    else ids.splice(index, 1);
    setSavedItemIds(ids);
    if (options.notify !== false) {
      if (isNowSaved) showFavoriteToast('Added to favorites');
      else showFavoriteToast('Removed from favorites', { showUndo: true, undoItemId: normalizedId });
    }
    return isNowSaved;
  }

  window.toggleFavorite = function (button) {
    if (!button) return;
    var itemId = getItemId(button);
    if (itemId) toggleSavedItem(itemId);
  };
  window.SpaceFitFavorites = { toggle: toggleSavedItem };
  /* ==========================================================================
     4. HOME PAGE SMART SEARCH BAR WITH DROPDOWN SUGGESTIONS & CLEAR BUTTON
     ========================================================================== */

  function renderHomeCategories() {
    var grid = document.getElementById('homeCategoryGrid');
    if (!grid) return;
    var availableCategories = window.SPACEFIT_CATEGORIES || [];
    var categories = HOME_CATEGORY_IDS.map(function (id) {
      return availableCategories.find(function (category) { return category.id === id; });
    }).filter(Boolean);
    grid.innerHTML = categories.map(function (category) {
      var href = 'shop.html?category=' + encodeURIComponent(category.id);
      var image = category.image
        ? '<img loading="lazy" alt="' + category.name + '" class="w-full h-full object-cover" src="' + category.image + '">'
        : '<span class="text-xs text-stone-500">No items in this category yet</span>';
      return '<a class="flex flex-col items-center rounded-xl border border-[#E7E3DC] bg-white p-3 text-center" href="' + href + '">' +
        '<div class="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">' + image + '</div>' +
        '<span class="text-sm font-semibold text-stone-800">' + category.name + '</span>' +
        '<span class="mt-0.5 text-[11px] text-stone-500">' + (category.count || 0) + ' items</span></a>';
    }).join('');
  }

  function renderGeneratedShopProducts() {
    var grid = document.getElementById('stateGrid');
    if (!grid) return;
    var generated = PRODUCTS_CATALOGUE.filter(function (product) { return product.placeholder; });
    generated.forEach(function (product) {
      var article = document.createElement('article');
      article.className = 'product-card group flex flex-col overflow-hidden rounded-xl border border-[#E7E3DC] bg-white';
      article.dataset.itemId = product.id;
      article.dataset.productId = product.id;
      article.innerHTML = '<div class="relative aspect-[4/3] overflow-hidden bg-stone-100">' +
        '<a href="product-details.html?id=' + encodeURIComponent(product.id) + '"><img loading="lazy" alt="' + product.title + '" src="' + product.image + '" class="h-full w-full object-cover"></a>' +
        '<button type="button" data-favorite-toggle data-item-id="' + product.id + '" aria-label="Add to wishlist" aria-pressed="false" class="favorite-toggle absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E3DC] bg-white text-stone-700"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg></button>' +
        '</div><div class="flex flex-1 flex-col gap-2 p-3"><div class="text-[11px] text-stone-500">' + product.category + ' · TODO</div>' +
        '<a class="line-clamp-2 text-sm font-semibold text-stone-900" href="product-details.html?id=' + encodeURIComponent(product.id) + '">' + product.title + '</a>' +
        '<div class="mt-auto flex items-center justify-between gap-2"><span class="text-xs font-bold">' + product.priceFormatted + '</span><button type="button" aria-label="Add to cart" title="Add to cart" class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#543A23] text-white" onclick="triggerAddToCart(\'' + product.id + '\')"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg></button></div></div>';
      grid.appendChild(article);
    });
  }

  function initShopFilters() {
    var grid = document.getElementById('stateGrid');
    var filterList = document.getElementById('categoryFilterList');
    if (!grid || !filterList) return;
    var categories = window.SPACEFIT_CATEGORIES || [];
    filterList.innerHTML = categories.map(function (category) {
      return '<label class="flex cursor-pointer items-center justify-between gap-2 text-sm text-stone-700"><span class="flex items-center gap-2"><input type="checkbox" data-category-filter="' + category.id + '" class="h-4 w-4 rounded accent-[#543A23]"><span>' + category.name + '</span></span><span class="text-xs text-stone-500">' + category.count + '</span></label>';
    }).join('');

    var search = document.getElementById('catalogueSearch');
    var applyLabel = document.getElementById('applyFiltersLabel');
    var emptyState = document.getElementById('stateEmpty');
    var resetButton = document.getElementById('resetFiltersButton');
    var emptyReset = emptyState && emptyState.querySelector('button');
    var sidebar = filterList.closest('aside');
    var minPriceInput = document.getElementById('minPriceFilter');
    var maxPriceInput = document.getElementById('maxPriceFilter');
    var priceMinLabel = document.getElementById('priceAbsoluteMin');
    var priceMaxLabel = document.getElementById('priceAbsoluteMax');
    var prices = PRODUCTS_CATALOGUE.map(function (product) { return Number(product.price); }).filter(function (price) { return Number.isFinite(price) && price > 0; });
    var fullMinPrice = prices.length ? Math.min.apply(Math, prices) : 0;
    var fullMaxPrice = prices.length ? Math.max.apply(Math, prices) : 0;
    function formatFilterPrice(value) { return '₦' + Number(value).toLocaleString('en-NG'); }
    if (minPriceInput && maxPriceInput) {
      [minPriceInput, maxPriceInput].forEach(function (input) { input.min = String(fullMinPrice); input.max = String(fullMaxPrice); });
      minPriceInput.value = String(fullMinPrice);
      maxPriceInput.value = String(fullMaxPrice);
    }
    if (priceMinLabel) priceMinLabel.textContent = formatFilterPrice(fullMinPrice);
    if (priceMaxLabel) priceMaxLabel.textContent = formatFilterPrice(fullMaxPrice);

    function cardProduct(card) {
      var id = card.dataset.itemId || card.dataset.productId || '';
      var link = card.querySelector('a[href*="product-details"]');
      if (!id && link) id = new URL(link.href, window.location.href).searchParams.get('id') || '';
      var normalizedId = normalizeItemId(id);
      return PRODUCTS_CATALOGUE.find(function (product) {
        return normalizeItemId(product.id) === normalizedId || normalizeItemId(product.title) === normalizedId || normalizeItemId(product.fullTitle) === normalizedId;
      });
    }
    function checkedValues(name) {
      return sidebar ? Array.from(sidebar.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) { return input.value; }) : [];
    }
    function currentPriceRange() {
      var preset = sidebar && sidebar.querySelector('input[name="price_bracket"]:checked');
      var min = minPriceInput && minPriceInput.value !== '' ? Number(minPriceInput.value) : fullMinPrice;
      var max = maxPriceInput && maxPriceInput.value !== '' ? Number(maxPriceInput.value) : fullMaxPrice;
      if (preset) {
        if (preset.value === 'under-100000') { min = fullMinPrice; max = Math.min(fullMaxPrice, 99999); }
        else if (preset.value === '100000-250000') { min = Math.max(fullMinPrice, 100000); max = Math.min(fullMaxPrice, 250000); }
        else if (preset.value === '250000-500000') { min = Math.max(fullMinPrice, 250000); max = Math.min(fullMaxPrice, 500000); }
        else if (preset.value === 'above-500000') { min = Math.max(fullMinPrice, 500001); max = fullMaxPrice; }
      }
      return { min: min, max: max, active: !!preset || min !== fullMinPrice || max !== fullMaxPrice };
    }
    function updatePriceInputsFromPreset(preset) {
      if (!preset || !minPriceInput || !maxPriceInput) return;
      var range = currentPriceRange();
      minPriceInput.value = String(range.min);
      maxPriceInput.value = String(range.max);
    }
    function loadFiltersFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var initialCategories = (params.get('category') || '').split(',').filter(Boolean).map(normalizeItemId);
      filterList.querySelectorAll('[data-category-filter]').forEach(function (input) { input.checked = initialCategories.includes(input.dataset.categoryFilter); });
      var initialFilters = (params.get('filters') || '').split(',').map(normalizeItemId);
      if (sidebar) sidebar.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (input) {
        if (input.hasAttribute('data-category-filter')) return;
        input.checked = initialFilters.includes(normalizeItemId(input.value)) || initialFilters.includes(normalizeItemId(input.value.replace(/-/g, ' ')));
      });
      var rangeMin = params.get('minPrice');
      var rangeMax = params.get('maxPrice');
      if (rangeMin !== null && minPriceInput) minPriceInput.value = rangeMin;
      if (rangeMax !== null && maxPriceInput) maxPriceInput.value = rangeMax;
      var preset = sidebar && sidebar.querySelector('input[name="price_bracket"]:checked');
      if (preset) updatePriceInputsFromPreset(preset);
      if (search && params.get('search')) search.value = params.get('search');
    }
    loadFiltersFromUrl();

    function apply(updateUrl) {
      var selected = Array.from(filterList.querySelectorAll('[data-category-filter]:checked')).map(function (input) { return input.dataset.categoryFilter; });
      var spaceFits = checkedValues('spaceFitProportion');
      var availability = checkedValues('availability');
      var priceRange = currentPriceRange();
      var q = search ? search.value.trim().toLowerCase() : '';
      var hasNonCategoryFilters = priceRange.active || spaceFits.length > 0 || availability.length > 0;
      var cards = Array.from(grid.querySelectorAll('.product-card'));
      var count = 0;
      cards.forEach(function (card) {
        var product = cardProduct(card);
        var categoryMatch = !selected.length || (product && selected.includes(normalizeItemId(product.category)));
        var searchable = product ? [product.title, product.fullTitle, product.category, product.condition, product.location, product.description, product.specs].filter(Boolean).join(' ').toLowerCase() : (card.textContent || '').toLowerCase();
        var searchMatch = !q || searchable.includes(q) || (card.textContent || '').toLowerCase().includes(q);
        var price = Number(product && product.price);
        var priceMatch = !priceRange.active || (Number.isFinite(price) && price >= priceRange.min && price <= priceRange.max);
        var spaceMatch = !spaceFits.length || (product && spaceFits.includes(product.spaceFitProportion));
        var available = String(product && product.availability || '').toLowerCase();
        var availabilityMatch = !availability.length || availability.some(function (value) {
          if (value === 'in-stock') return /in stock|low stock/.test(available);
          if (value === 'pre-order') return /pre-order/.test(available);
          if (value === 'ready-to-assemble') return /ready.to.assemble/.test(available);
          return available === value;
        });
        var visible = categoryMatch && searchMatch && priceMatch && spaceMatch && availabilityMatch;
        card.classList.toggle('hidden', !visible);
        if (visible) count += 1;
      });
      var priceRadio = sidebar && sidebar.querySelector('input[name="price_bracket"]:checked');
      var pickedFilterCount = selected.length + (priceRange.active ? 1 : 0) + spaceFits.length + availability.length;
      if (applyLabel) applyLabel.textContent = 'Apply Filters' + (pickedFilterCount ? ' (' + pickedFilterCount + ')' : '');
      var summaryText = document.getElementById('resultsSummaryText');
      if (summaryText) summaryText.textContent = 'Showing ' + count + ' of ' + cards.length + ' items';
      var categoryOnly = selected.length === 1 && !q && !hasNonCategoryFilters ? categories.find(function (category) { return category.id === selected[0]; }) : null;
      if (emptyState) {
        var heading = emptyState.querySelector('h3');
        var message = emptyState.querySelector('p');
        if (heading) heading.textContent = categoryOnly && categoryOnly.count === 0 ? 'No items in this category yet' : (q && !selected.length && !hasNonCategoryFilters ? 'No items found' : 'No items match these filters');
        if (message) message.textContent = categoryOnly && categoryOnly.count === 0 ? 'New products will appear here when they are added.' : 'Try another search or reset your filters to see all products.';
        emptyState.classList.toggle('hidden', count > 0);
        emptyState.classList.toggle('flex', count === 0);
      }
      grid.classList.toggle('hidden', count === 0);
      if (updateUrl) {
        var next = new URL(window.location.href);
        if (selected.length) next.searchParams.set('category', selected.join(',')); else next.searchParams.delete('category');
        if (q) next.searchParams.set('search', q); else next.searchParams.delete('search');
        var activeValues = sidebar ? Array.from(sidebar.querySelectorAll('input[type="checkbox"]:checked:not([data-category-filter]), input[name="price_bracket"]:checked')).map(function (input) { return input.value; }) : [];
        if (activeValues.length) next.searchParams.set('filters', activeValues.join(',')); else next.searchParams.delete('filters');
        if (priceRange.active && !priceRadio) { next.searchParams.set('minPrice', String(priceRange.min)); next.searchParams.set('maxPrice', String(priceRange.max)); }
        else { next.searchParams.delete('minPrice'); next.searchParams.delete('maxPrice'); }
        history.replaceState({}, '', next);
      }
      syncFavoriteButtons();
    }
    filterList.addEventListener('change', function () { apply(true); });
    if (sidebar) {
      sidebar.addEventListener('change', function (event) {
        if (event.target.name === 'price_bracket') updatePriceInputsFromPreset(event.target);
        if (event.target.type === 'checkbox' || event.target.type === 'radio') apply(true);
      });
      [minPriceInput, maxPriceInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener('input', function () {
          sidebar.querySelectorAll('input[name="price_bracket"]').forEach(function (radio) { radio.checked = false; });
          apply(true);
        });
      });
    }
    if (search) search.addEventListener('input', function () { apply(true); });
    ['shopNavSearch', 'mobileShopNavSearch'].forEach(function (id) {
      var navSearch = document.getElementById(id);
      if (!navSearch) return;
      navSearch.addEventListener('input', function () {
        if (search) search.value = navSearch.value;
        apply(true);
      });
      navSearch.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (search) search.value = navSearch.value;
          apply(true);
        }
      });
    });
    if (search) search.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); apply(true); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }
    });
    var clear = document.getElementById('clearSearchBtn');
    if (clear) clear.addEventListener('click', function () { if (search) search.value = ''; apply(true); });
    function reset() {
      filterList.querySelectorAll('input').forEach(function (input) { input.checked = false; });
      var aside = filterList.closest('aside');
      if (aside) aside.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (input) { input.checked = false; });
      if (minPriceInput) minPriceInput.value = String(fullMinPrice);
      if (maxPriceInput) maxPriceInput.value = String(fullMaxPrice);
      if (search) search.value = '';
      apply(true);
    }
    if (resetButton) resetButton.addEventListener('click', reset);
    var clearAll = document.getElementById('clearAllFiltersBtn');
    if (clearAll) clearAll.addEventListener('click', reset);
    if (emptyReset) { emptyReset.id = 'emptyResetFiltersButton'; emptyReset.addEventListener('click', reset); }
    var applyButton = document.getElementById('applyFiltersButton');
    if (applyButton) applyButton.addEventListener('click', function () { apply(true); if (window.innerWidth < 1024) filterList.closest('aside').classList.add('hidden'); });
    window.addEventListener('popstate', function () {
      loadFiltersFromUrl();
      apply(false);
    });
    apply(false);
  }

  function initHomeSearchBar() {
    var searchInput = document.getElementById('mainHeroSearch');
    var searchBtn = document.getElementById('searchExecuteBtn');
    if (!searchInput) return;

    var container = searchInput.closest('.relative') || searchInput.parentElement;
    if (container) {
      container.style.position = 'relative';
    }

    // Create Clear (x) Button if not exists
    var clearBtn = document.getElementById('heroSearchClearBtn');
    if (!clearBtn && container) {
      clearBtn = document.createElement('button');
      clearBtn.id = 'heroSearchClearBtn';
      clearBtn.type = 'button';
      clearBtn.setAttribute('aria-label', 'Clear search');
      clearBtn.className = 'hidden text-stone-400 hover:text-stone-700 px-2 py-1 text-sm font-semibold transition-colors focus:outline-none';
      clearBtn.innerHTML = '✕';
      searchInput.insertAdjacentElement('afterend', clearBtn);
    }

    // Create Suggestions Dropdown Container
    var dropdown = document.getElementById('heroSearchDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'heroSearchDropdown';
      dropdown.className = 'hidden absolute left-0 right-0 top-full mt-2 bg-white border border-[#E7E3DC] rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-[#F5F2EB]';
      dropdown.style.maxHeight = '380px';
      dropdown.style.overflowY = 'auto';
      var searchBoxWrapper = searchInput.closest('.bg-white') || container;
      searchBoxWrapper.style.position = 'relative';
      searchBoxWrapper.appendChild(dropdown);
    }

    function filterProducts(query) { return window.SpaceFitSearch.search(query).slice(0, 6); }

    function renderDropdown(matches, query) {
      if (!query.trim()) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
      }

      if (clearBtn) clearBtn.classList.remove('hidden');

      if (matches.length === 0) {
        dropdown.innerHTML = '<div class="p-4 text-center text-xs sm:text-sm text-stone-500 font-medium">No items found</div>';
        dropdown.classList.remove('hidden');
        return;
      }

      var html = '<div class="p-2">';
      matches.forEach(function (prod) {
        html += [
          '<a href="product-details.html?id=' + prod.id + '" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F2EB] transition-colors group">',
          '  <div class="w-11 h-11 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">',
          '    <img src="' + prod.image + '" alt="' + prod.title + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src=\'' + prod.fallbackImage + '\'">',
          '  </div>',
          '  <div class="flex-1 min-w-0">',
          '    <div class="flex items-center justify-between gap-2">',
          '      <h4 class="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-[#543A23] transition-colors">' + prod.title + '</h4>',
          '      <span class="text-xs font-bold text-stone-900 shrink-0">' + prod.priceFormatted + '</span>',
          '    </div>',
          '    <p class="text-[11px] text-stone-500 truncate">' + prod.category + ' • ' + prod.location + ' • ' + prod.condition + '</p>',
          '  </div>',
          '</a>'
        ].join('');
      });
      html += '</div>';
      html += '<div class="bg-[#FBF9F5] px-4 py-2 text-right border-t border-[#E7E3DC]">';
      html += '  <a href="' + SHOP_PAGE + '?search=' + encodeURIComponent(query) + '" class="text-xs font-semibold text-[#543A23] hover:text-[#F38B00] transition-colors">See all results in shop →</a>';
      html += '</div>';

      dropdown.innerHTML = html;
      dropdown.classList.remove('hidden');
    }

    searchInput.addEventListener('input', function () {
      var val = searchInput.value;
      if (!val.trim()) {
        dropdown.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
      }
      var matches = filterProducts(val);
      renderDropdown(matches, val);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        dropdown.classList.add('hidden');
        clearBtn.classList.add('hidden');
        searchInput.focus();
      });
    }

    function executeSearch() {
      var query = searchInput.value.trim();
      if (!isUserRegistered()) { showRegisterModal(null, 'shop-search:' + query); return; }
      if (query) {
        window.location.href = SHOP_PAGE + '?search=' + encodeURIComponent(query);
      } else {
        window.location.href = SHOP_PAGE;
      }
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', function (e) {
        e.preventDefault();
        executeSearch();
      });
    }

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== searchInput && e.target !== clearBtn) {
        dropdown.classList.add('hidden');
      }
    });
  }

  /* ==========================================================================
     5. PAGE LOAD INITIALIZATION & EVENT LISTENERS
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', function () {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    var params = new URLSearchParams(window.location.search);
    if (page === 'auth.html' && isUserRegistered()) { window.location.replace('index.html'); return; }
    if (!isUserRegistered() && !['index.html', 'auth.html', ''].includes(page)) { window.location.replace('index.html?registrationRequired=1&returnUrl=' + encodeURIComponent(page + window.location.search)); return; }
    if (!isUserRegistered() && page === 'index.html' && params.get('registrationRequired') === '1') showRegisterModal(params.get('returnUrl') || null);
    renderHomeCategories();
    renderGeneratedShopProducts();
    initShopFilters();
    syncProfileIcons();
    document.addEventListener('click', function (event) {
      if (isUserRegistered()) return;
      var link = event.target.closest('a[href]');
      if (!link) return;
      var target = new URL(link.href, window.location.href);
      var destination = target.pathname.split('/').pop();
      if (destination === 'index.html' || destination === 'auth.html' || target.origin !== window.location.origin) return;
      event.preventDefault(); event.stopImmediatePropagation(); showRegisterModal(null, 'navigate:' + target.pathname.split('/').pop() + target.search);
    }, true);
    // 1. Sync cart & favorites badges across all pages
    syncCartBadges();
    updateFavoritesBadge();
    syncFavoriteButtons();

    // 2. Initialize search
    initHomeSearchBar();

    // 3. Mobile menu drawer
    var mobileBtn = document.getElementById('mobileMenuBtn');
    var drawer = document.getElementById('mobileDrawer');
    if (mobileBtn && drawer) {
      mobileBtn.addEventListener('click', function () {
        drawer.classList.toggle('hidden');
      });
    }

    // 4. Hero search pills
    var searchInput = document.getElementById('mainHeroSearch');
    var pills = document.querySelectorAll('.suggestion-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var text = pill.innerText.replace('e.g.', '').replace('✦', '').trim();
        if (searchInput) {
          searchInput.value = text;
          searchInput.dispatchEvent(new Event('input'));
          searchInput.focus();
        }
      });
    });

    // 5. Universal binding for add-to-cart buttons across all pages
    document.querySelectorAll('button[aria-label="Add to cart"], button[title="Add to cart"], .add-to-cart-btn').forEach(function (btn) {
      if (btn.dataset.boundCart) return;
      btn.dataset.boundCart = 'true';
      btn.addEventListener('click', function (e) {
        // Find title & price from card
        var card = btn.closest('article, .product-card, [data-purpose="product-card"]');
        if (card) {
          e.preventDefault();
          var titleEl = card.querySelector('h3, h2, .product-title, a[href*="product-details"]');
          var title = titleEl ? titleEl.textContent.trim() : 'Furniture piece';
          var priceEl = card.querySelector('.font-bold, .font-extrabold, .text-price-md, .text-base');
          var price = priceEl ? priceEl.textContent.trim() : '150000';
          var imgEl = card.querySelector('img');
          var img = imgEl ? imgEl.src : '';

          addToCart({
            title: title,
            name: title,
            price: price,
            image: img
          }, 1);
        }
      });
    });

    // 6. Universal binding for favorite buttons
    document.querySelectorAll('[data-favorite-toggle], button[aria-label="Add to wishlist"], button[aria-label="Remove from favorites"], button[aria-label="Save to favorites"]').forEach(function (button) {
      if (button.dataset.boundFav) return;
      button.dataset.boundFav = 'true';
      if (/toggleFavorite(?:FromCart)?\s*\(/.test(button.getAttribute('onclick') || '')) return;
      button.addEventListener('click', function (e) {
        e.preventDefault();
        var itemId = getItemId(button);
        if (itemId) toggleSavedItem(itemId);
      });
    });

    // 7. Hero carousel auto-rotation if present
    var slides = Array.from(document.querySelectorAll('.hero-slide'));
    var dots = Array.from(document.querySelectorAll('.hero-dot'));
    var prevBtn = document.getElementById('heroPrevBtn');
    var nextBtn = document.getElementById('heroNextBtn');

    if (slides.length > 0) {
      var currentSlide = 0;
      var autoplayInterval = null;

      function updateCarousel(nextIndex) {
        currentSlide = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          var isActive = index === currentSlide;
          slide.classList.toggle('opacity-100', isActive);
          slide.classList.toggle('opacity-0', !isActive);
          slide.classList.toggle('z-10', isActive);
          slide.classList.toggle('z-0', !isActive);
          slide.classList.toggle('pointer-events-none', !isActive);
        });

        dots.forEach(function (dot, index) {
          var isActive = index === currentSlide;
          dot.classList.toggle('bg-[#543A23]', isActive);
          dot.classList.toggle('bg-stone-300', !isActive);
          dot.classList.toggle('w-6', isActive);
          dot.classList.toggle('w-2', !isActive);
        });
      }

      function startAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(function () {
          updateCarousel(currentSlide + 1);
        }, 4000);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          updateCarousel(currentSlide - 1);
          startAutoplay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          updateCarousel(currentSlide + 1);
          startAutoplay();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var dotIndex = Number(dot.dataset.dotIndex);
          updateCarousel(dotIndex);
          startAutoplay();
        });
      });

      updateCarousel(0);
      startAutoplay();
    }
  });

  // Window storage event listener for cross-tab sync
  window.addEventListener('storage', function (e) {
    if (e.key === CART_STORAGE_KEY) {
      syncCartBadges();
    }
    if (e.key === FAVORITES_STORAGE_KEY) {
      updateFavoritesBadge();
      syncFavoriteButtons();
    }
    if (e.key === AUTH_PERSIST_KEY || e.key === USER_PROFILE_KEY) syncProfileIcons();
  });

  window.addEventListener('auth:updated', syncProfileIcons);
  window.addEventListener('profile:updated', syncProfileIcons);

  window.addEventListener('cart:updated', syncCartBadges);
  window.addEventListener('favorites:updated', function () { updateFavoritesBadge(); syncFavoriteButtons(); });
  window.SpaceFitSearch = {
    search: function (query) {
      var q = String(query || '').trim().toLowerCase();
      if (!q) return [];
      return PRODUCTS_CATALOGUE.filter(function (product) {
        return [product.title, product.fullTitle, product.category, product.condition, product.location, product.description, product.specs]
          .filter(Boolean).join(' ').toLowerCase().includes(q);
      });
    }
  };
})();
