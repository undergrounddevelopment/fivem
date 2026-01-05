# Requirements Document

## Introduction

Modernisasi seluruh template aplikasi FiveM Tools V7 agar konsisten dengan style forum yang sudah diterapkan. Fokus pada design modern 2026 yang ringan, responsif, dan profesional tanpa terlihat dibuat oleh AI. Semua template harus menggunakan glass morphism, gradient effects, smooth animations, dan consistent spacing.

## Glossary

- **Template_System**: Sistem komponen UI yang mencakup semua halaman dan komponen dalam aplikasi
- **Glass_Morphism**: Efek visual dengan background transparan blur dan border subtle
- **Modern_Card**: Komponen card dengan hover effects, gradient overlays, dan smooth transitions
- **Responsive_Layout**: Layout yang otomatis menyesuaikan di semua ukuran layar (mobile, tablet, desktop)
- **Animation_System**: Sistem animasi menggunakan Framer Motion untuk transisi halus
- **Color_System**: Sistem warna konsisten dengan primary, accent, muted, dan gradient colors
- **Typography_System**: Sistem tipografi dengan font weights, sizes, dan line heights yang konsisten

## Requirements

### Requirement 1: Consistent Glass Morphism Style

**User Story:** As a user, I want all pages to have consistent glass morphism styling, so that the application looks modern and cohesive.

#### Acceptance Criteria

1. THE Template_System SHALL apply glass morphism effect to all Card components using `backdrop-blur-xl` and `bg-white/5` or `bg-card`
2. THE Template_System SHALL use consistent border styling with `border-white/10` or `border-primary/20` for subtle separation
3. WHEN a Card component is hovered, THE Template_System SHALL display subtle glow effect using gradient overlays
4. THE Template_System SHALL maintain consistent shadow styling using `shadow-lg shadow-black/5` for depth

### Requirement 2: Modern Card Components

**User Story:** As a user, I want cards to have modern hover effects and animations, so that interactions feel smooth and responsive.

#### Acceptance Criteria

1. WHEN a user hovers over a card, THE Modern_Card SHALL scale slightly using `whileHover={{ scale: 1.02, y: -5 }}`
2. THE Modern_Card SHALL include shimmer effect overlay that appears on hover
3. THE Modern_Card SHALL use rounded corners with `rounded-xl` or `rounded-2xl` consistently
4. WHEN displaying statistics, THE Modern_Card SHALL show icon in colored background container with `rounded-xl` shape
5. THE Modern_Card SHALL animate on mount using `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`

### Requirement 3: Responsive Grid Layout

**User Story:** As a user, I want the layout to work perfectly on all devices, so that I can use the application on mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE Responsive_Layout SHALL use CSS Grid with responsive breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` or `lg:grid-cols-4`
2. THE Responsive_Layout SHALL maintain consistent gap spacing using `gap-4` or `gap-6`
3. THE Responsive_Layout SHALL use container with `mx-auto px-4 sm:px-6 lg:px-8` for proper padding
4. WHEN on mobile devices, THE Responsive_Layout SHALL stack elements vertically with appropriate spacing
5. THE Responsive_Layout SHALL hide non-essential elements on mobile using `hidden sm:flex` or `hidden md:block`

### Requirement 4: Typography and Text Styling

**User Story:** As a user, I want text to be readable and visually appealing, so that content is easy to consume.

#### Acceptance Criteria

1. THE Typography_System SHALL use gradient text for headings using `gradient-text` class or `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`
2. THE Typography_System SHALL use `text-muted-foreground` for secondary text consistently
3. THE Typography_System SHALL apply `font-bold` or `font-semibold` for emphasis appropriately
4. THE Typography_System SHALL use consistent text sizes: `text-3xl` or `text-4xl` for main headings, `text-lg` for subheadings, `text-sm` for body text
5. THE Typography_System SHALL truncate long text using `truncate` class to prevent overflow

### Requirement 5: Icon and Badge Styling

**User Story:** As a user, I want icons and badges to be visually consistent, so that the interface looks professional.

#### Acceptance Criteria

1. THE Template_System SHALL display icons in colored background containers using pattern: `h-10 w-10 rounded-xl bg-{color}/20 flex items-center justify-center`
2. THE Template_System SHALL use Lucide icons consistently with sizes `h-4 w-4`, `h-5 w-5`, or `h-6 w-6`
3. THE Template_System SHALL style badges with subtle backgrounds using `bg-{color}/20 text-{color} border-{color}/30`
4. WHEN displaying status badges, THE Template_System SHALL use appropriate colors: green for success, amber for warning, red for error

### Requirement 6: Button Styling

**User Story:** As a user, I want buttons to be visually appealing and provide feedback, so that I know when I can interact with them.

#### Acceptance Criteria

1. THE Template_System SHALL style primary buttons with gradient background using `bg-gradient-to-r from-primary to-pink-600` or `from-primary to-accent`
2. THE Template_System SHALL add glow effect to primary buttons using `glow-sm` class
3. WHEN a button is hovered, THE Template_System SHALL apply scale animation using `whileHover={{ scale: 1.05 }}`
4. THE Template_System SHALL use `glass-hover` class for ghost/outline buttons
5. THE Template_System SHALL include icons in buttons with consistent gap using `gap-2`

### Requirement 7: Loading States

**User Story:** As a user, I want to see loading indicators while content loads, so that I know the application is working.

#### Acceptance Criteria

1. WHEN content is loading, THE Template_System SHALL display skeleton placeholders with `animate-pulse` effect
2. THE Template_System SHALL use `bg-muted/50` or `bg-secondary/50` for skeleton backgrounds
3. THE Template_System SHALL match skeleton shapes to actual content layout
4. WHEN loading completes, THE Template_System SHALL animate content in smoothly using Framer Motion

### Requirement 8: Empty States

**User Story:** As a user, I want to see helpful empty states when there's no content, so that I understand what to do next.

#### Acceptance Criteria

1. WHEN no content is available, THE Template_System SHALL display centered icon with `text-muted-foreground/50` styling
2. THE Template_System SHALL show descriptive message explaining the empty state
3. THE Template_System SHALL provide action button when applicable (e.g., "Create first item")
4. THE Template_System SHALL use consistent padding `py-8` or `py-12` for empty state containers

### Requirement 9: Page Header Styling

**User Story:** As a user, I want page headers to be visually distinct and informative, so that I know where I am in the application.

#### Acceptance Criteria

1. THE Template_System SHALL display page headers with icon in gradient background container
2. THE Template_System SHALL show page title using `text-3xl font-bold` or `text-4xl font-bold`
3. THE Template_System SHALL include subtitle/description using `text-muted-foreground`
4. THE Template_System SHALL align header content with `flex items-center gap-4` pattern
5. WHEN actions are available, THE Template_System SHALL display action buttons on the right side of header

### Requirement 10: Sidebar and Stats Panels

**User Story:** As a user, I want sidebar panels to display information clearly, so that I can quickly see important statistics.

#### Acceptance Criteria

1. THE Template_System SHALL style sidebar cards with `bg-card rounded-2xl p-6` pattern
2. THE Template_System SHALL display stats with label and value using `flex justify-between items-center` layout
3. THE Template_System SHALL use `text-sm text-muted-foreground` for stat labels
4. THE Template_System SHALL use `font-semibold` for stat values
5. THE Template_System SHALL add `space-y-3` for consistent vertical spacing between stat items

### Requirement 11: List Item Styling

**User Story:** As a user, I want list items to be interactive and visually appealing, so that I can easily browse content.

#### Acceptance Criteria

1. THE Template_System SHALL style list items with `rounded-xl bg-secondary/20 p-4` pattern
2. WHEN a list item is hovered, THE Template_System SHALL change background to `bg-secondary/40` or `bg-primary/10`
3. THE Template_System SHALL display avatar/thumbnail with `rounded-full` or `rounded-lg` and consistent size
4. THE Template_System SHALL truncate long titles using `truncate` class
5. THE Template_System SHALL show metadata (author, date, stats) using `text-xs text-muted-foreground`

### Requirement 12: Form Input Styling

**User Story:** As a user, I want form inputs to be easy to use and visually consistent, so that I can enter information efficiently.

#### Acceptance Criteria

1. THE Template_System SHALL style inputs with glass morphism effect using existing Input component
2. THE Template_System SHALL display search inputs with icon using `relative` container and `absolute left-3` icon positioning
3. THE Template_System SHALL add `pl-10` padding to inputs with left icons
4. WHEN input is focused, THE Template_System SHALL show subtle border highlight

### Requirement 13: Animation Consistency

**User Story:** As a user, I want animations to be smooth and consistent, so that the application feels polished.

#### Acceptance Criteria

1. THE Animation_System SHALL use Framer Motion for all page and component animations
2. THE Animation_System SHALL apply staggered animations for list items using `transition={{ delay: index * 0.05 }}`
3. THE Animation_System SHALL use consistent duration of `0.3s` or `0.5s` for transitions
4. THE Animation_System SHALL apply `transition-all` class for CSS transitions
5. IF animation causes performance issues, THEN THE Animation_System SHALL reduce or disable animations

### Requirement 14: Color Consistency

**User Story:** As a user, I want colors to be consistent throughout the application, so that the design feels unified.

#### Acceptance Criteria

1. THE Color_System SHALL use CSS variables for colors: `var(--primary)`, `var(--text)`, `var(--textDim)`
2. THE Color_System SHALL apply primary color for main actions and highlights
3. THE Color_System SHALL use amber/yellow for coins and premium features
4. THE Color_System SHALL use green for success states and free items
5. THE Color_System SHALL use red/destructive for errors and warnings
6. THE Color_System SHALL use purple for special features and ratings

### Requirement 15: Background Effects

**User Story:** As a user, I want subtle background effects that enhance the visual appeal without being distracting.

#### Acceptance Criteria

1. THE Template_System SHALL include blur orb backgrounds using `blur-orb` class with low opacity (0.2-0.3)
2. THE Template_System SHALL position blur orbs at different locations using absolute positioning
3. THE Template_System SHALL ensure content has `relative z-10` to appear above background effects
4. THE Template_System SHALL NOT use excessive background effects that impact performance
