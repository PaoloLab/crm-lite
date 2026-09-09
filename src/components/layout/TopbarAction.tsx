'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface TopbarActionContextValue {
  action: ReactNode;
  setAction: (action: ReactNode) => void;
}

const TopbarActionContext = createContext<TopbarActionContextValue | null>(null);

/**
 * Va renderizzato una sola volta, dentro app/(dashboard)/layout.tsx, a
 * wrappare sia <Topbar /> sia {children}: è quello che permette a una
 * pagina (anche Server Component) di "iniettare" il proprio bottone
 * contestuale nella topbar tramite <TopbarAction>, senza che il layout
 * condiviso conosca in anticipo cosa renderizzare.
 */
export function TopbarActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode>(null);

  return (
    <TopbarActionContext.Provider value={{ action, setAction }}>
      {children}
    </TopbarActionContext.Provider>
  );
}

function useTopbarActionContext(): TopbarActionContextValue {
  const context = useContext(TopbarActionContext);
  if (!context) {
    throw new Error('TopbarAction/useTopbarAction devono stare dentro <TopbarActionProvider>.');
  }
  return context;
}

/** Usato da <Topbar /> per leggere l'azione registrata dalla pagina corrente. */
export function useTopbarAction(): ReactNode {
  return useTopbarActionContext().action;
}

/**
 * Va renderizzato dalla singola pagina, ovunque nel suo JSX, con il bottone
 * contestuale come children (es. <TopbarAction><Button>Nuova azienda</Button></TopbarAction>).
 * Non renderizza nulla al proprio posto: registra solo il contenuto nel
 * contesto condiviso, che <Topbar /> mostra nell'angolo in alto a destra.
 * Cambiando pagina, il cleanup dell'effect rimuove l'azione della pagina precedente.
 */
export function TopbarAction({ children }: { children: ReactNode }) {
  const { setAction } = useTopbarActionContext();

  useEffect(() => {
    setAction(children);
    return () => setAction(null);
  }, [children, setAction]);

  return null;
}
