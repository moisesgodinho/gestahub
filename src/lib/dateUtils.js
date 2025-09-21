// src/lib/dateUtils.js

/**
 * Retorna a data de hoje como uma string no formato "YYYY-MM-DD".
 */
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto de Data em UTC.
 * @param {string} dateString - A data no formato "YYYY-MM-DD".
 * @returns {Date|null}
 */
export const getUTCDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN) || parts[1] < 1 || parts[1] > 12 || parts[2] < 1 || parts[2] > 31) {
    return null;
  }
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
};

/**
 * Formata uma string de data (YYYY-MM-DD) para exibição no formato "DD/MM/YYYY".
 * @param {string} dateString - A data no formato "YYYY-MM-DD".
 * @returns {string}
 */
export const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/**
 * Formata uma string de data (DD/MM/YYYY) para o formato de input de data ("YYYY-MM-DD").
 * @param {string} dateStr - A data no formato "DD/MM/YYYY".
 * @returns {string}
 */
export const formatDateForInput = (dateStr) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

/**
 * Converte uma string de data (DD/MM/YYYY) para um objeto Date em UTC.
 * @param {string} dateStr - A data no formato "DD/MM/YYYY".
 * @returns {Date|null}
 */
export const parseDateString = (dateStr) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (dateObj.getUTCFullYear() !== year || dateObj.getUTCMonth() !== month - 1 || dateObj.getUTCDate() !== day) {
    return null;
  }
  return dateObj;
};

/**
 * Formata segundos para uma string "MM:SS".
 * @param {number} seconds - O total de segundos.
 * @returns {string}
 */
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Calcula a idade gestacional em uma data específica com base na DUM.
 * @param {Date} lmpDate - Objeto Date da DUM.
 * @param {string} targetDate - Data alvo no formato "YYYY-MM-DD".
 * @returns {string}
 */
export const calculateGestationalAgeOnDate = (lmpDate, targetDate) => {
    if (!lmpDate || !targetDate) return '';
    const lmpTime = lmpDate.getTime();
    const targetTime = new Date(targetDate + 'T00:00:00Z').getTime();
    const gestationalAgeInMs = targetTime - lmpTime;
    const gestationalAgeInDays = Math.floor(gestationalAgeInMs / (1000 * 60 * 60 * 24));
    if (gestationalAgeInDays < 0) return '';
    const weeks = Math.floor(gestationalAgeInDays / 7);
    const days = gestationalAgeInDays % 7;
    return `${weeks}s ${days}d`;
};