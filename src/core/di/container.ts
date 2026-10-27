import { env } from "../config/env";
import { AiService } from "@/features/ai/aiService";
import { HttpAiRepository } from "@/features/ai/httpAiRepository";
import { AuthService } from "@/features/auth/authService";
import { HttpAuthRepository } from "@/features/auth/httpAuthRepository";
import { CuisineService } from "@/features/cuisine/cuisineService";
import { HttpCuisineRepository } from "@/features/cuisine/httpCuisineRepository";
import { HttpMealPlanRepository } from "@/features/mealplan/httpMealPlanRepository";
import { MealPlanService } from "@/features/mealplan/mealPlanService";
import { createPrivateClient } from "../http/privateClient";
import { createPublicClient } from "../http/publicClient";
import { AsyncKeyValueStorage } from "../storage/asyncKeyValueStorage";
import { SecureTokenStorage } from "../storage/secureTokenStorage";
import { HttpUserRepository } from "@/features/auth/httpUserRepository";
import { UserService } from "@/features/auth/userService";

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
export const mealPlanService = new MealPlanService(
  new HttpMealPlanRepository(privateHttp),
);
export const cuisineService = new CuisineService(
  new HttpCuisineRepository(privateHttp),
);
