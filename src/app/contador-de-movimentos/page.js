// src/app/contador-de-movimentos/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'react-toastify'; // 1. IMPORTE O TOAST
import AppNavigation from '@/components/AppNavigation';

export default function KickCounterPage() {
  const [user, setUser] = useState(null);
  const [kickCount, setKickCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSessions(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isCounting) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCounting]);
  
  const fetchSessions = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().kickSessions) {
      setSessions(docSnap.data().kickSessions.sort((a, b) => b.timestamp - a.timestamp));
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  const handleStart = () => {
    setIsCounting(true);
    setKickCount(0);
    setTimer(0);
    setStartTime(new Date());
  };

  const handleKick = () => {
    if (isCounting) {
      setKickCount(prevCount => prevCount + 1);
    }
  };
  
  // 2. FUNÇÕES ATUALIZADAS COM TOASTIFY
  const handleStopAndSave = async () => {
    setIsCounting(false);
    if (user && kickCount > 0) {
      const newSession = {
        kicks: kickCount,
        duration: timer,
        date: startTime.toLocaleDateString('pt-BR'),
        timestamp: startTime.getTime(),
      };
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { kickSessions: arrayUnion(newSession) }, { merge: true });
        setSessions(prevSessions => [newSession, ...prevSessions].sort((a, b) => b.timestamp - a.timestamp));
        toast.success("Sessão salva no histórico!");
      } catch (e) {
        console.error("Erro ao salvar sessão:", e);
        toast.error("Erro ao salvar a sessão.");
      }
    }
    setKickCount(0);
    setTimer(0);
  };

  const openDeleteConfirmation = (session) => {
    setSessionToDelete(session);
    setIsModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!user || !sessionToDelete) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { kickSessions: arrayRemove(sessionToDelete) });
      setSessions(prevSessions => prevSessions.filter(s => s.timestamp !== sessionToDelete.timestamp));
      toast.info("Sessão removida do histórico.");
    } catch (error) {
      console.error("Erro ao apagar sessão: ", error);
      toast.error("Não foi possível apagar a sessão.");
    } finally {
      setIsModalOpen(false);
      setSessionToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteSession}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar esta sessão? A ação não pode ser desfeita."
      />
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-4 text-center">
            Contador de Movimentos
          </h1>
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
              Monitore o padrão de movimentos do seu bebê. Pressione &quot;Iniciar&quot; e, a cada movimento (chute, giro ou vibração), clique em &quot;Movimentou!&quot;.
            </p>
            <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              {kickCount}
            </div>
            <div className="text-2xl text-slate-500 dark:text-slate-400 mb-6">
              {formatTime(timer)}
            </div>
            {!isCounting ? (
              <button onClick={handleStart} className="w-full sm:w-auto bg-rose-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-600 transition-all">
                Iniciar Sessão
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleKick} className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                  Movimentou!
                </button>
                <button onClick={handleStopAndSave} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  Parar e Salvar
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 rounded-r-lg space-y-4 text-sm">
            <div>
              <h3 className="font-bold text-lg">Por que contar os movimentos?</h3>
              <p className="mt-1">
                Esta é uma ferramenta importante para monitorar o bem-estar do seu bebê, especialmente no terceiro trimestre (a partir da 28ª semana). Movimentos fetais regulares são um forte sinal de que o bebê está saudável. Uma mudança no padrão pode ser um sinal de alerta precoce, permitindo que você e seu médico ajam rapidamente.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg">Como fazer a contagem?</h3>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Escolha um horário:</strong> Dê preferência a um momento em que seu bebê costuma estar mais ativo (geralmente à noite ou após uma refeição).</li>
                <li><strong>Fique confortável:</strong> Deite-se de lado (preferencialmente o esquerdo, para melhorar a circulação) ou sente-se com os pés para cima.</li>
                <li><strong>Conte os movimentos:</strong> Inicie a sessão e registre cada movimento que sentir (chutes, giros, vibrações). O objetivo comum é sentir <strong>10 movimentos em até 2 horas</strong>.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg">Quando devo procurar meu médico?</h3>
              <p className="mt-1">
                O mais importante é conhecer o padrão <strong>normal</strong> do seu bebê. Se você notar uma diminuição significativa e prolongada na atividade dele, ou se o tempo para atingir 10 movimentos aumentar muito, entre em contato com seu obstetra. <strong>Confie no seu instinto.</strong>
              </p>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Histórico de Sessões</h2>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.timestamp} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{session.date}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{session.kicks} movimentos</p>
                    </div>
                    <p className="font-medium text-indigo-600 dark:text-indigo-400 mx-4">em {formatTime(session.duration)}</p>
                    <button onClick={() => openDeleteConfirmation(session)} title="Apagar sessão" className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
          <AppNavigation />
          </div>
        </div>
      </div>
    </>
  );
}