// src/app/cronometro-de-contracoes/page.js
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "react-toastify";
import { formatTime } from "@/lib/dateUtils";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useUser } from "@/context/UserContext";
import { useContractions } from "@/hooks/useContractions";
import InfoTooltip from "@/components/InfoTooltip";

export default function ContractionTimerPage() {
  const { user, loading: userLoading } = useUser();
  const { contractions, loading: contractionsLoading } = useContractions(user);

  const [isTiming, setIsTiming] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractionToDelete, setContractionToDelete] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isTiming) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming]);

  const handleStartStop = async () => {
    if (!isTiming) {
      setIsTiming(true);
      setStartTime(new Date());
      setTimer(0);
    } else {
      setIsTiming(false);
      const endTime = new Date();
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
      const lastContraction = contractions[0];
      // Garante que lastContraction.startTime é um objeto de data para o cálculo
      const frequency = lastContraction
        ? Math.round(
            (startTime.getTime() -
              lastContraction.startTime.toDate().getTime()) /
              1000
          )
        : 0;

      if (user) {
        try {
          const contractionsRef = collection(
            db,
            "users",
            user.uid,
            "contractions"
          );
          await addDoc(contractionsRef, { startTime, duration, frequency });
          toast.success("Contração registrada!");
        } catch (error) {
          console.error("Erro ao salvar contração:", error);
          toast.error("Não foi possível salvar a contração.");
        }
      }
      setTimer(0);
    }
  };

  const openDeleteConfirmation = (contraction) => {
    setContractionToDelete(contraction);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !contractionToDelete) return;
    try {
      const docRef = doc(
        db,
        "users",
        user.uid,
        "contractions",
        contractionToDelete.id
      );
      await deleteDoc(docRef);
      toast.info("Registro de contração removido.");
    } catch (error) {
      console.error("Erro ao apagar registro:", error);
      toast.error("Não foi possível apagar o registro.");
    } finally {
      setIsModalOpen(false);
      setContractionToDelete(null);
    }
  };

  const loading = userLoading || contractionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <SkeletonLoader type="fullPage" />
      </div>
    );
  }

  const lastContraction = contractions[0];
  let lastDate = null;

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar este registro de contração?"
      />
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
            Cronômetro de Contrações
          </h1>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
              Quando a contração começar, pressione &quot;Iniciar&quot;. Quando
              terminar, pressione &quot;Parar&quot;.
            </p>
            <div className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 my-4 tabular-nums">
              {formatTime(timer)}
            </div>
            <button
              onClick={handleStartStop}
              className={`w-full sm:w-auto text-white font-bold py-4 px-10 rounded-lg transition-all text-xl ${isTiming ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-500 hover:bg-rose-600"}`}
            >
              {isTiming ? "Parar Contração" : "Iniciar Contração"}
            </button>

            {lastContraction && (
              <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Última Duração
                  </p>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {formatTime(lastContraction.duration)}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Última Frequência
                    </p>
                    <InfoTooltip text="A frequência é o tempo contado do início de uma contração até o início da próxima." />
                  </div>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {formatTime(lastContraction.frequency)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-2 border-l-4 border-amber-500">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Contrações de Treinamento vs. Trabalho de Parto
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              É comum sentir{" "}
              <strong>Contrações de Braxton Hicks</strong> (de treinamento) a
              partir do segundo trimestre. Elas são tipicamente{" "}
              <strong>irregulares, indolores</strong> e não aumentam de
              intensidade.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              As contrações de <strong>trabalho de parto</strong>, por outro
              lado, tornam-se{" "}
              <strong>
                regulares, mais longas, mais fortes e mais frequentes
              </strong>{" "}
              com o tempo.
              Se tiver dúvidas, entre sempre em contato com seu médico.
            </p>
          </div>

          <div className="mt-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-2 border-l-4 border-blue-500">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Quando ir para a maternidade?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uma referência comum é a <strong>Regra 5-1-1</strong>: contrações
              que duram <strong>1 minuto</strong>, ocorrem a cada{" "}
              <strong>5 minutos</strong>, por pelo menos <strong>1 hora</strong>
              . No entanto, siga sempre a orientação do seu médico. Esta
              ferramenta é um auxílio, mas não substitui a avaliação
              profissional.
            </p>
          </div>

          {contractions.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
                Histórico de Contrações
              </h2>
              <div className="space-y-3">
                {contractions.map((c) => {
                  // --- MUDANÇA AQUI ---
                  // Usando .toDate() para converter o Timestamp do Firebase para um objeto Date
                  const entryDate = c.startTime.toDate();
                  const currentDate = entryDate.toLocaleDateString("pt-BR");
                  const showDateHeader = currentDate !== lastDate;
                  lastDate = currentDate;

                  return (
                    <div key={c.id}>
                      {showDateHeader && (
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 pt-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                          {currentDate}
                        </h3>
                      )}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg mt-2">
                        <div className="flex-1 text-center">
                          {/* --- MUDANÇA AQUI --- */}
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {entryDate.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Início
                          </p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                            {formatTime(c.duration)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Duração
                          </p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-bold text-lg text-rose-500 dark:text-rose-400">
                            {formatTime(c.frequency)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Frequência
                          </p>
                        </div>
                        <div className="ml-2">
                          <button
                            onClick={() => openDeleteConfirmation(c)}
                            title="Apagar"
                            className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}