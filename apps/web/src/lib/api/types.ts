// API Response wrapper
export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
}

// Pagination response - matches API structure
export interface PaginatedResponse<T> {
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

// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Recipe types
export interface Recipe {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: 'usor' | 'mediu' | 'greu';
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl: string | null;
  ratingAvg: number;
  likesCount: number;
  authorId: number;
  author: { id: number; firstName: string; lastName: string };
  category: { id: number; name: string; slug: string } | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: number;
  quantity: number;
  unit: string;
  notes: string | null;
  ingredient: {
    id: number;
    name: string;
    slug: string;
    iconClass: string | null;
  };
}

export interface RecipeStep {
  id: number;
  stepOrder: number;
  instruction: string;
  duration: number | null;
  imageUrl: string | null;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  difficulty: 'usor' | 'mediu' | 'greu';
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl?: string;
  categoryId?: number;
  ingredients?: { ingredientId: number; quantity: number; unit: string; notes?: string }[];
  steps?: { stepOrder: number; instruction: string; duration?: number; imageUrl?: string }[];
}

// Category types
export interface RecipeCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  thematicCategory: 'retete' | 'selectii';
  recipeCount?: number;
}

export interface IngredientCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

// Review types
export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  userId: number;
  recipeId: number;
  user: { id: number; firstName: string; lastName: string; avatar: string | null };
  createdAt: string;
}

// CreateReviewRequest - no recipeId (it's a path parameter)
export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// Favorite types
export interface Favorite {
  id: number;
  userId: number;
  recipeId: number;
  recipe: Recipe;
  createdAt: string;
}

// Query params
export interface RecipeQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  search?: string;
  category?: string;
  difficulty?: 'usor' | 'mediu' | 'greu';
}
