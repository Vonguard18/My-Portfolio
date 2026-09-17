# Portfolio Improvement Plan

## Already Completed (this session)
- XSS fix in lightbox error handler
- Font loading optimization
- Mobile nav fix (Services link no longer hidden)
- Bug fix: UGC AD prev/next (missing `currentGallery = gallery` assignment)
- Scroll reveal animations (Intersection Observer)
- Focus management (visible rings, focus return on lightbox close)
- Preloader with progress bar
- SEO: OG tags, Twitter card, favicon, JSON-LD structured data
- Number count-up animation on proof stats
- 3D tilt effect on album cards
- Product Edit card styled like other lightboxes (slideshow + white text + overlay)

## Phase 1 — High Priority (Next 1-2 days)

### 1. Anchor Scroll Offset
Add `scroll-margin-top` to all sections to account for the fixed header:
```css
section[id], .hero { scroll-margin-top: 120px; }
@media (max-width: 700px) { section[id], .hero { scroll-margin-top: 80px; } }
```

### 2. Mobile Menu Toggle
Add a hamburger button that toggles a full-screen nav menu on mobile.
**Files:** `index.html` (add button), `styles.css` (toggle styles), `script.js` (toggle logic)

### 3. Image srcset
Add `srcset` with 1x/2x variants for gallery images for high-DPI screens.

### 4. Focus Trap in Lightbox
Trap focus within the lightbox when open — cycle Tab through available controls.

## Phase 2 — Medium Priority (1-2 weeks)

### 5. Dark Mode Toggle
Add a sun/moon toggle stored in `localStorage`. Use CSS `data-theme` attribute.

### 6. Back-to-Top Button
Floating button that appears on scroll.

### 7. Before/After Comparison Slider
Replace static before/after with an interactive drag slider.

### 8. Service Worker
Tiny SW (~2KB) for offline asset caching.

## Phase 3 — Low Priority (Future)

### 9. Contact Form
Add a form via Gmail or Whatsapp

### 10. Case Study Pages
Deep-dive into 1-2 featured projects with problem/solution/results.

### 11. Custom Cursor
Subtle circle cursor that scales on hover.

### 12. Gallery Filter
Filter buttons (Ads, Video, Product, UGC) that show/hide album items.

## Phase 4 — Major Redesign (If scaling)

### 13. Migrate to Astro
Static site generation with built-in image optimization.

### 14. Headless CMS
Contentful or Sanity for easy content updates.

### 15. WebGL Hero
Subtle WebGL background (Three.js/OGL).

### 16. Page Transitions
View Transitions API or GSAP + Swup for smooth navigation.

### 17. Performance Budget
Add build step with CSSNano, ImageOptim, Lighthouse CI.

## Tools Decision
**Keep vanilla JS/CSS.** Do NOT add:
- Tailwind (too heavy for a 3-file site)
- GSAP (existing CSS animations are sufficient)
- Icon libraries (↗↓←× symbols already work)

Add libraries ONLY if a specific feature requires them.
