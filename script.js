// Common image URL that serves as a placeholder (to be replaced by you)
const placeholderImageUrl = 'Comming Soon.jpg';
const blankPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

// --- Global Error Handling & Safe Utilities ---
(function setupGlobalSafety() {
	// Global runtime error handler
	window.addEventListener('error', function(event) {
		try {
			console.error('Unhandled Error:', event.error || event.message);
			if (typeof showToast === 'function') {
				showToast('Something went wrong. Please try again.');
			}
		} catch (_) { /* no-op */ }
	});

	// Unhandled promise rejection handler
	window.addEventListener('unhandledrejection', function(event) {
		try {
			console.error('Unhandled Promise Rejection:', event.reason);
			if (typeof showToast === 'function') {
				showToast('A network or processing error occurred.');
			}
		} catch (_) { /* no-op */ }
	});

	// Safe JSON parse helper
	window.safeJSONParse = function(value, fallback) {
		try {
			if (typeof value !== 'string') return fallback;
			return JSON.parse(value);
		} catch (_) {
			return fallback;
		}
	};

	// Safe localStorage helpers
	window.safeLocalGet = function(key, fallback) {
		try {
			return safeJSONParse(localStorage.getItem(key), fallback);
		} catch (_) {
			return fallback;
		}
	};
	window.safeLocalSet = function(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (e) {
			console.error('Failed to write to localStorage', key, e);
			if (typeof showToast === 'function') {
				showToast('Unable to save your changes locally.');
			}
			return false;
		}
	};
	window.safeLocalRemove = function(key) {
		try {
			localStorage.removeItem(key);
		} catch (_) { /* no-op */ }
	};

	// Domain-specific storage accessors
	window.getCart = function() { return safeLocalGet('glowhaven_cart', []); };
	window.setCart = function(newCart) { return safeLocalSet('glowhaven_cart', Array.isArray(newCart) ? newCart : []); };
	window.getFavorites = function() { return safeLocalGet('glowhaven_favorites', []); };
	window.setFavorites = function(newFavs) { return safeLocalSet('glowhaven_favorites', Array.isArray(newFavs) ? newFavs : []); };

	// Guarded query selector
	window.safeQuerySelector = function(selector) {
		try { return document.querySelector(selector) || null; } catch (_) { return null; }
	};

	// --- Input Validation Utilities ---
	window.sanitizeSearchQuery = function(query) {
		try {
			const trimmed = String(query || '').trim().slice(0, 100);
			// Allow letters, numbers, spaces, commas, hyphens, ampersand; strip others
			return trimmed.replace(/[^\p{L}\p{N}\s,&\-]/gu, '');
		} catch (_) {
			return '';
		}
	};
	window.isValidEmail = function(email) {
		const s = String(email || '').trim();
		if (s.length > 254) return false;
		// Simple RFC-like pattern
		return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
	};
	window.clampInteger = function(value, min, max, fallback) {
		const n = Number.parseInt(value, 10);
		if (!Number.isFinite(n)) return fallback;
		return Math.max(min, Math.min(max, n));
	};

	// Wrap critical global functions with try/catch if present
	function installSafetyWrappers() {
		['addToCart','toggleFavorite','toggleFavoriteDetail','checkout'].forEach(functionName => {
			try {
				const original = window[functionName];
				if (typeof original === 'function') {
					window[functionName] = function(...args) {
						try {
							return original.apply(this, args);
						} catch (err) {
							console.error(functionName + ' failed:', err);
							if (typeof showToast === 'function') {
								showToast('Action failed. Please try again.');
							}
							return undefined;
						}
					};
				}
			} catch (_) { /* no-op */ }
		});
	}

	// Attempt installation at different lifecycle points
	document.addEventListener('DOMContentLoaded', installSafetyWrappers);
	window.addEventListener('load', installSafetyWrappers);
	setTimeout(installSafetyWrappers, 1500);
})();

// DOM content loaded event handler
document.addEventListener('DOMContentLoaded', function() {
	// Images are now loaded directly with src attribute
	// No need for lazy loading initialization
	
	// Redirect to candle-collection-section if on category.html
if (window.location.pathname.includes('category.html')) {
    window.location.href = 'index.html#candle-collection-section';
}
	
	// Initialize search functionality
	initSearchFunctionality();
	
	// Render Shop By Category section
	const shopByCategoryContainer = document.getElementById('shop-by-category-container');
	if (shopByCategoryContainer && typeof renderShopByCategorySection === 'function') {
		shopByCategoryContainer.innerHTML = renderShopByCategorySection();
	}
	
	// Newsletter validation (non-invasive)
	const newsletterInput = document.querySelector('.newsletter-input');
	const newsletterButton = document.querySelector('.newsletter-button');
	if (newsletterButton) {
		newsletterButton.addEventListener('click', function(e) {
			e.preventDefault();
			const email = newsletterInput ? newsletterInput.value : '';
			if (!isValidEmail(email)) {
				if (typeof showToast === 'function') showToast('Please enter a valid email.');
				return;
			}
			if (typeof showToast === 'function') showToast('Thanks for subscribing!');
		});
	}
});

// Initialize search functionality
function initSearchFunctionality() {
	const searchInput = document.querySelector('#search-input');
	if (!searchInput) return; // Exit if search input doesn't exist on this page
	
	const searchContainer = document.querySelector('.search-container');
	
	// Create search suggestions dropdown
	const suggestionsDropdown = document.createElement('div');
	suggestionsDropdown.className = 'search-suggestions';
	suggestionsDropdown.style.display = 'none';
	searchContainer.appendChild(suggestionsDropdown);
	
	// Add click outside listener to close dropdown
	document.addEventListener('click', function(event) {
		if (!searchContainer.contains(event.target)) {
			suggestionsDropdown.style.display = 'none';
		}
	});
	
	// Add event listener for input changes
	searchInput.addEventListener('input', function() {
		const raw = this.value;
		const sanitized = sanitizeSearchQuery(raw).toLowerCase();
		this.value = sanitized; // reflect sanitized input without changing feature behavior
		
		// Clear previous suggestions
		suggestionsDropdown.innerHTML = '';
		
		if (sanitized.length < 2) {
			suggestionsDropdown.style.display = 'none';
			return;
		}
		
		// Filter candles based on search query
		const matchingCandles = candlesData.filter(candle => 
			candle.name.toLowerCase().includes(sanitized) || 
			candle.description.toLowerCase().includes(sanitized) || 
			candle.scent.toLowerCase().includes(sanitized)
		);
		
		// Display matching candles in dropdown
		if (matchingCandles.length > 0) {
			// Show the suggestions dropdown
			suggestionsDropdown.style.display = 'block';
			
			// Enable scrolling if there are many results
			if (matchingCandles.length > 5) {
				suggestionsDropdown.style.maxHeight = '400px';
				suggestionsDropdown.style.overflowY = 'auto';
			}
			
			// Show all matching candles instead of limiting to 5
			matchingCandles.forEach(candle => {
				const suggestion = document.createElement('div');
				suggestion.className = 'search-suggestion-item';
				suggestion.innerHTML = `
					<div class="suggestion-image">
						<img src="${candle.image}" alt="${candle.name}" onerror="this.src='${placeholderImageUrl}'">
					</div>
					<div class="suggestion-details">
						<div class="suggestion-name">${candle.name}</div>
						<div class="suggestion-price">₹${candle.price}</div>
					</div>
				`;
				
				// Add click event to navigate to the candle
				suggestion.addEventListener('click', function() {
					// Scroll to candle collection section
					const candleSection = document.getElementById('candle-collection-section');
					if (candleSection) {
						candleSection.scrollIntoView({ behavior: 'smooth' });
						
						// Highlight the selected candle after scrolling
						setTimeout(() => {
							const candleElements = document.querySelectorAll('.candle-card');
							candleElements.forEach(element => {
								if (element.dataset.id === candle.id) {
									element.classList.add('highlight-candle');
									setTimeout(() => {
										element.classList.remove('highlight-candle');
									}, 2000);
								}
							});
						}, 500);
					}
					
					// Clear search input and hide dropdown
					searchInput.value = '';
					suggestionsDropdown.style.display = 'none';
				});
				
				suggestionsDropdown.appendChild(suggestion);
			});
			
			suggestionsDropdown.style.display = 'block';
		} else {
			const noResults = document.createElement('div');
			noResults.className = 'no-search-results';
			noResults.textContent = 'No matching candles found';
			suggestionsDropdown.appendChild(noResults);
			suggestionsDropdown.style.display = 'block';
		}
	});
	
	// Hide dropdown when clicking outside
	document.addEventListener('click', function(event) {
		if (!searchContainer.contains(event.target)) {
			suggestionsDropdown.style.display = 'none';
		}
	});
	
	// Prevent dropdown from closing when clicking inside it
	suggestionsDropdown.addEventListener('click', function(event) {
		event.stopPropagation();
	});
}

// Initialize category page
function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get('type');
    
    // Category descriptions
    const categoryDescriptions = {
        'floral': 'Our floral candles feature delicate and enchanting scents inspired by beautiful flowers. Perfect for creating a fresh and inviting atmosphere.',
        'vanilla': 'Indulge in the warm and comforting aroma of our vanilla candles. These sweet-scented candles create a cozy and inviting ambiance.',
        'lavender': 'Experience the calming and soothing properties of our lavender candles. Ideal for relaxation and creating a peaceful environment.',
        'rose': 'Our rose-scented candles offer a romantic and elegant fragrance that adds sophistication to any space. Perfect for special occasions.'
    };
    
    // Category titles (capitalized)
    const categoryTitles = {
        'floral': 'Floral Candles',
        'vanilla': 'Vanilla Candles',
        'lavender': 'Lavender Candles',
        'rose': 'Rose Candles'
    };
    
    // Set page title and description
    if (categoryType && categoryTitles[categoryType]) {
        document.title = `SomaScents - ${categoryTitles[categoryType]}`;
        const titleElement = document.getElementById('category-title');
        const descriptionElement = document.getElementById('category-description');
        
        if (titleElement) titleElement.textContent = categoryTitles[categoryType];
        if (descriptionElement) descriptionElement.textContent = categoryDescriptions[categoryType] || '';
        
        // Filter and display products
        filterProductsByCategory(categoryType);
    } else {
        // Handle invalid category
        const titleElement = document.getElementById('category-title');
        const descriptionElement = document.getElementById('category-description');
        const productsContainer = document.getElementById('category-products');
        const noProductsElement = document.getElementById('no-products');
        
        if (titleElement) titleElement.textContent = 'Category Not Found';
        if (descriptionElement) descriptionElement.textContent = 'The requested category does not exist. Please return to our main collection.';
        if (productsContainer) productsContainer.style.display = 'none';
        if (noProductsElement) noProductsElement.style.display = 'block';
    }
}


// Cart functionality - declare cart variable globally
let cart = getCart();

// Updated candlesData from Catalogue.docx
const candlesData = [
    {
        id: '1',
        name: 'Rose Heart Jar Candle',
        price: 199,
        originalPrice: 249,
        image: 'candles_images/Rose Heart Jar Candle.jpg',
        description: 'A beautifully crafted jar candle with a romantic rose fragrance, perfect for creating a warm and inviting atmosphere.',
        scent: 'Floral'
    },
    {
        id: '2',
        name: 'Peony Jar Candle',
        price: 200,
        originalPrice: 249,
        image: 'candles_images/Peony Jar Candle.jpg',
        description: 'This elegant peony-scented jar candle combines floral and rose notes to bring a touch of sophistication to any space.',
        scent: 'Floral, Rose'
    },
    {
        id: '3',
        name: 'Jar of Hearts',
        price: 250,
        originalPrice: 299,
        image: 'candles_images/Jar of Hearts.jpg',
        description: 'A luxurious candle with a blend of vanilla and floral scents, ideal for adding warmth and elegance to your home.',
        scent: 'Vanilla, Floral'
    },
    {
        id: '4',
        name: 'Small Peony Candle',
        price: 79,
        image: 'candles_images/Small Peony Candle.jpg',
        description: 'A compact candle with a delightful mix of floral, rose, and lavender scents, perfect for small spaces or gifting.',
        scent: 'Floral, Rose, Lavender'
    },
    {
        id: '5',
        name: 'Lavender Marble Jar Candle',
        price: 249,
        image: 'candles_images/Lavender Marble Jar Candle.jpg',
        description: 'A soothing lavender-scented jar candle with a marble finish, designed to promote relaxation and tranquility.',
        scent: 'Lavender'
    },
    {
        id: '6',
        name: 'Heart of Roses',
        price: 79,
        image: 'candles_images/Heart of Roses.jpg',
        description: 'A charming small candle infused with the classic scent of roses, ideal for romantic settings or thoughtful gifts.',
        scent: 'Rose'
    },
    {
        id: '7',
        name: 'Scented Candles Bouquet',
        price: 499,
        image: 'candles_images/Scented Candles Bouquet.jpg',
        description: 'A stunning bouquet of scented candles with a floral fragrance, perfect as a centerpiece or luxurious gift.',
        scent: 'Floral'
    },
    {
        id: '8',
        name: 'Mothi Choor Laddu Candles',
        price: 200,
        originalPrice: 299,
        image: 'candles_images/Mothi Choor Laddu Candles.jpg',
        description: 'A pack of four candles inspired by the sweet aroma of mothi choor laddu, offering a warm vanilla scent.',
        scent: 'Vanilla'
    },
    {
        id: '9',
        name: 'Mini Bubble Candles',
        price: 199,
        image: 'candles_images/Mini Bubble Candles.jpg',
        description: 'A pack of three mini bubble candles with a blend of floral, vanilla, rose, and lavender scents for a versatile ambiance.',
        scent: 'Floral, Vanilla, Rose, Lavender'
    },
    {
        id: '10',
        name: 'Blooming Heart Tin Candle',
        price: 250,
        originalPrice: 349,
        image: 'candles_images/Blooming Heart Tin Candle.jpg',
        description: 'A heart-shaped tin candle with floral and rose notes, designed to add a touch of romance to any setting.',
        scent: 'Floral, Rose'
    },
    {
        id: '11',
        name: 'Tulip and Daisy Candle Bouquet',
        price: 99,
        image: 'candles_images/Tulip and Daisy Candle Bouquet.jpg',
        description: 'A single candle with a vibrant floral scent, inspired by tulips and daisies, perfect for a fresh and lively atmosphere.',
        scent: 'Floral'
    },
    {
        id: '12',
        name: 'Daisy Marble Candle',
        price: 249,
        image: 'candles_images/Daisy Marble Candle.jpg',
        description: 'A beautifully designed marble candle with a refreshing floral daisy scent, ideal for modern home decor.',
        scent: 'Floral'
    },
    {
        id: '13',
        name: 'Scented Floating Daisy Candles',
        price: 299,
        image: 'candles_images/Scented Floating Daisy Candles.jpg',
        description: 'A pack of six floating candles with a floral daisy fragrance, perfect for creating a serene and elegant ambiance.',
        scent: 'Floral'
    },
    {
        id: '14',
        name: 'Luxury Marble Jar Candle',
        price: 299,
        originalPrice: 399,
        image: 'candles_images/IMG_20250610_202641.jpg',
        description: 'An elegant marble jar candle with a sophisticated design, perfect for adding a touch of luxury to any room.',
        scent: 'Sandalwood, Vanilla'
    },
    {
        id: '15',
        name: 'Elegant Floral Candle Set',
        price: 319,
        originalPrice: 399,
        image: 'candles_images/IMG_20250703_202103_668.jpg',
        description: 'A beautiful set of floral-designed candles that bring a touch of nature and elegance to your home decor.',
        scent: 'Rose, Jasmine'
    },
    {
        id: '16',
        name: 'Scented Diya Candle',
        price: 45,
        originalPrice: 50,
        packPrice: 160,
        image: 'new_arrivals/scented diya candle.jpg',
        description: 'Beautiful scented diya candles, perfect for festive occasions and home decoration. Single piece ₹45, pack of 4 for ₹160.',
        scent: 'Customizable'
    },
    {
        id: '17',
        name: 'Scented T-Light Candles',
        price: 278,
        originalPrice: 300,
        image: 'new_arrivals/scented t- light candles .jpg',
        description: 'Pack of 6 scented t-light candles, perfect for creating a warm and inviting atmosphere in any room.',
        scent: 'Customizable'
    },
    {
        id: '18',
        name: 'Rose Teddy Candle',
        price: 150,
        image: 'new_arrivals/rose teddy candle.jpg',
        description: 'Adorable rose-scented teddy bear shaped candle, perfect for gifting and adding a cute touch to your decor.',
        scent: 'Rose, Customizable'
    },
    {
        id: '19',
        name: 'Motichoor Laddu Candle',
        price: 199,
        originalPrice: 250,
        image: 'new_arrivals/motichoor laddu candle.jpg',
        description: 'Pack of 6 motichoor laddu shaped candles, perfect for festive occasions and celebrations.',
        scent: 'Sweet, Customizable'
    },
    {
        id: '20',
        name: 'Scented Modak Candle',
        price: 250,
        originalPrice: 300,
        image: 'new_arrivals/scented modak candle.jpg',
        description: 'Pack of 9 scented modak shaped candles, ideal for festivals and special occasions.',
        scent: 'Sweet, Customizable'
    },
    {
        id: '21',
        name: 'Shades of Nature Scented Candles',
        price: 249,
        image: 'new_arrivals/shades of nature scented candles.jpg',
        description: 'Beautiful layered candles inspired by the colors of nature, perfect for adding a touch of elegance to any room.',
        scent: 'Natural, Customizable'
    },
    {
        id: '22',
        name: 'Combo 2Diya+2Laddu Candles',
        price: 150,
        image: 'new_arrivals/combo 2diya+2laddu.jpg',
        description: 'Combination pack of 2 diya candles and 2 laddu candles, perfect for festive occasions and celebrations.',
        scent: 'Customizable'
    }
];

// Updated bestSellersData with selected candles from Catalogue.docx
const bestSellersData = [
    {
        id: 'bs1',
        name: 'Scented Candles Bouquet',
        category: 'Candles',
        price: 499,
        image: 'candles_images/Scented Candles Bouquet.jpg'
    },
    {
        id: 'bs2',
        name: 'Blooming Heart Tin Candle',
        category: 'Candles',
        price: 349,
        image: 'candles_images/Blooming Heart Tin Candle.jpg'
    },
    {
        id: 'bs3',
        name: 'Mothi Choor Laddu Candles',
        category: 'Candles',
        price: 299,
        image: 'candles_images/Mothi Choor Laddu Candles.jpg'
    },
    {
        id: 'bs4',
        name: 'Scented Floating Daisy Candles',
        category: 'Candles',
        price: 299,
        image: 'candles_images/Scented Floating Daisy Candles.jpg'
    }
];

const appRoot = document.getElementById('app-root');
let currentPage = 'home-and-list';
let selectedCandleId = null;
let scrollToSection = null;

function navigateTo(page, id = null, section = null) {
    fadeTransition(() => {
        currentPage = page;
        selectedCandleId = id;
        scrollToSection = section;
        renderPage();
        if (!section) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    });
}

// Duplicate removed: showToast is defined later with enhanced fade-out behavior

// Duplicate removed: fadeTransition is defined later with improved class toggling

// Filter products by category for category.html page
function filterProductsByCategory(category) {
    // Get products that match the category
    const filteredProducts = candlesData.filter(candle => {
        return candle.scent.toLowerCase().includes(category.toLowerCase());
    });
    
    // Display filtered products or show no products message
    const productsContainer = document.getElementById('category-products');
    const noProductsElement = document.getElementById('no-products');
    
    if (filteredProducts.length > 0) {
        renderCategoryProducts(filteredProducts);
        if (productsContainer) productsContainer.style.display = 'grid';
        if (noProductsElement) noProductsElement.style.display = 'none';
    } else {
        if (productsContainer) productsContainer.style.display = 'none';
        if (noProductsElement) noProductsElement.style.display = 'block';
    }
}

// Render category products
function renderCategoryProducts(products) {
    const productsContainer = document.getElementById('category-products');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = products.map(candle => {
        const originalPrice = candle.originalPrice || candle.price;
        const discount = originalPrice > candle.price ? originalPrice - candle.price : 0;
        const discountPercentage = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
        
        // Check if item is in cart or favorites
        const cart = getCart();
        const isInCart = cart.some(item => item.id === candle.id);
        const favorites = getFavorites();
        const isFavorite = favorites.includes(candle.id);
        
        return `
            <div class="candle-card" data-candle-id="${candle.id}">
                <div class="candle-image">
                    <img src="${candle.image}" alt="${candle.name}" loading="lazy" decoding="async">
                    ${discountPercentage > 0 ? `<div class="discount-badge">-${discountPercentage}%</div>` : ''}
                    <div class="candle-overlay">
                        <button class="quick-view-btn" onclick="showCandleDetail('${candle.id}')">Quick View</button>
                    </div>
                </div>
                <div class="buy-now-container">
                    <button type="button" class="buy-now-btn" onclick="showCandleDetail('${candle.id}')" aria-label="Buy ${candle.name}">Buy Now</button>
                </div>
                <div class="candle-info">
                    <h3>${candle.name}</h3>
                    <div class="candle-price">
                        ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                        <span class="current-price">₹${candle.price}</span>
                    </div>
                    <div class="candle-actions">
                        <button type="button" class="add-to-favorites-btn ${isFavorite ? 'added-to-favorites' : ''}" data-candle-id="${candle.id}" title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <button type="button" class="add-to-cart-btn ${isInCart ? 'added-to-cart' : ''}" data-candle-id="${candle.id}" title="${isInCart ? 'Added to Cart' : 'Add to Cart'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize button states
    initializeButtonStates();
    initializeFavoritesButtons();
}

// Show candle detail for Quick View and Buy Now buttons on category page
function showCandleDetail(candleId) {
    const candle = candlesData.find(c => c.id === candleId);
    if (!candle) return;
    
    // Create modal for candle detail
    const modal = document.createElement('div');
    modal.className = 'candle-detail-modal';
    
    const originalPrice = candle.originalPrice || candle.price;
    const discount = originalPrice > candle.price ? originalPrice - candle.price : 0;
    const discountPercentage = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
    
    // Check if item is in cart or favorites
    const cart = getCart();
    const isInCart = cart.some(item => item.id === candle.id);
    const favorites = getFavorites();
    const isFavorite = favorites.includes(candle.id);
    
    modal.innerHTML = `
        <div class="candle-detail-content">
            <button class="close-detail-btn">&times;</button>
            <div class="candle-detail-grid">
                <div class="candle-detail-image">
                    <img src="${candle.image}" alt="${candle.name}">
                    ${discountPercentage > 0 ? `<div class="discount-badge">-${discountPercentage}%</div>` : ''}
                </div>
                <div class="candle-detail-info">
                    <h2>${candle.name}</h2>
                    <p class="candle-detail-description">${candle.description}</p>
                    <p class="candle-detail-scent"><strong>Scent:</strong> ${candle.scent}</p>
                    <div class="candle-detail-price">
                        ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                        <span class="current-price">₹${candle.price}</span>
                    </div>
                    <div class="candle-detail-quantity">
                        <label for="quantity">Quantity:</label>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease">-</button>
                            <input type="number" id="quantity" value="1" min="1" max="10">
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </div>
                    <div class="candle-detail-actions">
                        <button class="add-to-cart-detail-btn ${isInCart ? 'added-to-cart' : ''}" data-candle-id="${candle.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                            ${isInCart ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                        <button class="add-to-favorites-detail-btn ${isFavorite ? 'added-to-favorites' : ''}" data-candle-id="${candle.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            ${isFavorite ? 'Saved' : 'Save for Later'}
                        </button>
                    </div>
                    <div class="candle-detail-features">
                        <div class="feature">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                            <span>Hand-poured</span>
                        </div>
                        <div class="feature">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <span>Natural wax</span>
                        </div>
                        <div class="feature">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>Long-lasting</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close modal
    const closeBtn = modal.querySelector('.close-detail-btn');
    closeBtn.addEventListener('click', () => {
        if (modal && modal.parentNode) {
            document.body.style.overflow = 'auto';
            document.body.removeChild(modal);
        }
    });
    
    // Quantity controls
    const quantityInput = modal.querySelector('#quantity');
    const decreaseBtn = modal.querySelector('.quantity-btn.decrease');
    const increaseBtn = modal.querySelector('.quantity-btn.increase');
    
    decreaseBtn.addEventListener('click', () => {
        const currentValue = clampInteger(quantityInput.value, 1, 10, 1);
        quantityInput.value = currentValue > 1 ? currentValue - 1 : 1;
    });
    
    increaseBtn.addEventListener('click', () => {
        const currentValue = clampInteger(quantityInput.value, 1, 10, 1);
        quantityInput.value = currentValue < 10 ? currentValue + 1 : 10;
    });
    
    quantityInput.addEventListener('input', () => {
        quantityInput.value = clampInteger(quantityInput.value, 1, 10, 1);
    });
    
    // Add to cart from detail
    const addToCartBtn = modal.querySelector('.add-to-cart-detail-btn');
    addToCartBtn.addEventListener('click', () => {
        const quantity = clampInteger(quantityInput.value, 1, 10, 1);
        addToCartWithQuantity(candle.id, quantity);
        addToCartBtn.classList.add('added-to-cart');
        addToCartBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Added to Cart
        `;
    });
    
    // Add to favorites from detail
    const addToFavoritesBtn = modal.querySelector('.add-to-favorites-detail-btn');
    addToFavoritesBtn.addEventListener('click', () => {
        toggleFavoriteDetail(candle.id, addToFavoritesBtn);
    });
}

// Add to cart with quantity
function addToCartWithQuantity(candleId, quantity) {
    const candle = candlesData.find(c => c.id === candleId);
    if (!candle) return;
    
    const safeQty = clampInteger(quantity, 1, 10, 1);
    if (!Number.isInteger(safeQty) || safeQty < 1 || safeQty > 10) {
        if (typeof showToast === 'function') showToast('Please enter a valid quantity (1-10).');
        return;
    }
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === candleId);
    
    if (existingItem) {
        existingItem.quantity = clampInteger(existingItem.quantity + safeQty, 1, 99, 1);
    } else {
        cart.push({
            id: candleId,
            name: candle.name,
            price: candle.price,
            image: candle.image,
            quantity: safeQty
        });
    }
    
    setCart(cart);
    updateCartBadge();
    
    // Update all add to cart buttons for this candle
    document.querySelectorAll(`.add-to-cart-btn[data-candle-id="${candleId}"]`).forEach(button => {
        button.classList.add('added-to-cart');
        button.title = 'Added to Cart';
    });
    
    showToast('Added to cart');
}

// Toggle favorite from detail
function toggleFavoriteDetail(candleId, button) {
    let favorites = getFavorites();
    
    if (favorites.includes(candleId)) {
        // Remove from favorites
        favorites = favorites.filter(id => id !== candleId);
        button.classList.remove('added-to-favorites');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Save for Later
        `;
        showToast('Removed from favorites');
    } else {
        // Add to favorites
        favorites.push(candleId);
        button.classList.add('added-to-favorites');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Saved
        `;
        showToast('Added to favorites');
    }
    
    setFavorites(favorites);
    updateFavoritesBadge();
    
    // Update all favorite buttons for this candle
    document.querySelectorAll(`.add-to-favorites-btn[data-candle-id="${candleId}"]`).forEach(btn => {
        if (favorites.includes(candleId)) {
            btn.classList.add('added-to-favorites');
            btn.title = 'Remove from Favorites';
        } else {
            btn.classList.remove('added-to-favorites');
            btn.title = 'Add to Favorites';
        }
    });
}

// Images are now loaded directly with src attribute
// Lazy loading is handled by the browser's native loading="lazy" attribute

// Duplicate removed: setActiveNavLink is defined later

function renderPage() {
    appRoot.innerHTML = '';
    switch (currentPage) {
        case 'home-and-list':
            renderHomePageAndAllSections();
            break;
        case 'detail':
            renderCandleDetail(selectedCandleId);
            break;
        default:
            renderHomePageAndAllSections();
    }

    if (scrollToSection) {
        setTimeout(() => {
            const targetSection = document.getElementById(scrollToSection);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            scrollToSection = null;
        }, 0);
    }
    setActiveNavLink();

    // Animate cards
    setTimeout(() => {
        document.querySelectorAll('.candle-card, .best-seller-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 100);

    // Initialize button states after rendering
    setTimeout(() => {
        initializeButtonStates();
    }, 200);
} 

function renderHomePageAndAllSections() {
    appRoot.innerHTML = `
        <!-- Dussehra Offer Banner -->
        <div class="dussehra-offer-banner">
            <div class="dussehra-diya left-diya"></div>
            <div class="dussehra-diya right-diya"></div>
            <div class="floating-element flower-1"></div>
            <div class="floating-element flower-2"></div>
            <div class="floating-element flower-3"></div>
            <div class="floating-element star-1"></div>
            <div class="floating-element star-2"></div>
            <div class="dussehra-offer-content">
                <div class="dussehra-offer-text">
                    <span class="dussehra-offer-title">✨ Dussehra Special Offers ✨</span>
                    <span class="dussehra-offer-subtitle">Starting October 22nd | Up to 30% OFF on Festival Collection</span>
                </div>
                <div class="dussehra-offer-cta">
                    <a href="#candle-collection-section" class="dussehra-offer-button">Shop Now <span class="button-sparkle"></span></a>
                </div>
            </div>
            <div class="dussehra-decoration left-decoration"></div>
            <div class="dussehra-decoration right-decoration"></div>
        </div>
        
        <section class="hero-section" id="home-section">
            <div class="hero-main-content">
                <div class="hero-text-content">
                    <h2>Illuminate Your World with</h2>
                    <h3>SomaScents</h3>
                    <p>Discover handcrafted candles that transform your space into a sanctuary of warmth and aroma.</p>
                    <div class="hero-cta-group">
                        <a href="#candle-collection-section" class="button button-primary">Explore Candles</a>
                        <a href="#best-sellers-section" class="button button-outline button-small">Best Sellers</a>
                    </div>
                    <div class="hero-bottom">
                        <p class="hero-tagline">Hand-poured. Clean burn. Cozy vibes.</p>
                        <div class="hero-trust-badges">
                            <div class="trust-badge"><span class="icon">🌿</span>Natural wax blends</div>
                            <div class="trust-badge"><span class="icon">🕯️</span>Long-lasting burn</div>
                            <div class="trust-badge"><span class="icon">🎁</span>Perfect for gifting</div>
                        </div>
                    </div>
                </div>
                <div class="hero-image-gallery">
                    <div class="image-carousel-track">
                        <img src="candles_images/Peony Jar Candle.jpg" alt="Hero Candle" fetchpriority="high" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <img src="new_arrivals/rose teddy candle.jpg" alt="Lavender Marble Jar Candle" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <img src="new_arrivals/motichoor laddu candle.jpg" alt="Daisy Marble Candle" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <img src="candles_images/Heart of Roses.jpg" alt="Daisy Marble Candle" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <img src="new_arrivals/scented diya candle.jpg" alt="Rose Heart Jar Candle" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <img src="new_arrivals/Scented Candles Bouquet.jpg" alt="Rose Heart Jar Candle" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                    </div>
                </div>
            </div>
            <div class="scroll-indicator">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                Scroll
            </div>
        </section>

        <section class="container py-8" id="new-arrivals-section">
            <div class="text-center">
                <h2 class="section-title">New <span style="color: #d97706;">Arrivals</span></h2>
                <p class="section-subtitle">Discover our latest scented creations</p>
            </div>
            <div class="candle-grid new-arrivals-grid">
                <div class="candle-card" data-id="16">
                    <div class="candle-image">
                        <img src="new_arrivals/scented diya candle.jpg" alt="Scented Diya Candle" loading="lazy" decoding="async">
                        <div class="discount-badge">-10%</div>
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('16')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('16')" aria-label="Buy Scented Diya Candle">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Scented Diya Candle</h3>
                        <div class="candle-price">
                            <span class="original-price">₹50</span>
                            <span class="current-price">₹45 | Pack of 4: ₹160</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="16" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="16" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="17">
                    <div class="candle-image">
                        <img src="new_arrivals/scented t- light candles .jpg" alt="Scented T-Light Candles" loading="lazy" decoding="async">
                        <div class="discount-badge" style="position: absolute; top: 10px; right: 10px; background-color: #d97706; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;">-7%</div>
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('17')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('17')" aria-label="Buy Scented T-Light Candles">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Scented T-Light Candles</h3>
                        <div class="candle-price">
                            <span class="original-price">₹300</span>
                            <span class="current-price">₹278</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="17" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="17" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="18">
                    <div class="candle-image">
                        <img src="new_arrivals/rose teddy candle.jpg" alt="Rose Teddy Candle" loading="lazy" decoding="async">
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('18')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('18')" aria-label="Buy Rose Teddy Candle">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Rose Teddy Candle</h3>
                        <div class="candle-price">
                            <span class="current-price">₹150</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="18" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="18" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="19">
                    <div class="candle-image">
                        <img src="new_arrivals/motichoor laddu candle.jpg" alt="Motichoor Laddu Candle" loading="lazy" decoding="async">
                        <div class="discount-badge">-20%</div>
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('19')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('19')" aria-label="Buy Motichoor Laddu Candle">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Motichoor Laddu Candle</h3>
                        <div class="candle-price">
                            <span class="original-price">₹250</span>
                            <span class="current-price">₹199</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="19" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="19" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="20">
                    <div class="candle-image">
                        <img src="new_arrivals/scented modak candle.jpg" alt="Scented Modak Candle" loading="lazy" decoding="async">
                        <div class="discount-badge">-17%</div>
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('20')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('20')" aria-label="Buy Scented Modak Candle">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Scented Modak Candle</h3>
                        <div class="candle-price">
                            <span class="original-price">₹300</span>
                            <span class="current-price">₹250</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="20" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="20" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="21">
                    <div class="candle-image">
                        <img src="new_arrivals/shades of nature scented candles.jpg" alt="Shades of Nature Scented Candles" loading="lazy" decoding="async">
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('21')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('21')" aria-label="Buy Shades of Nature Scented Candles">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Shades of Nature Scented Candles</h3>
                        <div class="candle-price">
                            <span class="current-price">₹249</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="21" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="21" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="candle-card" data-id="22">
                    <div class="candle-image">
                        <img src="new_arrivals/combo 2diya+2laddu.jpg" alt="Combo 2Diya+2Laddu Candles" loading="lazy" decoding="async">
                        <div class="candle-overlay">
                            <button class="quick-view-btn" onclick="showCandleDetail('22')">Quick View</button>
                        </div>
                    </div>
                    <div class="buy-now-container">
                        <button type="button" class="buy-now-btn" onclick="showCandleDetail('22')" aria-label="Buy Combo 2Diya+2Laddu Candles">Buy Now</button>
                    </div>
                    <div class="candle-info">
                        <h3>Combo 2Diya+2Laddu Candles</h3>
                        <div class="candle-price">
                            <span class="current-price">₹150</span>
                        </div>
                        <div class="candle-actions">
                            <button type="button" class="add-to-favorites-btn" data-candle-id="22" title="Add to Favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <button type="button" class="add-to-cart-btn" data-candle-id="22" title="Add to Cart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="view-all-container">
                <button class="view-all-btn" onclick="document.getElementById('candle-collection-section').scrollIntoView({behavior: 'smooth'})">View All Products</button>
            </div>
        </section>

        <section class="container py-8" id="candle-collection-section">
            <h2 class="section-title" style="animation: fadeInUp 1s ease-out 0.3s both; transform: translateY(30px); opacity: 0;">Our Candle Collection</h2>
            <div class="candle-grid">
                ${candlesData.map((candle, i) => {
                    const originalPrice = candle.originalPrice || candle.price;
                    const discount = originalPrice > candle.price ? originalPrice - candle.price : 0;
                    const discountPercentage = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
                    
                    // Check if item is in cart or favorites
                    const isInCart = getCart().some(item => item.id === candle.id);
                    const favorites = getFavorites();
                    const isFavorite = favorites.includes(candle.id);
                    
                    return `
                        <div class="candle-card" data-id="${candle.id}" data-index="${i}">
                            <div class="candle-image">
                                <img src="${candle.image}" alt="${candle.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                                ${discountPercentage > 0 ? `<div class="discount-badge">-${discountPercentage}%</div>` : ''}
                                <div class="candle-overlay">
                                    <button class="quick-view-btn" onclick="showCandleDetail('${candle.id}')">Quick View</button>
                                </div>
                            </div>
                            <div class="buy-now-container">
                                <button type="button" class="buy-now-btn" onclick="showCandleDetail('${candle.id}')" aria-label="Buy ${candle.name}">Buy Now</button>
                            </div>
                            <div class="candle-info">
                                <h3>${candle.name}</h3>
                                <div class="candle-price">
                                    ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                                    <span class="current-price">₹${candle.price}</span>
                                </div>
                                <div class="candle-actions">
                                    <button type="button" class="add-to-favorites-btn ${isFavorite ? 'added-to-favorites' : ''}" data-candle-id="${candle.id}" title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                    </button>
                                    <button type="button" class="add-to-cart-btn ${isInCart ? 'added-to-cart' : ''}" data-candle-id="${candle.id}" title="${isInCart ? 'Added to Cart' : 'Add to Cart'}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>

        <div id="shop-by-category-container"></div>

        <section class="best-sellers-section" id="best-sellers-section">
            <h2 class="section-title">Best Sellers</h2>
            <div class="best-sellers-grid">
                ${bestSellersData.map((item, i) => `
                    <div class="best-seller-card" data-id="${item.id}" data-index="${i}">
                        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                        <h4>${item.name}</h4>
                        <p class="category">${item.category}</p>
                        <p class="price">₹${item.price.toFixed(0)}</p>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="testimonials-section" id="testimonials-section">
            <h2 class="section-title">Our Customers Love Us</h2>
            <div class="testimonials-carousel">
                <div class="testimonials-track" id="testimonials-track">
                    ${[
                        {name:'Amit', quote:"Good products, good prices. Worth it", stars:5},
                        {name:'Shalini Garg', quote:"Very nice floral and pleasant fragrance, long lasting too.", stars:5},
                        {name:'Khushpreet Kaur', quote:"Its fragrance so good", stars:5},
                        {name:'Rohit', quote:"Great packaging and fast delivery.", stars:5},
                        {name:'Meera', quote:"Scent fills the room without being overpowering.", stars:5},
                        {name:'Aarav', quote:"Perfect gifts. Everyone loved them!", stars:5}
                    ].map(t => `
                        <div class="testimonial-card">
                            <div class="testimonial-rating">${'★'.repeat(t.stars)}</div>
                            <p class="testimonial-quote">"${t.quote}"</p>
                            <div class="testimonial-author">${t.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="testimonial-nav">
                    <button class="testimonial-btn" id="testimonials-prev" aria-label="Previous">‹</button>
                    <button class="testimonial-btn" id="testimonials-next" aria-label="Next">›</button>
                </div>
            </div>
            <div class="rating-summary">
                <div class="rating-badge">4.7</div>
                <div class="rating-stars">★★★★★</div>
                <div class="rating-text">From <strong>324</strong> reviews</div>
            </div>
        </section>

        <section class="policies-section" id="policies-section">
            <h2 class="section-title">Our Policies</h2>
            <div class="policies-grid">
                <div class="policy-card">
                    <svg class="policy-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <h4>No Exchange</h4>
                    <p>Please note, we do not offer exchanges once an order is placed.</p>
                </div>
                <div class="policy-card">
                    <svg class="policy-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <h4>No Return Policy</h4>
                    <p>All sales are final. Returns are not accepted.</p>
                </div>
                <div class="policy-card">
                    <svg class="policy-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.555 17.555a1 1 0 01-1.414 0L13 14.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.121-2.121L9.172 11.707a1 1 0 011.414-1.414l2.121 2.121L14.414 11a1 1 0 011.414 1.414l-2.121 2.121L17.555 16.146a1 1 0 010 1.409zM15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <h4>Best Customer Support</h4>
                    <p>We provide 24/7 customer support for all your queries.</p>
                </div>
            </div>
        </section>

        <section class="about-section" id="about-section-link">
            <h2 class="section-title">About SomaScents</h2>
            <div class="container">
                <div class="about-main-content">
                    <p>At <strong>SomaScents</strong>, we believe that every home deserves a touch of warmth, tranquility, and exquisite aroma. Our journey began with a passion for <strong>handcrafted candles</strong> and a vision to <strong>"illuminate every home with elegance."</strong></p>
                    <p>We meticulously curate the finest selection of artisan-crafted candles, designed to transform your space into a sanctuary of peace and comfort.</p>
                </div>
                </div>

                <div class="about-features-grid">
                    <div class="about-feature-card">
                        <svg class="about-feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v2.158a1 1 0 01-.836.986l-3.23.647a1 1 0 00-.646.935V17a1 1 0 001 1h2a1 1 0 001-1v-2.172a1 1 0 01.387-.923l3.823-3.823a1 1 0 001.06-.286l.666-.666a1 1 0 00.286-1.06L14.77 5.757a1 1 0 00-1.06-.286l-3.823 3.823V6a1 1 0 01-1-1V2a1 1 0 01.836-.986z" clip-rule="evenodd"></path></svg>
                        <h4>Artisan Craftsmanship</h4>
                        <p>Each candle is handmade with high-quality, sustainable waxes and premium fragrance oils, ensuring perfection in every detail.</p>
                    </div>
                    <div class="about-feature-card">
                        <svg class="about-feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V9a1 1 0 012 0v2a1 1 0 11-2 0zM7 7a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                        <h4>Quality Ingredients</h4>
                        <p>We are committed to using only the finest ingredients, from natural soy and beeswax to lead-free wicks and phthalate-free fragrances.</p>
                    </div>
                    <div class="about-feature-card">
                        <svg class="about-feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.555 17.555a1 1 0 01-1.414 0L13 14.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.121-2.121L9.172 11.707a1 1 0 011.414-1.414l2.121 2.121L14.414 11a1 1 0 011.414 1.414l-2.121 2.121L17.555 16.146a1 1 0 010 1.409zM15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <h4>Customer Happiness</h4>
                        <p>Your satisfaction is our priority! Enjoy our exclusive collections made with love, designed to bring joy and ambiance to your space.</p>
                    </div>
                </div>

                <div class="about-mission-vision">
                    <h3>Our Mission & Vision ✨</h3>
                    <p>At SomaScents, our mission is to <strong>"inspire serenity and elevate everyday moments"</strong> through the art of fine candlemaking. We dream of a world where every home exudes unique warmth and delightful fragrance. Our vision is to support <strong>local artisans</strong> and provide a platform for them to <strong>share their craft</strong> with the world. We are here to <strong>spark tranquility, bring comfort, and inspire cozy living!</strong> 🕯️🌿</p>
                </div>
            </div>
        </section>

        <section class="container py-8 contact-section" id="contact-section-link">
            <h2 class="section-title">Contact Us</h2>
            <div class="contact-content">
                <div class="contact-form">
                    <h3>Send us a message</h3>
                    <form id="contact-form-element">
                        <div class="form-group">
                            <label for="name">Your Name</label>
                            <input type="text" id="name" placeholder="John Doe" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Your Email</label>
                            <input type="email" id="email" placeholder="john.doe@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Your Message</label>
                            <textarea id="message" rows="6" placeholder="Type your message here..." required></textarea>
                        </div>
                        <button type="submit" class="button button-primary">Send Message</button>
                    </form>
                </div>
                <div class="contact-info">
                    <h3>Our Details</h3>
                    <div class="contact-item">
                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                        <p><a href="mailto:somascents5@gmail.com">somascents5@gmail.com</a></p>
                    </div>
                    <div class="contact-item">
                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.774a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74A1 1 0 0118 16.847V17a1 1 0 01-1 1H3a1 1 0 01-1-1V3z"></path></svg>
                        <p>+91 7416778158</p>
                    </div>
                    <div class="contact-item">
                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                        <p>Mehdipatnam</p>
                    </div>
                    <div class="map-placeholder">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.4979338103223!2d78.43679631744384!3d17.39127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb97a7f03b5d81%3A0x55c2b1a6e3975d8!2sMehdipatnam%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1652345678901!5m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Add event listeners to each candle card
document.querySelectorAll('.candle-card').forEach(card => {
    card.addEventListener('click', (event) => {
        // Don't trigger if clicking on buttons
        if (event.target.closest('.add-to-cart-btn') || event.target.closest('.add-to-favorites-btn') || event.target.closest('.quick-view-btn') || event.target.closest('.buy-now-btn')) {
            return;
        }
        const candleId = event.currentTarget.dataset.id;
        navigateTo('detail', candleId);
    });
});
    // Trigger animations if in view
    triggerBestSellersAnimation();
    triggerCandleCollectionAnimation();
    triggerShopByCategoryAnimation();

    // Testimonial carousel is now handled in deferred-scripts.js
    // This prevents conflicts between multiple carousel implementations
}

// Function to show candle detail (for quick view)
function showCandleDetail(id) {
    navigateTo('detail', id);
    // Ensure detail opens from top
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 0);
}

// Function to render the detail view of a single candle
function renderCandleDetail(id) {
    const candle = candlesData.find(c => c.id === id);

    if (!candle) {
        appRoot.innerHTML = `
            <div class="container py-8 text-center text-red-600">
                Candle not found.
                <button class="button button-primary mt-4" onclick="navigateTo('home-and-list', null, 'candle-collection-section')">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path></svg>
                    Back to Candles
                </button>
            </div>
        `;
        return;
    }

    // Check if item is in favorites
    const favorites = getFavorites();
    const isFavorite = favorites.includes(candle.id);

    // Special pricing display for Scented Diya Candle
    let priceDisplay = `₹${candle.price.toFixed(2)}`;
    if (candle.id === '16' && candle.packPrice) {
        priceDisplay = `Single piece: ₹${candle.price.toFixed(2)} | Pack of 4: ₹${candle.packPrice.toFixed(2)}`;
    }

    appRoot.innerHTML = `
        <section class="container py-8">
            <div class="candle-detail">
                <div class="candle-detail-image-wrapper">
                    <img src="${candle.image}" alt="${candle.name}" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                </div>
                <div class="candle-detail-content">
                    <h2>${candle.name}</h2>
                    <p class="price">${priceDisplay}</p>
                    <p class="description">${candle.description}</p>
                    <div class="scent-notes">
                        <h3>Scent Notes:</h3>
                        <p>${candle.scent}</p>
                    </div>
                    <div class="button-group">
                        <button class="button button-primary" id="add-to-cart-detail-btn">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16 11V9H8V7h8V5l4 4-4 4zm-6 4H4a2 2 0 01-2-2V5a2 2 0 012-2h6v2H4v8h6v2z"/></svg>
                            Add to Cart
                        </button>
                        <button class="button button-secondary ${isFavorite ? 'added-to-favorites' : ''}" id="add-to-favorites-detail-btn">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3.22l-.61-.6a5.5 5.5 0 00-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 00-7.78-7.77l-.61.61z"/>
                            </svg>
                            ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button class="button button-secondary" id="back-to-candles-btn">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path></svg>
                            Back to Candles
                        </button>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Hide footer on detail page
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';
    }
    
    // Hide social media icons on detail page
    const socialButtonsContainer = document.getElementById('social-buttons-container');
    if (socialButtonsContainer) {
        socialButtonsContainer.style.display = 'none';
    }

    // Changed to navigate to candles section specifically
    document.getElementById('back-to-candles-btn').addEventListener('click', () => {
        // Show footer again when going back
        if (footer) {
            footer.style.display = 'block';
        }
        // Show social media icons again when going back
        const socialButtonsContainer = document.getElementById('social-buttons-container');
        if (socialButtonsContainer) {
            socialButtonsContainer.style.display = 'flex';
        }
        navigateTo('home-and-list', null, 'candle-collection-section');
    });
    
    // Add to cart button on detail page
    const addBtn = document.getElementById('add-to-cart-detail-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addToCart(id, null);
            addBtn.textContent = 'Added to Cart';
        });
    }
    
    // Add to favorites button on detail page
    const favBtn = document.getElementById('add-to-favorites-detail-btn');
    if (favBtn) {
        favBtn.addEventListener('click', () => {
            toggleFavorite(id);
            const favorites = getFavorites();
            const isFavorite = favorites.includes(id);
            favBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            favBtn.classList.toggle('added-to-favorites', isFavorite);
        });
    }
    
    // Scroll to top after rendering detail
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
} 

// Event listeners for navigation
document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    const homeEl = document.getElementById('home-section');
    if (homeEl) { homeEl.scrollIntoView({ behavior: 'instant' }); }
});

document.getElementById('nav-candles').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('candle-collection-section').scrollIntoView({ behavior: 'instant' });
});

document.getElementById('nav-about').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('about-section-link').scrollIntoView({ behavior: 'instant' });
});

document.getElementById('nav-contact').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contact-section-link').scrollIntoView({ behavior: 'instant' });
});

// Initialize the page on load
document.addEventListener('DOMContentLoaded', () => {
    // Only update current-year-footer as 'current-year' ID doesn't exist in HTML
    const currentYearFooter = document.getElementById('current-year-footer');
    if (currentYearFooter) {
        currentYearFooter.textContent = new Date().getFullYear();
    }
    renderPage();
    // Ensure we scroll to the offers section on initial load/reload
    setTimeout(() => {
        const offersSection = document.querySelector('.dussehra-offer-banner');
        if (offersSection) {
            offersSection.scrollIntoView({ behavior: 'instant' });
        }
    }, 100);
});

// Toast notification function
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toastContainer.style.display = 'block';
    toastContainer.style.opacity = '1';
    setTimeout(() => {
        toastContainer.style.transition = 'opacity 0.5s';
        toastContainer.style.opacity = '0';
        setTimeout(() => {
            toastContainer.style.display = 'none';
            toastContainer.style.transition = '';
        }, 500);
    }, 1800);
}

// Intersection Observer for best sellers wave animation
function triggerBestSellersAnimation() {
    const section = document.getElementById('best-sellers-section');
    const cards = section ? section.querySelectorAll('.best-seller-card') : [];
    if (!section || !cards.length) return;
    const observer = new window.IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach(card => card.classList.add('visible'));
                obs.disconnect();
            }
        });
    }, { threshold: 0.2 });
    observer.observe(section);
}

// Intersection Observer for shop by category section animation
function triggerShopByCategoryAnimation() {
    const section = document.getElementById('shop-by-category-section');
    const cards = section ? section.querySelectorAll('.best-seller-card') : [];
    if (!section || !cards.length) return;
    const observer = new window.IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach(card => card.classList.add('visible'));
                obs.disconnect();
            }
        });
    }, { threshold: 0.2 });
    observer.observe(section);
}

// Add Intersection Observer for candle collection
function triggerCandleCollectionAnimation() {
    const section = document.getElementById('candle-collection-section');
    const cards = section ? section.querySelectorAll('.candle-card') : [];
    if (!section || !cards.length) return;
    const groupSize = 3;
    // Create groups of 3
    for (let i = 0; i < cards.length; i += groupSize) {
        const group = Array.from(cards).slice(i, i + groupSize);
        const observer = new window.IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    group.forEach(card => card.classList.add('visible'));
                    obs.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(group[0]); // Observe the first card in each group
    }
}

// Fade transition and loading spinner logic
function fadeTransition(callback) {
    const appRoot = document.getElementById('app-root');
    const spinner = document.getElementById('loading-spinner');
    appRoot.classList.remove('fade-in');
    appRoot.classList.add('fade-out');
    spinner.classList.add('active');
    setTimeout(() => {
        callback();
        setTimeout(() => {
            appRoot.classList.remove('fade-out');
            appRoot.classList.add('fade-in');
            spinner.classList.remove('active');
        }, 50);
    }, 350);
}

// Highlight active navbar link
function setActiveNavLink() {
    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));
    if (currentPage === 'home-and-list') {
        document.getElementById('nav-home').classList.add('active');
    } else if (currentPage === 'detail') {
        document.getElementById('nav-candles').classList.add('active');
    }
}

// WhatsApp and Instagram buttons are now direct links with href attributes
// No JavaScript event listeners needed anymore

// Up arrow button logic
const scrollUpBtn = document.getElementById('scroll-up-btn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        scrollUpBtn.classList.add('visible');
    } else {
        scrollUpBtn.classList.remove('visible');
    }
});
scrollUpBtn.addEventListener('click', () => {
    document.getElementById('home-section').scrollIntoView({ behavior: 'smooth' });
});

// Search functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
    // Input event for real-time filtering
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm.length > 0) {
            // Filter candles based on search term
            const filteredCandles = candlesData.filter(candle => 
                candle.name.toLowerCase().includes(searchTerm) ||
                candle.description.toLowerCase().includes(searchTerm) ||
                candle.scent.toLowerCase().includes(searchTerm)
            );
            
            // Update the candle collection display with filtered results
            if (currentPage === 'home-and-list') {
                renderCandleCollection(filteredCandles);
            }
        } else {
            // Show all candles when search is cleared
            if (currentPage === 'home-and-list') {
                renderCandleCollection(candlesData);
            }
        }
    });
    
    // Add click event listeners to candle cards after search
    document.addEventListener('click', (e) => {
        // Check if the clicked element is a candle card or inside a candle card
        const candleCard = e.target.closest('.candle-card');
        if (candleCard) {
            const candleId = candleCard.dataset.id;
            if (candleId) {
                // Navigate to the specific candle detail page
                showCandleDetail(candleId);
                e.preventDefault();
            }
        }
    });
}

// Favorites functionality
const favoritesBtn = document.getElementById('favorites-btn');
if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
        // Navigate to favorites page
        window.location.href = 'favorites.html';
    });
}

// Cart functionality - cart variable is already declared globally

const cartBtn = document.getElementById('cart-btn');
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        showCartModal();
    });
}

// Add to cart function
function addToCart(candleId, event) {
    const candle = candlesData.find(c => c.id === candleId);
    if (!candle) return;
    
    const existingItem = getCart().find(item => item.id === candleId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: candleId,
            name: candle.name,
            price: candle.price,
            originalPrice: candle.originalPrice || candle.price,
            image: candle.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    updateCartButtonState(candleId);
    showToast('🛒 Added to cart!');
}

// Toggle favorite function
function toggleFavorite(candleId, event) {
    let favorites = getFavorites();
    const isFavorite = favorites.includes(candleId);
    
    if (isFavorite) {
        favorites = favorites.filter(id => id !== candleId);
        showToast('💔 Removed from favorites!');
    } else {
        favorites.push(candleId);
        showToast('❤️ Added to favorites!');
    }
    
    setFavorites(favorites);
    updateFavoriteButtonState(candleId);
    updateFavoritesBadge();
    
    // If we're on the favorites page, refresh it
    if (window.location.pathname.includes('favorites.html')) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Update cart button state
function updateCartButtonState(candleId) {
    const cartBtn = document.querySelector(`[data-candle-id="${candleId}"].add-to-cart-btn`);
    if (cartBtn) {
        const isInCart = getCart().some(item => item.id === candleId);
        if (isInCart) {
            cartBtn.classList.add('added-to-cart');
            cartBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            `;
            cartBtn.title = 'Added to Cart';
        } else {
            cartBtn.classList.remove('added-to-cart');
            cartBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            `;
            cartBtn.title = 'Add to Cart';
        }
    }
}

// Update favorite button state
function updateFavoriteButtonState(candleId) {
    const favoriteBtns = document.querySelectorAll(`[data-candle-id="${candleId}"].add-to-favorites-btn`);
    const favorites = getFavorites();
    const isFavorite = favorites.includes(candleId);
    
    favoriteBtns.forEach(favoriteBtn => {
        if (isFavorite) {
            favoriteBtn.classList.add('added-to-favorites');
            favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `;
            favoriteBtn.title = 'Remove from Favorites';
        } else {
            favoriteBtn.classList.remove('added-to-favorites');
            favoriteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `;
            favoriteBtn.title = 'Add to Favorites';
        }
    });
}

// Initialize button states
function initializeButtonStates() {
    candlesData.forEach(candle => {
        updateCartButtonState(candle.id);
        updateFavoriteButtonState(candle.id);
    });
    updateFavoritesBadge();
}

// Remove from cart function
function removeFromCart(candleId) {
    cart = cart.filter(item => item.id !== candleId);
    saveCart();
    updateCartBadge();
    renderCartModal();
    showToast('Removed from cart!');
}

// Update quantity function
function updateQuantity(candleId, change) {
    const item = cart.find(item => item.id === candleId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(candleId);
    } else {
        saveCart();
        updateCartBadge();
        renderCartModal();
    }
}

// Save cart to localStorage
function saveCart() {
    setCart(cart);
}

// Update cart badge
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        let badge = cartBtn.querySelector('.cart-badge');
        if (totalItems > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartBtn.appendChild(badge);
            }
            badge.textContent = totalItems;
        } else if (badge) {
            badge.remove();
        }
    }
}

// Update favorites badge
function updateFavoritesBadge() {
    const favorites = getFavorites();
    const totalFavorites = Array.isArray(favorites) ? favorites.length : 0;
    const favoritesBadge = document.getElementById('favorites-badge');
    if (favoritesBadge) {
        favoritesBadge.textContent = totalFavorites > 0 ? totalFavorites : '';
        favoritesBadge.style.display = totalFavorites > 0 ? 'inline-flex' : 'none';
    }
}

// Show cart modal
function showCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        renderCartModal();
        
        // Add click outside to close functionality
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideCartModal();
            }
        });
    }
}

// Hide cart modal
function hideCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add escape key functionality
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideCartModal();
    }
});

// Render cart modal content
function renderCartModal() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button onclick="hideCartModal()" class="close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <div class="empty-cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <h3>Your cart is empty</h3>
                <p>Add some candles to get started!</p>
            </div>
        `;
        return;
    }
    
    const cartItems = cart.map(item => {
        const candle = candlesData.find(c => c.id === item.id);
        const originalPrice = item.originalPrice || item.price;
        const discount = originalPrice > item.price ? originalPrice - item.price : 0;
        const discountPercentage = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='${placeholderImageUrl}'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">
                        ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                        <span class="current-price">₹${item.price}</span>
                        ${discountPercentage > 0 ? `<span class="discount-badge">-${discountPercentage}%</span>` : ''}
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity('${item.id}', -1)" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="quantity-btn">+</button>
                </div>
                <div class="cart-item-total">
                    ₹${item.price * item.quantity}
                </div>
                <button onclick="removeFromCart('${item.id}')" class="remove-btn" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalOriginal = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
    const totalDiscount = totalOriginal - subtotal;
    
    cartContent.innerHTML = `
        <div class="cart-header">
            <h3>Shopping Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
            <button onclick="hideCartModal()" class="close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
        <div class="cart-items">
            ${cartItems}
        </div>
        <div class="cart-summary">
            ${totalDiscount > 0 ? `
                <div class="discount-summary">
                    <span>Total Savings:</span>
                    <span class="savings">-₹${totalDiscount}</span>
                </div>
            ` : ''}
            <div class="cart-total">
                <span>Total:</span>
                <span class="total-amount">₹${subtotal}</span>
            </div>
        </div>
        <div class="cart-actions">
            <button onclick="hideCartModal()" class="continue-shopping-btn">Continue Shopping</button>
            <button onclick="checkout()" class="checkout-btn">Proceed to Checkout</button>
        </div>
    `;
    
    // Ensure scrolling works properly by scrolling to top when opening cart
    const cartModalContent = document.querySelector('.cart-modal-content');
    if (cartModalContent) {
        cartModalContent.scrollTop = 0;
    }
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    // Validate cart items before proceeding
    cart = cart.filter(item => item && item.id && Number.isFinite(item.price) && Number.isFinite(item.quantity) && item.quantity > 0);
    if (cart.length === 0) {
        setCart(cart);
        updateCartBadge();
        showToast('Your cart became invalid. Please re-add items.');
        return;
    }
    // Proceed with existing behavior (placeholder checkout)
    showToast('Proceeding to checkout...');
}

// Initialize cart badge and button states
updateCartBadge();
initializeButtonStates();

// Contact form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form-element');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (name && email && message) {
                showToast('Thank you for your message! We\'ll get back to you soon.');
                contactForm.reset();
            } else {
                showToast('Please fill in all fields.');
            }
        });
    }
});

// Helper function to render filtered candle collection
function renderCandleCollection(candles) {
    const candleSection = document.getElementById('candle-collection-section');
    if (!candleSection) return;
    
    const candleGrid = candleSection.querySelector('.candle-grid');
    if (!candleGrid) return;
    
    candleGrid.innerHTML = candles.map(candle => {
        const originalPrice = candle.originalPrice || candle.price;
        const discount = originalPrice > candle.price ? originalPrice - candle.price : 0;
        const discountPercentage = discount > 0 ? Math.round((discount / originalPrice) * 100) : 0;
        
        // Check if item is in cart or favorites
        const isInCart = getCart().some(item => item.id === candle.id);
        const favorites = getFavorites();
        const isFavorite = favorites.includes(candle.id);
        
        return `
            <div class="candle-card" data-candle-id="${candle.id}">
                <div class="candle-image">
                    <img src="${candle.image}" alt="${candle.name}" loading="lazy" decoding="async" onerror="this.src='${placeholderImageUrl}'">
                    ${discountPercentage > 0 ? `<div class="discount-badge">-${discountPercentage}%</div>` : ''}
                    <div class="candle-overlay">
                        <button class="quick-view-btn" onclick="showCandleDetail('${candle.id}')">Quick View</button>
                    </div>
                </div>
                <div class="buy-now-container">
                    <button type="button" class="buy-now-btn" onclick="showCandleDetail('${candle.id}')" aria-label="Buy ${candle.name}">Buy Now</button>
                </div>
                <div class="candle-info">
                    <h3>${candle.name}</h3>
                    <div class="candle-price">
                        ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                        <span class="current-price">₹${candle.price}</span>
                    </div>
                    <div class="candle-actions">
                        <button type="button" class="add-to-favorites-btn ${isFavorite ? 'added-to-favorites' : ''}" data-candle-id="${candle.id}" title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <button type="button" class="add-to-cart-btn ${isInCart ? 'added-to-cart' : ''}" data-candle-id="${candle.id}" title="${isInCart ? 'Added to Cart' : 'Add to Cart'}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Real-time section highlighting based on scroll position
function updateActiveNavLink() {
    const sections = [
        { id: 'home-section', navId: 'nav-home' },
        { id: 'candle-collection-section', navId: 'nav-candles' },
        { id: 'best-sellers-section', navId: 'nav-best-sellers' },
        { id: 'about-section-link', navId: 'nav-about' },
        { id: 'contact-section-link', navId: 'nav-contact' }
    ];

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollPosition + (windowHeight / 2);

    // Remove active class from all nav links
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
    });

    // Find which section is currently most visible in the viewport
    let activeSection = null;
    let maxVisibility = 0;

    for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i].id);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            // Calculate how much of the section is visible in the viewport
            const visibleTop = Math.max(sectionTop, scrollPosition);
            const visibleBottom = Math.min(sectionBottom, scrollPosition + windowHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibilityRatio = visibleHeight / Math.min(sectionHeight, windowHeight);
            
            // Check if section is significantly visible (more than 30% visible)
            if (visibilityRatio > 0.3 && visibilityRatio > maxVisibility) {
                maxVisibility = visibilityRatio;
                activeSection = sections[i];
            }
        }
    }

    // If no section is significantly visible, find the closest one
    if (!activeSection) {
        let minDistance = Infinity;
        for (let i = 0; i < sections.length; i++) {
            const section = document.getElementById(sections[i].id);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionCenter = sectionTop + (sectionHeight / 2);
                const distance = Math.abs(viewportCenter - sectionCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeSection = sections[i];
                }
            }
        }
    }

    // Add active class to the current section's nav link
    const activeNavLink = document.getElementById(activeSection.navId);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
}

// Optimized scroll event listener for faster response
let scrollTimeout;
let ticking = false;

function throttledUpdateActiveNavLink() {
    if (!ticking) {
        requestAnimationFrame(function() {
            updateActiveNavLink();
            ticking = false;
        });
        ticking = true;
    }
}

// Add scroll event listener for real-time navigation highlighting
window.addEventListener('scroll', throttledUpdateActiveNavLink, { passive: true });

// Initialize active nav link on page load
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavLink();
    
    // Mobile sidebar functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileShopToggle = document.getElementById('mobile-shop-toggle');
    const mobileShopMenu = document.getElementById('mobile-shop-menu');

    // Open mobile sidebar
    function openMobileSidebar() {
        mobileSidebar.classList.add('open');
        mobileOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Close mobile sidebar
    function closeMobileSidebar() {
        mobileSidebar.classList.remove('open');
        mobileOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Event listeners for mobile sidebar
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileSidebar);
    }

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileSidebar);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Mobile shop dropdown toggle
    if (mobileShopToggle && mobileShopMenu) {
        mobileShopToggle.addEventListener('click', () => {
            mobileShopMenu.classList.toggle('open');
            const arrow = mobileShopToggle.querySelector('svg');
            if (mobileShopMenu.classList.contains('open')) {
                arrow.style.transform = 'rotate(180deg)';
            } else {
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    }

    // Mobile navigation links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileSidebar();
            mobileNavLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Mobile features buttons
    const mobileFavoritesBtn = document.getElementById('mobile-favorites-btn');
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    if (mobileFavoritesBtn) {
        mobileFavoritesBtn.addEventListener('click', () => {
            closeMobileSidebar();
            window.location.href = 'favorites.html';
        });
    }
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', () => {
            closeMobileSidebar();
            showCartModal();
        });
    }

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileSidebar && mobileSidebar.classList.contains('open')) {
            closeMobileSidebar();
        }
    });
    
    // Candle collection wave animation
    const candleSection = document.getElementById('candle-collection-section');
    if (candleSection) {
        const candleCards = candleSection.querySelectorAll('.candle-card');
        let animationTriggered = false;
        
        // Function to check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
        }
        
        // Function to trigger wave animation
        function triggerWaveAnimation() {
            if (animationTriggered) return;
            
            candleCards.forEach((card, index) => {
                if (isElementInViewport(card)) {
                    setTimeout(() => {
                        card.classList.add('wave-animate');
                    }, index * 100);
                }
            });
            
            animationTriggered = true;
        }
        
        // Scroll event listener for wave animation
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (isElementInViewport(candleSection)) {
                    triggerWaveAnimation();
                }
            }, 50);
        }, { passive: true });
        
        // Also trigger on initial load if section is visible
        if (isElementInViewport(candleSection)) {
            triggerWaveAnimation();
        }
    }
    
    // New Arrivals animations removed to keep display stable
    
    // Add event listeners for favorites and cart buttons using data attributes
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Handle favorites button clicks
        if (target.closest('.add-to-favorites-btn')) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const button = target.closest('.add-to-favorites-btn');
            const candleId = button.getAttribute('data-candle-id');
            if (candleId) {
                toggleFavorite(candleId, event);
            }
            return false;
        }
        
        // Handle cart button clicks
        if (target.closest('.add-to-cart-btn')) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const button = target.closest('.add-to-cart-btn');
            const candleId = button.getAttribute('data-candle-id');
            if (candleId) {
                addToCart(candleId, event);
            }
            return false;
        }
    }, true);
});