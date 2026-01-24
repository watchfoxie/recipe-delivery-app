'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../../../../lib/hooks/useAuth';
import { useToast } from '../../../../../../lib/hooks/useToast';
import { recipesApi } from '../../../../../../lib/api/recipes';
import { categoriesApi } from '../../../../../../lib/api/categories';
import type { RecipeCategory, CreateRecipeRequest } from '../../../../../../lib/api/types';
import LoadingSpinner from '../../../../../../components/common/LoadingSpinner';

interface IngredientRow {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string;
}

interface StepRow {
  id: string;
  description: string;
  timeMinutes: string;
  notes: string;
}

interface FormData {
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  recipeCategoryId: string;
  difficulty: 'usor' | 'mediu' | 'greu';
  prepTimeMinutes: string;
  cookTimeMinutes: string;
  servings: string;
}

const initialFormData: FormData = {
  title: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  recipeCategoryId: '',
  difficulty: 'mediu',
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  servings: '',
};

const initialIngredient: Omit<IngredientRow, 'id'> = {
  name: '',
  quantity: '',
  unit: '',
  notes: '',
};

const initialStep: Omit<StepRow, 'id'> = {
  description: '',
  timeMinutes: '',
  notes: '',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createIngredient(): IngredientRow {
  return { id: generateId(), ...initialIngredient };
}

function createStep(): StepRow {
  return { id: generateId(), ...initialStep };
}

interface EditRecipePageProps {
  readonly params: Promise<{ readonly id: string }>;
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const resolvedParams = use(params);
  const recipeId = Number.parseInt(resolvedParams.id, 10);

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() => [createIngredient()]);
  const [steps, setSteps] = useState<StepRow[]>(() => [createStep()]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isRecipeLoading, setIsRecipeLoading] = useState(true);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/autentificare');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const data = await categoriesApi.getRecipeCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        error('Nu am putut încărca categoriile');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, error]);

  // Fetch existing recipe on mount
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setIsRecipeLoading(true);
        setRecipeError(null);

        const recipe = await recipesApi.getById(recipeId);

        // Verify the user owns this recipe
        if (recipe.authorId !== user.id) {
          setRecipeError('Nu ai permisiunea să editezi această rețetă');
          return;
        }

        // Parse description - split back short description from full description
        const descriptionParts = recipe.description?.split('\n\n') || [''];
        const shortDesc = descriptionParts[0] || '';
        const detailedDesc = descriptionParts.slice(1).join('\n\n');

        // Populate form data
        setFormData({
          title: recipe.title || '',
          shortDescription: shortDesc,
          description: detailedDesc,
          imageUrl: recipe.imageUrl || '',
          recipeCategoryId: recipe.category?.id?.toString() || '',
          difficulty: recipe.difficulty || 'mediu',
          prepTimeMinutes: recipe.prepTime?.toString() || '',
          cookTimeMinutes: recipe.cookTime?.toString() || '',
          servings: recipe.servings?.toString() || '',
        });

        // Populate ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredients(
            recipe.ingredients.map((ing) => ({
              id: generateId(),
              name: ing.ingredient?.name || '',
              quantity: ing.quantity?.toString() || '',
              unit: ing.unit || '',
              notes: ing.notes || '',
            }))
          );
        }

        // Populate steps
        if (recipe.steps && recipe.steps.length > 0) {
          const sortedSteps = [...recipe.steps].sort((a, b) => a.stepOrder - b.stepOrder);
          setSteps(
            sortedSteps.map((step) => ({
              id: generateId(),
              description: step.instruction || '',
              timeMinutes: step.duration?.toString() || '',
              notes: '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setRecipeError('Rețeta nu a fost găsită sau nu mai există');
      } finally {
        setIsRecipeLoading(false);
      }
    };

    if (isAuthenticated && user && recipeId) {
      fetchRecipe();
    }
  }, [isAuthenticated, user, recipeId, error]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ingredient handlers
  const handleIngredientChange = (
    index: number,
    field: keyof Omit<IngredientRow, 'id'>,
    value: string
  ) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, createIngredient()]);
  };

  const removeIngredientRow = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Step handlers
  const handleStepChange = (index: number, field: keyof Omit<StepRow, 'id'>, value: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addStepRow = () => {
    setSteps((prev) => [...prev, createStep()]);
  };

  const removeStepRow = (index: number) => {
    if (steps.length > 1) {
      setSteps((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      error('Titlul rețetei este obligatoriu');
      return false;
    }
    if (!formData.shortDescription.trim()) {
      error('Descrierea scurtă este obligatorie');
      return false;
    }
    if (!formData.recipeCategoryId) {
      error('Te rugăm să selectezi o categorie');
      return false;
    }

    // Validate at least one ingredient
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      error('Adaugă cel puțin un ingredient');
      return false;
    }

    // Validate at least one step
    const validSteps = steps.filter((step) => step.description.trim());
    if (validSteps.length === 0) {
      error('Adaugă cel puțin un pas de preparare');
      return false;
    }

    return true;
  };

  const handleSubmit = async (isPublished: boolean) => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare ingredients - filter empty rows
      const validIngredients = ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          ingredientId: 0, // Will be handled by backend based on name
          name: ing.name.trim(),
          quantity: Number.parseFloat(ing.quantity) || 1,
          unit: ing.unit.trim() || 'buc',
          notes: ing.notes.trim() || undefined,
        }));

      // Prepare steps - filter empty rows and add step numbers
      const validSteps = steps
        .filter((step) => step.description.trim())
        .map((step, index) => ({
          stepOrder: index + 1,
          instruction: step.description.trim(),
          duration: step.timeMinutes ? Number.parseInt(step.timeMinutes, 10) : undefined,
          notes: step.notes.trim() || undefined,
        }));

      const recipeData: CreateRecipeRequest = {
        title: formData.title.trim(),
        description: formData.shortDescription.trim() + (formData.description ? '\n\n' + formData.description.trim() : ''),
        difficulty: formData.difficulty,
        prepTime: formData.prepTimeMinutes ? Number.parseInt(formData.prepTimeMinutes, 10) : 0,
        cookTime: formData.cookTimeMinutes ? Number.parseInt(formData.cookTimeMinutes, 10) : 0,
        servings: formData.servings ? Number.parseInt(formData.servings, 10) : 4,
        imageUrl: formData.imageUrl.trim() || undefined,
        categoryId: Number.parseInt(formData.recipeCategoryId, 10),
        ingredients: validIngredients,
        steps: validSteps,
      };

      await recipesApi.update(recipeId, recipeData);

      success('Rețeta a fost actualizată cu succes!');
      router.push('/profil/retete');
    } catch (err) {
      console.error('Error updating recipe:', err);
      error('Nu am putut actualiza rețeta. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while fetching recipe
  if (isRecipeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-theme-secondary">Se încarcă rețeta...</p>
      </div>
    );
  }

  // Show error if recipe not found or user doesn't own it
  if (recipeError) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Link
          href="/profil/retete"
          className="inline-flex items-center gap-2 text-brown hover:text-brown/70 transition-colors mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Înapoi la rețetele mele</span>
        </Link>

        <div className="bg-pink/20 border border-pink rounded-2xl p-8 text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-brown mb-4"></i>
          <h2 className="text-xl font-display font-bold text-theme-primary mb-2">Eroare</h2>
          <p className="text-theme-secondary mb-6">{recipeError}</p>
          <Link
            href="/profil/retete"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brown text-white rounded-lg hover:bg-brown/90 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Înapoi la rețetele mele
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back navigation */}
      <Link
        href="/profil/retete"
        className="inline-flex items-center gap-2 text-brown hover:text-brown/70 transition-colors mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        <span>Înapoi la rețetele mele</span>
      </Link>

      {/* Page header */}
      <h1 className="text-3xl font-display font-bold text-theme-primary mb-8">
        Editează rețeta
      </h1>

      {/* Section 1: Basic Information */}
      <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
        <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
          <i className="fa-solid fa-circle-info text-peach" />
          Informații de bază
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-theme-secondary text-sm font-medium mb-1">
              Titlu rețetă <span className="text-pink">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="ex: Plăcintă cu brânză și mărar"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
              required
            />
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-theme-secondary text-sm font-medium mb-1">
              Descriere scurtă <span className="text-pink">*</span>
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="O descriere scurtă și atractivă a rețetei..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors resize-none"
              required
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label htmlFor="description" className="block text-theme-secondary text-sm font-medium mb-1">
              Descriere detaliată
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Poveste despre rețetă, sfaturi, variante..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors resize-none"
            />
          </div>

          {/* Image URL with preview */}
          <div>
            <label htmlFor="imageUrl" className="block text-theme-secondary text-sm font-medium mb-1">
              Imagine URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
            />
            {formData.imageUrl && (
              <div className="mt-3 relative h-48 w-full rounded-lg overflow-hidden border border-theme">
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholders/recipe-placeholder-2.png';
                  }}
                />
              </div>
            )}
          </div>

          {/* Grid for Category, Difficulty */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="recipeCategoryId" className="block text-theme-secondary text-sm font-medium mb-1">
                Categorie <span className="text-pink">*</span>
              </label>
              <select
                id="recipeCategoryId"
                name="recipeCategoryId"
                value={formData.recipeCategoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:outline-none focus:border-peach transition-colors"
                required
                disabled={isCategoriesLoading}
              >
                <option value="">Selectează categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-theme-secondary text-sm font-medium mb-1">
                Dificultate
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:outline-none focus:border-peach transition-colors"
              >
                <option value="usor">Ușor</option>
                <option value="mediu">Mediu</option>
                <option value="greu">Greu</option>
              </select>
            </div>
          </div>

          {/* Grid for Times and Servings */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Prep Time */}
            <div>
              <label htmlFor="prepTimeMinutes" className="block text-theme-secondary text-sm font-medium mb-1">
                Timp preparare (min)
              </label>
              <input
                type="number"
                id="prepTimeMinutes"
                name="prepTimeMinutes"
                value={formData.prepTimeMinutes}
                onChange={handleInputChange}
                min="0"
                placeholder="30"
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
              />
            </div>

            {/* Cook Time */}
            <div>
              <label htmlFor="cookTimeMinutes" className="block text-theme-secondary text-sm font-medium mb-1">
                Timp gătire (min)
              </label>
              <input
                type="number"
                id="cookTimeMinutes"
                name="cookTimeMinutes"
                value={formData.cookTimeMinutes}
                onChange={handleInputChange}
                min="0"
                placeholder="45"
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
              />
            </div>

            {/* Servings */}
            <div>
              <label htmlFor="servings" className="block text-theme-secondary text-sm font-medium mb-1">
                Porții
              </label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                min="1"
                placeholder="4"
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Ingredients */}
      <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
        <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
          <i className="fa-solid fa-carrot text-peach" />
          Ingrediente
        </h2>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className="flex gap-2 items-start p-3 bg-theme-primary/50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Denumire"
                  className="col-span-2 md:col-span-1 px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                />
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  placeholder="Cantitate"
                  className="px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  placeholder="Unitate"
                  className="px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                />
                <input
                  type="text"
                  value={ingredient.notes}
                  onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                  placeholder="Notă (opțional)"
                  className="col-span-2 md:col-span-1 px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredientRow(index)}
                disabled={ingredients.length === 1}
                className="w-8 h-8 rounded-full bg-pink/30 text-brown hover:bg-pink/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Șterge ingredient"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addIngredientRow}
            className="w-full py-2 rounded-lg border-2 border-dashed border-theme text-theme-secondary hover:border-peach hover:text-peach transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus" />
            Adaugă ingredient
          </button>
        </div>
      </section>

      {/* Section 3: Steps */}
      <section className="bg-theme-card rounded-2xl shadow-rustic p-6 mb-6">
        <h2 className="text-xl font-display font-bold text-theme-primary mb-4 flex items-center gap-2">
          <i className="fa-solid fa-list-ol text-peach" />
          Pași de preparare
        </h2>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex gap-2 items-start p-3 bg-theme-primary/50 rounded-lg"
            >
              {/* Step number */}
              <div className="w-8 h-8 rounded-full bg-brown text-white flex items-center justify-center font-bold text-sm shrink-0">
                {index + 1}
              </div>

              <div className="flex-1 space-y-2">
                <textarea
                  value={step.description}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  placeholder="Descrierea pasului..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={step.timeMinutes}
                    onChange={(e) => handleStepChange(index, 'timeMinutes', e.target.value)}
                    placeholder="Timp (minute)"
                    min="0"
                    className="px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                  />
                  <input
                    type="text"
                    value={step.notes}
                    onChange={(e) => handleStepChange(index, 'notes', e.target.value)}
                    placeholder="Notă (opțional)"
                    className="px-3 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-peach transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeStepRow(index)}
                disabled={steps.length === 1}
                className="w-8 h-8 rounded-full bg-pink/30 text-brown hover:bg-pink/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Șterge pas"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addStepRow}
            className="w-full py-2 rounded-lg border-2 border-dashed border-theme text-theme-secondary hover:border-peach hover:text-peach transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus" />
            Adaugă pas
          </button>
        </div>
      </section>

      {/* Submit Actions */}
      <div className="flex gap-4">
        <Link
          href="/profil/retete"
          className="flex-1 py-3 rounded-lg font-semibold text-brown bg-cream border-2 border-brown hover:bg-cream/80 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-times"></i>
          <span>Anulează</span>
        </Link>

        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-lg font-semibold text-white bg-brown hover:bg-brown/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Se salvează...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-save"></i>
              <span>Salvează modificările</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
