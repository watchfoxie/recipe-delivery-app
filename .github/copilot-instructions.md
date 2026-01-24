# Copilot Instructions - Recipe Delivery App

## Architecture Overview

**Nx monorepo** with two main applications and e2e test suites:
- `apps/api` – NestJS 11 REST API (TypeScript, TypeORM, MySQL)
- `apps/web` – Next.js 15 frontend (React 19, Tailwind CSS 4)
- `apps/api-e2e` – Jest-based contract tests for the API
- `apps/web-e2e` – Cypress e2e tests for the web app

All endpoints are prefixed with `/api` (e.g., `/api/recipes`). Swagger docs available at `/api/docs` in non-production environments.

## Developer Workflows

### Running the stack
```powershell
# Start MySQL + phpMyAdmin (required before API)
docker compose up -d

# Run API with auto-migrations
nx serve api

# Run Next.js frontend
nx serve web
```

### Database operations (always via Nx targets)
```powershell
nx run @recipe-delivery-app/api:db:migration:generate -- --name=AddFeature
nx run @recipe-delivery-app/api:db:migration:run
nx run @recipe-delivery-app/api:db:migration:revert
nx run @recipe-delivery-app/api:db:seed
```

### Testing
```powershell
nx test @recipe-delivery-app/api          # Unit tests
nx e2e @recipe-delivery-app/api-e2e       # E2E (runs migrations + seed automatically)
nx affected -t build,test,e2e             # Run only affected targets
```

## API Module Patterns

### Entity structure (`apps/api/src/modules/<domain>/entities/`)
- Use TypeORM decorators with explicit column names: `@Column({ name: 'snake_case' })`
- Define indexes in entity: `@Index('idx_recipe_category', ['recipeCategoryId'])`
- Example: [recipe.entity.ts](/apps/api/src/modules/recipes/entities/recipe.entity.ts)

### Controller patterns
- Decorate with `@ApiTags('DomainName')` and `@Controller('domain')`
- Use `@ApiStandardResponses(DtoClass, { isPaginated: true })` for consistent OpenAPI docs
- Return `{ message, data }` structure with i18n-translated messages
- Example: [recipes.controller.ts](apps/api/src/modules/recipes/recipes.controller.ts)

### Query parsing for list endpoints
Use `QueryParserUtil` from `common/utils/query-parser.util.ts`:
```typescript
const { sort, filter } = QueryParserUtil.parse(query, {
  sortMapping: { created_at: 'recipe.createdAt' },
  filterMapping: { difficulty: { column: 'recipe.difficulty', enumValues: ['usor', 'mediu', 'greu'] } }
});
```
Supports operators: `eq`, `ne`, `lt`, `gt`, `lte`, `gte`, `like`, `in`

### API Query Parameter Formats (Critical for Web Client)

> ⚠️ **Using incorrect parameter formats causes HTTP 422 errors.**

#### Sort Parameters
The API uses **snake_case** field names for sorting. The web client must use:
- `created_at:desc` or `created_at:asc` (NOT `createdAt`)
- `likes_count:desc` or `likes_count:asc` (NOT `likesCount`)
- `title:asc` or `title:desc`
- `difficulty:asc` or `difficulty:desc`
- `rating_avg:asc` or `rating_avg:desc`

#### Filter Parameters
- Use **numeric IDs** for foreign key filters, not slugs
- Example: `recipe_category_id:eq:5` (NOT `category.slug:eq:supe`)
- Available filter fields: `difficulty`, `recipe_category_id`, `prep_time`, `author_id`, `rating_avg`, `title`

#### Category Filtering Pattern
When filtering recipes by category slug (from URL), first fetch the category ID:
```typescript
// 1. Lookup category ID by slug
const categoryResponse = await apiClient.get(`/recipe-categories/slug/${categorySlug}`);
const categoryId = categoryResponse.data.data.id;

// 2. Use numeric ID in filter
const recipesResponse = await recipesApi.getAll({ filter: `recipe_category_id:eq:${categoryId}` });
```

#### Complete Example
```typescript
// Fetching recipes with sorting and filtering
const response = await recipesApi.getAll({
  page: 1,
  limit: 12,
  sort: 'created_at:desc',                    // snake_case field names
  filter: 'recipe_category_id:eq:5'           // numeric ID, not slug
});
```

## Internationalization (i18n)

- Translations in `apps/api/src/i18n/{en,ro}/messages.json`
- Fallback language: Romanian (`ro`)
- Use `I18nService` or `translateMessage()` helper for runtime translation
- Validation errors auto-translate via `I18nValidationPipe` and `I18nValidationExceptionFilter`

## Authentication

- JWT-based auth via `@nestjs/passport` and `@nestjs/jwt`
- Login endpoint: `POST /api/users/login` returns `{ data: { token } }`
- Protect endpoints with `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth('bearer')`
- `AuthModule` is `@Global()` – no need to import in feature modules
- `JwtAuthGuard` lives in `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

## Key Conventions

1. **DTOs**: Use `class-validator` + `class-transformer`. Response DTOs use `@Expose()` with `excludeExtraneousValues: true`
2. **Pagination**: All list endpoints support `page`, `limit`, `sort`, `filter` query params
3. **Error responses**: Handled by global filters in `common/filters/` – consistent `{ statusCode, message, error }` format
4. **Naming**: Database uses `snake_case`, TypeScript uses `camelCase` – always set explicit column names
5. **Enum values**: Recipe difficulty uses Romanian: `'usor'`, `'mediu'`, `'greu'`
6. **Tailwind CSS**: In `apps/web`, avoid `@apply` with custom class names (use utility lists directly in each class).
7. **Next.js App Router**: Hooks like `useSearchParams()` must live in a client component wrapped by a `Suspense` boundary in the page.
8. **Fonts & hydration**: Avoid inline `font-family` styles in `apps/web`. Use CSS variables and classes. The root `<body>` suppresses hydration warnings to tolerate client font extensions that override fonts.

## Frontend Architecture (apps/web)

### Design System - Ice Cream Palette
The app uses a rustic culinary theme with these TailwindCSS 4 custom colors (defined in `global.css`):
- `brown` (#6b3e26) - Primary text and accent
- `pink` (#ffc5d9) - Highlights
- `mint` (#c2f2d0) - Success states
- `cream` (#fdf5c9) - Backgrounds
- `peach` (#ffcb85) - Secondary accent

### Route Structure (App Router)
```
apps/web/src/app/
├── (main)/                           # Main layout with Header/Footer
│   ├── page.tsx                     # Homepage
│   ├── [category]/page.tsx          # Category listing
│   ├── reteta/[slug]/page.tsx       # Recipe detail (with favorites, reviews, sharing)
│   ├── retete/                      # Recipe categories
│   │   ├── page.tsx                 # All recipe categories
│   │   └── [subcategory]/page.tsx   # Subcategory recipe list
│   ├── selectii/                    # Thematic selections
│   │   ├── page.tsx                 # All selections
│   │   └── [selection]/page.tsx     # Selection detail
│   ├── ingrediente/                 # Ingredients
│   │   ├── page.tsx                 # All ingredient categories
│   │   └── [ingredient]/page.tsx    # Ingredient detail
│   ├── video/page.tsx               # Video tutorials
│   ├── search/page.tsx              # Search results
│   └── profil/                      # Authenticated user pages (protected)
│       ├── page.tsx                 # User dashboard
│       ├── setari/page.tsx          # Account settings (name, email, password, theme)
│       ├── favorite/page.tsx        # Saved recipes
│       └── retete/                  # User's recipes CRUD
│           ├── page.tsx             # List user's recipes
│           ├── noua/page.tsx        # Create new recipe
│           └── [id]/editeaza/page.tsx # Edit existing recipe
└── (auth)/                          # Auth layout (no Header/Footer)
    ├── layout.tsx                   # Centered layout with logo
    ├── autentificare/page.tsx       # Login
    └── inregistrare/page.tsx        # Register
```

### Component Library (`apps/web/src/components/`)
| Component | Purpose |
|-----------|---------|
| `layout/Header.tsx` | Sticky nav with mobile menu, auth-aware |
| `layout/Footer.tsx` | Site footer with links |
| `ui/Button.tsx` | 4 variants (primary/secondary/outline/ghost), loading state |
| `ui/Input.tsx` | Form input with icons, error states |
| `ui/Card.tsx` | Container with hover effects |
| `ui/StarRating.tsx` | Interactive/display star rating |
| `recipe/RecipeCard.tsx` | Recipe preview card |
| `recipe/RecipeGrid.tsx` | Responsive recipe grid |
| `common/LoadingSpinner.tsx` | Loading indicator |
| `common/Toast.tsx` | Notification toast |

### State Management
- **AuthContext** (`lib/context/AuthContext.tsx`): JWT token storage, login/logout/register, user profile
- **ToastContext** (`lib/context/ToastContext.tsx`): Global toast notifications (success, error, warning, info)
- **useAuth hook** (`lib/hooks/useAuth.ts`): Access auth state and methods
- **useToast hook** (`lib/hooks/useToast.ts`): Show toast notifications

### API Client (`apps/web/src/lib/api/`)
Type-safe Axios client with automatic token injection:
- `client.ts` - Axios instance with interceptors
- `types.ts` - TypeScript interfaces (User, Recipe, Category, etc.)
- `auth.ts`, `recipes.ts`, `categories.ts`, `favorites.ts`, `reviews.ts`, `users.ts` - Endpoint functions

### API Endpoint Patterns (Critical for Web-API Communication)
The web API client must use these exact endpoint paths and DTO structures:

**Recipes:**
- `GET /recipes` - List all recipes (paginated)
- `GET /recipes/:id` - Get recipe by ID
- `GET /recipes/slug/:slug` - Get recipe by slug
- `GET /recipes/my` - Get current user's recipes (requires auth)
- `POST /recipes` - Create recipe (requires auth)
- `PUT /recipes/:id` - Update recipe (requires auth)
- `DELETE /recipes/:id` - Delete recipe (requires auth)

**Reviews (nested under recipes):**
- `GET /recipes/:recipeId/reviews` - Get all reviews for a recipe
- `GET /recipes/:recipeId/reviews/my` - Get current user's review (requires auth)
- `GET /recipes/:recipeId/reviews/stats` - Get rating stats (average, count)
- `POST /recipes/:recipeId/reviews` - Create review with body `{ rating, comment? }` (requires auth)
- `PUT /recipes/:recipeId/reviews/:id` - Update review (requires auth)
- `DELETE /recipes/:recipeId/reviews/:id` - Delete review (requires auth)

**Favorites:**
- `GET /favorites` - Get user's favorite recipes (paginated, requires auth)
- `POST /favorites/:recipeId` - Add to favorites (no body needed, requires auth)
- `DELETE /favorites/:recipeId` - Remove from favorites (requires auth)
- `GET /favorites/:recipeId/status` - Check if recipe is favorited (requires auth)

**Paginated Response Structure:**
```typescript
interface PaginatedResponse<T> {
  message: string;
  data: {
    items: T[];
    page: number;
    limit: number;
    total: number;
    sort: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
    filter: Array<{ field: string; operator: string; value: string }>;
  };
}
```

### API Configuration
The web app connects to the API at `http://localhost:3001/api`. The base URL is configured in `apps/web/src/lib/api/client.ts` and can be overridden via `NEXT_PUBLIC_API_URL` environment variable in `.env.local`.
The API enables CORS for the web app. Configure allowed origins via `CORS_ORIGINS` (comma-separated). Default is `http://localhost:3000`. Using `*` allows any origin (credentials disabled).

### Asset Usage
Static assets (images) are stored in `apps/web/public/images/` with the following structure:
- `images/logo/` - Logo images (home-cooking-logo.png)
- `images/hero/` - Hero section images (moldovan-mamaliga.png)
- `images/features/` - Feature section images (vibrant-fruits.jpg, agroturism-moldova.jpg, kitchen-couple.jpg, rich-bread.jpg)
- `images/placeholders/` - Placeholder images for recipes (recipe-placeholder-2.png)

### Toast Notifications
The app uses `react-toastify` for toast notifications. The ToastProvider is configured in `apps/web/src/lib/context/ToastContext.tsx` and provides `success`, `error`, `warning`, `info` methods through the `useToast` hook.

### Image Configuration
`next.config.js` is configured to allow remote images from `localhost:3001` (API) and `cloudinary.com` for recipe images.

### Protected Routes Pattern
```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <LoadingSpinner />;
  // ... page content
}
```

### Web Application Component Architecture

The web app follows a modular component architecture with these key sections:

#### Homepage Sections (`apps/web/src/components/home/`)
- `HeroSection.tsx` - Main hero with hashtag badge, headline, CTAs, stats, and hero image
- `FeaturedRecipesSection.tsx` - 3x2 recipe grid with category filter buttons (default: Plăcinte)
- `QualityIngredientsSection.tsx` - 2-column layout showcasing ingredient quality
- `NewsletterSection.tsx` - Email subscription form with brown background

#### Layout Components (`apps/web/src/components/layout/`)
- `Header.tsx` - Fixed navigation with:
  - Logo + site name
  - 4 category dropdowns (Rețete, Selecții, Ingrediente, Video)
  - Search field
  - Theme toggle (light/dark mode)
  - Account dropdown (auth-aware)
  - Mobile responsive menu
- `Footer.tsx` - 4-column footer with brand, quick links, categories, contact

#### Routing Structure (`apps/web/src/app/(main)/`)
- `/` - Homepage with modular sections
- `/retete` - Recipe categories page
- `/retete/[subcategory]` - Dynamic subcategory with filtering/sorting
- `/selectii` - Selections (thematic collections) page
- `/selectii/[selection]` - Dynamic selection page
- `/ingrediente` - Ingredients categories page
- `/ingrediente/[ingredient]` - Dynamic ingredient page
- `/video` - Video tutorials with 2x2 YouTube grid
- `/search` - Search results with filtering options

#### Theme System
- CSS variables in `global.css` for light/dark themes
- Theme stored in localStorage
- Theme-aware utility classes: `.bg-theme-primary`, `.text-theme-primary`, `.border-theme`
- Rustic shadow classes: `.shadow-rustic`, `.shadow-rustic-lg`
- Pattern backgrounds: `.pattern-culinary`, `.hero-gradient-light`

## File Locations Reference

| Purpose | Location |
|---------|----------|
| App configuration | `apps/api/src/common/config/app.config.ts` |
| Global filters | `apps/api/src/common/filters/` |
| Shared DTOs | `apps/api/src/common/dto/` |
| Migrations | `apps/api/src/database/migrations/` |
| TypeORM config | `apps/api/src/database/typeorm.datasource.ts` |
| E2E test helpers | `apps/api-e2e/src/support/` |
| Frontend theme | `apps/web/src/app/global.css` |
| API client | `apps/web/src/lib/api/` |
| React contexts | `apps/web/src/lib/context/` |
| UI components | `apps/web/src/components/` |
