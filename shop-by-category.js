// Shop By Category Section JavaScript

function renderShopByCategorySection() {
    console.log('Rendering Shop By Category Section');
    return `
        <section class="container py-8" id="shop-by-category-section">
            <h2 class="section-title">Shop By Category</h2>
            <div class="category-grid">
                <div class="category-card" onclick="document.getElementById('candle-collection-section').scrollIntoView({behavior: 'smooth'})">
                    <div class="category-image">
                        <img src="candles_images/Scented Floating Daisy Candles.jpg" alt="Floral Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Floral Candles</h3>
                        <p class="category-description">Discover our collection of beautiful floral-scented candles</p>
                        <a href="#candle-collection-section" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="document.getElementById('candle-collection-section').scrollIntoView({behavior: 'smooth'})">
                    <div class="category-image">
                        <img src="candles_images/IMG_20250610_202641.jpg" alt="Vanilla Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Vanilla Candles</h3>
                        <p class="category-description">Explore our warm and comforting vanilla-scented candles</p>
                        <a href="#candle-collection-section" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="document.getElementById('candle-collection-section').scrollIntoView({behavior: 'smooth'})">
                    <div class="category-image">
                        <img src="candles_images/Lavender Marble Jar Candle.jpg" alt="Lavender Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Lavender Candles</h3>
                        <p class="category-description">Relax with our soothing lavender-scented candles</p>
                        <a href="#candle-collection-section" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="document.getElementById('candle-collection-section').scrollIntoView({behavior: 'smooth'})">
                    <div class="category-image">
                        <img src="candles_images/Rose Heart Jar Candle.jpg" alt="Rose Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Rose Candles</h3>
                        <p class="category-description">Indulge in our romantic rose-scented candles</p>
                        <a href="#candle-collection-section" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Export the function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderShopByCategorySection };
}