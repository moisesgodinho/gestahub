// src/app/mais/page.js
"use client";

import Link from "next/link";
import KickCounterIcon from "@/components/icons/KickCounterIcon";
import ContractionIcon from "@/components/icons/ContractionIcon";
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
];

export default function MorePage() {
  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Mais Ferramentas
        </h1>
        <Card>
          <nav className="flex flex-col gap-2">
            {otherLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                  <span className="text-lg text-slate-700 dark:text-slate-300 font-semibold">
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
