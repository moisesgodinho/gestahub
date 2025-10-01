// src/app/hidratacao/page.js
"use client";

import WaterTracker from "@/components/WaterTracker";
import Card from "@/components/Card";
import WaterChart from "@/components/WaterChart"; 

export default function WaterPage() {
  return (
    <div className="flex items-start justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Hidratação
        </h1>
        
        <WaterTracker />
        
        <WaterChart />

        <div className="mt-8">
          <Card className="border-l-4 border-blue-500">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              A Importância da Hidratação na Gestação
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manter-se bem hidratada durante a gravidez é fundamental para a sua saúde e para o desenvolvimento do bebê. A água ajuda a formar o líquido amniótico, produzir mais volume sanguíneo, construir novos tecidos, transportar nutrientes e eliminar toxinas.
            </p>
            <h4 className="font-semibold text-md text-slate-700 dark:text-slate-300 mt-4">
              Recomendação
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A recomendação geral é consumir de <strong>2 a 3 litros</strong> de líquidos por dia, o que equivale a cerca de 8 a 12 copos. No entanto, essa necessidade pode variar. Converse sempre com seu médico para entender a quantidade ideal para você.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}