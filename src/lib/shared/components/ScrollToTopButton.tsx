'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/lib/components/ui/button';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Gérer la visibilité du bouton selon le scroll
  useEffect(() => {
    const toggleVisibility = () => {
      // Afficher le bouton si on a scrollé plus de 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <div className="fixed right-6 bottom-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            size="lg"
            onClick={scrollToTop}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
            aria-label="Retour en haut de page"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
}
