export const IMPOSTAZIONI = {
  // 1. Costanti relative ai Ruoli dei Giocatori
  RUOLI: {
    PORTIERE: "P",
    DIFENSORE: "D",
    CENTROCAMPISTA: "C",
    ATTACCANTE: "A",
  },

  // 2. Costanti relative ai cAMPIONATI DISPONIBILI
  CAMPIONATI: {
    GIR1: "PREMIER LEAGUE",
    GIR2: "LIGA SPAGNOLA",
    GIR3: "BUNDESLIGA",
    GIR4: "LIGUE 1",
    GIR5: "SERIE A",
    TUTTI: [
      "PREMIER LEAGUE",
      "LIGA SPAGNOLA",
      "BUNDESLIGA",
      "LIGUE 1",
      "SERIE A",
    ],
  },
  // 3. Regole di gioco
  REGOLE: {
    NUMERO_SQUADRE: 100,
    NUMERO_SQUADRE_A_GIRONE: 20,
    MAX_NUMERO_GIOCATORI_PER_SQUADRA: 25,
    MAX_P: 3,
    MAX_D: 8,
    MAX_C: 8,
    MAX_A: 6,
    CARICAMENTO_FUORI_LISTA: false,
    MAX_POSSEDUTO: 9, //traccia di quante squadre possono possedere un giocatore
  },

  // 4. Valore Bonus/Malus di gioco
  BONUSMALUS: {
    GOAL: 3,
    ASSIST: 1,
    AMMONIZIONE: -0.5,
    ESPULSIONE: -1,
    RIGORESEGNATO: 3,
    RIGORESBAGLIATO: -3,
    RIGOREPARATO: 3,
    GOALSUBITO: -1,
    CLEENSHEET: 1,
    AUTOGOAL: -2,
  },
  // 5. Opzioni di gioco
  OPZIONI_LEGHE: {
    CARICAMENTO_FUORI_LISTA: false, //true (carica anche Fuorilista) false ( non caricare)
    NUMERO_GIORNATE: 38,
  },
};
