import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/auth/userSlice";
import themeReducer from "@/core/theme/themeSlice";
import pantryReducer from "@/features/pantry/pantrySlice";
import mealPlanReducer from "@/features/mealplan/mealPlanSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    user: userReducer,
    pantry: pantryReducer,
    mealPlan: mealPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
