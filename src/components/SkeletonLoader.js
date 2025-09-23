// src/components/SkeletonLoader.js
"use client";

// Componente para uma única linha de esqueleto
const SkeletonLine = ({ width = "full", height = "h-4" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse ${width} ${height}`}
  ></div>
);

// Esqueleto para um card genérico
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
    <div className="flex justify-between items-center">
      <SkeletonLine width="w-1/3" height="h-6" />
      <SkeletonLine width="w-1/4" height="h-5" />
    </div>
    <div className="space-y-3 pt-4">
      <SkeletonLine width="full" />
      <SkeletonLine width="w-5/6" />
      <SkeletonLine width="w-3/4" />
    </div>
  </div>
);

// Esqueleto para um item de lista (como uma consulta ou entrada de diário)
const ListItemSkeleton = () => (
  <div className="p-4 rounded-lg flex items-center gap-4 bg-slate-100 dark:bg-slate-700/50">
    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-md animate-pulse"></div>
    <div className="flex-grow space-y-2">
      <SkeletonLine width="w-1/2" />
      <SkeletonLine width="w-1/3" height="h-3" />
    </div>
    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full animate-pulse"></div>
  </div>
);

// O componente principal exportado
export default function SkeletonLoader({ type = "card" }) {
  if (type === "list") {
    return (
      <div className="space-y-4">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
    );
  }

  if (type === "fullPage") {
    return (
      <div className="w-full max-w-3xl space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Padrão é 'card'
  return <CardSkeleton />;
}
