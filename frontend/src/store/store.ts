import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, type PersistConfig } from 'redux-persist';
import type { Reducer } from 'redux';

import { api } from './api';
import { authReducer } from './slices/authSlice';
import { flowReducer } from './slices/flowSlice';
import { profileReducer } from './slices/profileSlice';
import { uiReducer } from './slices/uiSlice';
import { localStorageAdapter } from './persistStorage';

const rootReducer = combineReducers({
  auth: authReducer,
  flow: flowReducer,
  profile: profileReducer,
  ui: uiReducer,
  [api.reducerPath]: api.reducer,
});

type StoreState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<StoreState> = {
  key: 'root',
  storage: localStorageAdapter,
  // `ui` is intentionally NOT persisted — `logoutLocked` resets to its
  // factory default (`true`) on every page load, so the user has to unblock
  // logout each session regardless of browser cache state.
  whitelist: ['auth', 'flow', 'profile'],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer as Reducer<StoreState>,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = StoreState;
export type AppDispatch = AppStore['dispatch'];
