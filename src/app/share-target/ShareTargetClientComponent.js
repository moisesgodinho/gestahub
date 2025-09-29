// src/app/share-target/ShareTargetClientComponent.js
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShareTargetClientComponent() {
  const searchParams = useSearchParams();
  const [sharedContent, setSharedContent] = useState(null);

  useEffect(() => {
    const title = searchParams.get("title");
    const text = searchParams.get("text");
    const url = searchParams.get("url");

    if (title || text || url) {
      setSharedContent({ title, text, url });
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-rose-500 dark:text-rose-400 mb-4">
        Conteúdo Compartilhado
      </h1>
      {sharedContent ? (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Você pode usar esta página para salvar o conteúdo compartilhado em
            uma nova anotação no diário, por exemplo.
          </p>
          {sharedContent.title && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                Título:
              </h2>
              <p className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                {sharedContent.title}
              </p>
            </div>
          )}
          {sharedContent.text && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                Texto:
              </h2>
              <p className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                {sharedContent.text}
              </p>
            </div>
          )}
          {sharedContent.url && (
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                URL:
              </h2>
              <a
                href={sharedContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 block bg-slate-100 dark:bg-slate-700 rounded-md text-blue-500 hover:underline truncate"
              >
                {sharedContent.url}
              </a>
            </div>
          )}
          <div className="mt-6 flex gap-4">
            <Link
              href="/diario-de-sintomas"
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Salvar no Diário
            </Link>
            <Link
              href="/"
              className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          Processando conteúdo compartilhado...
        </p>
      )}
    </div>
  );
}
