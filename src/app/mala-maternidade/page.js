// src/app/mala-maternidade/page.js
"use client";

import { useUser } from "@/context/UserContext";
import { useMaternityBag } from "@/hooks/useMaternityBag";
import { maternityBagData } from "@/data/maternityBagData";
import Card from "@/components/Card";
import SkeletonLoader from "@/components/SkeletonLoader";

function ChecklistItem({ item, isChecked, onToggle }) {
  return (
    <label
      key={item.id}
      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggle(item.id)}
        className="sr-only peer"
      />
      <div
        className={`w-6 h-6 border-2 rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${
          isChecked
            ? "bg-rose-500 border-rose-500"
            : "border-slate-400 dark:border-slate-500"
        }`}
      >
        <svg
          className={`w-4 h-4 text-white transform transition-transform ${
            isChecked ? "scale-100" : "scale-0"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span
        className={`flex-grow text-slate-700 dark:text-slate-300 ${
          isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""
        }`}
      >
        {item.label}
      </span>
    </label>
  );
}

export default function MaternityBagPage() {
  const { user, loading: userLoading } = useUser();
  const {
    checkedItems,
    loading: bagLoading,
    updateCheckedItems,
  } = useMaternityBag(user);

  const handleToggle = (itemId) => {
    const newCheckedItems = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    updateCheckedItems(newCheckedItems);
  };

  const loading = userLoading || bagLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Mala da Maternidade
        </h1>
        <div className="space-y-6">
          {Object.values(maternityBagData).map((category) => (
            <Card key={category.title}>
              <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                {category.title}
              </h2>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {category.items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    isChecked={checkedItems.includes(item.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
