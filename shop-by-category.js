// Shop By Category Section JavaScript

function renderShopByCategorySection() {
    return `
        <section class="container py-8" id="shop-by-category-section">
            <h2 class="section-title">Shop By Category</h2>
            <div class="category-grid">
                <div class="category-card" onclick="window.location.href='category.html?type=floral'">
                    <div class="category-image">
                        <img src="Comming Soon.jpg" alt="Floral Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Floral Candles</h3>
                        <p class="category-description">Discover our collection of beautiful floral-scented candles</p>
                        <a href="category.html?type=floral" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="window.location.href='category.html?type=vanilla'">
                    <div class="category-image">
                        <img src="Comming Soon.jpg" alt="Vanilla Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Vanilla Candles</h3>
                        <p class="category-description">Explore our warm and comforting vanilla-scented candles</p>
                        <a href="category.html?type=vanilla" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="window.location.href='category.html?type=lavender'">
                    <div class="category-image">
                        <img src="Comming Soon.jpg" alt="Lavender Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Lavender Candles</h3>
                        <p class="category-description">Relax with our soothing lavender-scented candles</p>
                        <a href="category.html?type=lavender" class="shop-now-btn">Shop Now</a>
                    </div>
                </div>
                
                <div class="category-card" onclick="window.location.href='category.html?type=rose'">
                    <div class="category-image">
                        <img src="Comming Soon.jpg" alt="Rose Candles" loading="lazy" decoding="async">
                    </div>
                    <div class="category-info">
                        <h3>Rose Candles</h3>
                        <p class="category-description">Indulge in our romantic rose-scented candles</p>
                        <a href="category.html?type=rose" class="shop-now-btn">Shop Now</a>
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