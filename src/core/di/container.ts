import { env } from "../config/env";
import { AiService } from "@/features/ai/aiService";
import { HttpAiRepository } from "@/features/ai/httpAiRepository";
import { AuthService } from "@/features/auth/authService";
import { HttpAuthRepository } from "@/features/auth/httpAuthRepository";
import { CuisineService } from "@/features/cuisine/cuisineService";
import { HttpCuisineRepository } from "@/features/cuisine/httpCuisineRepository";
import { CustomRecipeService } from "@/features/customRecipe/customRecipeService";
import { HttpCustomRecipeRepository } from "@/features/customRecipe/httpCustomRecipeRepository";
import { FeedbackService } from "@/features/feedback/feedbackService";
import { HttpFeedbackRepository } from "@/features/feedback/httpFeedbackRepository";
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
import { HttpShoppingRepository } from "@/features/shopping/httpShoppingRepository";
import { ShoppingService } from "@/features/shopping/shoppingService";
import { HttpUnitRepository } from "@/features/unit/httpUnitRepository";
import { UnitService } from "@/features/unit/unitService";

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

const cuisineRepository = new HttpCuisineRepository(publicHttp, privateHttp);
export const cuisineService = new CuisineService(cuisineRepository, cuisineRepository);

const customRecipeRepository = new HttpCustomRecipeRepository(privateHttp);
export const customRecipeService = new CustomRecipeService(customRecipeRepository, customRecipeRepository);

export const feedbackService = new FeedbackService(new HttpFeedbackRepository(privateHttp));

const pantryRepository = new HttpPantryRepository(privateHttp);
export const pantryService = new PantryService(pantryRepository);

const mealPlanRepository = new HttpMealPlanRepository(privateHttp);
export const mealPlanService = new MealPlanService(mealPlanRepository);

const shoppingRepository = new HttpShoppingRepository(privateHttp);
export const shoppingService = new ShoppingService(shoppingRepository, shoppingRepository);

export const unitService = new UnitService(new HttpUnitRepository(privateHttp));
