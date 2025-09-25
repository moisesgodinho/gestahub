// src/data/birthPlanData.js

export const birthPlanData = [
  {
    id: "ambiente",
    title: "Ambiente do Parto",
    questions: [
      {
        id: "ambiente_luz",
        text: "Iluminação",
        type: "radio",
        options: [
          "Prefiro luz baixa/indireta",
          "Tanto faz",
          "Prefiro ambiente bem iluminado",
        ],
        tooltip: "Um ambiente com pouca luz pode ajudar a promover o relaxamento e a produção de ocitocina, o hormônio do trabalho de parto."
      },
      {
        id: "ambiente_som",
        text: "Som ambiente",
        type: "checkbox",
        options: [
          "Gostaria de silêncio",
          "Gostaria de ouvir minha própria playlist",
          "Permito conversas em tom baixo",
          "Ruído não me incomoda",
        ],
        tooltip: "Músicas calmas ou o silêncio podem ajudar na concentração e no alívio da dor. Sinta-se à vontade para criar uma playlist para este momento."
      },
      {
        id: "ambiente_acompanhantes",
        text: "Quem você gostaria que estivesse presente?",
        type: "checkbox",
        options: [
          "Meu parceiro(a)",
          "Doula",
          "Mãe/Pai",
          "Outro familiar ou amigo(a)",
          "Apenas a equipe médica",
        ],
        tooltip: "A lei do acompanhante (Lei nº 11.108/2005) garante a você o direito de ter uma pessoa de sua escolha ao seu lado durante todo o trabalho de parto, parto e pós-parto."
      },
    ],
  },
  {
    id: "trabalho_parto",
    title: "Durante o Trabalho de Parto",
    questions: [
      {
        id: "tp_movimentacao",
        text: "Movimentação",
        type: "radio",
        options: [
          "Gostaria de me movimentar livremente",
          "Prefiro ficar mais quieta ou deitada",
          "Seguirei a recomendação da equipe",
        ],
        tooltip: "Caminhar, agachar e mudar de posição pode ajudar na progressão do trabalho de parto e no alívio da dor."
      },
      {
        id: "tp_comida",
        text: "Alimentação e hidratação",
        type: "radio",
        options: [
          "Gostaria de comer e beber livremente (alimentos leves)",
          "Apenas líquidos (água, isotônicos)",
          "Seguirei a recomendação da equipe",
        ],
        tooltip: "Manter-se hidratada e consumir alimentos leves pode fornecer a energia necessária para o trabalho de parto. Verifique a política do seu hospital sobre isso."
      },
      {
        id: "tp_monitoramento",
        text: "Monitoramento fetal",
        type: "radio",
        options: [
          "Prefiro monitoramento intermitente (se possível)",
          "Não me importo com monitoramento contínuo",
          "Seguirei a recomendação da equipe",
        ],
        tooltip: "O monitoramento intermitente (ouvindo os batimentos do bebê em intervalos) permite mais liberdade de movimento. O contínuo é feito com cintas na barriga e pode ser necessário em alguns casos."
      },
    ],
  },
  {
    id: "alivio_dor",
    title: "Alívio da Dor",
    questions: [
      {
        id: "alivio_nao_farmacologico",
        text: "Métodos não farmacológicos que gostaria de tentar:",
        type: "checkbox",
        options: [
          "Massagens",
          "Chuveiro ou banheira",
          "Técnicas de respiração",
          "Compressas quentes/frias",
          "Mudar de posição",
        ],
        tooltip: "Esses métodos podem ser muito eficazes para o conforto e alívio da dor, especialmente nas fases iniciais do trabalho de parto."
      },
      {
        id: "alivio_farmacologico",
        text: "Métodos farmacológicos:",
        type: "radio",
        options: [
          "Gostaria de evitar, se possível",
          "Estou aberta a analgesia (ex: peridural) se eu sentir necessidade",
          "Prefiro receber analgesia assim que possível",
          "Seguirei a recomendação da equipe",
        ],
        tooltip: "A analgesia peridural é um método eficaz para o alívio da dor, mas também pode limitar a movimentação. Converse com seu médico sobre os prós e contras."
      },
    ],
  },
  {
    id: "cuidados_bebe",
    title: "Cuidados com o Bebê Após o Nascimento",
    questions: [
      {
        id: "bebe_contato",
        text: "Contato pele a pele",
        type: "radio",
        options: [
          "Gostaria de ter o bebê no meu colo imediatamente após o nascimento",
          "Gostaria que meu parceiro(a) fizesse o contato pele a pele",
          "Seguirei a rotina do hospital",
        ],
        tooltip: "O contato pele a pele imediato ajuda a regular a temperatura e os batimentos cardíacos do bebê, além de fortalecer o vínculo e auxiliar no início da amamentação."
      },
      {
        id: "bebe_cordao",
        text: "Corte do cordão umbilical",
        type: "radio",
        options: [
          "Gostaria de esperar o cordão parar de pulsar (clampeamento tardio)",
          "Gostaria que meu parceiro(a) cortasse o cordão",
          "Seguirei a rotina do hospital",
        ],
        tooltip: "Esperar o cordão parar de pulsar (cerca de 1 a 3 minutos) permite que mais sangue rico em ferro passe da placenta para o bebê, o que é benéfico para sua saúde."
      },
      {
        id: "bebe_amamentacao",
        text: "Amamentação",
        type: "radio",
        options: [
          "Desejo amamentar na primeira hora de vida (Golden Hour)",
          "Preciso de ajuda e orientação para amamentar",
          "Não pretendo amamentar / Usarei fórmula",
        ],
        tooltip: "A 'Golden Hour' (Hora Dourada) é a primeira hora de vida do bebê, um momento ideal para iniciar a amamentação e fortalecer o vínculo."
      },
      {
        id: "bebe_procedimentos",
        text: "Procedimentos de rotina (banho, exames, vacinas)",
        type: "radio",
        options: [
          "Gostaria de estar presente em todos os procedimentos",
          "Prefiro que os procedimentos sejam adiados, se possível",
          "Seguirei a rotina do hospital",
        ],
        tooltip: "Procedimentos como a vacina de Vitamina K e o colírio oftálmico são padrão. Você pode solicitar que o banho seja adiado por algumas horas para não remover o vérnix."
      },
    ],
  },
];