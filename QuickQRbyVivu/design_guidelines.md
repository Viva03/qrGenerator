# QR Generator Design Guidelines

## Design Approach
**System Selected**: Material Design with utility-first principles  
**Rationale**: QR generation is a utility-focused tool where clarity, efficiency, and immediate visual feedback are paramount. Material Design's elevation system and form patterns provide excellent structure for the generation workflow.

## Core Design Principles
1. **Tool-first mentality**: Every element serves the generation workflow
2. **Immediate feedback**: Real-time preview as users adjust settings
3. **Progressive disclosure**: Show basic options first, advanced features accessible but not overwhelming
4. **Clear visual hierarchy**: Input → Customize → Preview → Download flow

## Layout System

**Container Structure**: Centered single-column card layout with max-width of 600px on desktop
- Mobile (base): Full-width with 16px (p-4) side padding
- Desktop: Centered card with rounded corners and subtle elevation

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Section spacing: p-6 (forms, preview area)
- Element spacing: gap-4 between form groups, gap-2 within groups
- Large spacing: mt-8 between major sections (input → customization → preview)

**Grid Layout**: Single column on mobile, remains single column on desktop to maintain focused workflow

## Typography

**Font Stack**: 
- Primary: Inter or Outfit (Google Fonts) for clean, modern utility feel
- Headings: 600 weight
- Body: 400 weight
- Labels: 500 weight

**Hierarchy**:
- Page Title (if used): text-2xl font-semibold
- Section Headers: text-lg font-semibold mb-3
- Form Labels: text-sm font-medium mb-1.5
- Helper Text: text-xs opacity-70
- Button Text: text-sm font-medium

## Component Library

### Main Card Container
- Rounded corners (rounded-xl)
- Subtle shadow (shadow-lg)
- Padding: p-6 on mobile, p-8 on desktop
- White background with very subtle border

### URL Input Section
- Full-width text input with rounded-lg border
- Height: h-12
- Placeholder: "Enter URL to generate QR code"
- Focus state with ring effect
- Clear visual distinction from other inputs

### Customization Panel
- Organized in a compact grid layout
- Color pickers: Side-by-side (2-column grid on mobile for compact feel)
- Size selector: Segmented control or radio buttons with visual labels (200×200, 300×300, 400×400)
- Logo upload: Bordered dashed zone with "Click or drag to upload" text
- Each option group has clear label and spacing

### QR Preview Area
- Centered display with generous padding (p-8)
- Light background to distinguish from card
- Rounded corners (rounded-lg)
- Canvas/image centers within this area
- Minimum height when empty with placeholder text or icon

### Action Buttons
- Primary "Generate QR" button: Full-width, prominent, h-12, rounded-lg, font-medium
- Download button: Full-width when active, same styling as primary
- Reset button: Secondary style (outline or ghost), less prominent, positioned below download
- Button states clearly visible (hover, active, disabled)

### Logo Upload Zone
- Dashed border (border-2 border-dashed)
- Rounded corners (rounded-lg)
- Padding: p-6
- Upload icon centered with text below
- Preview thumbnail shown after upload with remove option
- Size: Square aspect ratio, 120×120px preview

## Visual Feedback & States

**Loading States**: 
- Spinner or skeleton in preview area during generation
- Disabled state on buttons with reduced opacity

**Success States**:
- QR preview smoothly appears
- Download button activates
- Optional: Subtle success message or checkmark

**Error States**:
- Red border on invalid URL input
- Error message below input field (text-sm, red tint)
- Clear error messaging for failed uploads

## Responsive Behavior

**Mobile (< 768px)**:
- Stack all elements vertically
- Color pickers remain 2-column for compactness
- Full-width buttons
- Preview area scales down proportionally
- Card takes full width with side padding

**Desktop (≥ 768px)**:
- Centered card with max-width constraint
- Color pickers can expand to better spacing
- Buttons maintain reasonable width (max-w-md centered if needed)
- Preview area has more breathing room

## Accessibility
- All form inputs have associated labels
- Color contrast ratios meet WCAG AA standards (4.5:1 for text)
- Focus indicators clearly visible on all interactive elements
- Keyboard navigation flows logically through the form
- Color pickers have text labels, not just color swatches
- Download provides both PNG and SVG options for accessibility

## Animations
**Minimal and purposeful**:
- Smooth opacity transition when QR appears (duration-200)
- Button hover states with subtle scale or brightness shift
- No scroll-driven animations
- No decorative animations

## Images
**No hero image required** - This is a utility tool where the interface IS the product. The layout begins immediately with the functional card.

**Logo upload preview**: Shows user-uploaded logo thumbnail in upload zone after selection