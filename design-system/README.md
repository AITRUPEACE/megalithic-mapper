# Megalithic Mapper Design System

A warm, exploration-focused design system with Google Maps-inspired light theme and daily.dev-inspired dark theme. Features elegant serif headers, glassmorphic components, and a rich orange/amber accent palette.

## Quick Start

1. Copy the files from this folder to your project
2. Follow the setup instructions below

---

## Design Philosophy

- **Light Theme**: Clean, cartographic aesthetic inspired by Google Maps
- **Dark Theme**: Immersive, content-focused aesthetic inspired by daily.dev
- **Primary Color**: Warm orange (`hsl(23, 94%, 52%)`) - conveys exploration & discovery
- **Accent Color**: Golden amber (`hsl(45, 100%, 50%)`) - highlights & hotspots
- **Typography**: Inter (sans) for UI, Playfair Display (serif) for headings

---

## Installation

### 1. Install Dependencies

```bash
npm install tailwindcss-animate clsx tailwind-merge next-themes
# For fonts (Next.js)
# Fonts are loaded from next/font/google
```

### 2. Copy Configuration Files

Copy these files to your project root:
- `tailwind.config.preset.ts` → Use as base for your `tailwind.config.ts`
- `globals.css` → Replace/merge with your `src/app/globals.css`
- `components.json` → Use if you're using shadcn/ui

### 3. Setup Fonts (Next.js)

In your root `layout.tsx`:

```tsx
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {/* Add ThemeProvider wrapper */}
        {children}
      </body>
    </html>
  );
}
```

### 4. Setup Theme Provider

```tsx
// src/providers/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Wrap your app:

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

---

## Color System

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | Off-white (#FAFAFA) | Near-black (#0A0C10) | Page background |
| `foreground` | Dark blue-gray | Light gray | Primary text |
| `primary` | Orange (#F97316) | Bright orange (#F9822A) | CTAs, links, focus |
| `accent` | Golden (#FACC15) | Light gold (#FFD54F) | Highlights, badges |
| `card` | White | Dark card (#14171F) | Card backgrounds |
| `muted` | Light gray | Dark gray | Disabled, subtle |
| `destructive` | Red | Red | Errors, delete |

### HSL Values Reference

```css
/* Light Theme */
--primary: 23 94% 52%;     /* Warm orange */
--accent: 45 100% 50%;     /* Golden amber */
--background: 0 0% 98%;    /* Off-white */
--foreground: 220 20% 15%; /* Dark slate */

/* Dark Theme */
--primary: 23 94% 58%;     /* Brighter orange */
--accent: 45 100% 65%;     /* Light gold */
--background: 220 20% 4%;  /* Near black */
--foreground: 210 20% 93%; /* Light gray */
```

---

## Typography

### Font Stack

```css
/* Body text - clean, readable */
font-family: var(--font-sans), system-ui, -apple-system, sans-serif;

/* Headings - elegant, authoritative */
font-family: var(--font-serif), "Playfair Display", serif;
```

### Usage

```tsx
// Headings automatically use serif font
<h1 className="text-3xl">Elegant Heading</h1>

// Body uses sans font by default
<p className="text-base">Clean body text</p>

// Manual override
<span className="font-serif">Serif text</span>
<span className="font-sans">Sans text</span>
```

---

## Component Patterns

### Glass Panel

```tsx
<div className="glass-panel p-4">
  {/* Content with glassmorphic effect */}
</div>
```

```css
.glass-panel {
  @apply rounded-xl border border-border/60 bg-card/70 
         shadow-lg shadow-black/20 backdrop-blur;
}
```

### Gradient Text

```tsx
<span className="gradient-text">
  Stunning gradient text
</span>
```

---

## Animations

### Built-in Animations

```tsx
// Floating effect (6s loop)
<div className="animate-float">Gently floats up and down</div>

// Pulsing glow (3s loop)
<div className="animate-pulse-glow">Subtle opacity pulse</div>

// Shimmer effect (2s loop)
<div className="animate-shimmer">Shimmering highlight</div>
```

### Accordion Animations (Radix UI)

```css
animation: 'accordion-down': 'accordion-down 0.2s ease-out',
animation: 'accordion-up': 'accordion-up 0.2s ease-out',
```

---

## Utility Classes

### Touch Targets

```tsx
// Minimum 44x44px touch target (iOS HIG + Material Design)
<button className="touch-target">Accessible button</button>
```

### Safe Areas (Mobile)

```tsx
// Padding for notched phones
<div className="pb-safe">Bottom safe area</div>
<div className="pt-safe">Top safe area</div>
```

### Scrollbar Styling

```tsx
// Thin, styled scrollbar
<div className="scrollbar-thin overflow-y-auto">
  Scrollable content
</div>
```

---

## Utils (cn function)

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)}>
```

---

## Theme Toggle Example

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="touch-target rounded-lg p-2 hover:bg-muted transition-colors"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
```

---

## File Structure

```
design-system/
├── README.md                    # This file
├── globals.css                  # CSS variables & base styles
├── tailwind.config.preset.ts    # Tailwind configuration
├── components.json              # shadcn/ui configuration
├── theme-provider.tsx           # Next-themes provider
└── utils.ts                     # Utility functions
```

---

## Customization

### Changing Primary Color

Update the HSL values in `globals.css`:

```css
:root {
  --primary: 220 90% 50%;  /* Change to blue */
}
.dark {
  --primary: 220 90% 60%;
}
```

### Adding Chart Colors

Add to your `:root` and `.dark` blocks:

```css
--chart-1: 23 94% 52%;
--chart-2: 45 100% 50%;
--chart-3: 142 76% 36%;
--chart-4: 199 89% 48%;
--chart-5: 280 65% 60%;
```

---

## License

MIT - Use freely in your projects.












