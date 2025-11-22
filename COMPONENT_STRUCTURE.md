# Mobile Navigation Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────┐
│  TOP BAR (z-450)                                    │
│  ┌──────┐  Search  [+]  🔔  👤                     │
│  │  ☰   │                                           │
│  └──────┘                                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│                MAIN CONTENT                         │
│                (scrollable)                         │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  BOTTOM NAV (z-500) - Mobile Only                  │
│  🗺️    🧭    💬    🖼️    📚                      │
│  Map  Disc  Forum  Media Texts                     │
└─────────────────────────────────────────────────────┘

MOBILE VIEW (<768px)
```

```
┌──────┬──────────────────────────────────────────────┐
│      │  TOP BAR (z-450)                             │
│  S   │  Research Hub  [Search]  [+New]  🔔  👤     │
│  I   ├──────────────────────────────────────────────┤
│  D   │                                              │
│  E   │                                              │
│  B   │           MAIN CONTENT                       │
│  A   │           (scrollable)                       │
│  R   │                                              │
│      │                                              │
│  z   │                                              │
│  40  │                                              │
└──────┴──────────────────────────────────────────────┘

DESKTOP VIEW (≥768px)
```

## Component Hierarchy

```
App Layout
└── AppLayout (src/app/(app)/layout.tsx)
    ├── AppSidebar (visible: md+)
    │   └── Navigation Links (8 items)
    │       ├── Map
    │       ├── Discover
    │       ├── Forum
    │       ├── Media
    │       ├── Texts
    │       ├── Research Hub
    │       ├── Notifications
    │       └── Profile
    │
    ├── Main Container
    │   ├── AppTopbar
    │   │   ├── Left Section
    │   │   │   ├── Hamburger Button (visible: <md)
    │   │   │   │   └── Sheet with Nav Items
    │   │   │   ├── Research Hub Link (visible: md+)
    │   │   │   └── Search Icon (visible: <md)
    │   │   │
    │   │   └── Right Section
    │   │       ├── New Contribution Button
    │   │       │   ├── Full (visible: md+)
    │   │       │   └── Icon Only (visible: <md)
    │   │       ├── Search Input (visible: lg+)
    │   │       ├── Verification Button (visible: lg+)
    │   │       ├── Notifications Icon (visible: md+)
    │   │       └── Profile Dropdown
    │   │           └── DropdownMenu
    │   │               ├── User Info
    │   │               ├── Profile Link
    │   │               ├── Notifications (visible: <md)
    │   │               ├── Verification (visible: <lg)
    │   │               ├── Settings Link
    │   │               └── Logout Button
    │   │
    │   └── Page Content
    │       └── {children}
    │
    └── MobileNavbar (visible: <md)
        └── 5 Main Nav Items
            ├── Map
            ├── Discover
            ├── Forum
            ├── Media
            └── Texts
```

## State Management

```typescript
// Sheet State (Hamburger Menu)
const [isSheetOpen, setIsSheetOpen] = useState(false);
// Auto-closes on navigation

// Route Detection (for active states)
const pathname = usePathname();
// Used in: MobileNavbar, AppTopbar, AppSidebar
```

## Responsive Visibility Classes

```tsx
// Mobile Only (<md, <768px)
className="md:hidden"

// Desktop Only (≥md, ≥768px)
className="hidden md:block"
className="hidden md:flex"
className="hidden md:inline-flex"

// Large Desktop Only (≥lg, ≥1024px)
className="hidden lg:block"
className="hidden lg:flex"

// Mobile & Tablet (hide on large)
className="lg:hidden"
```

## Z-Index Stack

```
Modals/Overlays:    z-50 to z-9999 (Radix UI defaults)
Mobile Bottom Nav:  z-[500]
Top Bar:            z-[450]
Map Controls:       z-[400]
Sidebar:            z-40
Content:            z-0 (default)
```

## Key Props & Interfaces

```typescript
// AppTopbar
interface AppTopbarProps {
  onGlobalSearch?: (query: string) => void;
}

// Navigation Items Structure
const navItems = [
  { 
    href: string,
    label: string,
    icon: LucideIcon 
  }
];

// Mobile Nav Items (5 main routes)
const mobileNavItems = navItems.slice(0, 5);
```

## Import Dependencies

```typescript
// Navigation Components
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/navigation/app-topbar";
import { MobileNavbar } from "@/components/navigation/mobile-navbar";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, ... } from "@/components/ui/sheet";
import { DropdownMenu, ... } from "@/components/ui/dropdown-menu";

// Icons (lucide-react)
import { 
  Menu, Map, Compass, MessageSquare, Images, 
  BookOpen, Network, Bell, UserCircle, Settings, 
  LogOut, Search, Plus, ShieldCheck 
} from "lucide-react";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
```

## Active State Logic

```typescript
// In all navigation components
const pathname = usePathname();
const isActive = pathname.startsWith(item.href);

// Styling based on active state
className={cn(
  "base-classes",
  isActive && "active-classes"
)}
```

## Accessibility Features

```tsx
// Screen reader labels
<span className="sr-only">Toggle menu</span>

// ARIA labels
aria-label="Toggle theme"

// Semantic HTML
<nav>, <header>, <aside>, <main>

// Keyboard navigation
- All buttons focusable
- Tab order logical
- Enter/Space activates
```

## Animation & Transitions

```css
/* Sheet slide-in from left */
transition: transform 0.3s ease-out

/* Bottom navbar fade-in */
transition: opacity 0.3s ease-out

/* Dropdown menu */
data-[state=open]:animate-in
data-[state=closed]:animate-out

/* Backdrop blur */
backdrop-blur
```

## Testing Utilities

```typescript
// Check current route
const pathname = usePathname();

// Check if mobile
const isMobile = window.innerWidth < 768;

// Check if specific route
const isMapRoute = pathname.startsWith("/map");
```

## Performance Optimizations

1. **Dynamic Imports**: Map component loaded dynamically
2. **Conditional Rendering**: Mobile components only on mobile
3. **Memo**: Navigation items memoized
4. **State Colocation**: State close to where it's used
5. **CSS Transforms**: Hardware-accelerated animations

## Common Patterns

```tsx
// Responsive Button
<Button className="hidden md:flex">Desktop</Button>
<Button className="md:hidden">Mobile</Button>

// Conditional Dropdown Item
<DropdownMenuItem className="md:hidden">
  Mobile Only
</DropdownMenuItem>

// Active Link
<Link
  className={cn(
    "base",
    pathname.startsWith(href) && "active"
  )}
>
```

## Error Handling

- All links have fallback states
- Missing icons gracefully degraded
- Invalid routes handled by Next.js
- TypeScript for type safety

## Browser Support

- ✅ Chrome/Edge 90+ (full support)
- ✅ Firefox 88+ (full support)  
- ✅ Safari 14+ (full support)
- ⚠️ Backdrop blur may fallback on older browsers
- ✅ Progressive enhancement strategy

