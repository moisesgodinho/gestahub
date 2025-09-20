// src/app/perfil/page.js
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';

// Função para calcular a idade
const calculateAge = (birthDateString) => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getUTCDate())) {
    age--;
  }
  return age;
};

// Função para capitalizar o nome
const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  // Campos do formulário
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user) {
      setDisplayName(userProfile?.displayName || user.displayName || '');
      setDob(userProfile?.dob || '');
    }
  }, [user, userProfile, loading, router]);

  const handleSave = async () => {
    if (!user) return;

    if (dob && new Date(dob) > new Date()) {
        toast.warn("A data de nascimento não pode ser no futuro.");
        return;
    }

    const formattedDisplayName = capitalizeName(displayName);

    const profileData = {
      displayName: formattedDisplayName,
      dob,
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { profile: profileData }, { merge: true });
      updateUserProfile(profileData);
      setDisplayName(formattedDisplayName); // Garante que o estado local também seja atualizado
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Não foi possível salvar as alterações.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  const handleNameChange = (e) => {
      setDisplayName(capitalizeName(e.target.value));
  }

  if (loading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-rose-500 dark:text-rose-400">Carregando...</p>
      </main>
    );
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-rose-500 dark:text-rose-400 mb-6 text-center">
          Seu Perfil
        </h1>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
          {user && (
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Exibição</label>
                    <input type="text" id="displayName" value={displayName} onChange={handleNameChange} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Nascimento</label>
                    <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <p className="text-md text-slate-500 dark:text-slate-400 mt-1">{user.email} (não pode ser alterado)</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome de Exibição</label>
                    <p className="text-lg text-slate-900 dark:text-slate-100">{displayName || 'Não definido'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Idade</label>
                    <p className="text-lg text-slate-900 dark:text-slate-100">{dob ? `${calculateAge(dob)} anos` : 'Não definida'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <p className="text-lg text-slate-900 dark:text-slate-100">{user.email}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              {isEditing ? (
                <div className="flex gap-4">
                  <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Salvar</button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Editar Perfil</button>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}