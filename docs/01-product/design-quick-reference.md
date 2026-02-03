# Design Quick Reference

Fast lookup for common design values and patterns used in Smart Reconciliation.

---

## Colors

### Primary Actions
```css
--color-brand-500: #4D65FF;  /* Primary buttons, links */
--color-brand-600: #3D4FE0;  /* Hover states */
```

### AI/Innovation Features
```css
--color-accent-500: #7E51FF;  /* AI highlights, secondary CTAs */
```

### Status Colors
```css
--color-success-500: #10B981;  /* ✓ Success messages */
--color-warning-500: #F59E0B;  /* ⚠ Warnings */
--color-error-500: #EF4444;    /* ✗ Errors */
--color-info-500: #06B6D4;     /* ℹ Info messages */
```

### Text & Surfaces
```css
--color-neutral-900: #171717;  /* Headings */
--color-neutral-600: #525252;  /* Body text */
--color-neutral-400: #A3A3A3;  /* Subtle text */
--color-neutral-100: #F5F5F5;  /* Light backgrounds */
```

---

## Typography

### Font Sizes (Responsive)
```css
/* Display (Hero titles): 40-72px */
font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);

/* H1 (Main headings): 32-56px */
font-size: clamp(2rem, 4vw + 0.5rem, 3.5rem);

/* H2 (Section headings): 28-44px */
font-size: clamp(1.75rem, 3vw + 0.5rem, 2.75rem);

/* Body (Regular text): 16px */
font-size: 1rem;

/* Small (Helper text): 14px */
font-size: 0.875rem;
```

### Font Weights
```css
font-weight: 400;  /* Regular - body text */
font-weight: 500;  /* Medium - subheadings */
font-weight: 600;  /* SemiBold - headings, labels */
font-weight: 700;  /* Bold - primary headings */
```

---

## Spacing

### Common Gaps
```css
gap: 0.5rem;   /* 8px - Tight */
gap: 1rem;     /* 16px - Normal */
gap: 1.5rem;   /* 24px - Comfortable */
gap: 2rem;     /* 32px - Spacious */
```

### Padding
```css
padding: 0.75rem 1.5rem;  /* Buttons (md) */
padding: 1rem 2rem;       /* Buttons (lg) */
padding: 1.5rem;          /* Cards (24px) */
padding: 2rem;            /* Sections (32px) */
```

### Section Spacing
```css
margin-bottom: 3rem;   /* 48px - Between sections */
margin-bottom: 6rem;   /* 96px - Between major sections */
```

---

## Components

### Button Classes
```html
<!-- Primary CTA -->
<button class="button button--primary button--lg">
  Get Started
</button>

<!-- Secondary -->
<button class="button button--secondary button--md">
  Learn More
</button>

<!-- Ghost -->
<button class="button button--ghost button--sm">
  Cancel
</button>
```

### Card Pattern
```html
<article class="card card--elevated card--interactive">
  <div class="card__icon"><!-- Icon --></div>
  <h3 class="card__title">Title</h3>
  <p class="card__description">Description</p>
  <a href="#" class="card__link">Link →</a>
</article>
```

### Input with Label
```html
<div class="form-field">
  <label for="email" class="form-field__label">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    class="form-field__input"
    placeholder="you@example.com"
  />
  <span class="form-field__hint">
    We'll never share your email
  </span>
</div>
```

---

## Shadows

### Quick Reference
```css
box-shadow: var(--shadow-xs);   /* Subtle - cards */
box-shadow: var(--shadow-sm);   /* Small - buttons */
box-shadow: var(--shadow-md);   /* Medium - dropdowns */
box-shadow: var(--shadow-lg);   /* Large - modals */
box-shadow: var(--shadow-brand); /* Colored - brand elements */
```

---

## Border Radius

```css
border-radius: 0.25rem;  /* 4px - Small (badges) */
border-radius: 0.5rem;   /* 8px - Normal (buttons, inputs) */
border-radius: 0.75rem;  /* 12px - Medium (cards) */
border-radius: 1rem;     /* 16px - Large (sections) */
border-radius: 9999px;   /* Full - Pills, avatars */
```

---

## Transitions

### Standard Durations
```css
transition: all 150ms ease;  /* Fast - hover states */
transition: all 200ms ease;  /* Normal - buttons */
transition: all 300ms ease;  /* Medium - modals */
transition: all 500ms ease;  /* Slow - page transitions */
```

### Easing Functions
```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);  /* Standard */
--ease-out: cubic-bezier(0, 0, 0.2, 1);        /* Decelerate */
--ease-in: cubic-bezier(0.4, 0, 1, 1);         /* Accelerate */
```

---

## Grid Layouts

### 3-Column Feature Grid
```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

### 2-Column Content + Sidebar
```css
.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
```

---

## Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm - tablets */ }
@media (min-width: 768px) { /* md - landscape tablets */ }
@media (min-width: 1024px) { /* lg - laptops */ }
@media (min-width: 1280px) { /* xl - desktops */ }
```

---

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Skip Link
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

---

## Common Patterns

### Container
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
}
```

### Centered Content
```css
.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
```

### Loading Spinner
```html
<div class="spinner" role="status" aria-label="Loading">
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
  </svg>
</div>
```

---

## Animation Best Practices

### Performance
```css
/* GPU-accelerated properties only */
transform: translateY(-2px);  /* ✓ Good */
opacity: 0.8;                 /* ✓ Good */
top: -2px;                    /* ✗ Avoid */
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Gradient Examples

### Primary Brand Gradient
```css
background: linear-gradient(135deg, #4D65FF 0%, #7E51FF 100%);
```

### Subtle Background
```css
background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FF 100%);
```

### Text Gradient
```css
background: linear-gradient(135deg, #4D65FF, #7E51FF);
background-clip: text;
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Icon Sizing

```css
.icon-sm { width: 1rem; height: 1rem; }     /* 16px */
.icon-md { width: 1.25rem; height: 1.25rem; } /* 20px */
.icon-lg { width: 1.5rem; height: 1.5rem; }   /* 24px */
.icon-xl { width: 2rem; height: 2rem; }       /* 32px */
```

---

## Utility Classes

### Margin/Padding
```css
.m-0 { margin: 0; }
.mt-4 { margin-top: 1rem; }
.p-6 { padding: 1.5rem; }
```

### Flexbox
```css
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: 1rem; }
```

### Typography
```css
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.font-semibold { font-weight: 600; }
.text-center { text-align: center; }
```

---

## Z-Index Scale

```css
--z-dropdown: 1000;
--z-sticky: 1010;
--z-modal-backdrop: 1020;
--z-modal: 1030;
--z-tooltip: 1040;
```

---

**For complete details, see:**
- 📘 Full Brand Guidelines: `docs/01-product/brand-guidelines.md`
- 🎨 Design Examples: `docs/01-product/design-examples.md`
- 🛠️ Skill Documentation: `.claude/skills/README.md`

**To use the design skill:**
```
/website-design [your design request]
```
