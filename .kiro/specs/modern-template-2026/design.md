# Design Document: Modern Template 2026

## Overview

Dokumen ini menjelaskan arsitektur dan implementasi untuk modernisasi seluruh template aplikasi FiveM Tools V7. Design mengikuti style forum yang sudah diterapkan dengan fokus pada glass morphism, smooth animations, responsive layout, dan consistent styling. Implementasi menggunakan React/Next.js dengan Tailwind CSS dan Framer Motion.

## Architecture

### Component Hierarchy

```
App
├── Layout (app/layout.tsx)
│   ├── ModernNavbar
│   ├── Main Content
│   │   ├── Page Components
│   │   │   ├── PageHeader
│   │   │   ├── StatsGrid
│   │   │   ├── ContentGrid
│   │   │   │   ├── ModernCard
│   │   │   │   ├── ListItem
│   │   │   │   └── EmptyState
│   │   │   └── Sidebar
│   │   │       └── SidebarCard
│   │   └── LoadingState
│   └── ModernFooter
```

### Style System Architecture

```
styles/
├── globals.css (base styles, CSS variables)
├── glass.css (glass morphism utilities)
└── animations.css (animation keyframes)

Tailwind Config
├── colors (primary, accent, muted, etc.)
├── borderRadius (xl, 2xl)
├── boxShadow (glow effects)
└── animation (custom animations)
```

## Components and Interfaces

### 1. ModernCard Component

```typescript
interface ModernCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  value?: string | number
  trend?: "up" | "down" | "neutral"
  className?: string
  onClick?: () => void
  children?: React.ReactNode
  variant?: "default" | "stat" | "feature"
  colorScheme?: "primary" | "blue" | "amber" | "green" | "purple"
}
```

**Implementation Pattern:**
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  whileTap={{ scale: 0.98 }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Card className="glass card-hover border-{color}/20 overflow-hidden group relative">
    <div className="absolute inset-0 bg-gradient-to-br from-{color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardContent className="relative z-10">
      {/* Content */}
    </CardContent>
    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </Card>
</motion.div>
```

### 2. PageHeader Component

```typescript
interface PageHeaderProps {
  title: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  actions?: React.ReactNode
}
```

**Implementation Pattern:**
```tsx
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
  <div className="flex items-center gap-4">
    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
      <Icon className="h-7 w-7 text-primary-foreground" />
    </div>
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  <div className="flex items-center gap-3">
    {actions}
  </div>
</div>
```

### 3. StatsGrid Component

```typescript
interface StatItem {
  label: string
  value: string | number
  icon: LucideIcon
  color: "primary" | "blue" | "amber" | "green" | "purple"
  trend?: "up" | "down"
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
}
```

**Implementation Pattern:**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-{columns} gap-4 mb-8">
  {stats.map((stat, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass border-{stat.color}/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-{stat.color}/20 flex items-center justify-center">
            <stat.icon className="h-6 w-6 text-{stat.color}" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ))}
</div>
```

### 4. ListItem Component

```typescript
interface ListItemProps {
  title: string
  subtitle?: string
  avatar?: string
  metadata?: { icon: LucideIcon; value: string | number }[]
  href?: string
  onClick?: () => void
  badge?: { label: string; variant: "default" | "secondary" | "destructive" }
  isPinned?: boolean
}
```

**Implementation Pattern:**
```tsx
<Link href={href}>
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4 transition-all hover:bg-secondary/40 group"
  >
    <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0">
      <img src={avatar} className="h-full w-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
        {title}
      </h3>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        {subtitle}
      </div>
    </div>
    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
      {metadata?.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <item.icon className="h-4 w-4" />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  </motion.div>
</Link>
```

### 5. EmptyState Component

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}
```

**Implementation Pattern:**
```tsx
<div className="text-center py-12">
  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
    <Icon className="h-8 w-8 text-primary" />
  </div>
  <p className="text-muted-foreground mb-4">{title}</p>
  {description && (
    <p className="text-xs text-muted-foreground/70 mb-4">{description}</p>
  )}
  {action && (
    <Button className="gap-2 bg-gradient-to-r from-primary to-pink-600">
      {action.label}
    </Button>
  )}
</div>
```

### 6. LoadingState Component

```typescript
interface LoadingStateProps {
  variant: "card" | "list" | "grid" | "page"
  count?: number
}
```

**Implementation Pattern:**
```tsx
<div className="animate-pulse space-y-4">
  {variant === "card" && (
    <div className="h-32 bg-muted/50 rounded-xl" />
  )}
  {variant === "list" && (
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-xl bg-secondary/20 p-4">
        <div className="h-11 w-11 rounded-full bg-secondary/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-secondary/50 rounded" />
          <div className="h-3 w-1/3 bg-secondary/50 rounded" />
        </div>
      </div>
    ))
  )}
</div>
```

### 7. SidebarCard Component

```typescript
interface SidebarCardProps {
  title: string
  children: React.ReactNode
}
```

**Implementation Pattern:**
```tsx
<Card className="bg-card rounded-2xl">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {children}
  </CardContent>
</Card>
```

## Data Models

### Style Configuration

```typescript
interface StyleConfig {
  colors: {
    primary: string
    accent: string
    success: string
    warning: string
    error: string
    muted: string
  }
  spacing: {
    container: string
    gap: string
    padding: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    "2xl": string
  }
  animation: {
    duration: number
    easing: string
  }
}
```

### Component Variants

```typescript
type CardVariant = "default" | "stat" | "feature" | "glass"
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline"
type ColorScheme = "primary" | "blue" | "amber" | "green" | "purple" | "red"
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Glass Morphism Consistency

*For any* Card component rendered in the application, it SHALL have the glass morphism classes applied including `backdrop-blur` effect and semi-transparent background.

**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: Card Animation Props

*For any* ModernCard component, it SHALL have Framer Motion animation props with `initial`, `animate`, and `whileHover` defined correctly.

**Validates: Requirements 2.1, 2.5**

### Property 3: Responsive Grid Classes

*For any* grid container in the application, it SHALL have responsive breakpoint classes following the pattern `grid-cols-{n} md:grid-cols-{m} lg:grid-cols-{k}`.

**Validates: Requirements 3.1, 3.2**

### Property 4: Icon Container Pattern

*For any* icon displayed in a stat card or header, it SHALL be wrapped in a container with `rounded-xl bg-{color}/20 flex items-center justify-center` pattern.

**Validates: Requirements 5.1, 9.1**

### Property 5: Button Gradient and Glow

*For any* primary action button, it SHALL have gradient background classes and glow effect class applied.

**Validates: Requirements 6.1, 6.2**

### Property 6: Loading Skeleton Animation

*For any* loading skeleton element, it SHALL have `animate-pulse` class and appropriate background color class.

**Validates: Requirements 7.1, 7.2**

### Property 7: Empty State Structure

*For any* empty state component, it SHALL have centered layout with icon, message text, and optional action button.

**Validates: Requirements 8.1, 8.2, 8.4**

### Property 8: List Item Hover State

*For any* list item component, hovering SHALL change the background color from `bg-secondary/20` to `bg-secondary/40` or similar transition.

**Validates: Requirements 11.1, 11.2**

### Property 9: Text Truncation

*For any* title or long text in list items and cards, it SHALL have `truncate` class to prevent overflow.

**Validates: Requirements 4.5, 11.4**

### Property 10: Color Scheme Consistency

*For any* component using color scheme, it SHALL use the correct color for its purpose: amber for coins/premium, green for success/free, red for errors.

**Validates: Requirements 14.3, 14.4, 14.5**

## Error Handling

### Component Error Boundaries

```typescript
// Wrap major sections with error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <PageContent />
</ErrorBoundary>
```

### Image Loading Errors

```typescript
// Handle image loading failures gracefully
<img
  src={imageUrl}
  onError={(e) => {
    e.currentTarget.src = '/placeholder.svg'
  }}
  className="..."
/>
```

### Animation Performance

```typescript
// Reduce animations on low-performance devices
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const animationProps = prefersReducedMotion 
  ? {} 
  : { whileHover: { scale: 1.02 } }
```

## Testing Strategy

### Unit Tests

Unit tests akan memverifikasi:
- Component rendering dengan props yang berbeda
- CSS class application yang benar
- Event handler functionality
- Conditional rendering logic

### Property-Based Tests

Property-based tests menggunakan **fast-check** library untuk TypeScript/JavaScript:

```typescript
import fc from 'fast-check'

// Property 1: Glass Morphism Consistency
describe('Glass Morphism Consistency', () => {
  it('all cards should have glass morphism classes', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          variant: fc.constantFrom('default', 'stat', 'feature')
        }),
        (props) => {
          const { container } = render(<ModernCard {...props} />)
          const card = container.querySelector('.glass')
          expect(card).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Visual Regression Tests

- Snapshot testing untuk component styling
- Cross-browser testing untuk consistency
- Responsive testing untuk different viewports

### Test Configuration

- Minimum 100 iterations per property test
- Each test tagged with: **Feature: modern-template-2026, Property {number}: {property_text}**
- Use React Testing Library untuk component testing
- Use fast-check untuk property-based testing
