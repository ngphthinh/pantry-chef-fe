import { env } from "../config/env";
import { AuthService } from "@/features/auth/authService";
import { HttpAuthRepository } from "@/features/auth/httpAuthRepository";
import { createPrivateClient } from "../http/privateClient";
import { createPublicClient } from "../http/publicClient";
import { AsyncKeyValueStorage } from "../storage/asyncKeyValueStorage";
import { SecureTokenStorage } from "../storage/secureTokenStorage";
import { HttpUserRepository } from "@/features/auth/httpUserRepository";
import { UserService } from "@/features/auth/userService";
import {HttpSavedRecipeRepository} from "@/features/savedRecipes/httpSavedRecipeRepository";
import {SavedRecipeService} from "@/features/savedRecipes/savedRecipeService";
import {CachedSavedRecipeRepository} from "@/features/savedRecipes/cachedSavedRecipeRepository";
import {HttpStatsRepository} from "@/features/stats/httpStatsRepository";
import {StatsService} from "@/features/stats/statsService";
import {HttpCollectionRepository} from "@/features/collections/httpCollectionRepository";
import {CollectionService} from "@/features/collections/collectionService";

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

export const savedRecipeService = new SavedRecipeService(
    new CachedSavedRecipeRepository(new HttpSavedRecipeRepository(privateHttp))
)

export const statsService = new StatsService(new HttpStatsRepository(privateHttp));
export const collectionService = new CollectionService(new HttpCollectionRepository(privateHttp));