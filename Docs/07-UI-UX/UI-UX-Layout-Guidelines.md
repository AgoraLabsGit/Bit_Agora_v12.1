# BitAgora UI/UX Layout Guidelines

## Overview
This document establishes the standard layout patterns for BitAgora admin pages to ensure consistency, usability, and professional appearance across the entire application.

## Core Layout Principles

### 1. **Left-Aligned Content (Standard)**
- **Rule**: All admin pages should use left-aligned, full-width layout
- **Implementation**: Use `max-w-full mx-auto` for container classes
- **Reasoning**: 
  - Better content utilization on wide screens
  - Natural reading flow for left-to-right languages
  - Improved usability on desktop and tablet devices
  - Consistent with modern web application standards

### 2. **Avoid Center-Aligned Content**
- **Rule**: Do not use centered containers with fixed max-width on admin pages
- **Avoid**: `max-w-6xl mx-auto` or similar centered containers
- **Exception**: Only use centered content for specific components (modals, error states, empty states)

## Layout Structure

### Header Layout
```css
/* Standard Header Layout */
.header-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  /* sm:padding: 0 1.5rem; */
  /* lg:padding: 0 2rem; */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem; /* 64px */
  /* sm:height: 5rem; */ /* 80px */
}
```

### Main Content Layout
```css
/* Standard Main Content Layout */
.main-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  /* sm:padding: 1.5rem; */
  /* lg:padding: 2rem; */
  /* py: 1rem to 2rem responsive */
}
```

## Implementation Examples

### ✅ **Correct Implementation (Transactions Page)**
```jsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="bg-card border-b border-border">
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16 sm:h-20">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-semibold">Page Title</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Actions */}
        </div>
      </div>
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
    <div className="space-y-6">
      {/* Content */}
    </div>
  </main>
</div>
```

### ❌ **Incorrect Implementation (Avoid)**
```jsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="bg-card border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* This centers the header content */}
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* This centers the main content */}
  </main>
</div>
```

## Page-Specific Guidelines

### Admin Dashboard Pages
- **Layout**: Full-width, left-aligned
- **Header**: Fixed height (64px mobile, 80px desktop)
- **Content**: Full-width with consistent padding
- **Cards**: Use full available width with proper spacing

### Transaction Management
- **Layout**: Full-width for optimal table display
- **Filters**: Expandable section at top
- **Data Tables**: Full-width for better column visibility
- **Actions**: Right-aligned in header

### Payment Settings
- **Layout**: Full-width for form sections
- **Form Cards**: Full-width with consistent spacing
- **Buttons**: Right-aligned for save actions
- **Status**: Full-width for better visibility

### Product Management
- **Layout**: Full-width grid system
- **Product Cards**: Responsive grid (1-4 columns)
- **Details**: Full-width forms and inputs
- **Actions**: Context-appropriate positioning

## Responsive Behavior

### Mobile (< 640px)
- **Padding**: `px-4 py-4`
- **Header Height**: `h-16` (64px)
- **Content**: Single column layout
- **Actions**: Stacked or collapsed

### Tablet (640px - 1024px)
- **Padding**: `px-6 py-6`
- **Header Height**: `h-20` (80px)
- **Content**: 2-column layout where appropriate
- **Actions**: Horizontal layout

### Desktop (> 1024px)
- **Padding**: `px-8 py-8`
- **Header Height**: `h-20` (80px)
- **Content**: Multi-column layout
- **Actions**: Full horizontal layout

## Common Patterns

### Page Title Pattern
```jsx
<div className="flex items-center gap-2">
  <Icon className="h-6 w-6 text-primary" />
  <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Page Title</h1>
</div>
```

### Action Buttons Pattern
```jsx
<div className="flex items-center gap-2 sm:gap-3">
  <Button variant="outline" size="sm">
    <Icon className="h-4 w-4" />
    <span className="hidden sm:inline">Action</span>
  </Button>
</div>
```

### Content Spacing Pattern
```jsx
<div className="space-y-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

## Benefits of This Approach

1. **Consistency**: All admin pages follow the same layout pattern
2. **Usability**: Better content utilization and readability
3. **Responsiveness**: Optimal display across all device sizes
4. **Scalability**: Easy to add new pages following the same pattern
5. **Maintenance**: Single source of truth for layout decisions

## Migration Strategy

When updating existing pages:
1. Replace `max-w-6xl mx-auto` with `max-w-full mx-auto`
2. Ensure consistent padding: `px-4 sm:px-6 lg:px-8`
3. Update responsive spacing: `py-4 sm:py-6 lg:py-8`
4. Test on all device sizes
5. Maintain consistent header height

## Implementation Checklist

- [ ] Header uses `max-w-full mx-auto`
- [ ] Main content uses `max-w-full mx-auto`
- [ ] Consistent padding across breakpoints
- [ ] Responsive header height (h-16 sm:h-20)
- [ ] Proper spacing between content sections
- [ ] Actions positioned appropriately
- [ ] Tested on mobile, tablet, and desktop

---

**Document Version**: 1.0  
**Created**: 2025-01-08  
**Last Updated**: 2025-01-08  
**Status**: Active Standard 