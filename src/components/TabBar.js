// src/components/TabBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "./icons/HomeIcon";
import CalendarIcon from "./icons/CalendarIcon";
import JournalIcon from "./icons/JournalIcon";
import ScaleIcon from "./icons/ScaleIcon"; // ALTERAÇÃO: Importar o novo ícone
import MoreIcon from "./icons/MoreIcon";

const mainNavLinks = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/consultas", label: "Consultas", icon: CalendarIcon },
  { href: "/diario-de-sintomas", label: "Diário", icon: JournalIcon },
  { href: "/acompanhamento-de-peso", label: "Peso", icon: ScaleIcon }, // ALTERAÇÃO: Usar o novo ícone
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {mainNavLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-slate-50 dark:hover:bg-slate-700 group"
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-rose-500"
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-rose-500"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/mais"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-slate-50 dark:hover:bg-slate-700 group"
        >
          <MoreIcon
            className={`w-6 h-6 mb-1 transition-colors ${
              pathname === "/mais"
                ? "text-rose-500 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400 group-hover:text-rose-500"
            }`}
          />
          <span
            className={`text-xs transition-colors ${
              pathname === "/mais"
                ? "text-rose-500 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400 group-hover:text-rose-500"
            }`}
          >
            Mais
          </span>
        </Link>
      </div>
    </div>
  );
}
