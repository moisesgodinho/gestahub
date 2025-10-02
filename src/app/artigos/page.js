// src/app/artigos/page.js
"use client";

import { useState, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { useGestationalData } from "@/hooks/useGestationalData";
import { articlesData } from "@/data/articlesData";
import Card from "@/components/Card";
import SkeletonLoader from "@/components/SkeletonLoader";
import ArticleViewModal from "@/components/ArticleViewModal";

export default function ArticlesPage() {
  const { user, loading: userLoading } = useUser();
  const { gestationalInfo, loading: gestationalLoading } =
    useGestationalData(user);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const loading = userLoading || gestationalLoading;

  const { relevantArticles, otherArticles } = useMemo(() => {
    if (!gestationalInfo) {
      return { relevantArticles: [], otherArticles: articlesData };
    }
    const currentWeek = gestationalInfo.weeks;
    const relevant = [];
    const others = [];

    articlesData.forEach((article) => {
      const isRelevant =
        article.weeks === "all" ||
        (Array.isArray(article.weeks) && article.weeks.includes(currentWeek));
      if (isRelevant) {
        relevant.push(article);
      } else {
        others.push(article);
      }
    });

    return { relevantArticles: relevant, otherArticles: others };
  }, [gestationalInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <ArticleViewModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
      <div className="flex items-start justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Artigos e Dicas
          </h1>

          <div className="space-y-8">
            {relevantArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b-2 border-rose-500 pb-2">
                  Para sua semana
                </h2>
                <div className="space-y-4">
                  {relevantArticles.map((article) => (
                    <Card key={article.id} className="flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {article.title}
                      </h3>
                      <p className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400 mt-1">
                        {article.category}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-2 flex-grow">
                        {article.summary}
                      </p>
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="mt-4 self-start px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors text-sm"
                      >
                        Ler mais
                      </button>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {otherArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b-2 border-slate-300 dark:border-slate-600 pb-2">
                  Outros tópicos
                </h2>
                <div className="space-y-4">
                  {otherArticles.map((article) => (
                    <Card key={article.id} className="flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {article.title}
                      </h3>
                      <p className="text-xs font-semibold uppercase text-indigo-500 dark:text-indigo-400 mt-1">
                        {article.category}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-2 flex-grow">
                        {article.summary}
                      </p>
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="mt-4 self-start px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors text-sm"
                      >
                        Ler mais
                      </button>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
