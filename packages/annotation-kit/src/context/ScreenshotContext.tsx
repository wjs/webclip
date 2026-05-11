import React, { createContext, useContext } from 'react';
import type { ScreenshotProvider } from '../types';

export const ScreenshotContext = createContext<ScreenshotProvider | null>(null);

export const ScreenshotProviderWrapper: React.FC<{
  provider: ScreenshotProvider;
  children: React.ReactNode;
}> = ({ provider, children }) => (
  <ScreenshotContext.Provider value={provider}>
    {children}
  </ScreenshotContext.Provider>
);

export function useScreenshotProvider(): ScreenshotProvider {
  const ctx = useContext(ScreenshotContext);
  if (!ctx) throw new Error('ScreenshotProvider not provided — wrap your component tree with ScreenshotProviderWrapper');
  return ctx;
}