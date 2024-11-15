import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import { Provider, useSelector } from 'react-redux';
import { userSlice } from "./slice/userSlice";
import { PersistGate } from "redux-persist/integration/react";

const rootReducer = combineReducers({
  user: userSlice.reducer
});
const persistedRootReducer = persistReducer({
  key: 'root',
  storage,
  version: 1
}, rootReducer);

const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
const persistor = persistStore(store);

export const ReduxStoreProvider = ({ children }: ChildrenProps) => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
);

const useRootSelector = useSelector.withTypes<ReturnType<typeof store.getState>>();
export const useUserStore = () => useRootSelector(state => state.user);