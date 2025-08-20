// Deferred non-critical JavaScript functions

// Testimonial carousel functionality
function initTestimonialCarousel() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.getElementById('testimonials-prev');
    const nextBtn = document.getElementById('testimonials-next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    // Get all testimonial cards
    const testimonials = track.querySelectorAll('.testimonial-card');
    if (testimonials.length === 0) return;
    
    // Set up variables for carousel
    let position = 0;
    const testimonialWidth = testimonials[0].offsetWidth + 20; // width + margin
    const visibleCards = window.innerWidth > 900 ? 3 : 1;
    const maxPosition = Math.max(0, (testimonials.length - visibleCards) * testimonialWidth);
    
    // Initially show first 3 testimonials
    track.style.transform = `translateX(0px)`;
    
    // Update navigation button states
    function updateButtonStates() {
        prevBtn.disabled = position <= 0;
        nextBtn.disabled = position >= maxPosition;
        prevBtn.style.opacity = position <= 0 ? '0.5' : '1';
        nextBtn.style.opacity = position >= maxPosition ? '0.5' : '1';
    }
    
    // Initialize button states
    updateButtonStates();
    
    // Previous button click handler
    prevBtn.addEventListener('click', () => {
        position = Math.max(position - testimonialWidth, 0);
        track.style.transform = `translateX(-${position}px)`;
        updateButtonStates();
    });
    
    // Next button click handler
    nextBtn.addEventListener('click', () => {
        position = Math.min(position + testimonialWidth, maxPosition);
        track.style.transform = `translateX(-${position}px)`;
        updateButtonStates();
    });
    
    // Add swipe support for mobile
    let touchStartX = null;
    
    track.addEventListener('touchstart', (e) => { 
        touchStartX = e.changedTouches[0].screenX; 
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        
        if (Math.abs(dx) > 40) {
            if (dx > 0 && position > 0) {
                // Swipe right - go to previous
                position = Math.max(position - testimonialWidth, 0);
            } else if (dx < 0 && position < maxPosition) {
                // Swipe left - go to next
                position = Math.min(position + testimonialWidth, maxPosition);
            }
            track.style.transform = `translateX(-${position}px)`;
            updateButtonStates();
        }
        touchStartX = null;
    }, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Recalculate dimensions
        const newVisibleCards = window.innerWidth > 900 ? 3 : 1;
        const newTestimonialWidth = testimonials[0].offsetWidth + 20;
        const newMaxPosition = Math.max(0, (testimonials.length - newVisibleCards) * newTestimonialWidth);
        
        // Adjust position if needed
        position = Math.min(position, newMaxPosition);
        track.style.transform = `translateX(-${position}px)`;
        updateButtonStates();
    });
}

// Initialize button states
function initializeButtonStates() {
    // Add to favorites functionality
    document.querySelectorAll('.add-to-favorites-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const candleId = this.dataset.candleId;
            toggleFavorite(candleId, this);
        });
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const candleId = this.dataset.candleId;
            addToCart(candleId, this);
        });
    });
}

// Load deferred functions when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonial carousel with a slight delay
    setTimeout(() => {
        initTestimonialCarousel();
    }, 1000);
});

// Load deferred functions when page is fully loaded
window.addEventListener('load', function() {
    // Initialize button states if not already done
    if (!document.querySelector('.add-to-favorites-btn.initialized')) {
        initializeButtonStates();
    }
});