// src/app/offline/page.js
"use client";

import Card from "@/components/Card";
import WifiOffIcon from "@/components/icons/WifiOffIcon";

export default function OfflinePage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card>
        <div className="flex flex-col items-center gap-4">
          <WifiOffIcon className="w-16 h-16 text-rose-500" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            Você está offline
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Parece que não há conexão com a internet. Por favor, verifique sua
            conexão e tente novamente.
          </p>
        </div>
      </Card>
    </div>
  );
}

// O ícone pode ser um novo arquivo ou adicionado diretamente aqui.
// Para simplicidade, vamos adicioná-lo como um novo componente de ícone.
