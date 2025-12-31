# Fit Femme Design Guidelines

## Brand Identity
Fit Femme is a premium fitness app designed for women, celebrating curves and culture with bold, empowering aesthetics. The design system combines cinematic photography, bold typography, and a sophisticated dark theme with vibrant accent colors.

## Color System

### Primary Colors
- **Primary Pink**: `#d41173` - Brand color for CTAs, highlights, and active states
- **Primary Dark**: `#a30d58` - Pressed/hover states for primary elements

### Background Colors
- **Background Dark**: `#221019` - Main app background (deep chocolate/purple dark)
- **Surface Dark**: `#331926` - Card backgrounds and elevated surfaces
- **Card Dark**: `#2d1b24` - Alternative card background (slightly lighter)
- **Surface Secondary**: `#3a1d2b` / `#482336` - Secondary elevated elements

### Accent Colors
- **Accent Pink**: `#c992ad` - Subtle highlights, metadata text
- **Green (Success)**: `#0bda8b` - Progress indicators, positive metrics
- **Purple**: `#8b5cf6` - Secondary metric visualization
- **Blue**: `#60a5fa` - Steps/activity indicators
- **Cyan**: `#22d3ee` - Hydration indicators
- **Red**: `#ef4444` - Heart rate, intensity indicators
- **Yellow**: `#eab308` - Achievement badges

### Text Colors
- **White**: Primary text on dark backgrounds
- **White 90%**: `rgba(255,255,255,0.9)` - High emphasis text
- **White 80%**: `rgba(255,255,255,0.8)` - Body text
- **White 60%**: `rgba(255,255,255,0.6)` - Secondary text
- **White 50%**: `rgba(255,255,255,0.5)` - Tertiary text
- **White 40%**: `rgba(255,255,255,0.4)` - Disabled text
- **White 20%**: `rgba(255,255,255,0.2)` - Subtle borders
- **White 10%**: `rgba(255,255,255,0.1)` - Card borders, dividers
- **White 5%**: `rgba(255,255,255,0.05)` - Very subtle borders

## Typography

### Font Family
- **Primary**: Lexend (weights: 300, 400, 500, 600, 700, 800, 900)
- **Fallback**: System sans-serif

### Type Scale
- **Display Large**: 96-110px, font-weight: 700-900, tracking: -0.02em
- **Display**: 56-72px, font-weight: 700-900, tracking: -0.025em, line-height: 0.9-1.1
- **Headline Large**: 42px, font-weight: 700, tracking: -0.01em
- **Headline**: 28-32px, font-weight: 700, tracking: -0.015em
- **Title**: 20-24px, font-weight: 600-700
- **Body Large**: 18-19px, font-weight: 300-400
- **Body**: 14-16px, font-weight: 400-500
- **Label**: 11-14px, font-weight: 500-700, uppercase tracking: 0.05-0.1em
- **Caption**: 10-12px, font-weight: 400-500

### Text Styles
- **Uppercase Labels**: Small text (10-14px), tracking: 0.05-0.15em, font-weight: 500-700
- **Glow Effect**: For large timer/metric displays: `text-shadow: 0 0 20px rgba(212,17,115,0.5)`

## Layout & Spacing

### Border Radius
- **Default**: 8px (0.5rem)
- **Large**: 16px (1rem)
- **XL**: 24px (1.5rem)
- **2XL**: 32px (2rem)
- **Full**: 9999px (pills/circles)

### Container
- **Max Width**: 400px (phone simulation)
- **Phone Frame**: Rounded corners 40px on desktop simulation
- **Safe Area**: Account for status bar (~56px top), tab bar (~80px bottom on iOS)

### Spacing System
- Use multiples of 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)

## Visual Effects

### Glassmorphism
- **Background**: `rgba(34,16,25,0.45)` to `rgba(51,25,38,0.6)`
- **Backdrop Blur**: 8-16px
- **Border**: 1px solid rgba(255,255,255,0.05-0.1)
- Use for navigation bars, floating panels, and overlay cards

### Shadows
- **Soft Shadow**: `0 2px 8px rgba(0,0,0,0.1)`
- **Medium Shadow**: `0 10px 30px -10px rgba(0,0,0,0.3)`
- **Primary Glow**: `0 10px 30px -10px rgba(212,17,115,0.6)`
- **Floating Button**: `0 10px 40px rgba(0,0,0,0.5)`

### Gradients
- **Dark Overlay**: `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(34,16,25,0.9) 100%)`
- **Primary Gradient**: `linear-gradient(to bottom, #d41173 0%, rgba(212,17,115,0) 100%)`
- **Radial Accent**: `radial-gradient(circle, rgba(212,17,115,0.2) 0%, transparent 70%)`

## Components

### Buttons
- **Primary**: Background #d41173, white text, rounded-xl, height 56-64px, font-weight 700
- **Primary Glow**: Box-shadow with primary color at 60% opacity
- **Icon Button**: 40-48px circle, bg white/10, backdrop-blur, hover: white/20
- **Pressed State**: Scale 0.95, transition 200ms

### Cards
- **Glass Card**: Surface-dark with 60% opacity, backdrop-blur 8px, border 1px primary/10
- **Workout Card**: 288px width (72 * 4), rounded-xl, overflow hidden
- **Stat Card**: Grid 2 columns, height 128px, relative overflow hidden with colored glow

### Progress Indicators
- **Circular Ring**: SVG-based, stroke-width 2.5-8, stroke-linecap round
- **Ring Colors**: Primary, green (#0bda8b), purple (#8b5cf6)
- **Progress Bar**: Height 4-6px, rounded-full, active portion with glow effect
- **Segmented Progress**: Multiple bars with gaps, fill left-to-right

### Navigation
- **Tab Bar**: Glassmorphism, 5 tabs, center tab is primary action
- **Tab Height**: ~80px including safe area
- **Active Tab**: Primary color with glow
- **Inactive Tab**: White 60%

### Hero/Header Sections
- **Height**: 420px for dashboard hero
- **Background**: Full-bleed images with dark gradient overlays
- **Content**: Bottom-aligned with 48-64px bottom padding
- **Border Radius**: Rounded bottom 40px (2.5rem)

## Imagery & Photography

### Style
- High-contrast, cinematic photography
- Black women in athletic wear and fitness contexts
- Dark, moody lighting with dramatic shadows
- Focus on strength, power, and confidence

### Overlays
- Always apply dark gradients for text legibility
- Primary color overlay at 10% with mix-blend-overlay
- Gradient from black/40 at top to background-dark at bottom

### Image Treatments
- Background-position: center or top
- Background-size: cover
- Hover: Scale 1.05 with 1s transition

## Iconography
- **Library**: Material Symbols Outlined
- **Sizes**: 16px (small), 20-24px (default), 28-32px (large), 42-44px (extra large)
- **Fill**: Use filled icons for active/primary states
- **Color**: Inherit from parent or match context (primary for active, white/60 for inactive)

## Interaction Patterns

### Touch Feedback
- **Scale Down**: Active scale 0.95 on press
- **Transition**: 200ms ease-out
- **Hover** (web): Increase opacity or background brightness

### Animations
- **Fade In**: Opacity 0 to 1, 700ms duration
- **Slide Up**: translateY 20px to 0, 500ms ease-out
- **Pulse**: For live indicators (recording dot, active status)
- **Glow Pulse**: Animate opacity on primary glows

## Accessibility

### Contrast
- Maintain WCAG AA contrast ratios
- White text on dark backgrounds meets standards
- Use 60%+ opacity for body text
- Primary pink passes on dark backgrounds

### Touch Targets
- Minimum 44x44px for all interactive elements
- Icon buttons: 40-48px
- Primary CTAs: 56-64px height

### Text Legibility
- Never place text directly on images without gradients
- Use border-left accent bars (2px primary) for important text blocks
- Apply text-shadow/glow for large display text over images

## Special Patterns

### Onboarding Carousel
- Full-screen horizontal snap scroll
- Page indicators: 1.5px height, 8-32px width, primary for active
- Bottom CTA floating with gradient background fade

### Video Player
- Segmented progress at top
- Oversized timer display (110px)
- Glassmorphic bottom sheet with pull indicator
- Circular play button with SVG progress ring

### Metrics Display
- Large circular progress rings (256px diameter)
- Grid layouts for stat cards (2 columns)
- Use colored glows matching metric type
- Include trend indicators (+/- percentages in green/red)