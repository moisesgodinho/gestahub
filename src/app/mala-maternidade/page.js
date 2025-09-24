// src/app/mala-maternidade/page.js
"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useMaternityBag } from "@/hooks/useMaternityBag";
import Card from "@/components/Card";
import SkeletonLoader from "@/components/SkeletonLoader";
import ConfirmationModal from "@/components/ConfirmationModal";

// Ícone de Lixeira
const DeleteIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// Componente para adicionar um novo item
function AddItemForm({ onAddItem }) {
  const [label, setLabel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (label.trim()) {
      onAddItem(label.trim());
      setLabel("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Adicionar novo item..."
        className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
      />
      <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-sm">
        Adicionar
      </button>
    </form>
  );
}


export default function MaternityBagPage() {
  const { user, loading: userLoading } = useUser();
  const { listData, checkedItems, loading: bagLoading, addItem, removeItem, toggleItem, restoreDefaults } = useMaternityBag(user);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loading = userLoading || bagLoading;

  // Define a ordem fixa das categorias
  const categoryOrder = ["mom", "baby", "companion", "docs"];

  const handleDeleteRequest = (categoryId, itemId) => {
    setItemToDelete({ categoryId, itemId });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.categoryId, itemToDelete.itemId, () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja remover este item da sua lista?"
      />
      <div className="flex items-start justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 text-center sm:text-left">
                Mala da Maternidade
              </h1>
              <button
                onClick={restoreDefaults}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-semibold"
              >
                Restaurar Itens Padrão
              </button>
          </div>

          <div className="space-y-6">
            {listData && categoryOrder.map((categoryId) => {
              const category = listData[categoryId];
              if (!category) return null;

              return (
                <Card key={categoryId}>
                  <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                    {category.title}
                  </h2>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-center group">
                        <label className="flex-grow flex items-center gap-4 p-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-6 h-6 border-2 rounded-md flex-shrink-0 flex items-center justify-center transition-colors ${checkedItems.includes(item.id) ? "bg-rose-500 border-rose-500" : "border-slate-400 dark:border-slate-500"}`}>
                            <svg className={`w-4 h-4 text-white transform transition-transform ${checkedItems.includes(item.id) ? "scale-100" : "scale-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <span className={`flex-grow text-slate-700 dark:text-slate-300 ${checkedItems.includes(item.id) ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                            {item.label}
                          </span>
                        </label>
                        <button onClick={() => handleDeleteRequest(categoryId, item.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <DeleteIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <AddItemForm onAddItem={(label) => addItem(categoryId, label)} />
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}