import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/auth/userSlice";
import themeReducer from "@/core/theme/themeSlice";
import aiReducer from "@/features/ai/aiSlice";
import pantryReducer from "@/features/pantry/pantrySlice";
import mealPlanReducer from "@/features/mealplan/mealPlanSlice";
import cuisineReducer from "@/features/cuisine/cuisineSlice";
import feedbackReducer from "@/features/feedback/feedbackSlice";
import shoppingReducer from "@/features/shopping/shoppingSlice";
import unitReducer from "@/features/unit/unitSlice";
import adminReducer from "@/features/admin/adminSlice";
import customRecipeReducer from "@/features/customRecipe/customRecipeSlice";
import recipeReducer from "@/features/recipe/recipeSlice";
import savedRecipesReducer from "@/features/savedRecipes/savedRecipesSlice";
import statsReducer from "@/features/stats/statsSlice";
import collectionsReducer from "@/features/collections/collectionsSlice";
import ingredientReducer from "@/features/ingredient/ingredientSlice";
import excludedIngredientReducer from "@/features/excludedIngredient/excludedIngredientSlice";
import syncReducer from "@/features/sync/syncSlice";
import metaReducer from "@/features/meta/metaSlice";
import expiryReminderReducer from "@/features/expiryReminder/expiryReminderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    user: userReducer,
    ai: aiReducer,
    pantry: pantryReducer,
    mealPlan: mealPlanReducer,
    cuisine: cuisineReducer,
    customRecipe: customRecipeReducer,
    feedback: feedbackReducer,
    shopping: shoppingReducer,
    unit: unitReducer,
    admin: adminReducer,
    recipe: recipeReducer,
    savedRecipes: savedRecipesReducer,
    stats: statsReducer,
    collections: collectionsReducer,
    ingredient: ingredientReducer,
    excludedIngredient: excludedIngredientReducer,
    sync: syncReducer,
    meta: metaReducer,
    expiryReminder: expiryReminderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
