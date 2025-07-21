/**
 * Boutique Me - Hotel Finder Application
 * Simplified, traveler-focused UX
 */

class HotelFinder {
    constructor() {
        this.hotels = [];
        this.filteredHotels = [];
        this.filters = {
            macroZone: '',
        };
        
        this.imageObserver = null;
        
        this.init();
    }

    async init() {
        try {
            this.cacheElements();
            this.setupImageObserver();
            await this.loadHotels();
            this.renderMacroZonas();
            this.setupEventListeners();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to initialize hotel finder:', error);
            this.elements.resultsCount.textContent = 'Error al cargar. Intenta de nuevo.';
        }
    }

    cacheElements() {
        this.elements = {
            resultsCount: document.getElementById('results-count'),
            hotelsGrid: document.getElementById('hotels-grid'),
            macroZonasGrid: document.getElementById('macro-zonas-grid'),
            emptyState: document.getElementById('empty-state'),
            modal: document.getElementById('hotel-modal'),
            modalBody: document.getElementById('modal-body'),
            modalClose: document.getElementById('modal-close')
        };
    }

    setupImageObserver() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '100px 0px', threshold: 0.01 });
        }
    }

    async loadHotels() {
        const response = await fetch('hotels.json');
        if (!response.ok) throw new Error('Failed to fetch hotels.json');
        this.hotels = await response.json();
        this.filteredHotels = [...this.hotels];
    }
    
    renderMacroZonas() {
        const zones = ['Todos', ...new Set(this.hotels.map(h => h.macroZone))];
        const grid = this.elements.macroZonasGrid;
        
        zones.forEach(zone => {
            const btn = document.createElement('button');
            btn.className = 'zona-btn';
            btn.textContent = zone;
            btn.dataset.zone = zone;
            if (zone === 'Todos') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                this.filters.macroZone = (zone === 'Todos') ? '' : zone;
                grid.querySelectorAll('.zona-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyFilters();
            });
            grid.appendChild(btn);
        });
    }

    setupEventListeners() {
        // Modal close
        this.elements.modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal on outside click
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.getAttribute('aria-hidden') === 'false') {
                this.closeModal();
            }
        });
    }

    applyFilters() {
        this.filteredHotels = this.hotels.filter(hotel => 
            (this.filters.macroZone ? hotel.macroZone === this.filters.macroZone : true)
        );
        this.renderHotels();
    }

    renderHotels() {
        const grid = this.elements.hotelsGrid;
        const count = this.filteredHotels.length;
        
        this.elements.resultsCount.textContent = `${count} ${count === 1 ? 'hotel encontrado' : 'hoteles encontrados'}`;
        grid.innerHTML = '';
        
        if (count === 0) {
            this.elements.emptyState.setAttribute('aria-hidden', 'false');
            return;
        }

        this.elements.emptyState.setAttribute('aria-hidden', 'true');
        const fragment = document.createDocumentFragment();
        
        this.filteredHotels.forEach(hotel => {
            fragment.appendChild(this.createHotelCard(hotel));
        });

        grid.appendChild(fragment);
    }

    createHotelCard(hotel) {
        const card = document.createElement('article');
        card.className = 'hotel-card';
        card.setAttribute('aria-labelledby', `hotel-name-${hotel.id}`);
        card.tabIndex = 0;
        
        card.innerHTML = `
            <div class="hotel-image">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3C/svg%3E" data-src="${hotel.image}" alt="${this.escapeHtml(hotel.name)}" loading="lazy">
            </div>
            <div class="hotel-content">
                <h3 id="hotel-name-${hotel.id}" class="hotel-name">${this.escapeHtml(hotel.name)}</h3>
                <p class="hotel-location">${this.escapeHtml(hotel.location)}</p>
                <p class="hotel-description">${this.escapeHtml(hotel.description).substring(0, 100)}...</p>
                <div class="hotel-footer">
                    <div class="hotel-price">
                        $${hotel.nightlyRate.toLocaleString()}
                        <span class="hotel-price-label">USD por noche</span>
                    </div>
                    <a href="mailto:info@boutique-me.cl?subject=Consulta de disponibilidad: ${encodeURIComponent(hotel.name)}&body=Hola, quisiera consultar la disponibilidad para el hotel ${encodeURIComponent(hotel.name)}." class="cta-button">Consultar disponibilidad</a>
                </div>
            </div>`;

        const img = card.querySelector('img[data-src]');
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            this.loadImage(img);
        }

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.cta-button')) {
                this.openModal(hotel);
            }
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openModal(hotel);
            }
        });

        return card;
    }

    openModal(hotel) {
        const stars = '★'.repeat(Math.round(hotel.rating)) + '☆'.repeat(5 - Math.round(hotel.rating));
        
        this.elements.modalBody.innerHTML = `
            <h2>${this.escapeHtml(hotel.name)}</h2>
            <img src="${hotel.image}" alt="${this.escapeHtml(hotel.name)}" style="width:100%; border-radius: var(--radius-md); margin-bottom: var(--space-md);">
            <p><strong>Ubicación:</strong> ${this.escapeHtml(hotel.location)}</p>
            <p>${this.escapeHtml(hotel.description)}</p>
            <p><strong>Lugares fantásticos cerca:</strong></p>
            <ul>
                ${hotel.nearbyAttractions.map(attr => `<li>${this.escapeHtml(attr)}</li>`).join('')}
            </ul>
            <p><strong>Precio:</strong> $${hotel.nightlyRate.toLocaleString()} USD por noche</p>
            <p><strong>Rating:</strong> ${stars} (${hotel.rating}/5)</p>
            <a href="mailto:info@boutique-me.cl?subject=Consulta de disponibilidad: ${encodeURIComponent(hotel.name)}&body=Hola, quisiera consultar la disponibilidad para el hotel ${encodeURIComponent(hotel.name)}." class="cta-button">Consultar disponibilidad</a>
        `;
        
        this.elements.modal.setAttribute('aria-hidden', 'false');
        this.elements.modalClose.focus();
    }

    closeModal() {
        this.elements.modal.setAttribute('aria-hidden', 'true');
    }

    loadImage(img) {
        if (!img || !img.dataset.src) return;
        img.src = img.dataset.src;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HotelFinder();
}); 