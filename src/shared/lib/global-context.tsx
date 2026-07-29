import { createContext } from 'react';

export interface GlobalContextValue {
  lang?: string;
  setLang?: (value: string) => void;
  theme?: string;
  setTheme?: (value: string) => void;
}

export const GlobalContext = createContext<GlobalContextValue>({});
