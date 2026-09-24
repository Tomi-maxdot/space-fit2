// SpaceFit Core Script - Shared Interactivity, Global Cart, Favorites & Smart Search
(function () {
  'use strict';

  var CART_STORAGE_KEY = 'spacefitCart';
  var FAVORITES_STORAGE_KEY = 'spacefitSavedItemIds';
  var AUTH_STORAGE_KEY = 'spacefitIsRegistered';
  var CART_PAGE = 'cart.html';
  var FAVORITES_PAGE = 'favourite.html';
  var SHOP_PAGE = 'shop.html';
  var AUTH_PAGE = 'auth.html';

  /* ==========================================================================
     0. USER AUTHENTICATION STATE & REGISTRATION GUARD
     ========================================================================== */

  function isUserRegistered() {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setRegistered(status) {
    localStorage.setItem(AUTH_STORAGE_KEY, status ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('auth:updated', { detail: { isRegistered: !!status } }));
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
    requireAuth: requireAuth
  };

  // Master product catalogue for universal search, recommendations & cart metadata
  var PRODUCTS_CATALOGUE = [
    {
      id: 'luna-bed',
      title: 'Luna Bed Frame',
      fullTitle: 'Luna Upholstered Queen Bed',
      category: 'Beds',
      price: 450000,
      priceFormatted: '₦450,000',
      condition: 'Handcrafted Oak',
      location: 'Lagos',
      description: 'Natural solid oak with curved headboard and oatmeal bouclé upholstery.',
      specs: 'Solid wood frame, 200 × 160 × 90 cm, Modern, Easy assembly',
      image: 'assets/featured%20product/lunabedframe.jpg',
      fallbackImage: 'assets/featured%20product/lunabedframe.jpg'
    },
    {
      id: 'cloudrest-mattress',
      title: 'Comfort Cloud Mattress',
      fullTitle: 'Comfort Cloud Orthopedic Mattress',
      category: 'Mattresses',
      price: 180000,
      priceFormatted: '₦180,000',
      condition: 'Verified Seller',
      location: 'Abuja',
      description: 'Orthopedic dual-layer high density foam with breathable cooling gel.',
      specs: 'Memory foam & pocket spring, 180 × 200 × 28 cm, Zero motion transfer',
      image: 'assets/featured%20product/cloud%20bedding.jpg',
      fallbackImage: 'assets/featured%20product/cloud%20bedding.jpg'
    },
    {
      id: 'kanso-wardrobe',
      title: 'Aspen Solid Wardrobe',
      fullTitle: 'Aspen Solid Minimalist Wardrobe',
      category: 'Wardrobes',
      price: 320000,
      priceFormatted: '₦320,000',
      condition: '3-Door Minimal',
      location: 'Ibadan',
      description: 'Ash wood finish with integrated hangers and soft-close German hinges.',
      specs: 'Blonde ash wood, 150 × 210 × 60 cm, Modular shelving',
      image: 'assets/featured%20product/solid%20wardrobe.jpg',
      fallbackImage: 'assets/featured%20product/solid%20wardrobe.jpg'
    },
    {
      id: 'nordic-desk',
      title: 'Novo Work Desk',
      fullTitle: 'Novo Ergonomic Oak Work Desk',
      category: 'Desks',
      price: 150000,
      priceFormatted: '₦150,000',
      condition: 'Popular Compact',
      location: 'Lagos',
      description: 'Slender tapered legs with cable routing for clean, mindful workspaces.',
      specs: 'Sustainably sourced white oak, 120 × 60 × 75 cm, Beveled perimeter',
      image: 'assets/featured%20product/novo%20workdesk.jpg',
      fallbackImage: 'assets/featured%20product/novo%20workdesk.jpg'
    },
    {
      id: 'kyoto-bed',
      title: 'Kyoto Solid Ash Bed Frame',
      fullTitle: 'Kyoto Solid Ash Low Platform Bed',
      category: 'Beds',
      price: 520000,
      priceFormatted: '₦520,000',
      condition: 'Brand new',
      location: 'Lagos',
      description: 'Low-profile Japanese solid ash bed frame with mortise and tenon joinery.',
      specs: 'Solid Japanese Ash, 215 × 195 × 85 cm, Japandi Minimalist',
      image: 'assets/carousell/Serene%20living%20room%20with%20sectional%20sofa%20and%20abstract%20art%20coffee%20table%20floor%20lamp.jpg',
      fallbackImage: 'assets/carousell/Serene%20living%20room%20with%20sectional%20sofa%20and%20abstract%20art%20coffee%20table%20floor%20lamp.jpg'
    },
    {
      id: 'arlo-nightstand',
      title: 'Arlo Floating Walnut Nightstand',
      fullTitle: 'Arlo Floating Walnut Bedside Drawer',
      category: 'Nightstands',
      price: 65000,
      priceFormatted: '₦65,000',
      condition: 'Like new',
      location: 'Lagos',
      description: 'Cantilevered floating American walnut nightstand with cable dock channel.',
      specs: 'American walnut & brass cleat, 45 × 32 × 25 cm, Wall mounted',
      image: 'assets/shop%20by%20category/nightstand.jpg',
      fallbackImage: 'assets/shop%20by%20category/nightstand.jpg'
    },
    {
      id: 'sahara-rug',
      title: 'Sahara Handwoven Wool Rug',
      fullTitle: 'Sahara Handwoven Berber Wool Rug',
      category: 'Rugs',
      price: 140000,
      priceFormatted: '₦140,000',
      condition: 'Brand new',
      location: 'Abuja',
      description: 'Handwoven 100% natural mountain wool area rug with subtle Berber motifs.',
      specs: '100% Unbleached Mountain Wool, 240 × 300 cm, Non-shedding pile',
      image: 'assets/shop%20by%20category/rugs.jpg',
      fallbackImage: 'assets/shop%20by%20category/rugs.jpg'
    },
    {
      id: 'vesper-lamp',
      title: 'Vesper Brass Floor Lamp',
      fullTitle: 'Vesper Brass Floor Standing Lamp',
      category: 'Lighting',
      price: 82000,
      priceFormatted: '₦82,000',
      condition: 'Brand new',
      location: 'Lagos',
      description: 'Architectural floor lamp crafted from brushed solid brass with travertine base.',
      specs: 'Brushed brass & travertine stone, 145 × 28 × 28 cm, 2700K warm LED',
      image: 'assets/carousell/Scandinavian-style%20home%20office%20with%20a%20minimalist%20desk,%20ergonomic%20chair,%20and%20built-in%20shelves.jpg',
      fallbackImage: 'assets/carousell/Scandinavian-style%20home%20office%20with%20a%20minimalist%20desk,%20ergonomic%20chair,%20and%20built-in%20shelves.jpg'
    }
  ];

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
      return Array.isArray(raw) ? raw.filter(Boolean).map(String) : [];
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

  function getItemId(button) {
    if (!button) return '';
    var directId = button.getAttribute('data-item-id') || button.dataset.itemId || button.getAttribute('data-product-id');
    if (directId) return normalizeItemId(directId);

    var productCard = button.closest('article, .product-card, [data-purpose="product-card"]');
    if (productCard) {
      var cardId = productCard.getAttribute('data-item-id') || productCard.dataset.itemId || productCard.getAttribute('data-product-id');
      if (cardId) return normalizeItemId(cardId);
      var productLink = productCard.querySelector('a[href*="product-details"]');
      if (productLink) { var productId = new URL(productLink.href, window.location.href).searchParams.get('id'); if (productId) return normalizeItemId(productId); }
      var titleEl = productCard.querySelector('h3, h2, .product-title, a[href*="product-details"]') || productCard.querySelector('a');
      var titleText = titleEl ? (titleEl.textContent || '').trim() : '';
      if (titleText) return normalizeItemId(titleText);
    }

    if ((window.location.pathname.split('/').pop() || '') === 'product-details.html') {
      var pageProductId = new URLSearchParams(window.location.search).get('id');
      if (pageProductId) return normalizeItemId(pageProductId);
    }
    var text = (button.closest('article') || button.parentElement || button).textContent || '';
    var fallback = text.replace(/\s+/g, ' ').trim();
    return fallback ? normalizeItemId(fallback) : '';
  }

  function updateFavoritesBadge() {
    var count = getSavedItemIds().length;
    document.querySelectorAll('[data-favorites-count], #favoritesHeaderBadge, #shopWishlistBadge').forEach(function (badge) {
      badge.textContent = formatBadgeCount(count);
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
    document.querySelectorAll('[data-favorite-toggle], .favorite-toggle, button[aria-label="Add to wishlist"], button[aria-label="Remove from favorites"], button[onclick*="toggleFavorite"]').forEach(function (button) {
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

    function filterProducts(query) {
      var q = query.toLowerCase().trim();
      if (!q) return [];
      return PRODUCTS_CATALOGUE.filter(function (prod) {
        var matchTitle = prod.title.toLowerCase().indexOf(q) !== -1 || prod.fullTitle.toLowerCase().indexOf(q) !== -1;
        var matchCategory = prod.category.toLowerCase().indexOf(q) !== -1;
        var matchCondition = prod.condition.toLowerCase().indexOf(q) !== -1;
        var matchLocation = prod.location.toLowerCase().indexOf(q) !== -1;
        var matchDesc = prod.description.toLowerCase().indexOf(q) !== -1;
        var matchSpecs = prod.specs.toLowerCase().indexOf(q) !== -1;
        return matchTitle || matchCategory || matchCondition || matchLocation || matchDesc || matchSpecs;
      }).slice(0, 6);
    }

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
    if (!isUserRegistered() && !['index.html', 'auth.html', ''].includes(page)) { window.location.replace('index.html?registrationRequired=1&returnUrl=' + encodeURIComponent(page + window.location.search)); return; }
    if (!isUserRegistered() && page === 'index.html' && params.get('registrationRequired') === '1') showRegisterModal(params.get('returnUrl') || null);
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
    document.querySelectorAll('[data-favorite-toggle], button[aria-label="Add to wishlist"], button[aria-label="Remove from favorites"]').forEach(function (button) {
      if (button.dataset.boundFav) return;
      button.dataset.boundFav = 'true';
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
  });

  window.addEventListener('cart:updated', syncCartBadges);
  window.addEventListener('favorites:updated', function () { updateFavoritesBadge(); syncFavoriteButtons(); });
})();