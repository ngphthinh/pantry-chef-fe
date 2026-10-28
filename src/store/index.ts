import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/auth/userSlice";
import themeReducer from "@/core/theme/themeSlice";
import savedRecipesReducer from "@/features/savedRecipes/savedRecipesSlice";
import statsReducer from "@/features/stats/statsSlice";
import collectionsReducer from "@/features/collections/collectionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    user: userReducer,
    savedRecipes: savedRecipesReducer,
    stats : statsReducer,
    collections: collectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
