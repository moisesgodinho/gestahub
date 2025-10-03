// src/components/MedicationForm.js
"use client";

import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { getTodayString } from "@/lib/dateUtils";

export default function MedicationForm({ onSave, onCancel, medicationToEdit }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState(1);
  const [notes, setNotes] = useState("");
  const [scheduleType, setScheduleType] = useState("FLEXIBLE");
  const [doses, setDoses] = useState([""]);
  
  const [startTime, setStartTime] = useState("");
  const [intervalHours, setIntervalHours] = useState("");

  const [durationType, setDurationType] = useState("CONTINUOUS");
  const [durationValue, setDurationValue] = useState("");
  const [startDate, setStartDate] = useState(getTodayString());

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name || "");
      setDosage(medicationToEdit.dosage || "");
      const freq = medicationToEdit.frequency || 1;
      setFrequency(freq);
      setNotes(medicationToEdit.notes || "");
      const type = medicationToEdit.scheduleType || "FLEXIBLE";
      setScheduleType(type);
      
      if (type === 'INTERVAL') {
          setStartTime(medicationToEdit.doses && medicationToEdit.doses.length > 0 ? medicationToEdit.doses[0] : "");
          setIntervalHours(medicationToEdit.intervalHours || "");
      } else {
          const savedDoses = medicationToEdit.doses || [];
          setDoses(Array.from({ length: freq }, (_, i) => savedDoses[i] || ""));
      }

      setDurationType(medicationToEdit.durationType || "CONTINUOUS");
      setDurationValue(medicationToEdit.durationValue || "");
      setStartDate(medicationToEdit.startDate || getTodayString());
    } else {
      // Reset para estado inicial limpo
      setName("");
      setDosage("");
      setFrequency(1);
      setNotes("");
      setScheduleType("FLEXIBLE");
      setDoses([""]);
      setStartTime("");
      setIntervalHours("");
      setDurationType("CONTINUOUS");
      setDurationValue("");
      setStartDate(getTodayString());
    }
  }, [medicationToEdit]);

  useEffect(() => {
    if (scheduleType !== 'INTERVAL') {
        setDoses(currentDoses => {
            const newDoses = Array.from({ length: Number(frequency) || 1 });
            return newDoses.map((_, i) => currentDoses[i] || "");
        });
    }
  }, [frequency, scheduleType]);

  useEffect(() => {
    if (scheduleType === 'INTERVAL' && intervalHours > 0 && intervalHours < 25) {
      const newFrequency = Math.floor(24 / intervalHours);
      setFrequency(newFrequency > 0 ? newFrequency : 1);
    }
  }, [intervalHours, scheduleType]);

  const handleDoseChange = (index, value) => {
    const newDoses = [...doses];
    newDoses[index] = value;
    setDoses(newDoses);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      toast.warn("Por favor, insira o nome do medicamento.");
      return;
    }

    let finalDoses = doses;
    let finalInterval = null;
    let finalStartDate = null;

    if (scheduleType === 'FIXED_TIMES' && doses.some(dose => !dose || !dose.trim())) {
        toast.warn("Por favor, preencha todos os horários.");
        return;
    }
    if (scheduleType === 'INTERVAL') {
        if (!startTime || !intervalHours) {
            toast.warn("Preencha o horário inicial e o intervalo.");
            return;
        }
        finalDoses = [startTime];
        finalInterval = Number(intervalHours);
    }

    // Garante que todos os tipos que precisam de uma data de início a recebam.
    if(durationType === 'DAYS' || scheduleType === 'INTERVAL' || durationType === 'CONTINUOUS'){
        finalStartDate = startDate;
    }

    onSave({ 
        name, 
        dosage, 
        frequency: Number(frequency), 
        notes, 
        scheduleType, 
        doses: finalDoses,
        intervalHours: finalInterval,
        durationType, 
        durationValue: durationType === 'CONTINUOUS' ? null : durationValue,
        startDate: finalStartDate,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl mb-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {medicationToEdit ? "Editar Medicamento" : "Adicionar Medicamento"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome*</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ácido Fólico" required className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosagem</label>
                <input type="text" id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Ex: 500mg" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
            </div>
            <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nº de doses ao dia</label>
                <input 
                    type="number" 
                    id="frequency" 
                    value={frequency} 
                    onChange={(e) => { if (scheduleType !== 'INTERVAL') setFrequency(e.target.value) }}
                    min="1" max="10" 
                    readOnly={scheduleType === 'INTERVAL'}
                    className={`mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 ${scheduleType === 'INTERVAL' ? 'bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
            <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Horário:</label>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scheduleType" value="FLEXIBLE" checked={scheduleType === 'FLEXIBLE'} onChange={() => setScheduleType('FLEXIBLE')} className="form-radio text-indigo-600 bg-transparent border-slate-400 focus:ring-indigo-500"/>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Flexível</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scheduleType" value="FIXED_TIMES" checked={scheduleType === 'FIXED_TIMES'} onChange={() => setScheduleType('FIXED_TIMES')} className="form-radio text-indigo-600 bg-transparent border-slate-400 focus:ring-indigo-500"/>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Horário Fixo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scheduleType" value="INTERVAL" checked={scheduleType === 'INTERVAL'} onChange={() => setScheduleType('INTERVAL')} className="form-radio text-indigo-600 bg-transparent border-slate-400 focus:ring-indigo-500"/>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Intervalo Fixo</span>
                    </label>
                </div>
            </div>

            {scheduleType === 'INTERVAL' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label htmlFor="startDateInterval" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início*</label>
                        <input type="date" id="startDateInterval" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200" required/>
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Horário da 1ª dose*</label>
                        <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200" required/>
                    </div>
                    <div>
                        <label htmlFor="intervalHours" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Intervalo (horas)*</label>
                        <input type="number" id="intervalHours" value={intervalHours} onChange={(e) => setIntervalHours(e.target.value)} placeholder="Ex: 8" min="1" max="24" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200" required/>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {doses.map((dose, index) => (
                        <div key={index}>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Dose {index + 1}</label>
                            <input
                                type={scheduleType === 'FIXED_TIMES' ? 'time' : 'text'}
                                value={dose}
                                onChange={(e) => handleDoseChange(index, e.target.value)}
                                placeholder={scheduleType === 'FLEXIBLE' ? 'Ex: Após o almoço' : ''}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm"
                                required
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duração do Tratamento:</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="durationType" value="CONTINUOUS" checked={durationType === 'CONTINUOUS'} onChange={() => setDurationType('CONTINUOUS')} className="form-radio text-indigo-600 bg-transparent border-slate-400 focus:ring-indigo-500"/>
                <span className="text-sm text-slate-700 dark:text-slate-300">Uso Contínuo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="durationType" value="DAYS" checked={durationType === 'DAYS'} onChange={() => setDurationType('DAYS')} className="form-radio text-indigo-600 bg-transparent border-slate-400 focus:ring-indigo-500"/>
                <span className="text-sm text-slate-700 dark:text-slate-300">Período de Dias</span>
            </label>
          </div>
          {durationType === 'DAYS' && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="durationDays" className="block text-xs font-medium text-slate-600 dark:text-slate-400">Número de dias:</label>
                <input type="number" id="durationDays" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} min="1" placeholder="Ex: 30"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" required />
              </div>
              <div>
                <label htmlFor="startDateDays" className="block text-xs font-medium text-slate-600 dark:text-slate-400">Data de Início:</label>
                <input type="date" id="startDateDays" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200 text-sm" required />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Anotações Adicionais</label>
          <input type="text" id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Tomar com bastante água" className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent dark:text-slate-200"/>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">Cancelar</button>
          <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Salvar</button>
        </div>
      </form>
    </div>
  );
}