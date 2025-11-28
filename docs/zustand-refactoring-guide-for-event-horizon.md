# Zustand Refactoring Guide for Event-Horizon

> **Context:** Recommendations for Event-Horizon as a solo developer project
> 
> **Philosophy:** Keep your pragmatic service-oriented architecture, but improve state management and reduce complexity in God files.

---

## 🎯 Overview

This guide will help you refactor Event-Horizon to:
1. ✅ Replace scattered state with Zustand stores
2. ✅ Break up massive orchestration hooks (God files)
3. ✅ Consolidate type definitions
4. ✅ Maintain your fast iteration speed

**Time Investment:** 2-4 days  
**Risk Level:** Low (incremental changes)  
**Benefit:** Cleaner code, easier debugging, faster feature development

---

## 📦 Phase 1: Setup Zustand (30 minutes)

### Step 1.1: Install Dependencies

```bash
npm install zustand
npm install -D @types/zustand
```

### Step 1.2: Create Stores Directory

```bash
mkdir -p src/stores
```

### Step 1.3: Update tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/stores/*": ["./src/stores/*"]
    }
  }
}
```

---

## 🗂️ Phase 2: Consolidate Type Definitions (2-3 hours)

### Current Problem
Types are scattered across multiple files with no central source of truth.

### Solution: Create a Unified Types Directory

```bash
mkdir -p src/types
```

### Step 2.1: Create Main Type Index

Create `src/types/index.ts`:

```typescript
// Re-export all types from a single entry point
export * from './poi';
export * from './event';
export * from './map';
export * from './chat';
export * from './user';
export * from './api';
export * from './analytics';
```

### Step 2.2: Organize POI Types

Create `src/types/poi.ts`:

```typescript
export interface POI {
  id: string;
  name: string;
  description: string;
  coordinates: Coordinates;
  category: POICategory;
  categoryDefinition?: POICategoryDefinition;
  eventId: string;
  isVisible: boolean;
  isSaved?: boolean;
  badges?: POIBadgeSet;
  // Add all your POI-related fields
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface POICategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface POICategoryDefinition {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  color: string;
  isVisibleByDefault: boolean;
}

export interface POIBadgeSet {
  friendsHere?: number;
  activities?: number;
  announcements?: number;
}

// Filter-related types
export interface POIFiltersState {
  searchTerm: string;
  categories: string[];
  showSavedOnly: boolean;
  showFriendsOnly: boolean;
}
```

### Step 2.3: Organize Event Types

Create `src/types/event.ts`:

```typescript
export interface Event {
  id: string;
  name: string;
  subtitle?: string;
  logoUrl?: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  organizationId: string;
  perimeter?: MapPerimeter;
  center?: Coordinates;
  zoom?: number;
}

export interface MapPerimeter {
  type: 'polygon';
  coordinates: number[][][];
}

export type EventBootstrapBundle = {
  event: Event | null;
  pois: POI[];
  shapes: MapShape[];
  pinGroups: PinGroup[];
  categories: POICategoryDefinition[];
  backgroundOverlay: MapBackgroundOverlay | null;
};
```

### Step 2.4: Organize Map Types

Create `src/types/map.ts`:

```typescript
export interface MapBackgroundOverlay {
  imageUrl: string;
  bounds: MapBounds;
  opacity: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapShape {
  id: string;
  type: 'polygon' | 'circle' | 'rectangle';
  coordinates: number[][];
  properties: {
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    label?: string;
  };
}

export interface PinGroup {
  id: string;
  name: string;
  poiIds: string[];
  color: string;
}

export type MapCenterTarget = {
  lat: number;
  lng: number;
  zoom?: number;
};
```

### Step 2.5: Organize Chat Types

Create `src/types/chat.ts`:

```typescript
export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'poi';
  poiId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}
```

### Step 2.6: Organize User Types

Create `src/types/user.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'organizer' | 'attendee';
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  currentPoiId?: string;
}
```

### Step 2.7: Organize API Types

Create `src/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
```

### Step 2.8: Update Imports Throughout Codebase

**Before:**
```typescript
import type { POI } from "@/types/poi";
import type { Event } from "@/types/event";
```

**After:**
```typescript
import type { POI, Event, ChatRoom, User } from "@/types";
```

---

## 🏪 Phase 3: Create Zustand Stores (4-6 hours)

### Store Architecture

```
src/stores/
├── index.ts              # Re-export all stores
├── map-store.ts          # Map state & actions
├── poi-store.ts          # POI data & filters
├── chat-store.ts         # Chat state
├── user-store.ts         # User & friends
├── drawer-store.ts       # UI drawer state
└── notification-store.ts # Notifications
```

### Step 3.1: Create Map Store

Create `src/stores/map-store.ts`:

```typescript
import { create } from 'zustand';
import type { MapCenterTarget, MapBackgroundOverlay } from '@/types';

interface MapState {
  // State
  center: [number, number];
  zoom: number;
  backgroundOverlay: MapBackgroundOverlay | null;
  mapCenterTarget: MapCenterTarget | null;
  isMapReady: boolean;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setMapCenterTarget: (target: MapCenterTarget | null) => void;
  setBackgroundOverlay: (overlay: MapBackgroundOverlay | null) => void;
  setMapReady: (ready: boolean) => void;
  
  // Computed actions
  flyTo: (target: MapCenterTarget) => void;
  resetView: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  center: [37.7805, -122.416],
  zoom: 15,
  backgroundOverlay: null,
  mapCenterTarget: null,
  isMapReady: false,
  
  // Actions
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMapCenterTarget: (target) => set({ mapCenterTarget: target }),
  setBackgroundOverlay: (overlay) => set({ backgroundOverlay: overlay }),
  setMapReady: (ready) => set({ isMapReady: ready }),
  
  // Computed actions
  flyTo: (target) => set({ mapCenterTarget: target }),
  resetView: () => set({
    center: [37.7805, -122.416],
    zoom: 15,
    mapCenterTarget: null,
  }),
}));
```

### Step 3.2: Create POI Store

Create `src/stores/poi-store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { POI, POIFiltersState } from '@/types';

interface PoiState {
  // State
  pois: POI[];
  selectedPoiId: string | null;
  highlightedPoiId: string | null;
  savedPoiIds: string[];
  filters: POIFiltersState;
  
  // Actions
  setPois: (pois: POI[]) => void;
  addPoi: (poi: POI) => void;
  updatePoi: (id: string, updates: Partial<POI>) => void;
  deletePoi: (id: string) => void;
  
  selectPoi: (id: string | null) => void;
  highlightPoi: (id: string | null) => void;
  
  toggleSavePoi: (id: string) => void;
  clearSavedPois: () => void;
  
  setFilters: (filters: Partial<POIFiltersState>) => void;
  clearFilters: () => void;
  
  // Computed
  getFilteredPois: () => POI[];
  getPoiById: (id: string) => POI | undefined;
}

const initialFilters: POIFiltersState = {
  searchTerm: '',
  categories: [],
  showSavedOnly: false,
  showFriendsOnly: false,
};

export const usePoiStore = create<PoiState>()(
  persist(
    (set, get) => ({
      // Initial state
      pois: [],
      selectedPoiId: null,
      highlightedPoiId: null,
      savedPoiIds: [],
      filters: initialFilters,
      
      // Actions
      setPois: (pois) => set({ pois }),
      
      addPoi: (poi) => set((state) => ({
        pois: [...state.pois, poi]
      })),
      
      updatePoi: (id, updates) => set((state) => ({
        pois: state.pois.map(poi =>
          poi.id === id ? { ...poi, ...updates } : poi
        )
      })),
      
      deletePoi: (id) => set((state) => ({
        pois: state.pois.filter(poi => poi.id !== id),
        selectedPoiId: state.selectedPoiId === id ? null : state.selectedPoiId,
      })),
      
      selectPoi: (id) => set({ selectedPoiId: id }),
      highlightPoi: (id) => set({ highlightedPoiId: id }),
      
      toggleSavePoi: (id) => set((state) => ({
        savedPoiIds: state.savedPoiIds.includes(id)
          ? state.savedPoiIds.filter(savedId => savedId !== id)
          : [...state.savedPoiIds, id]
      })),
      
      clearSavedPois: () => set({ savedPoiIds: [] }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearFilters: () => set({ filters: initialFilters }),
      
      // Computed
      getFilteredPois: () => {
        const { pois, filters, savedPoiIds } = get();
        
        return pois.filter(poi => {
          // Search term
          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            if (!poi.name.toLowerCase().includes(term) &&
                !poi.description.toLowerCase().includes(term)) {
              return false;
            }
          }
          
          // Categories
          if (filters.categories.length > 0) {
            if (!filters.categories.includes(poi.category.id)) {
              return false;
            }
          }
          
          // Saved only
          if (filters.showSavedOnly && !savedPoiIds.includes(poi.id)) {
            return false;
          }
          
          return true;
        });
      },
      
      getPoiById: (id) => {
        return get().pois.find(poi => poi.id === id);
      },
    }),
    {
      name: 'poi-storage',
      partialize: (state) => ({
        savedPoiIds: state.savedPoiIds, // Only persist saved POIs
      }),
    }
  )
);
```

### Step 3.3: Create Drawer Store

Create `src/stores/drawer-store.ts`:

```typescript
import { create } from 'zustand';
import type { BottomNavTab } from '@/types';

interface DrawerState {
  // State
  isOpen: boolean;
  activeTab: BottomNavTab;
  chatDrawerOpen: boolean;
  notificationDrawerOpen: boolean;
  
  // Actions
  openDrawer: (tab?: BottomNavTab) => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveTab: (tab: BottomNavTab) => void;
  
  openChatDrawer: () => void;
  closeChatDrawer: () => void;
  toggleChatDrawer: () => void;
  
  openNotificationDrawer: () => void;
  closeNotificationDrawer: () => void;
  toggleNotificationDrawer: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  // Initial state
  isOpen: false,
  activeTab: 'explore',
  chatDrawerOpen: false,
  notificationDrawerOpen: false,
  
  // Actions
  openDrawer: (tab) => set((state) => ({
    isOpen: true,
    activeTab: tab || state.activeTab,
  })),
  
  closeDrawer: () => set({ isOpen: false }),
  
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  openChatDrawer: () => set({
    chatDrawerOpen: true,
    notificationDrawerOpen: false,
  }),
  
  closeChatDrawer: () => set({ chatDrawerOpen: false }),
  
  toggleChatDrawer: () => set((state) => ({
    chatDrawerOpen: !state.chatDrawerOpen,
    notificationDrawerOpen: false,
  })),
  
  openNotificationDrawer: () => set({
    notificationDrawerOpen: true,
    chatDrawerOpen: false,
  }),
  
  closeNotificationDrawer: () => set({ notificationDrawerOpen: false }),
  
  toggleNotificationDrawer: () => set((state) => ({
    notificationDrawerOpen: !state.notificationDrawerOpen,
    chatDrawerOpen: false,
  })),
}));
```

### Step 3.4: Create Chat Store

Create `src/stores/chat-store.ts`:

```typescript
import { create } from 'zustand';
import type { ChatRoom, ChatMessage } from '@/types';

interface ChatState {
  // State
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  unreadTotal: number;
  
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  updateRoom: (id: string, updates: Partial<ChatRoom>) => void;
  
  setActiveRoom: (roomId: string | null) => void;
  
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  
  markRoomAsRead: (roomId: string) => void;
  markAllAsRead: () => void;
  
  // Computed
  getActiveRoom: () => ChatRoom | undefined;
  getActiveMessages: () => ChatMessage[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  rooms: [],
  activeRoomId: null,
  messages: {},
  unreadTotal: 0,
  
  // Actions
  setRooms: (rooms) => set({
    rooms,
    unreadTotal: rooms.reduce((sum, room) => sum + room.unreadCount, 0),
  }),
  
  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms, room],
    unreadTotal: state.unreadTotal + room.unreadCount,
  })),
  
  updateRoom: (id, updates) => set((state) => {
    const rooms = state.rooms.map(room =>
      room.id === id ? { ...room, ...updates } : room
    );
    return {
      rooms,
      unreadTotal: rooms.reduce((sum, room) => sum + room.unreadCount, 0),
    };
  }),
  
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  
  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages,
    },
  })),
  
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message],
    },
  })),
  
  markRoomAsRead: (roomId) => set((state) => {
    const rooms = state.rooms.map(room =>
      room.id === roomId ? { ...room, unreadCount: 0 } : room
    );
    return {
      rooms,
      unreadTotal: rooms.reduce((sum, room) => sum + room.unreadCount, 0),
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    rooms: state.rooms.map(room => ({ ...room, unreadCount: 0 })),
    unreadTotal: 0,
  })),
  
  // Computed
  getActiveRoom: () => {
    const { rooms, activeRoomId } = get();
    return rooms.find(room => room.id === activeRoomId);
  },
  
  getActiveMessages: () => {
    const { messages, activeRoomId } = get();
    return activeRoomId ? messages[activeRoomId] || [] : [];
  },
}));
```

### Step 3.5: Create User Store

Create `src/stores/user-store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Friend } from '@/types';

interface UserState {
  // State
  user: User | null;
  friends: Friend[];
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  updateFriend: (id: string, updates: Partial<Friend>) => void;
  removeFriend: (id: string) => void;
  
  // Computed
  getFriendById: (id: string) => Friend | undefined;
  getOnlineFriends: () => Friend[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      friends: [],
      isAuthenticated: false,
      
      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      
      logout: () => set({
        user: null,
        friends: [],
        isAuthenticated: false,
      }),
      
      setFriends: (friends) => set({ friends }),
      
      addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend],
      })),
      
      updateFriend: (id, updates) => set((state) => ({
        friends: state.friends.map(friend =>
          friend.id === id ? { ...friend, ...updates } : friend
        ),
      })),
      
      removeFriend: (id) => set((state) => ({
        friends: state.friends.filter(friend => friend.id !== id),
      })),
      
      // Computed
      getFriendById: (id) => {
        return get().friends.find(friend => friend.id === id);
      },
      
      getOnlineFriends: () => {
        return get().friends.filter(friend => friend.currentPoiId !== null);
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Step 3.6: Create Store Index

Create `src/stores/index.ts`:

```typescript
// Re-export all stores
export { useMapStore } from './map-store';
export { usePoiStore } from './poi-store';
export { useDrawerStore } from './drawer-store';
export { useChatStore } from './chat-store';
export { useUserStore } from './user-store';
```

---

## 🔨 Phase 4: Break Up God Files (4-6 hours)

### Target: `useAttendeeMapExperience` Hook

**Current Problem:** 500+ line orchestration hook that's hard to test and maintain.

### Step 4.1: Analyze Current Structure

Read `features/map/attendee/hooks/useAttendeeMapExperience.ts` and identify sub-concerns:

1. **Core Map Behavior**: Popups, location, selection
2. **UI State**: Drawer, tabs, zoom controls
3. **Data Management**: Badges, saved POIs, search
4. **Realtime Features**: Presence, notifications

### Step 4.2: Create Focused Composite Hooks

Create `features/map/attendee/hooks/useMapCore.ts`:

```typescript
"use client";

import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import { useMapStore, usePoiStore } from "@/stores";
import { useActivePopups } from "./useActivePopups";
import { usePoiSelectionEffects } from "./usePoiSelectionEffects";
import { useMarkerHighlightSync } from "./useMarkerHighlightSync";

interface UseMapCoreOptions {
  mapRef: MutableRefObject<LeafletMap | null>;
  pendingPoiMarkersRef: MutableRefObject<Map<string, any>>;
  popUpHighlightRef: MutableRefObject<string | null>;
  trackPoiView?: (poiId: string, source: string) => void;
}

export function useMapCore(options: UseMapCoreOptions) {
  const { mapRef, pendingPoiMarkersRef, popUpHighlightRef, trackPoiView } = options;
  
  // Store state
  const { selectedPoiId, highlightedPoiId, selectPoi, highlightPoi } = usePoiStore();
  const { mapCenterTarget, setMapCenterTarget } = useMapStore();
  
  // Sub-hooks
  const { activePopups, addPopup, removePopup, clearPopups } = useActivePopups();
  
  usePoiSelectionEffects({
    selectedPoiId,
    mapRef,
    trackPoiView,
  });
  
  useMarkerHighlightSync({
    highlightedPoiId,
    selectedPoiId,
    pendingPoiMarkersRef,
    popUpHighlightRef,
  });
  
  // Actions
  const handleHighlightPoi = useCallback((poiId: string | null) => {
    highlightPoi(poiId);
  }, [highlightPoi]);
  
  const handlePopUpHighlight = useCallback((poiId: string | null) => {
    popUpHighlightRef.current = poiId;
  }, [popUpHighlightRef]);
  
  return {
    // State
    highlightedPoiId,
    selectedPoiId,
    mapCenterTarget,
    activePopups,
    
    // Actions
    handleHighlightPoi,
    handlePopUpHighlight,
    setMapCenterTarget,
    selectPoi,
    addPopup,
    removePopup,
    clearPopups,
  };
}
```

Create `features/map/attendee/hooks/useMapUI.ts`:

```typescript
"use client";

import type { MutableRefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import { useDrawerStore } from "@/stores";
import { useAutoBottomTab } from "./useAutoBottomTab";
import { useResponsiveZoomControls } from "./useResponsiveZoomControls";

interface UseMapUIOptions {
  isMobile: boolean;
  mapRef: MutableRefObject<LeafletMap | null>;
  selectedPoiId: string | null;
}

export function useMapUI(options: UseMapUIOptions) {
  const { isMobile, mapRef, selectedPoiId } = options;
  
  // Store state
  const drawer = useDrawerStore();
  
  // Sub-hooks
  const { bottomNavTab, setBottomNavTab } = useAutoBottomTab({
    selectedPoiId,
    isDrawerOpen: drawer.isOpen,
  });
  
  useResponsiveZoomControls({
    isMobile,
    mapRef,
  });
  
  return {
    // Drawer state
    drawer,
    
    // Bottom nav
    bottomNavTab,
    setBottomNavTab,
  };
}
```

Create `features/map/attendee/hooks/useMapData.ts`:

```typescript
"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { POI } from "@/types";
import { usePoiStore } from "@/stores";
import { useRealtimePoiBadges } from "./useRealtimePoiBadges";
import { useSavedPoiPersistence } from "./useSavedPoiPersistence";
import { useSearchSuggestionHandler } from "./useSearchSuggestionHandler";

interface UseMapDataOptions {
  eventId?: string | null;
  pois: POI[];
  setPois: Dispatch<SetStateAction<POI[]>>;
}

export function useMapData(options: UseMapDataOptions) {
  const { eventId, pois, setPois } = options;
  
  // Store state
  const { savedPoiIds, toggleSavePoi } = usePoiStore();
  
  // Sub-hooks
  useRealtimePoiBadges({
    eventId,
    pois,
    setPois,
  });
  
  useSavedPoiPersistence({
    savedPoiIds,
  });
  
  const { searchSuggestions, handleSearchSelect } = useSearchSuggestionHandler({
    pois,
  });
  
  // Actions
  const handleToggleSavePoi = useCallback((poiId: string) => {
    toggleSavePoi(poiId);
  }, [toggleSavePoi]);
  
  return {
    // State
    savedPoiIds,
    searchSuggestions,
    
    // Actions
    handleToggleSavePoi,
    handleSearchSelect,
  };
}
```

### Step 4.3: Refactor Main Hook

Update `features/map/attendee/hooks/useAttendeeMapExperience.ts`:

```typescript
"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { POI, POIFiltersState } from "@/types";
import { useMapCore } from "./useMapCore";
import { useMapUI } from "./useMapUI";
import { useMapData } from "./useMapData";
import { useUserLocationTracker } from "./useUserLocation";
import { useDrawerActivityFeed } from "./useDrawerActivityFeed";

export type UseAttendeeMapExperienceOptions = {
  eventId?: string | null;
  focusId?: string | null;
  pois: POI[];
  setPois: Dispatch<SetStateAction<POI[]>>;
  filters: POIFiltersState;
  filteredPois: POI[];
  isMobile: boolean;
  mapRef: MutableRefObject<LeafletMap | null>;
  pendingPoiMarkersRef: MutableRefObject<Map<string, any>>;
  popUpHighlightRef: MutableRefObject<string | null>;
  trackPoiView?: (poiId: string, source: string) => void;
};

/**
 * Main hook orchestrating the attendee map experience.
 * 
 * Now broken into focused sub-hooks:
 * - useMapCore: Core map behavior (selection, popups, highlighting)
 * - useMapUI: UI state (drawer, tabs, zoom)
 * - useMapData: Data management (badges, saved POIs, search)
 */
export function useAttendeeMapExperience(options: UseAttendeeMapExperienceOptions) {
  const {
    eventId,
    focusId,
    pois,
    setPois,
    filters,
    filteredPois,
    isMobile,
    mapRef,
    pendingPoiMarkersRef,
    popUpHighlightRef,
    trackPoiView,
  } = options;
  
  // Core map behavior
  const core = useMapCore({
    mapRef,
    pendingPoiMarkersRef,
    popUpHighlightRef,
    trackPoiView,
  });
  
  // UI state management
  const ui = useMapUI({
    isMobile,
    mapRef,
    selectedPoiId: core.selectedPoiId,
  });
  
  // Data management
  const data = useMapData({
    eventId,
    pois,
    setPois,
  });
  
  // User location tracking
  const location = useUserLocationTracker({
    mapRef,
    isMobile,
  });
  
  // Activity feed
  const activity = useDrawerActivityFeed({
    eventId,
    selectedPoiId: core.selectedPoiId,
  });
  
  // Return combined interface
  return {
    // Core
    highlightedPoiId: core.highlightedPoiId,
    selectedPoiId: core.selectedPoiId,
    mapCenterTarget: core.mapCenterTarget,
    handleHighlightPoi: core.handleHighlightPoi,
    handlePopUpHighlight: core.handlePopUpHighlight,
    setMapCenterTarget: core.setMapCenterTarget,
    selectPoi: core.selectPoi,
    
    // UI
    drawer: ui.drawer,
    bottomNavTab: ui.bottomNavTab,
    setBottomNavTab: ui.setBottomNavTab,
    
    // Data
    savedPoiIds: data.savedPoiIds,
    handleToggleSavePoi: data.handleToggleSavePoi,
    searchSuggestions: data.searchSuggestions,
    handleSearchSelect: data.handleSearchSelect,
    
    // Location
    userLocation: location.userLocation,
    isTrackingLocation: location.isTracking,
    toggleLocationTracking: location.toggleTracking,
    
    // Activity
    activityItems: activity.items,
    activityLoading: activity.loading,
  };
}
```

**Benefits:**
- ✅ Main hook is now ~150 lines instead of 500+
- ✅ Each sub-hook can be tested independently
- ✅ Can reuse `useMapCore` without UI dependencies
- ✅ Easier to understand and maintain

---

## 🎯 Phase 5: Migration Strategy (Incremental)

### Step 5.1: Start with New Features

For any **new features**, use Zustand stores from the start:

```typescript
// ✅ Good: New feature uses stores
function NewFeatureComponent() {
  const { pois, selectPoi } = usePoiStore();
  const { openDrawer } = useDrawerStore();
  
  // Component logic
}
```

### Step 5.2: Migrate Existing Components (Gradually)

**Priority Order:**
1. Start with leaf components (no children using old patterns)
2. Move up the tree gradually
3. Update one feature area at a time (e.g., all POI-related first)

**Example Migration:**

**Before:**
```typescript
function PoiCard({ poi, onSelect, savedPoiIds, onToggleSave }) {
  const isSaved = savedPoiIds.includes(poi.id);
  
  return (
    <div onClick={() => onSelect(poi.id)}>
      <h3>{poi.name}</h3>
      <button onClick={() => onToggleSave(poi.id)}>
        {isSaved ? 'Unsave' : 'Save'}
      </button>
    </div>
  );
}
```

**After:**
```typescript
function PoiCard({ poi }) {
  const { selectPoi, savedPoiIds, toggleSavePoi } = usePoiStore();
  const isSaved = savedPoiIds.includes(poi.id);
  
  return (
    <div onClick={() => selectPoi(poi.id)}>
      <h3>{poi.name}</h3>
      <button onClick={() => toggleSavePoi(poi.id)}>
        {isSaved ? 'Unsave' : 'Save'}
      </button>
    </div>
  );
}
```

**Benefits:**
- ✅ No more prop drilling
- ✅ Component is self-contained
- ✅ Easier to test

### Step 5.3: Update Services to Work with Stores

**Before:**
```typescript
// services/map-bootstrap.ts
export async function loadPois(eventId: string) {
  const response = await fetch(`/api/events/${eventId}/pois`);
  return response.json();
}

// Component
const pois = await loadPois(eventId);
setPois(pois);
```

**After:**
```typescript
// services/map-bootstrap.ts
import { usePoiStore } from '@/stores';

export async function loadPois(eventId: string) {
  const response = await fetch(`/api/events/${eventId}/pois`);
  const pois = await response.json();
  
  // Update store directly
  usePoiStore.getState().setPois(pois);
  
  return pois;
}

// Component - simpler!
await loadPois(eventId);
// State is already updated!
```

---

## 🧪 Phase 6: Testing Your Stores (Optional)

### Step 6.1: Install Testing Dependencies

```bash
npm install -D @testing-library/react @testing-library/react-hooks
```

### Step 6.2: Example Store Test

Create `src/stores/__tests__/poi-store.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { usePoiStore } from '../poi-store';

describe('usePoiStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = usePoiStore.getState();
    store.setPois([]);
    store.clearFilters();
  });
  
  it('should add a POI', () => {
    const { result } = renderHook(() => usePoiStore());
    
    act(() => {
      result.current.addPoi({
        id: '1',
        name: 'Test POI',
        // ... other fields
      });
    });
    
    expect(result.current.pois).toHaveLength(1);
    expect(result.current.pois[0].name).toBe('Test POI');
  });
  
  it('should filter POIs by search term', () => {
    const { result } = renderHook(() => usePoiStore());
    
    act(() => {
      result.current.setPois([
        { id: '1', name: 'Coffee Shop', /* ... */ },
        { id: '2', name: 'Bathroom', /* ... */ },
      ]);
      result.current.setFilters({ searchTerm: 'coffee' });
    });
    
    const filtered = result.current.getFilteredPois();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Coffee Shop');
  });
  
  it('should toggle saved POI', () => {
    const { result } = renderHook(() => usePoiStore());
    
    act(() => {
      result.current.toggleSavePoi('1');
    });
    
    expect(result.current.savedPoiIds).toContain('1');
    
    act(() => {
      result.current.toggleSavePoi('1');
    });
    
    expect(result.current.savedPoiIds).not.toContain('1');
  });
});
```

---

## 📊 Phase 7: Before & After Comparison

### Before (Current Event-Horizon)

```typescript
// Component with heavy prop drilling
function MapExperience() {
  const [pois, setPois] = useState([]);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [savedPoiIds, setSavedPoiIds] = useState([]);
  const [filters, setFilters] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // 50+ lines of state management logic
  
  return (
    <MapContainer>
      <PoiList
        pois={pois}
        selectedPoiId={selectedPoiId}
        savedPoiIds={savedPoiIds}
        filters={filters}
        onSelectPoi={setSelectedPoiId}
        onToggleSave={handleToggleSave}
        onUpdateFilters={setFilters}
      />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedPoi={pois.find(p => p.id === selectedPoiId)}
        savedPoiIds={savedPoiIds}
        onToggleSave={handleToggleSave}
      />
    </MapContainer>
  );
}
```

### After (With Zustand)

```typescript
// Component with clean store usage
function MapExperience() {
  const { pois, setPois } = usePoiStore();
  
  // That's it! State is managed in stores
  
  return (
    <MapContainer>
      <PoiList />
      <Drawer />
    </MapContainer>
  );
}

// Child components are self-contained
function PoiList() {
  const { pois, filters, getFilteredPois, selectPoi } = usePoiStore();
  const filteredPois = getFilteredPois();
  
  return (
    <div>
      {filteredPois.map(poi => (
        <PoiCard key={poi.id} poi={poi} />
      ))}
    </div>
  );
}
```

**Lines of Code Reduction:**
- MapExperience: 200+ lines → ~50 lines (**75% reduction**)
- No more prop drilling through 5+ component layers
- Easier to test and maintain

---

## 🎓 Best Practices

### 1. Store Organization

```typescript
// ✅ Good: Each store handles one domain
usePoiStore()    // POI data and filters
useMapStore()    // Map viewport and settings
useChatStore()   // Chat rooms and messages

// ❌ Bad: God store
useAppStore()    // Everything in one massive store
```

### 2. Actions vs Computed Values

```typescript
// ✅ Good: Use computed functions for derived state
const filteredPois = usePoiStore(state => state.getFilteredPois());

// ❌ Bad: Store derived state
const { filteredPois } = usePoiStore(); // Duplicates data
```

### 3. Selectors for Performance

```typescript
// ✅ Good: Subscribe only to what you need
const selectedPoi = usePoiStore(state =>
  state.pois.find(p => p.id === state.selectedPoiId)
);

// ❌ Bad: Re-renders on any store change
const store = usePoiStore();
const selectedPoi = store.pois.find(p => p.id === store.selectedPoiId);
```

### 4. Don't Mix Store Logic with Services

```typescript
// ✅ Good: Service fetches, store manages state
async function loadPois(eventId: string) {
  const response = await fetch(`/api/events/${eventId}/pois`);
  const pois = await response.json();
  usePoiStore.getState().setPois(pois);
}

// ❌ Bad: Service knows about component state
async function loadPois(eventId: string, setPois: Dispatch<...>) {
  // Service shouldn't know about React state
}
```

---

## 🚀 Quick Start Checklist

- [ ] Install Zustand: `npm install zustand`
- [ ] Create `src/stores/` directory
- [ ] Create `src/types/` directory with consolidated types
- [ ] Create basic stores: map, poi, drawer, chat, user
- [ ] Update one small feature to use stores (proof of concept)
- [ ] Break up `useAttendeeMapExperience` into sub-hooks
- [ ] Migrate one component tree at a time
- [ ] Update services to work with stores
- [ ] Add persistence where needed (saved POIs, user preferences)
- [ ] Ship! 🎉

---

## 📚 Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [TypeScript with Zustand](https://docs.pmnd.rs/zustand/guides/typescript)
- [Zustand DevTools](https://github.com/pmndrs/zustand#devtools)

---

## 🤝 Need Help?

If you get stuck during migration:
1. Start small - migrate one component first
2. Keep old code alongside new code (gradual migration)
3. Test each piece as you migrate
4. Don't refactor everything at once - ship features!

Remember: **The goal is to ship features faster, not to have perfect architecture.** Zustand is a tool to make your life easier as a solo dev, not an academic exercise!

Good luck! 🚀

