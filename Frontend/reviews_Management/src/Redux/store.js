import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";


const rootReducer = combineReducers({
  
  [authSlice.name]: authSlice.reducer,
 
});

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) => [
    ...defaultMiddleware(), 
  
  ],
  devTools: process.env.NODE_ENV !== 'production', // Enables Redux DevTools in non-production mode
});

export default store;
