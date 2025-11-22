# Mobile Navigation Testing Guide

## Quick Start

```bash
npm run dev
```

Navigate to: `http://localhost:3000/map`

## Testing Checklist

### ✅ Desktop View (≥768px width)

**Expected Behavior:**

- [ ] Sidebar visible on left side
- [ ] Sidebar collapses on map page (except on hover/focus)
- [ ] Top bar shows:
  - [ ] "Research Hub" link
  - [ ] Search bar (on ≥1024px)
  - [ ] "New Contribution" button with text
  - [ ] "Request Verification" button (on ≥1024px)
  - [ ] Notifications bell icon
  - [ ] Profile avatar with dropdown
- [ ] NO bottom navbar visible
- [ ] NO hamburger menu button

**Test Profile Dropdown:**

1. Click profile avatar (top-right)
2. Verify dropdown shows:
   - User name: "Alex Zahn"
   - Email: "alex@example.com"
   - Profile link
   - Settings link
   - Log out option (in red)

### ✅ Mobile View (<768px width)

**Expected Behavior:**

- [ ] Sidebar is hidden
- [ ] Top bar shows:
  - [ ] Hamburger menu icon (left)
  - [ ] Search icon button (mobile only)
  - [ ] "+" icon button (compact version)
  - [ ] Profile avatar with dropdown
- [ ] Bottom navbar visible with 5 items:
  - [ ] Map
  - [ ] Discover
  - [ ] Forum
  - [ ] Media
  - [ ] Texts
- [ ] Active page highlighted in bottom navbar
- [ ] Content has proper padding at bottom (not hidden by navbar)

**Test Hamburger Menu:**

1. Tap hamburger menu icon (top-left)
2. Verify sheet/drawer opens from left
3. Check all navigation items present:
   - Map
   - Discover
   - Forum
   - Media
   - Text Library
   - Research Hub
   - Notifications
   - Profile
4. Verify active item is highlighted
5. Tap a nav item - verify:
   - Drawer closes
   - Navigation occurs
   - Bottom navbar updates active state

**Test Profile Dropdown on Mobile:**

1. Tap profile avatar
2. Verify dropdown includes mobile-only items:
   - Notifications (on mobile only)
   - Request Verification (hidden on ≥1024px)
   - Profile
   - Settings
   - Log out

**Test Bottom Navbar:**

1. Tap each icon in bottom navbar
2. Verify:
   - Navigation occurs
   - Icon becomes highlighted/filled
   - Label shows as primary color

### ✅ Z-Index Layering

**Test on Map Page:**

1. Navigate to `/map`
2. Verify layering (top to bottom):
   - Mobile navbar (z-500) - if mobile
   - Topbar (z-450) - always on top
   - Map control buttons (z-400)
   - Sidebar (z-40)
3. Ensure no overlap issues
4. Verify bottom navbar doesn't cover map content

## Browser DevTools Testing

### Chrome DevTools

1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test these devices:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Pixel 5 (393px)
   - Samsung Galaxy S20 Ultra (412px)
   - iPad Air (820px)
   - iPad Pro (1024px)

### Firefox Responsive Design Mode

1. Open Developer Tools (F12)
2. Click "Responsive Design Mode" (Ctrl+Shift+M)
3. Test various widths:
   - 320px (very small phone)
   - 375px (iPhone SE)
   - 768px (breakpoint)
   - 1024px (large tablet/small desktop)

## Specific Feature Tests

### Test: Touch Targets (Mobile)

- All bottom navbar icons should be easy to tap
- Minimum touch target: 44x44px
- Adequate spacing between items

### Test: Orientation Changes

1. Start in portrait mode
2. Rotate to landscape
3. Verify layout adapts properly
4. Check bottom navbar still accessible

### Test: Scrolling

1. On a page with long content
2. Scroll down
3. Verify:
   - Bottom navbar stays fixed
   - Topbar stays fixed
   - Content scrolls behind them

### Test: Navigation Transitions

1. Navigate between pages using bottom navbar
2. Verify smooth transitions
3. Check active state updates immediately

## Known Breakpoints

```css
/* Tailwind breakpoints used */
sm: 640px
md: 768px   ← Main mobile/desktop split
lg: 1024px  ← Search bar appears
xl: 1280px
2xl: 1536px
```

## Responsive Behavior Summary

| Viewport Width | Sidebar | Bottom Nav | Hamburger | Search Bar | Verification Btn |
| -------------- | ------- | ---------- | --------- | ---------- | ---------------- |
| < 768px        | Hidden  | Visible    | Visible   | Icon only  | In dropdown      |
| 768px - 1023px | Visible | Hidden     | Hidden    | Hidden     | In dropdown      |
| ≥ 1024px       | Visible | Hidden     | Hidden    | Visible    | Visible          |

## Common Issues & Solutions

### Issue: Bottom navbar covers content

**Solution:** Content has `pb-20` on mobile, `pb-6` on desktop

### Issue: Map buttons hidden by topbar

**Solution:** Topbar z-index (450) < Map buttons z-index (400) is incorrect - but map buttons should be lower. Actually, map buttons are IN the map content, so they should work fine.

### Issue: Hamburger menu doesn't close on navigation

**Solution:** Already handled with `onClick={() => setIsSheetOpen(false)}`

### Issue: Profile dropdown too wide on mobile

**Solution:** Dropdown auto-adjusts width, max 14rem (w-56)

## Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test with screen reader
- [ ] Check ARIA labels present

## Performance Testing

- [ ] Test on slow 3G network
- [ ] Verify no layout shift on load
- [ ] Check navigation response time
- [ ] Ensure smooth animations

## Next Steps

After confirming all tests pass:

1. Test on real mobile devices (iOS/Android)
2. Test with different browsers (Safari, Chrome, Firefox)
3. Gather user feedback
4. Consider A/B testing bottom nav vs. hamburger only
5. Add analytics to track mobile navigation usage
