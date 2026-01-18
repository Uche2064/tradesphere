"use client";

import { useEffect } from "react";

/**
 * Hook pour définir le titre de la page dynamiquement dans les composants client
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    // Vérifier qu'on est côté client
    if (typeof window === "undefined") return;
    
    const newTitle = `${title} | TradeSphere`;
    
    // Utiliser setTimeout pour s'assurer que la mise à jour se fait après le rendu de Next.js
    const timer = setTimeout(() => {
      document.title = newTitle;
    }, 0);
    
    // Mettre à jour immédiatement aussi
    document.title = newTitle;
    
    return () => {
      clearTimeout(timer);
    };
  }, [title]);
}
