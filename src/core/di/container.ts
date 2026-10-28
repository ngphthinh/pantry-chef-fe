import { env } from "../config/env";
import { AiService } from "@/features/ai/aiService";
import { HttpAiRepository } from "@/features/ai/httpAiRepository";
import { AuthService } from "@/features/auth/authService";
import { HttpAuthRepository } from "@/features/auth/httpAuthRepository";
import { CuisineService } from "@/features/cuisine/cuisineService";
import { HttpCuisineRepository } from "@/features/cuisine/httpCuisineRepository";
import { createPrivateClient } from "../http/privateClient";
import { createPublicClient } from "../http/publicClient";
import { AsyncKeyValueStorage } from "../storage/asyncKeyValueStorage";
import { SecureTokenStorage } from "../storage/secureTokenStorage";
import { HttpUserRepository } from "@/features/auth/httpUserRepository";
import { UserService } from "@/features/auth/userService";

import { HttpPantryRepository } from "@/features/pantry/httpPantryRepository";
import { PantryService } from "@/features/pantry/pantryService";
import { HttpMealPlanRepository } from "@/features/mealplan/httpMealPlanRepository";
import { MealPlanService } from "@/features/mealplan/mealPlanService";
import { CustomRecipeService } from "@/features/customRecipe/customRecipeService";
import { HttpCustomRecipeRepository } from "@/features/customRecipe/httpCustomRecipeRepository";
import { HttpRecipeRepository } from "@/features/recipe/httpRecipeRepository";
import { RecipeService } from "@/features/recipe/recipeService";
import { HttpShoppingRepository } from "@/features/shopping/httpShoppingRepository";
import { ShoppingService } from "@/features/shopping/shoppingService";

export const kvStorage = new AsyncKeyValueStorage();
export const tokenStorage = new SecureTokenStorage();

export const publicHttp = createPublicClient(env.apiUrl);
export const privateHttp = createPrivateClient(env.apiUrl, tokenStorage);

const authRepository = new HttpAuthRepository(publicHttp, privateHttp);
const userRepository = new HttpUserRepository(privateHttp);

export const authService = new AuthService(
  authRepository,
  authRepository,
  userRepository,
  tokenStorage,
);

export const userService = new UserService(userRepository);

export const aiService = new AiService(new HttpAiRepository(privateHttp));

export const cuisineService = new CuisineService(
  new HttpCuisineRepository(privateHttp),
);
const pantryRepository = new HttpPantryRepository(privateHttp);
export const pantryService = new PantryService(pantryRepository);

const mealPlanRepository = new HttpMealPlanRepository(privateHttp);
export const mealPlanService = new MealPlanService(mealPlanRepository);

const shoppingRepository = new HttpShoppingRepository(privateHttp);
export const shoppingService = new ShoppingService(shoppingRepository);

const recipeRepository = new HttpRecipeRepository(privateHttp);
export const recipeService = new RecipeService(recipeRepository);

const customRecipeRepository = new HttpCustomRecipeRepository(privateHttp);
export const customRecipeService = new CustomRecipeService(customRecipeRepository);
