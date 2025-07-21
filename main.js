/**
 * Boutique Me - Hotel Finder Application
 * Vanilla ES6 JavaScript with debounced filtering, lazy loading, and accessibility
 */

class HotelFinder {
    constructor() {
        this.hotels = [];
        this.filteredHotels = [];
        this.filters = {
            search: '',
            region: '',
            maxPrice: 2500,
            amenities: new Set()
        };
        
        // Debounce timers
        this.searchDebounceTimer = null;
        this.filterDebounceTimer = null;
        
        // DOM elements
        this.elements = {};
        
        // Intersection Observer for lazy loading
        this.imageObserver = null;
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.cacheElements();
            this.setupImageObserver();
            await this.loadHotels();
            this.setupEventListeners();
            this.populateRegionFilter();
            this.populateAmenitiesFilter();
            this.renderDestinosPopulares();
            this.renderHotels();
        } catch (error) {
            console.error('Failed to initialize hotel finder:', error);
            this.showError('Error al cargar hoteles. Por favor recarga la página.');
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            searchInput: document.getElementById('search-input'),
            regionSelect: document.getElementById('region-select'),
            priceRange: document.getElementById('price-range'),
            priceValue: document.getElementById('price-value'),
            amenitiesContainer: document.getElementById('amenities-container'),
            resultsCount: document.getElementById('results-count'),
            hotelsGrid: document.getElementById('hotels-grid'),
            destinosGrid: document.getElementById('destinos-grid'),
            loading: document.getElementById('loading'),
            emptyState: document.getElementById('empty-state')
        };
    }

    /**
     * Set up Intersection Observer for lazy loading images
     */
    setupImageObserver() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    /**
     * Load and parse hotel data from JSON file
     */
    async loadHotels() {
        try {
            this.showLoading(true);
            const response = await fetch('hotels.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.hotels = await response.json();
            this.filteredHotels = [...this.hotels];
            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);
            throw error;
        }
    }

    /**
     * Set up all event listeners with accessibility support
     */
    setupEventListeners() {
        // Search input with debouncing
        this.elements.searchInput.addEventListener('input', (e) => {
            this.debounce(() => {
                this.filters.search = e.target.value.toLowerCase().trim();
                this.applyFilters();
            }, 300, 'search');
        });

        // Region filter
        this.elements.regionSelect.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.applyFilters();
        });

        // Price range filter
        this.elements.priceRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.filters.maxPrice = value;
            this.elements.priceValue.textContent = `$${value.toLocaleString()}`;
            
            this.debounce(() => {
                this.applyFilters();
            }, 150, 'filter');
        });

        // Keyboard navigation for price range
        this.elements.priceRange.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                setTimeout(() => {
                    const value = parseInt(e.target.value);
                    this.elements.priceValue.textContent = `$${value.toLocaleString()}`;
                }, 10);
            }
        });

        // Amenities filter delegation
        this.elements.amenitiesContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const amenity = e.target.value;
                if (e.target.checked) {
                    this.filters.amenities.add(amenity);
                } else {
                    this.filters.amenities.delete(amenity);
                }
                this.applyFilters();
            }
        });

        // Keyboard navigation for amenity checkboxes
        this.elements.amenitiesContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const checkbox = e.target.closest('.amenity-checkbox')?.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }

    /**
     * Debounce function to limit API calls and improve performance
     */
    debounce(func, delay, timerId) {
        const timer = timerId === 'search' ? 'searchDebounceTimer' : 'filterDebounceTimer';
        clearTimeout(this[timer]);
        this[timer] = setTimeout(func, delay);
    }

    /**
     * Populate region filter dropdown with unique regions
     */
    populateRegionFilter() {
        const regions = [...new Set(this.hotels.map(hotel => hotel.region))].sort();
        const fragment = document.createDocumentFragment();
        
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            fragment.appendChild(option);
        });
        
        this.elements.regionSelect.appendChild(fragment);
    }

    /**
     * Populate amenities filter with checkboxes
     */
    populateAmenitiesFilter() {
        const allAmenities = new Set();
        this.hotels.forEach(hotel => {
            hotel.amenities.forEach(amenity => allAmenities.add(amenity));
        });

        const sortedAmenities = [...allAmenities].sort();
        const fragment = document.createDocumentFragment();

        sortedAmenities.forEach(amenity => {
            const label = document.createElement('label');
            label.className = 'amenity-checkbox';
            label.tabIndex = 0;
            label.setAttribute('role', 'checkbox');
            label.setAttribute('aria-checked', 'false');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = amenity;
            checkbox.id = `amenity-${amenity}`;
            
            const span = document.createElement('span');
            span.className = 'amenity-label';
            span.textContent = this.formatAmenityName(amenity);
            
            // Update aria-checked when checkbox changes
            checkbox.addEventListener('change', () => {
                label.setAttribute('aria-checked', checkbox.checked.toString());
            });
            
            label.appendChild(checkbox);
            label.appendChild(span);
            fragment.appendChild(label);
        });

        this.elements.amenitiesContainer.appendChild(fragment);
    }

    /**
     * Render destinos populares section
     */
    renderDestinosPopulares() {
        const destinos = [...new Set(this.hotels.map(h => h.region))].sort();
        const grid = this.elements.destinosGrid;
        const fragment = document.createDocumentFragment();

        destinos.forEach(region => {
            const card = document.createElement('div');
            card.className = 'destino-card';
            card.tabIndex = 0;
            
            const regionHotels = this.hotels.filter(h => h.region === region);
            const sampleImage = regionHotels[0]?.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&crop=center&q=80';
            
            card.innerHTML = `
                <img src="${sampleImage}" alt="Vista de ${region}" loading="lazy">
                <h3>${this.escapeHtml(region)}</h3>
                <p>${regionHotels.length} hoteles boutique</p>
            `;
            
            card.addEventListener('click', () => {
                this.elements.regionSelect.value = region;
                this.filters.region = region;
                this.applyFilters();
            });
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
            
            fragment.appendChild(card);
        });

        grid.appendChild(fragment);
    }

    /**
     * Format amenity names for display
     */
    formatAmenityName(amenity) {
        const translations = {
            'spa': 'Spa',
            'restaurant': 'Restaurante',
            'wifi': 'WiFi',
            'pool': 'Piscina',
            'fitness': 'Gimnasio',
            'concierge': 'Concierge',
            'room-service': 'Servicio a la habitación',
            'excursions': 'Excursiones',
            'hiking': 'Senderismo',
            'wildlife-watching': 'Observación de fauna',
            'eco-tours': 'Ecoturismo',
            'hot-springs': 'Termas',
            'wine-tasting': 'Cata de vinos',
            'art-gallery': 'Galería de arte',
            'vineyard-tours': 'Tours de viñedos',
            'private-guide': 'Guía privado',
            '4wd-vehicle': 'Vehículo 4x4',
            'observatory': 'Observatorio',
            'astronomy-tours': 'Tours astronómicos',
            'library': 'Biblioteca',
            'uma-bar': 'Bar Uma',
            'horseback-riding': 'Cabalgatas',
            'kayaking': 'Kayak',
            'bird-watching': 'Observación de aves',
            'local-culture': 'Cultura local',
            'boat-tours': 'Tours en bote',
            'lake-activities': 'Actividades lacustres',
            'volcano-views': 'Vistas a volcanes'
        };
        
        return translations[amenity] || amenity
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Apply all active filters to the hotels data
     */
    applyFilters() {
        this.filteredHotels = this.hotels.filter(hotel => {
            // Search filter (name, location, description, attractions)
            if (this.filters.search) {
                const searchTerms = [
                    hotel.name.toLowerCase(),
                    hotel.location.toLowerCase(),
                    hotel.region.toLowerCase(),
                    hotel.description.toLowerCase(),
                    ...(hotel.nearbyAttractions || []).map(attr => attr.toLowerCase())
                ].join(' ');
                
                if (!searchTerms.includes(this.filters.search)) {
                    return false;
                }
            }

            // Region filter
            if (this.filters.region && hotel.region !== this.filters.region) {
                return false;
            }

            // Price filter
            if (hotel.nightlyRate > this.filters.maxPrice) {
                return false;
            }

            // Amenities filter
            if (this.filters.amenities.size > 0) {
                const hasAllAmenities = [...this.filters.amenities].every(
                    amenity => hotel.amenities.includes(amenity)
                );
                if (!hasAllAmenities) {
                    return false;
                }
            }

            return true;
        });

        this.renderHotels();
    }

    /**
     * Render hotels to the DOM with accessibility features
     */
    renderHotels() {
        const grid = this.elements.hotelsGrid;
        const count = this.filteredHotels.length;
        
        // Update results count
        const countText = count === 0 
            ? 'No se encontraron hoteles' 
            : count === 1 
                ? '1 hotel encontrado' 
                : `${count} hoteles encontrados`;
        this.elements.resultsCount.textContent = countText;

        // Show/hide empty state
        if (count === 0) {
            grid.innerHTML = '';
            this.showEmptyState(true);
            return;
        }

        this.showEmptyState(false);

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        this.filteredHotels.forEach((hotel, index) => {
            const hotelCard = this.createHotelCard(hotel, index);
            fragment.appendChild(hotelCard);
        });

        // Replace grid content
        grid.innerHTML = '';
        grid.appendChild(fragment);

        // Announce results to screen readers
        this.announceResults(count);
    }

    /**
     * Create a hotel card element with full accessibility support
     */
    createHotelCard(hotel, index) {
        const card = document.createElement('article');
        card.className = 'hotel-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `hotel-name-${hotel.id}`);
        card.tabIndex = 0;

        // Generate star rating for accessibility
        const stars = '★'.repeat(Math.floor(hotel.rating)) + '☆'.repeat(5 - Math.floor(hotel.rating));
        const ratingText = `${hotel.rating} de 5 estrellas`;

        card.innerHTML = `
            <div class="hotel-image">
                <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f0f2f5'/%3E%3C/svg%3E"
                    data-src="${hotel.image}" 
                    alt="${hotel.name} - ${hotel.location}"
                    loading="lazy"
                    width="800"
                    height="600"
                >
                <div class="hotel-rating" aria-label="${ratingText}">
                    <span aria-hidden="true">${stars}</span>
                    <span class="visually-hidden">${ratingText}</span>
                </div>
            </div>
            <div class="hotel-content">
                <h3 id="hotel-name-${hotel.id}" class="hotel-name">${this.escapeHtml(hotel.name)}</h3>
                <p class="hotel-location">
                    <span aria-label="Ubicación">📍</span>
                    ${this.escapeHtml(hotel.location)}
                </p>
                <p class="hotel-description">${this.escapeHtml(hotel.description)}</p>
                <div class="hotel-amenities" role="list" aria-label="Amenidades del hotel">
                    ${hotel.amenities.slice(0, 5).map(amenity => 
                        `<span class="amenity-tag" role="listitem">${this.escapeHtml(this.formatAmenityName(amenity))}</span>`
                    ).join('')}
                    ${hotel.amenities.length > 5 ? `<span class="amenity-tag">+${hotel.amenities.length - 5} más</span>` : ''}
                </div>
                ${hotel.nearbyAttractions ? `
                <div class="hotel-attractions">
                    <h4>Lugares fantásticos cerca:</h4>
                    <ul>
                        ${hotel.nearbyAttractions.map(attr => `<li>${this.escapeHtml(attr)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                <div class="hotel-footer">
                    <div class="hotel-price">
                        $${hotel.nightlyRate.toLocaleString()}
                        <span class="hotel-price-label">por noche</span>
                    </div>
                    <div class="hotel-rooms" aria-label="Número de habitaciones">
                        ${hotel.rooms} habitaciones
                    </div>
                </div>
            </div>
        `;

        // Set up lazy loading for the image
        const img = card.querySelector('img[data-src]');
        if (this.imageObserver && img) {
            this.imageObserver.observe(img);
        } else {
            // Fallback for browsers without Intersection Observer
            this.loadImage(img);
        }

        // Add keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Could trigger modal or navigation to hotel details
                this.handleHotelSelection(hotel);
            }
        });

        card.addEventListener('click', () => {
            this.handleHotelSelection(hotel);
        });

        return card;
    }

    /**
     * Load image with error handling and accessibility
     */
    loadImage(img) {
        if (!img || !img.dataset.src) return;

        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = tempImg.src;
            img.classList.add('loaded');
        };
        tempImg.onerror = () => {
            // Fallback to a placeholder or default image
            img.alt = `${img.alt} (Imagen no disponible)`;
            img.style.backgroundColor = '#f0f2f5';
        };
        tempImg.src = img.dataset.src;
    }

    /**
     * Handle hotel selection (placeholder for future functionality)
     */
    handleHotelSelection(hotel) {
        console.log('Hotel seleccionado:', hotel.name);
        // Could implement modal, navigation, or booking functionality
        // For now, could open booking.com or similar
        // window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`, '_blank');
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show/hide loading state with accessibility
     */
    showLoading(show) {
        this.elements.loading.setAttribute('aria-hidden', (!show).toString());
        if (show) {
            this.elements.loading.focus();
        }
    }

    /**
     * Show/hide empty state with accessibility
     */
    showEmptyState(show) {
        this.elements.emptyState.setAttribute('aria-hidden', (!show).toString());
    }

    /**
     * Show error message to user
     */
    showError(message) {
        this.elements.resultsCount.textContent = message;
        this.elements.resultsCount.setAttribute('role', 'alert');
        this.elements.resultsCount.style.color = 'var(--color-accent)';
    }

    /**
     * Announce results to screen readers
     */
    announceResults(count) {
        const announcement = count === 0 
            ? 'No hay hoteles que coincidan con tus filtros actuales' 
            : count === 1 
                ? 'Se encontró 1 hotel que coincide con tus filtros' 
                : `Se encontraron ${count} hoteles que coinciden con tus filtros`;
        
        // Create temporary element for screen reader announcement
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        announcer.textContent = announcement;
        
        document.body.appendChild(announcer);
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }

    /**
     * Get current filter state for analytics or persistence
     */
    getFilterState() {
        return {
            search: this.filters.search,
            region: this.filters.region,
            maxPrice: this.filters.maxPrice,
            amenities: Array.from(this.filters.amenities),
            resultCount: this.filteredHotels.length
        };
    }

    /**
     * Reset all filters to default state
     */
    resetFilters() {
        this.filters = {
            search: '',
            region: '',
            maxPrice: 2500,
            amenities: new Set()
        };
        
        // Reset form elements
        this.elements.searchInput.value = '';
        this.elements.regionSelect.value = '';
        this.elements.priceRange.value = '2500';
        this.elements.priceValue.textContent = '$2,500';
        
        // Reset amenity checkboxes
        const checkboxes = this.elements.amenitiesContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.amenity-checkbox').setAttribute('aria-checked', 'false');
        });
        
        this.applyFilters();
    }
}

/**
 * Utility functions for performance monitoring and debugging
 */
class PerformanceMonitor {
    static measurePageLoad() {
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
            
            console.log(`Tiempo de carga de página: ${loadTime}ms`);
            
            // Monitor for Web Vitals if needed
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log(`${entry.name}: ${entry.value}`);
                    });
                });
                
                try {
                    observer.observe({entryTypes: ['largest-contentful-paint', 'first-input']});
                } catch (e) {
                    // Fallback for older browsers
                }
            }
        });
    }

    static measureFilterPerformance(callback) {
        const start = performance.now();
        callback();
        const end = performance.now();
        console.log(`Operación de filtrado tomó ${end - start} milisegundos`);
    }
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize performance monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        PerformanceMonitor.measurePageLoad();
    }
    
    // Initialize the main application
    const hotelFinder = new HotelFinder();
    
    // Make it available globally for debugging
    window.hotelFinder = hotelFinder;
    
    // Add service worker registration for PWA capabilities (optional)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrado:', registration))
            .catch(error => console.log('Registro de SW falló:', error));
    }
});

/**
 * Export for module systems (if needed)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HotelFinder, PerformanceMonitor };
} 