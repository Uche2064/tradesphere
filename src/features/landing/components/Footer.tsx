"use client";


import { Store } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TradeSphere</span>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
              La plateforme SaaS de gestion commerciale pour boutiques, PME et réseaux de magasins.
            </p>
            <div className="flex gap-3">
              {/* Social icons can stay <a> if external */}
              <a href="#" className="w-9 h-9 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 ..."/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 ..."/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5 ..."/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm hover:text-white transition-colors">Fonctionnalités</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm hover:text-white transition-colors">Tarifs</Link>
              </li>
              <li>
                <Link href="/customers" className="text-sm hover:text-white transition-colors">Cas clients</Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-sm hover:text-white transition-colors">Roadmap</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">À propos</Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm hover:text-white transition-colors">Carrières</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ressources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-sm hover:text-white transition-colors">Documentation</Link>
              </li>
              <li>
                <Link href="/help-center" className="text-sm hover:text-white transition-colors">Centre d&apos;aide</Link>
              </li>
              <li>
                <Link href="/api" className="text-sm hover:text-white transition-colors">API</Link>
              </li>
              <li>
                <Link href="/status" className="text-sm hover:text-white transition-colors">Statut</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 dark:border-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              © 2026 TradeSphere. Tous droits réservés.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/#" className="text-slate-400 dark:text-slate-500 hover:text-white transition-colors">Mentions légales</Link>
              <Link href="/#" className="text-slate-400 dark:text-slate-500 hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/#" className="text-slate-400 dark:text-slate-500 hover:text-white transition-colors">CGU</Link>
              <Link href="/#" className="text-slate-400 dark:text-slate-500 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}