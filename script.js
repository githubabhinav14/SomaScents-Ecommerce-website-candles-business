// Common image URL that serves as a placeholder (to be replaced by you)
const placeholderImageUrl = 'Comming Soon.jpg';
const blankPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';

// DOM content loaded event handler
document.addEventListener('DOMContentLoaded', function() {
    // Images are now loaded directly with src attribute
    // No need for lazy loading initialization
});


// Cart functionality - declare cart variable globally
let cart = JSON.parse(localStorage.getItem('glowhaven_cart')) || [];

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
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    });
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toastContainer.style.display = 'block';
    setTimeout(() => {
        toastContainer.style.display = 'none';
    }, 2000);
}

function fadeTransition(callback) {
    const appRoot = document.getElementById('app-root');
    const spinner = document.getElementById('loading-spinner');
    appRoot.classList.add('fade-out');
    spinner.classList.add('active');
    setTimeout(() => {
        callback();
        appRoot.classList.remove('fade-out');
        appRoot.classList.add('fade-in');
        spinner.classList.remove('active');
        // Initialize lazy loading after page transition
        initLazyLoading();
    }, 500);
}

// Images are now loaded directly with src attribute
// Lazy loading is handled by the browser's native loading="lazy" attribute

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => link.classList.remove('active'));
    let activeLinkId;
    switch (currentPage) {
        case 'home-and-list':
            activeLinkId = scrollToSection ? `nav-${scrollToSection.split('-')[0]}` : 'nav-home';
            break;
        case 'detail':
            activeLinkId = 'nav-candles';
            break;
    }
    const activeLink = document.getElementById(activeLinkId);
    if (activeLink) activeLink.classList.add('active');
}

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
                    <img src="candles_images/Peony Jar Candle.jpg" alt="Hero Candle" style="width:100%;height:100%;object-fit:contain;border-radius:0.75rem;" fetchpriority="high" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                </div>
            </div>
            <div class="scroll-indicator">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                Scroll
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
                    const isInCart = cart.some(item => item.id === candle.id);
                    const favorites = JSON.parse(localStorage.getItem('glowhaven_favorites')) || [];
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
                                <p class="candle-description">${candle.description}</p>
                                <p class="candle-scent"><strong>Scent:</strong> ${candle.scent}</p>
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
                        {name:'Khushpreet Kaur', quote:"Its fragrance so good 😊.", stars:5},
                        {name:'Rohit', quote:"Great packaging and fast delivery.", stars:5},
                        {name:'Meera', quote:"Scent fills the room without being overpowering.", stars:5},
                        {name:'Aarav', quote:"Perfect gifts. Everyone loved them!", stars:5}
                    ].map(t => `
                        <div class="testimonial-card">
                            <div class="testimonial-rating">${'★'.repeat(t.stars)}</div>
                            <p class="testimonial-quote">${t.quote}</p>
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
                    <svg class="center-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 110-6 3 3 0 010 6z"></path></svg>
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
                        <p><a href="mailto:somascents@gmail.com">somascents@gmail.com</a></p>
                    </div>
                    <div class="contact-item">
                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.774a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74A1 1 0 0118 16.847V17a1 1 0 01-1 1H3a1 1 0 01-1-1V3z"></path></svg>
                        <p>+91 8919847675</p>
                    </div>
                    <div class="contact-item">
                        <svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                        <p>Mehdipatnam</p>
                    </div>
                    <div class="map-placeholder">
                        <img src="https://placehold.co/400x250/E0E7FF/3F51B5?text=Map+Goes+Here" alt="Map Location">
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
    // Trigger best seller animation if in view
    triggerBestSellersAnimation();
    triggerCandleCollectionAnimation();

    // Testimonial carousel is now handled in deferred-scripts.js
    // This prevents conflicts between multiple carousel implementations
}

// Function to show candle detail (for quick view)
function showCandleDetail(id) {
    navigateTo('detail', id);
    // Ensure detail opens from top
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
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

    appRoot.innerHTML = `
        <section class="container py-8">
            <div class="candle-detail">
                <div class="candle-detail-image-wrapper">
                    <img src="${candle.image}" alt="${candle.name}" onerror="this.onerror=null;this.src='${placeholderImageUrl}';">
                </div>
                <div class="candle-detail-content">
                    <h2>${candle.name}</h2>
                    <p class="price">₹${candle.price.toFixed(2)}</p>
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
                        <button class="button button-secondary" id="back-to-candles-btn">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path></svg>
                            Back to Candles
                        </button>
                    </div>
                </div>
            </div>
        </section>
    `;

    // Changed to navigate to candles section specifically
    document.getElementById('back-to-candles-btn').addEventListener('click', () => navigateTo('home-and-list', null, 'candle-collection-section'));
    // Add to cart button on detail page
    const addBtn = document.getElementById('add-to-cart-detail-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addToCart(id, null);
            addBtn.textContent = 'Added to Cart';
        });
    }
    // Scroll to top after rendering detail
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
} 

// Event listeners for navigation
document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    const homeEl = document.getElementById('home-section');
    if (homeEl) { homeEl.scrollIntoView({ behavior: 'auto' }); }
});

document.getElementById('nav-candles').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('candle-collection-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('nav-about').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('about-section-link').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('nav-contact').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('contact-section-link').scrollIntoView({ behavior: 'smooth' });
});

// Initialize the page on load
document.addEventListener('DOMContentLoaded', () => {
    // Only update current-year-footer as 'current-year' ID doesn't exist in HTML
    const currentYearFooter = document.getElementById('current-year-footer');
    if (currentYearFooter) {
        currentYearFooter.textContent = new Date().getFullYear();
    }
    renderPage();
    // Ensure we scroll to the top of the home section on initial load/reload
    document.getElementById('home-section').scrollIntoView({ behavior: 'smooth' });
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

// WhatsApp button logic
const whatsappBtn = document.getElementById('whatsapp-btn');
whatsappBtn.addEventListener('click', () => {
    const phoneNumber = '+918985665850'; // Replace with your actual WhatsApp number
    const message = 'Hi! I\'m interested in your candles. Can you help me?';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});

// Instagram button logic
const instagramBtn = document.getElementById('instagram-btn');
instagramBtn.addEventListener('click', () => {
    const instagramUrl = 'https://www.instagram.com/somascents_?igsh=Nmx2enA0eXZ4enRm'; // SomaScents Instagram handle
    window.open(instagramUrl, '_blank');
});

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
    
    const existingItem = cart.find(item => item.id === candleId);
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
    let favorites = JSON.parse(localStorage.getItem('glowhaven_favorites')) || [];
    const isFavorite = favorites.includes(candleId);
    
    if (isFavorite) {
        favorites = favorites.filter(id => id !== candleId);
        showToast('💔 Removed from favorites!');
    } else {
        favorites.push(candleId);
        showToast('❤️ Added to favorites!');
    }
    
    localStorage.setItem('glowhaven_favorites', JSON.stringify(favorites));
    updateFavoriteButtonState(candleId);
}

// Update cart button state
function updateCartButtonState(candleId) {
    const cartBtn = document.querySelector(`[data-candle-id="${candleId}"].add-to-cart-btn`);
    if (cartBtn) {
        const isInCart = cart.some(item => item.id === candleId);
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
    const favoriteBtn = document.querySelector(`[data-candle-id="${candleId}"].add-to-favorites-btn`);
    if (favoriteBtn) {
        const favorites = JSON.parse(localStorage.getItem('glowhaven_favorites')) || [];
        const isFavorite = favorites.includes(candleId);
        
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
    }
}

// Initialize button states
function initializeButtonStates() {
    candlesData.forEach(candle => {
        updateCartButtonState(candle.id);
        updateFavoriteButtonState(candle.id);
    });
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
    localStorage.setItem('glowhaven_cart', JSON.stringify(cart));
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

    const storeName = 'SomaScents';
    const phoneNumber = '+918985665850'; // WhatsApp number

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalOriginal = cart.reduce((sum, item) => sum + ((item.originalPrice || item.price) * item.quantity), 0);
    const totalSavings = Math.max(0, totalOriginal - subtotal);

    const lines = [];
    const canIncludeImages = window.location.protocol.startsWith('http');
    lines.push(`Hello ${storeName} 👋`);
    lines.push('');
    lines.push('*I would like to place an order:*');
    lines.push('');
    cart.forEach((item, idx) => {
        const lineTotal = item.price * item.quantity;
        const unit = `₹${item.price}`;
        lines.push(`${idx + 1}. *${item.name}*  x${item.quantity}  —  ₹${lineTotal} (${unit} each)`);
        if (canIncludeImages) {
            try {
                const imageUrl = new URL(item.image, window.location.href).href;
                if (imageUrl.startsWith('http')) {
                    lines.push(imageUrl);
                }
            } catch (e) { /* ignore */ }
        }
    });
    lines.push('');
    if (totalSavings > 0) {
        lines.push(`Savings: *₹${totalSavings}*`);
    }
    lines.push(`Total: *₹${subtotal}*`);
    lines.push('');
    lines.push('*Customer details (please fill):*');
    lines.push('Name:');
    lines.push('Address:');
    lines.push('Phone:');
    lines.push('Notes:');

    const message = lines.join('\n');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
        const isInCart = cart.some(item => item.id === candle.id);
        const favorites = JSON.parse(localStorage.getItem('glowhaven_favorites')) || [];
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
                    <p class="candle-description">${candle.description}</p>
                    <p class="candle-scent"><strong>Scent:</strong> ${candle.scent}</p>
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