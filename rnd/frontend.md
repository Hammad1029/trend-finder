```markdown
# TrendToy MVP Frontend Implementation Brief

## Project Overview

Build a **B2B Trend Finder MVP** that helps importers discover trending products in specific global regions. This is the **frontend/full-stack Next.js application** that consumes a Python/FastAPI backend running LangGraph agents.

---

## Tech Stack (Non-Negotiable)

### Core Framework

- **Next.js 14+** (App Router, TypeScript)
- **React 18+** with Server Components where appropriate
- **Tailwind CSS** for styling
- **shadcn/ui** for component library

### Database & Auth

- **Supabase** (PostgreSQL + Auth + Realtime)
- **Prisma ORM** for type-safe database access
- **pgvector** extension enabled (already configured in backend)

### State Management & Data Fetching

- **TanStack Query (React Query)** for server state management
- **Zustand** for lightweight client state (if needed, e.g., UI preferences)
- **SWR** as alternative for Supabase Realtime subscriptions (choose one: React Query OR SWR, prefer React Query)

### Additional Tooling

- **Zod** for runtime validation
- **react-hook-form** for form handling
- **Recharts** for trend visualization charts
- **Lucide React** for icons

---

## Database Schema (Prisma Translation Required)

You need to translate this SQLAlchemy schema into **Prisma schema** (`schema.prisma`):

### Tables & Relationships

#### 1. `requests` (User Search Requests)
```

id Int @id @default(autoincrement())
user_request String @db.VarChar(255)
created_at DateTime @default(now())
user_id String // Supabase Auth user ID

search_criteria SearchCriteria?
product_metrics ProductMetrics[]
product_clusters ProductClusters[]

```

#### 2. `search_criteria` (Extracted Search Parameters)
```

id Int @id @default(autoincrement())
primary_keywords String @db.VarChar(255)
negative_keywords String @db.VarChar(255)
target_region String @db.VarChar(10)
price_min Int
price_max Int
currency String @db.VarChar(10)
vertical_category String @db.VarChar(50)
time_horizon_in_months Int

request_id Int @unique
request Request @relation(fields: [request_id], references: [id], onDelete: Cascade)

```

#### 3. `product_metrics` (Scraped Products)
```

id Int @id @default(autoincrement())

// Product Info
keyword_searched String @db.VarChar(255)
platform String @db.VarChar(50) // "Amazon", "Daraz"
unique_id String @db.VarChar(50) // ASIN or platform ID
description String @db.VarChar(1000)
price Float
currency String @db.VarChar(10)
image_url String @db.VarChar(255)
platform_category String @db.VarChar(50)
platform_region String @db.VarChar(10)

// Metrics
rating Float
review_count Int
sales_last_month Int
search_ranking Int
sponsored Boolean
score Float // Individual product trend score

// Vector Embedding (use Prisma Unsupported type)
embedding Unsupported("vector(1536)")

// Foreign Keys
request_id Int
request Request @relation(fields: [request_id], references: [id], onDelete: Cascade)

cluster_id Int?
cluster ProductClusters? @relation(fields: [cluster_id], references: [id], onDelete: SetNull)

```

#### 4. `product_clusters` (Grouped Trending Products)
```

id Int @id @default(autoincrement())
label Int // Cluster ID from ML algorithm

// Trend Info
trend_keywords String[] // Array of keywords
trend_final_score Float // 0-10 composite score
trend_label String @db.VarChar(50) // "STRONG UPWARD", "EMERGING", etc.
trend_explanation String @db.VarChar(1000)
trend_search_score Float // Google Trends component
trend_market_score Float // BSR/Reviews component
trend_slope Float // +/- trend direction
trend_volatility Float
trend_sales_volume Int
trend_saturation_ratio Float

// Cluster Analytics
cluster_size Int
min_price Float
max_price Float
average_price Float
average_sales_last_month Int
average_rating Float
average_review_count Int
average_search_ranking Int
average_product_score Float

// Foreign Key
request_id Int
request Request @relation(fields: [request_id], references: [id], onDelete: Cascade)

// Relationships
product_metrics ProductMetrics[]

```

---

## Application Architecture

### 1. Authentication Flow (Supabase Auth)
- Use `@supabase/auth-helpers-nextjs` and `@supabase/ssr`
- Implement middleware for protected routes
- Store user session in cookies (not localStorage)
- All API routes must verify JWT token

### 2. API Routes (Next.js Route Handlers)
Create these API endpoints in `app/api/`:

#### `POST /api/search`
- Accepts: `{ query: string }`
- Validates user credits/subscription
- Forwards request to Python backend: `POST http://python-backend/search`
- Stores `Request` record in Supabase
- Returns: `{ request_id: number, status: "processing" }`

#### `GET /api/search/[request_id]`
- Polls Python backend for status
- Returns aggregated results from `product_clusters` and `product_metrics`

#### `GET /api/search/history`
- Fetches user's past searches (filter by `user_id`)

#### `POST /api/trends/time-machine`
- Accepts: `{ product_keywords: string, region: string, start_year: number, end_year: number }`
- Calls Python backend to fetch Google Trends historical data
- Returns chart data

### 3. Real-Time Updates (Supabase Realtime)
- Subscribe to `product_clusters` table changes for live search progress
- Update UI when new clusters are inserted (agent working in background)
- Use React Query's `invalidateQueries` on realtime events

---

## Page Structure (App Router)

```

app/
├── (auth)/
│ ├── login/
│ │ └── page.tsx // Sign In/Sign Up page
│ └── layout.tsx // Auth layout (no navbar)
│
├── (dashboard)/
│ ├── layout.tsx // Protected layout with navbar
│ ├── page.tsx // Dashboard (Main Hub - Wireframe #3)
│ ├── search/
│ │ └── [id]/
│ │ └── page.tsx // Results page (Wireframe #5)
│ ├── history/
│ │ └── page.tsx // Search history (Wireframe #8)
│ └── settings/
│ └── page.tsx // User settings (Wireframe #9)
│
├── api/
│ ├── search/
│ │ ├── route.ts // POST new search
│ │ └── [id]/
│ │ └── route.ts // GET search results
│ ├── history/
│ │ └── route.ts // GET user history
│ └── trends/
│ └── time-machine/
│ └── route.ts // POST historical trends
│
└── layout.tsx // Root layout

````

---

## Key Components (shadcn/ui Based)

### Core UI Components to Install
```bash
npx shadcn-ui@latest add button input card badge dialog tabs select form table skeleton
````

### Custom Components to Build

#### 1. `SearchBar.tsx`

- Large input with autocomplete suggestions
- Shows example queries
- Triggers search mutation (React Query)

#### 2. `SearchProgressCard.tsx`

- Real-time agent status (Wireframe #4)
- Progress bar with step-by-step updates
- Uses Supabase Realtime subscription

#### 3. `ClusterCard.tsx`

- Expandable/collapsible cluster view
- Shows top product + "Show Similar N" button
- Color-coded by trend score (🟢 > 8, 🟡 6-8, 🔴 < 6)

#### 4. `ProductDetailModal.tsx`

- Dialog component (Wireframe #6)
- Recharts line chart for Google Trends
- "Time Machine" button to expand historical view

#### 5. `TimeMachineModal.tsx`

- Separate dialog for historical trends (Wireframe #7)
- Year range selector
- Multi-year Recharts line chart

#### 6. `HistoryTable.tsx`

- shadcn Table component
- Pagination + filtering
- Action buttons: View, Re-run, Export, Delete

---

## State Management Strategy

### React Query Setup

```typescript
// lib/react-query.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Key Queries & Mutations

#### Queries

```typescript
// hooks/useSearchResults.ts
useQuery(["search", requestId], () => fetchSearchResults(requestId));

// hooks/useSearchHistory.ts
useQuery(["history"], () => fetchSearchHistory());
```

#### Mutations

```typescript
// hooks/useCreateSearch.ts
useMutation((query: string) => createSearch(query), {
  onSuccess: (data) => {
    router.push(`/search/${data.request_id}`);
  },
});
```

### Realtime Integration

```typescript
// hooks/useRealtimeSearch.ts
// Subscribe to product_clusters table
// On INSERT event → invalidate React Query cache
supabase
  .channel("search-updates")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "product_clusters" },
    (payload) => queryClient.invalidateQueries(["search", requestId])
  );
```

---

## Styling Guidelines

### Design System (Tailwind)

- **Colors**: Use shadcn's default theme (zinc for neutrals)
- **Trend Badges**:
  - 🟢 Green: `bg-green-100 text-green-800`
  - 🟡 Yellow: `bg-yellow-100 text-yellow-800`
  - 🔴 Red: `bg-red-100 text-red-800`
- **Spacing**: Consistent `space-y-4` for vertical rhythm
- **Typography**: `font-sans` (Inter/system font)

### Responsive Breakpoints

- Mobile-first approach
- Hide cluster expansion on mobile (show top product only)
- Stack filters vertically on `< md` screens

---

## Critical Implementation Rules

### 1. Never Use localStorage for Session

- ❌ `localStorage.setItem('token', ...)`
- ✅ Supabase cookies via `@supabase/ssr`

### 2. Optimize Embedding Queries

- **Never fetch `embedding` column in SELECT queries** (it's 1536 floats!)
- Only fetch when doing similarity search via pgvector
- Example:

```typescript
// ❌ BAD
const products = await prisma.productMetrics.findMany(); // Includes embedding

// ✅ GOOD
const products = await prisma.productMetrics.findMany({
  select: { id: true, description: true, price: true /* ... NO embedding */ },
});
```

### 3. Debounce Search Input

- Use `useDebouncedValue` hook (300ms delay)
- Prevent API spam

### 4. Error Boundaries

- Wrap pages in React Error Boundaries
- Show user-friendly error messages
- Log errors to Sentry (optional)

---

## Performance Optimizations

### 1. Server Components by Default

- Use `'use client'` only when needed (forms, interactivity)
- Fetch initial data in Server Components

### 2. Image Optimization

- Use Next.js `<Image>` component for product images
- Set `loader` for external URLs (Amazon/Daraz)

### 3. Lazy Loading

- Dynamic import for heavy components (Recharts)

```typescript
const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  loading: () => <Skeleton className="h-64" />,
});
```

### 4. Pagination

- Don't load all clusters at once
- Implement "Load More" or pagination for > 10 clusters

---

## Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Python Backend
PYTHON_BACKEND_URL=https://your-railway-app.railway.app

# Database (for Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

---

## Testing Strategy (Optional for MVP)

### Unit Tests

- Vitest for utility functions
- React Testing Library for components

### E2E Tests

- Playwright for critical flows:
  1. Sign up → Search → View results
  2. Historical trends modal

---

## Deliverables Checklist

- [ ] Prisma schema matching the ORM above
- [ ] Supabase Auth integration (login/signup pages)
- [ ] Protected dashboard with search bar
- [ ] API routes for search CRUD operations
- [ ] Real-time search progress updates
- [ ] Results page with clustered products
- [ ] Product detail modal with trend chart
- [ ] Time Machine feature (historical Google Trends)
- [ ] Search history page
- [ ] Settings page (account, preferences)
- [ ] Responsive design (mobile + desktop)
- [ ] Error handling + loading states
- [ ] Type-safe Prisma queries
- [ ] React Query cache invalidation on Realtime events

---

## Critical Questions to Answer Before Starting

1. **Database**: Do you have Supabase project created? (Need URL + keys)
2. **Python Backend**: Is the FastAPI server deployed? (Need endpoint URL)
3. **Auth**: Email/password only, or also OAuth (Google, GitHub)?
4. **Pricing**: Should we implement Stripe integration now or fake it with a flag?
5. **Deployment**: Vercel project created?

---

## Example Code Snippets

### Prisma Client Setup

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Supabase Client (Server-Side)

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### API Route Example

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await request.json();

  // Create request record
  const searchRequest = await prisma.request.create({
    data: {
      user_request: query,
      user_id: user.id,
    },
  });

  // Forward to Python backend
  const response = await fetch(`${process.env.PYTHON_BACKEND_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: searchRequest.id, query }),
  });

  return NextResponse.json({
    request_id: searchRequest.id,
    status: "processing",
  });
}
```

---

## Final Notes

- **Start with authentication** (blocking requirement for everything else)
- **Build search flow first** (core user journey)
- **Add Time Machine later** (nice-to-have feature)
- **Use placeholder data** if Python backend isn't ready
- **Focus on UX** - smooth loading states, no jarring transitions
- **Keep it simple** - This is an MVP, not a full product
