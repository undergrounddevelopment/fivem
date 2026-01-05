# Implementation Plan: Modern Template 2026

## Overview

Implementasi modernisasi template mengikuti style forum yang sudah diterapkan. Fokus pada konsistensi glass morphism, animations, responsive layout, dan styling yang profesional. Semua perubahan dilakukan secara incremental tanpa merusak fungsionalitas yang ada.

## Tasks

- [x] 1. Setup base style utilities dan CSS variables
  - [x] 1.1 Update globals.css dengan glass morphism utilities
    - Tambahkan `.glass` class dengan backdrop-blur dan background
    - Tambahkan `.card-hover` class untuk hover effects
    - Tambahkan `.shimmer` class untuk shimmer effect
    - Tambahkan `.glow-sm` class untuk glow effect
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Update Tailwind config dengan custom colors dan animations
    - Pastikan color variables tersedia
    - Tambahkan custom animation keyframes jika belum ada
    - _Requirements: 14.1, 14.2_

- [x] 2. Create reusable modern components
  - [x] 2.1 Create/Update ModernCard component
    - Implement glass morphism styling
    - Add Framer Motion animations (whileHover, initial, animate)
    - Add shimmer overlay effect
    - Add gradient hover overlay
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.5_

  - [x] 2.2 Write property test for ModernCard glass morphism
    - **Property 1: Glass Morphism Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.4**

  - [x] 2.3 Create PageHeader component
    - Implement icon in gradient container
    - Add title and subtitle styling
    - Add responsive layout for actions
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 2.4 Create StatsGrid component
    - Implement responsive grid layout
    - Add colored icon containers
    - Add staggered animations
    - _Requirements: 3.1, 3.2, 5.1_

  - [x] 2.5 Write property test for icon container pattern
    - **Property 4: Icon Container Pattern**
    - **Validates: Requirements 5.1, 9.1**

  - [x] 2.6 Create ListItem component
    - Implement hover state transitions
    - Add avatar/thumbnail styling
    - Add metadata display
    - Add text truncation
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 2.7 Write property test for list item hover state
    - **Property 8: List Item Hover State**
    - **Validates: Requirements 11.1, 11.2**

  - [x] 2.8 Create EmptyState component
    - Implement centered layout
    - Add icon in colored container
    - Add message and action button
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 2.9 Create LoadingState component
    - Implement skeleton variants (card, list, grid)
    - Add animate-pulse effect
    - Match skeleton shapes to content
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 2.10 Write property test for loading skeleton
    - **Property 6: Loading Skeleton Animation**
    - **Validates: Requirements 7.1, 7.2**

- [x] 3. Checkpoint - Ensure base components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Modernize Asset Detail Page (app/asset/[id]/page.tsx)
  - [x] 4.1 Update page header with PageHeader component pattern
    - Add gradient icon container
    - Update title styling with gradient text
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 4.2 Update cards with glass morphism styling
    - Apply glass class to all Card components
    - Add hover effects and transitions
    - Update border colors
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.3 Update stats display with icon containers
    - Add colored background containers for icons
    - Update spacing and layout
    - _Requirements: 5.1, 5.2_

  - [x] 4.4 Update badges with modern styling
    - Apply colored backgrounds with transparency
    - Update border colors
    - _Requirements: 5.3, 5.4_

  - [x] 4.5 Add Framer Motion animations
    - Add page entrance animations
    - Add card hover animations
    - _Requirements: 2.1, 2.5, 13.1_

  - [x] 4.6 Update loading state with skeleton
    - Replace simple loading with skeleton placeholders
    - Match skeleton to actual content layout
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 5. Modernize Spin Wheel Page (app/spin-wheel/page.tsx)
  - [x] 5.1 Update page layout with consistent styling
    - Apply glass morphism to cards
    - Update header with gradient icon
    - _Requirements: 1.1, 9.1_

  - [x] 5.2 Update activity buttons with modern styling
    - Add colored icon containers
    - Update hover effects
    - _Requirements: 5.1, 6.4_

  - [x] 5.3 Enhance animations
    - Update Framer Motion animations
    - Add staggered entrance animations
    - _Requirements: 13.1, 13.2_

- [x] 6. Modernize Dashboard Page (app/dashboard/page.tsx)
  - [x] 6.1 Verify and enhance stats cards styling
    - Ensure glass morphism is applied
    - Verify gradient overlays on hover
    - _Requirements: 1.1, 1.3_

  - [x] 6.2 Update XP and badges section
    - Ensure consistent card styling
    - Update progress bar styling
    - _Requirements: 1.1, 14.3_

  - [x] 6.3 Update asset list items
    - Apply ListItem component pattern
    - Add hover transitions
    - _Requirements: 11.1, 11.2_

  - [x] 6.4 Verify empty states
    - Ensure EmptyState pattern is used
    - Update styling if needed
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 7. Checkpoint - Verify main pages
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Modernize Assets List Page (app/assets/page.tsx)
  - [x] 8.1 Update page header
    - Apply PageHeader component pattern
    - Add search input with icon
    - _Requirements: 9.1, 12.2, 12.3_

  - [x] 8.2 Update asset cards grid
    - Apply responsive grid classes
    - Add glass morphism to cards
    - Add hover animations
    - _Requirements: 3.1, 1.1, 2.1_

  - [x] 8.3 Update filter/category section
    - Apply modern button styling
    - Add transitions
    - _Requirements: 6.4, 13.4_

  - [x] 8.4 Update loading and empty states
    - Apply LoadingState component pattern
    - Apply EmptyState component pattern
    - _Requirements: 7.1, 8.1_

- [x] 9. Modernize Profile Page (app/profile/[id]/page.tsx)
  - [x] 9.1 Update profile header section
    - Apply glass morphism to profile card
    - Update avatar styling
    - _Requirements: 1.1, 11.3_

  - [x] 9.2 Update stats display
    - Apply StatsGrid pattern
    - Add colored icon containers
    - _Requirements: 5.1, 3.1_

  - [x] 9.3 Update activity/assets list
    - Apply ListItem pattern
    - Add hover effects
    - _Requirements: 11.1, 11.2_

- [x] 10. Modernize Membership Page (app/membership/page.tsx)
  - [x] 10.1 Update pricing cards
    - Apply glass morphism
    - Add gradient borders for featured plan
    - Add hover animations
    - _Requirements: 1.1, 2.1_

  - [x] 10.2 Update feature lists
    - Add consistent icon styling
    - Update text styling
    - _Requirements: 5.2, 4.2_

  - [x] 10.3 Update CTA buttons
    - Apply gradient styling to primary buttons
    - Add glow effect
    - _Requirements: 6.1, 6.2_

- [x] 11. Modernize Upload Page (app/upload/page.tsx)
  - [x] 11.1 Update form container
    - Apply glass morphism to form card
    - Update input styling
    - _Requirements: 1.1, 12.1_

  - [x] 11.2 Update form inputs
    - Ensure consistent input styling
    - Add focus states
    - _Requirements: 12.1, 12.4_

  - [x] 11.3 Update submit button
    - Apply gradient styling
    - Add loading state
    - _Requirements: 6.1, 6.2_

- [x] 12. Modernize Messages Page (app/messages/page.tsx)
  - [x] 12.1 Update conversation list
    - Apply ListItem pattern
    - Add hover effects
    - _Requirements: 11.1, 11.2_

  - [x] 12.2 Update message bubbles
    - Apply glass morphism
    - Update colors for sent/received
    - _Requirements: 1.1, 14.1_

  - [x] 12.3 Update input area
    - Apply modern input styling
    - Add send button styling
    - _Requirements: 12.1, 6.1_

- [x] 13. Checkpoint - Verify all pages
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Final polish and consistency check
  - [x] 14.1 Verify responsive behavior on all pages
    - Test mobile, tablet, desktop viewports
    - Ensure proper stacking on mobile
    - _Requirements: 3.4, 3.5_

  - [x] 14.2 Verify animation performance
    - Check for smooth animations
    - Reduce animations if performance issues
    - _Requirements: 13.5_

  - [x] 14.3 Verify color consistency
    - Check amber for coins/premium
    - Check green for success/free
    - Check red for errors
    - _Requirements: 14.3, 14.4, 14.5_

  - [x] 14.4 Write property test for color scheme consistency
    - **Property 10: Color Scheme Consistency**
    - **Validates: Requirements 14.3, 14.4, 14.5**

- [x] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Focus on consistency with existing forum styling
- Do not break existing functionality
- Test on multiple screen sizes after each major change
