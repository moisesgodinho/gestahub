// src/data/appointmentData.js

export const appointmentTypes = [
  "Consulta Pré-natal",
  "Ultrassom Obstétrico",
  "Exame de Glicemia",
  "Ecocardiograma Fetal",
  "Consulta com Nutricionista",
  "Exames de Sangue",
];

export const ultrasoundSchedule = [
  {
    id: "transvaginal",
    name: "1º Ultrassom (Transvaginal)",
    startWeek: 8,
    endWeek: 11,
    type: "ultrasound",
  },
  {
    id: "morfologico_1",
    name: "2º Ultrassom (Morfológico 1º Trimestre)",
    startWeek: 12,
    endWeek: 14,
    type: "ultrasound",
  },
  {
    id: "morfologico_2",
    name: "3º Ultrassom (Morfológico 2º Trimestre)",
    startWeek: 22,
    endWeek: 24,
    type: "ultrasound",
  },
  {
    id: "ecocardiograma",
    name: "4º Ultrassom (Ecocardiograma Fetal)",
    startWeek: 26,
    endWeek: 28,
    type: "ultrasound",
  },
  {
    id: "doppler_3",
    name: "5º Ultrassom (3º Trimestre com Doppler)",
    startWeek: 28,
    endWeek: 36,
    type: "ultrasound",
  },
];