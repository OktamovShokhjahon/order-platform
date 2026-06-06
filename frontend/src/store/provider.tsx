'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import { useEffect, useRef } from 'react';
import { initCart } from './slices/cartSlice';
import { initAuth, loadUser, logout } from './slices/authSlice';
import { setOnUnauthorized } from '@/lib/api';

function StoreInitializer({ children }: { children: React.ReactNode }) {
  const didInit = useRef(false);

  if (!didInit.current) {
    didInit.current = true;
    store.dispatch(initAuth());
    store.dispatch(initCart());
  }

  useEffect(() => {
    setOnUnauthorized(() => {
      store.dispatch(logout());
    });
    store.dispatch(loadUser());
  }, []);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  );
}
