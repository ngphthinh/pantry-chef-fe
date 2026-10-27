import { env } from "../config/env";
import { AuthService } from "@/features/auth/authService";
import { HttpAuthRepository } from "@/features/auth/httpAuthRepository";
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

const pantryRepository = new HttpPantryRepository(privateHttp);
export const pantryService = new PantryService(pantryRepository);

const mealPlanRepository = new HttpMealPlanRepository(privateHttp);
export const mealPlanService = new MealPlanService(mealPlanRepository, mealPlanRepository);

const shoppingRepository = new HttpShoppingRepository(privateHttp);
export const shoppingService = new ShoppingService(shoppingRepository);

