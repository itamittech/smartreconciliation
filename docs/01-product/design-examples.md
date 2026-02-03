# Design Examples - Smart Reconciliation

Practical examples demonstrating the brand guidelines and design system in action.

---

## Hero Section Example

### Design Concept
Modern, professional hero section with subtle dot pattern background, gradient accents, and clear call-to-action hierarchy.

### HTML Structure

```html
<section class="hero">
  <!-- Background Pattern -->
  <div class="hero__background" aria-hidden="true"></div>

  <!-- Gradient Accent (Innovation) -->
  <div class="hero__gradient" aria-hidden="true"></div>

  <!-- Content -->
  <div class="hero__container container">
    <!-- Badge (Optional) -->
    <div class="hero__badge">
      <svg class="hero__badge-icon" aria-hidden="true">
        <!-- AI icon -->
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span>AI-Powered Reconciliation</span>
    </div>

    <!-- Main Content -->
    <h1 class="hero__title">
      Smart Reconciliation Made
      <span class="hero__title-accent">Simple</span>
    </h1>

    <p class="hero__description">
      Automate your financial data matching with intelligent AI algorithms.
      Reduce manual work by 90% and improve accuracy with confidence scoring.
    </p>

    <!-- Call to Actions -->
    <div class="hero__actions">
      <button class="button button--primary button--lg">
        <span>Get Started Free</span>
        <svg class="button__icon" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <button class="button button--secondary button--lg">
        <svg class="button__icon" aria-hidden="true">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Watch Demo</span>
      </button>
    </div>

    <!-- Trust Indicators -->
    <div class="hero__trust">
      <p class="hero__trust-text">Trusted by finance teams at</p>
      <div class="hero__logos" aria-label="Partner company logos">
        <!-- Logo placeholders -->
      </div>
    </div>
  </div>
</section>
```

### CSS Implementation

```css
/* ============================================
   Hero Section
   ============================================ */

.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-neutral-0);
  padding: var(--spacing-fluid-lg) 0;
}

/* Background Pattern (from brand guidelines) */
.hero__background {
  position: absolute;
  inset: 0;
  background-image: var(--pattern-dots);
  background-size: var(--pattern-dots-size);
  opacity: 0.4;
  z-index: 0;
}

/* Gradient Accent (Innovation Enhancement) */
.hero__gradient {
  position: absolute;
  inset: 0;
  background: var(--gradient-hero);
  z-index: 1;
  opacity: 0.6;
}

/* Container */
.hero__container {
  position: relative;
  z-index: 2;
  max-width: var(--container-lg);
  text-align: center;
  padding: 0 var(--container-padding);
}

/* Badge */
.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  border-radius: 2rem;
  color: var(--color-brand-700);
  font-size: var(--font-size-body-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-6);
  animation: fadeInUp 600ms var(--ease-out) backwards;
}

.hero__badge-icon {
  width: 1rem;
  height: 1rem;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

/* Title */
.hero__title {
  font-size: var(--font-size-display);
  line-height: var(--line-height-display);
  letter-spacing: var(--letter-spacing-display);
  font-weight: 700;
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-6);
  animation: fadeInUp 600ms 100ms var(--ease-out) backwards;
}

.hero__title-accent {
  display: block;
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Description */
.hero__description {
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-body-lg);
  color: var(--color-neutral-600);
  max-width: var(--max-line-length-wide);
  margin: 0 auto var(--spacing-8);
  animation: fadeInUp 600ms 200ms var(--ease-out) backwards;
}

/* Actions */
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  justify-content: center;
  margin-bottom: var(--spacing-12);
  animation: fadeInUp 600ms 300ms var(--ease-out) backwards;
}

/* Trust Indicators */
.hero__trust {
  animation: fadeInUp 600ms 400ms var(--ease-out) backwards;
}

.hero__trust-text {
  font-size: var(--font-size-body-sm);
  color: var(--color-neutral-500);
  margin-bottom: var(--spacing-4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.hero__logos {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
  justify-content: center;
  align-items: center;
  opacity: 0.6;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: var(--spacing-16) 0;
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__actions .button {
    width: 100%;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Button Component Example

### Design Concept
Versatile button system with multiple variants, sizes, and states. Includes subtle animations and accessibility features.

### TypeScript Component

```typescript
// Button.tsx
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Button content */
  children: React.ReactNode;

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Button type */
  type?: 'button' | 'submit' | 'reset';

  /** Full width */
  fullWidth?: boolean;

  /** Icon position */
  iconPosition?: 'left' | 'right';

  /** Accessible label (if icon-only) */
  ariaLabel?: string;

  /** Additional CSS classes */
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  iconPosition = 'right',
  ariaLabel,
  className = '',
}) => {
  const classNames = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth && styles['button--full-width'],
    loading && styles['button--loading'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && (
        <span className={styles.button__spinner} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="60"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </span>
      )}
      <span className={styles.button__content}>{children}</span>
    </button>
  );
};

Button.displayName = 'Button';
```

### CSS Module

```css
/* Button.module.css */

/* ============================================
   Base Button Styles
   ============================================ */

.button {
  /* Reset */
  appearance: none;
  border: none;
  background: none;
  font-family: inherit;
  cursor: pointer;

  /* Base Styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  font-weight: 600;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;

  border-radius: 0.5rem;
  transition: all var(--duration-fast) var(--ease-default);

  /* Focus State */
  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }

  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

/* ============================================
   Size Variants
   ============================================ */

.button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.75rem;
}

.button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3.5rem;
}

/* ============================================
   Style Variants
   ============================================ */

/* Primary Button */
.button--primary {
  background: var(--color-brand-500);
  color: white;
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: var(--color-brand-600);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
}

/* Secondary Button */
.button--secondary {
  background: white;
  color: var(--color-brand-600);
  border: 2px solid var(--color-brand-200);
  box-shadow: var(--shadow-xs);

  &:hover:not(:disabled) {
    background: var(--color-brand-50);
    border-color: var(--color-brand-300);
    box-shadow: var(--shadow-sm);
  }

  &:active:not(:disabled) {
    background: var(--color-brand-100);
  }
}

/* Ghost Button */
.button--ghost {
  background: transparent;
  color: var(--color-neutral-700);

  &:hover:not(:disabled) {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
  }

  &:active:not(:disabled) {
    background: var(--color-neutral-200);
  }
}

/* Danger Button */
.button--danger {
  background: var(--color-error-500);
  color: white;
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: var(--color-error-600);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
}

/* ============================================
   Loading State
   ============================================ */

.button--loading {
  pointer-events: none;
}

.button__spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1.25em;
  height: 1.25em;

  svg {
    width: 100%;
    height: 100%;
  }
}

.button--loading .button__content {
  opacity: 0;
}

/* ============================================
   Icon Button
   ============================================ */

.button__icon {
  width: 1.25em;
  height: 1.25em;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

/* ============================================
   Full Width
   ============================================ */

.button--full-width {
  width: 100%;
}

/* ============================================
   Responsive Adjustments
   ============================================ */

@media (max-width: 768px) {
  .button--lg {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
  }
}

/* ============================================
   Reduced Motion
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button:hover {
    transform: none;
  }
}
```

### Usage Examples

```typescript
// Basic Usage
<Button>Click Me</Button>

// Primary CTA
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary Action
<Button variant="secondary">
  Learn More
</Button>

// With Icon
<Button variant="primary">
  <span>Continue</span>
  <ArrowRightIcon className="button__icon" />
</Button>

// Loading State
<Button loading={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>

// Disabled
<Button disabled>
  Not Available
</Button>

// Full Width (Mobile)
<Button fullWidth variant="primary">
  Sign Up
</Button>

// Danger Action
<Button variant="danger">
  Delete Account
</Button>
```

---

## Card Component Example

### Design Concept
Flexible card component for displaying features, statistics, or content blocks. Includes hover effects and optional interactive states.

### HTML Structure

```html
<article class="card card--elevated card--interactive">
  <!-- Optional Badge -->
  <div class="card__badge card__badge--success">
    <span class="card__badge-dot"></span>
    <span>Active</span>
  </div>

  <!-- Icon -->
  <div class="card__icon">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2"/>
    </svg>
  </div>

  <!-- Content -->
  <div class="card__content">
    <h3 class="card__title">Intelligent Matching</h3>
    <p class="card__description">
      AI-powered algorithms automatically match transactions with
      confidence scoring and exception handling.
    </p>
  </div>

  <!-- Optional Footer -->
  <div class="card__footer">
    <a href="#" class="card__link">
      Learn more
      <svg class="card__link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"/>
      </svg>
    </a>
  </div>
</article>
```

### CSS Implementation

```css
/* ============================================
   Card Component
   ============================================ */

.card {
  position: relative;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.75rem;
  padding: var(--spacing-6);
  transition: all var(--duration-normal) var(--ease-default);
}

/* Elevated Variant */
.card--elevated {
  box-shadow: var(--shadow-sm);
}

/* Interactive Variant */
.card--interactive {
  cursor: pointer;

  &:hover {
    border-color: var(--color-brand-300);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
}

/* Badge */
.card__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: var(--font-size-caption);
  font-weight: 600;
  margin-bottom: var(--spacing-4);
}

.card__badge--success {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.card__badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s ease-in-out infinite;
}

/* Icon */
.card__icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-50);
  border-radius: 0.75rem;
  color: var(--color-brand-600);
  margin-bottom: var(--spacing-4);
  transition: all var(--duration-fast) var(--ease-default);
}

.card--interactive:hover .card__icon {
  background: var(--color-brand-100);
  transform: scale(1.05);
}

.card__icon svg {
  width: 1.5rem;
  height: 1.5rem;
  stroke: currentColor;
  stroke-width: 2;
}

/* Content */
.card__content {
  margin-bottom: var(--spacing-4);
}

.card__title {
  font-size: var(--font-size-h4);
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: var(--spacing-3);
}

.card__description {
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  color: var(--color-neutral-600);
}

/* Footer */
.card__footer {
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-neutral-200);
}

.card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-brand-600);
  font-weight: 600;
  font-size: var(--font-size-body-sm);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.card__link:hover {
  color: var(--color-brand-700);
}

.card__link-icon {
  width: 1rem;
  height: 1rem;
  transition: transform var(--duration-fast) var(--ease-default);
}

.card__link:hover .card__link-icon {
  transform: translateX(2px);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Grid Layout for Multiple Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Color Usage Examples

### Semantic Color Applications

```css
/* Success State */
.alert--success {
  background: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-800);
}

/* Warning State */
.alert--warning {
  background: var(--color-warning-50);
  border-color: var(--color-warning-200);
  color: var(--color-warning-800);
}

/* Error State */
.alert--error {
  background: var(--color-error-50);
  border-color: var(--color-error-200);
  color: var(--color-error-800);
}

/* Info State */
.alert--info {
  background: var(--color-info-50);
  border-color: var(--color-info-200);
  color: var(--color-info-800);
}

/* AI Feature Highlight (Using Accent Purple) */
.feature--ai {
  background: linear-gradient(135deg, var(--color-brand-50), var(--color-accent-50));
  border: 1px solid var(--color-accent-200);
}
```

---

## Next Steps

1. **Implement Core Components**: Start with Button, Card, Input
2. **Create Layout System**: Container, Grid, Responsive utilities
3. **Build Page Templates**: Landing, Dashboard, Auth pages
4. **Add Interactions**: Hover states, animations, transitions
5. **Test Accessibility**: Keyboard navigation, screen readers
6. **Optimize Performance**: Bundle size, load times, animations

---

**These examples demonstrate the brand guidelines in action. Use `/website-design` to generate more components and layouts!**
