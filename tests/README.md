# MVP Test Suite

Test suite for Megalithic Mapper MVP features using Vitest.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run with UI
npm run test:ui
```

## Test Structure

```
tests/
├── setup.ts              # Global test setup
├── README.md             # This file
├── api/                  # API route tests
│   ├── sites.test.ts     # Site CRUD tests
│   ├── posts.test.ts     # Post creation tests
│   ├── feed.test.ts      # Activity feed tests
│   └── voting.test.ts    # Community voting tests
└── utils/
    └── test-utils.ts     # Shared test utilities
```

## What's Tested

### Sites API (`/api/sites`)
- ✅ Authentication required for site creation
- ✅ Validation of required fields (name, summary, coordinates)
- ✅ Successful site creation with valid data
- ✅ Listing sites with pagination
- ✅ Filtering by verification status

### Posts API (`/api/posts`)
- ✅ Authentication required for post creation
- ✅ Validation of required fields (body)
- ✅ Successful post creation
- ✅ Posts can be linked to sites
- ✅ YouTube URL parsing and thumbnail extraction

### Feed API (`/api/feed`)
- ✅ Returns feed items with default sorting
- ✅ Hot sorting algorithm
- ✅ Filtering by site
- ✅ Time decay calculations

### Voting API (`/api/sites/[id]/vote`)
- ✅ Authentication required
- ✅ Vote type validation (approve/reject/needs_info)
- ✅ Site existence check
- ✅ Creating new votes
- ✅ Updating existing votes
- ✅ Retrieving vote counts
- ✅ Removing votes
- ✅ Auto-verification threshold logic

## Utilities

### `createChainableMock<T>(data)`
Creates a mock that mimics Supabase's chainable query builder.

```typescript
const mock = createChainableMock([{ id: '1', name: 'Site' }]);
mockSupabase.schema().from.mockReturnValue(mock);
```

### Mock Data Generators
- `mockSite(overrides)` - Generate site objects
- `mockPost(overrides)` - Generate post objects
- `mockProfile(overrides)` - Generate profile objects
- `mockActivityItem(overrides)` - Generate activity feed items

## Configuration

Tests use:
- **Vitest** - Test runner
- **happy-dom** - DOM environment
- **vi.mock** - Module mocking

The Supabase client is mocked in `setup.ts` to avoid hitting real database.

## Adding New Tests

1. Create test file in appropriate directory (`tests/api/`, `tests/components/`, etc.)
2. Import utilities from `tests/utils/test-utils.ts`
3. Use `describe`/`it` blocks to organize tests
4. Mock Supabase responses using `createChainableMock`

Example:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChainableMock, mockSite } from '../utils/test-utils';

describe('MyFeature', () => {
  it('should do something', async () => {
    const mock = createChainableMock([mockSite()]);
    // Test implementation
  });
});
```



