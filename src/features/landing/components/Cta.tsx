"use client";

import { Button } from "@/components/ui/button";

export default function Cta() {
  return (
    <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Prêt à transformer votre gestion commerciale ?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de commerces qui ont choisi TradeSphere pour gagner en efficacité et booster leur croissance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" className="text-lg h-14 bg-blue-600 dark:hover:text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              Démarrer gratuitement
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Contacter l&apos;équipe
            </Button>
          </div>
        </div>
      </section>
  );
}