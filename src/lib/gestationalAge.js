// src/lib/gestationalAge.js

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto de Data em UTC.
 * Esta é a maneira mais segura de evitar problemas de fuso horário.
 * @param {string} dateString - A data no formato "YYYY-MM-DD".
 * @returns {Date|null}
 */
const parseUTCDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;
  const parts = dateString.split("-").map(Number);
  if (
    parts.length !== 3 ||
    parts.some(isNaN) ||
    parts[1] < 1 ||
    parts[1] > 12 ||
    parts[2] < 1 ||
    parts[2] > 31
  ) {
    return null;
  }
  // Cria a data usando UTC para garantir consistência
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
};

/**
 * Calcula a Data da Última Menstruação (DUM) estimada com base nos dados do usuário.
 * A calculadora de ultrassom tem prioridade.
 * @param {object} userData - O objeto de dados do usuário do Firestore.
 * @returns {Date|null} - Um objeto de Data representando a DUM estimada em UTC, ou nulo.
 */
export function getEstimatedLmp(userData) {
  // MODIFICADO: Acessa o novo objeto 'gestationalProfile'
  const profile = userData?.gestationalProfile;
  if (!profile) return null;

  // Prioridade 1: Dados do Ultrassom
  if (profile.ultrasound && profile.ultrasound.examDate) {
    const { examDate, weeksAtExam, daysAtExam } = profile.ultrasound;
    const examDateObj = parseUTCDate(examDate);
    if (!examDateObj) return null;

    const weeks = parseInt(weeksAtExam, 10) || 0;
    const days = parseInt(daysAtExam, 10) || 0;
    const daysAtExamTotal = weeks * 7 + days;

    const lmpTime =
      examDateObj.getTime() - daysAtExamTotal * 24 * 60 * 60 * 1000;
    return new Date(lmpTime);
  }

  // Prioridade 2: Dados da DUM
  if (profile.lmp) {
    return parseUTCDate(profile.lmp);
  }

  return null;
}

/**
 * Calcula a Data Provável do Parto (DPP) com base na DUM estimada.
 * @param {Date} estimatedLmp - A DUM estimada (deve ser um objeto de Data em UTC).
 * @returns {Date|null}
 */
export function getDueDate(estimatedLmp) {
  if (!estimatedLmp) return null;
  const dueDate = new Date(estimatedLmp.getTime());
  dueDate.setUTCDate(dueDate.getUTCDate() + 280); // Adiciona 280 dias em UTC
  return dueDate;
}
