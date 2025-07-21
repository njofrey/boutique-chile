# Boutique Chile - Hotel Finder

A high-performance, static hotel finder for luxury boutique accommodations across Chile. Built with vanilla HTML, CSS, and JavaScript focusing on accessibility, performance, and user experience.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with 1/2/3 column layouts
- **Advanced Filtering**: Debounced search, region, price, amenities, and availability filters
- **Performance Optimized**: Lazy loading images, <150KB total assets, Lighthouse ≥90 mobile score
- **Accessibility First**: WCAG AA compliant with full keyboard navigation and screen reader support
- **Modern UX**: Smooth transitions, subtle animations, intuitive interface

## 📁 Project Structure

```
Boutique-me/
├── index.html          # Main HTML file (semantic, SEO-ready)
├── styles.css          # Mobile-first CSS with design system
├── main.js            # Vanilla ES6 JavaScript application
├── hotels.json        # Hotel data with 7 boutique properties
├── fonts/             # Self-hosted WOFF2 fonts directory
│   ├── inter-regular.woff2      # Inter font (to be added)
│   └── space-grotesk-medium.woff2 # Space Grotesk font (to be added)
└── README.md          # This documentation
```

## 🎨 Design System

### Colors
- **Primary**: #1a1a1a (text)
- **Accent**: #B45309 (brand orange)
- **Background**: #ffffff (main), #f8f9fa (alternate)
- **Contrast Ratio**: AAA compliant (minimum 4.5:1)

### Typography
- **Primary**: Inter (body text, UI elements)
- **Headings**: Space Grotesk (headings, logo)
- **Loading**: System font fallbacks for performance

## 🏨 Adding New Hotels

To add hotels to the finder, edit `hotels.json` with this structure:

```json
{
  "id": "unique-hotel-id",
  "name": "Hotel Name",
  "region": "Geographic Region",
  "location": "City, Specific Area",
  "nightlyRate": 450,
  "currency": "USD",
  "rating": 5,
  "image": "https://optimized-image-url.jpg",
  "amenities": ["spa", "restaurant", "wifi", "pool"],
  "availableDates": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "description": "Hotel description for SEO and user experience",
  "rooms": 20,
  "checkIn": "15:00",
  "checkOut": "12:00"
}
```

### Hotel Data Guidelines

1. **Images**: Use 800x600px images, optimized for web (WebP preferred, JPEG fallback)
2. **Amenities**: Use consistent naming (kebab-case): `spa`, `wifi`, `room-service`, `wine-tasting`
3. **Regions**: Keep consistent for filter functionality
4. **Descriptions**: 1-2 sentences, SEO-friendly with location keywords
5. **Prices**: Use whole numbers in USD for consistency

## 🖼️ Image Optimization

### Image Requirements
- **Dimensions**: 800x600px (4:3 aspect ratio)
- **Format**: WebP with JPEG fallback
- **Quality**: 80% compression for optimal balance
- **Size**: Target <50KB per image

### Optimization Tools
```bash
# Using ImageMagick for batch optimization
magick input.jpg -resize 800x600^ -gravity center -extent 800x600 -quality 80 output.jpg

# Using cwebp for WebP conversion
cwebp -q 80 input.jpg -o output.webp
```

### CDN Integration
For production, use a CDN like Cloudinary or ImageKit:
```javascript
// Example Cloudinary URL with automatic optimization
const imageUrl = `https://res.cloudinary.com/your-account/image/fetch/w_800,h_600,c_fill,f_auto,q_auto/${originalUrl}`;
```

## 🔤 Font Setup

Download and add these WOFF2 fonts to the `fonts/` directory:

1. **Inter Regular (400)**: `fonts/inter-regular.woff2`
2. **Space Grotesk Medium (500)**: `fonts/space-grotesk-medium.woff2`

### Font Sources
- [Inter](https://fonts.google.com/specimen/Inter) - Download and convert to WOFF2
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) - Download and convert to WOFF2

### Font Conversion
```bash
# Using woff2_compress tool
woff2_compress input.ttf
```

## 📈 Performance Optimization

### Current Optimizations
- Intersection Observer for lazy loading
- CSS custom properties for consistency
- Debounced search and filtering
- Minimal DOM manipulation
- Preloaded critical fonts

### Performance Budget
- **Total Assets**: <150KB
- **Critical Path**: <25KB (above-the-fold CSS)
- **JavaScript**: <30KB (gzipped)
- **Images**: Lazy loaded, optimized
- **Lighthouse Score**: ≥90 mobile

### Monitoring
Performance monitoring is built into the JavaScript for development:
```javascript
// Available in browser console during development
hotelFinder.getFilterState(); // Current filter performance
```

## ♿ Accessibility Features

### WCAG AA Compliance
- **Keyboard Navigation**: Full site accessible via keyboard
- **Screen Readers**: ARIA labels, roles, and live regions
- **Color Contrast**: AA compliant (4.5:1 minimum)
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Testing Tools
```bash
# Lighthouse accessibility audit
lighthouse https://your-domain.com --only-categories=accessibility

# axe-core testing (browser extension)
# WAVE testing (web accessibility evaluation tool)
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Vercel Configuration** (`vercel.json`):
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       },
       {
         "source": "/(.*).html",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=3600"
           }
         ]
       }
     ]
   }
   ```

### Netlify Deployment

1. **Drag and drop** the project folder to [Netlify Deploy](https://app.netlify.com/drop)
2. **Custom Headers** (`_headers`):
   ```
   /*
     Cache-Control: public, max-age=31536000
   /*.html
     Cache-Control: public, max-age=3600
   ```

### GitHub Pages

1. **Repository Settings** → **Pages** → **Deploy from branch**
2. **Custom Domain**: Configure CNAME for custom domain
3. **HTTPS**: Enable force HTTPS in settings

## 🔧 Development

### Local Development
```bash
# Simple HTTP server (Python)
python3 -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or using Live Server (VS Code extension)
```

### Browser Support
- **Modern**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features**: ES6+, CSS Grid, Intersection Observer
- **Fallbacks**: Built-in for older browsers

### Performance Testing
```bash
# Lighthouse CI for automated testing
npm install -g @lhci/cli
lhci autorun --upload.target=filesystem --upload.outputDir=./lighthouse-results
```

## 📊 Analytics Integration

Add analytics to track user behavior:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Custom Events
```javascript
// Track filter usage
gtag('event', 'filter_used', {
  'filter_type': 'region',
  'filter_value': 'Patagonia'
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Fonts Not Loading**: Verify WOFF2 files are in `/fonts/` directory
2. **Images Not Loading**: Check CORS headers for external images
3. **Filters Not Working**: Verify JSON structure matches expected format
4. **Performance Issues**: Use browser DevTools Performance tab

### Debug Mode
Open browser console and access:
```javascript
// Application instance
window.hotelFinder

// Current filter state
window.hotelFinder.getFilterState()

// Reset all filters
window.hotelFinder.resetFilters()
```

## 📝 License

MIT License - Feel free to modify and distribute.

---

**Performance Target**: Lighthouse ≥90 mobile, <150KB total assets
**Accessibility**: WCAG AA compliant
**Browser Support**: Modern browsers (90%+ coverage) 