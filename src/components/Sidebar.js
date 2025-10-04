// src/components/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "./icons/HomeIcon";
import CalendarIcon from "./icons/CalendarIcon";
import JournalIcon from "./icons/JournalIcon";
import ScaleIcon from "./icons/ScaleIcon";
import WaterIcon from "./icons/WaterIcon";
import KickCounterIcon from "./icons/KickCounterIcon";
import ContractionIcon from "./icons/ContractionIcon";
import BagIcon from "./icons/BagIcon";
import BirthPlanIcon from "./icons/BirthPlanIcon";
import ArticleIcon from "./icons/ArticleIcon";
import CartIcon from "./icons/CartIcon";
import PillIcon from "@/components/icons/PillIcon"; // Importado

const navLinks = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/consultas", label: "Consultas", icon: CalendarIcon },
  { href: "/diario-de-sintomas", label: "Diário", icon: JournalIcon },
  { href: "/acompanhamento-de-peso", label: "Peso", icon: ScaleIcon },
  { href: "/hidratacao", label: "Hidratação", icon: WaterIcon },
  {
    href: "/contador-de-movimentos",
    label: "Movimentos",
    icon: KickCounterIcon,
  },
  {
    href: "/cronometro-de-contracoes",
    label: "Contrações",
    icon: ContractionIcon,
  },
  {
    href: "/mala-maternidade",
    label: "Mala Maternidade",
    icon: BagIcon,
  },
  {
    href: "/plano-de-parto",
    label: "Plano de Parto",
    icon: BirthPlanIcon,
  },
  {
    href: "/artigos",
    label: "Artigos e Dicas",
    icon: ArticleIcon,
  },
  {
    href: "/lista-de-compras",
    label: "Lista de Compras",
    icon: CartIcon,
  },
  {
    href: "/medicamentos", // Adicionado
    label: "Medicamentos",
    icon: PillIcon,
  },
  { href: "/offline", label: "Offline", icon: () => null, hidden: true }, // Adicionado para cache
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-slate-800 shadow-lg flex flex-col items-center py-4">
      <Link
        href="/"
        className="mb-8 text-3xl font-bold text-rose-500 dark:text-rose-400"
      >
        GestaHub
      </Link>
      <nav className="flex w-full flex-col items-start px-4 gap-2">
        {navLinks
          .filter((link) => !link.hidden)
          .map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center w-full gap-4 p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
