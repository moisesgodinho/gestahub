// src/app/mais/page.js
"use client";

import Link from "next/link";
import KickCounterIcon from "@/components/icons/KickCounterIcon";
import ContractionIcon from "@/components/icons/ContractionIcon";
import BagIcon from "@/components/icons/BagIcon"; // Importar o novo ícone
import Card from "@/components/Card";

const otherLinks = [
  {
    href: "/contador-de-movimentos",
    label: "Contador de Movimentos",
    icon: KickCounterIcon,
  },
  {
    href: "/cronometro-de-contracoes",
    label: "Cronômetro de Contrações",
    icon: ContractionIcon,
  },
  {
    href: "/mala-maternidade",
    label: "Mala da Maternidade",
    icon: BagIcon,
  },
];

export default function MorePage() {
  return (
    // CORREÇÃO: Alterado "items-center" para "items-start" para alinhar ao topo
    <div className="flex items-start justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Mais Ferramentas
        </h1>
        <Card>
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            {otherLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors aspect-square"
                >
                  <Icon className="w-12 h-12 text-rose-500 dark:text-rose-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </Card>
      </div>
    </div>
  );
}