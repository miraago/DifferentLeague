import { IMPOSTAZIONI } from "./impostazioni.js";

//CLASS GIOCATORE**************************************************************
class Giocatore {
  //attributi
  #id;
  #nome;
  #squadraDiAppartenenza;
  #ruolo;
  #ruoloMantra;
  #fuoriLista;
  #quotazione;
  #presenze = 0; //presenza intesa come giocato almeno un minuto in una giornata
  #presenzeAVoto = 0; //presenza intesa come giocato almeno un minuto in una giornata in cui ha ricevuto un voto
  #fvm;
  #fvmUltime5;
  #mv = 0;
  #mvUltime5;
  #sommaBonusMalus;
  #sommaBonusMalusUltime5;
  #possessi = [];
  #statisticheDiGiornata = [];
  #goalTotali = 0;
  #assistTotali = 0;
  #goalSubitiTotali = 0;
  #rigoriParatiTotali = 0;
  #rigoriSbagliatiTotali = 0;
  #rigoriSegnatiTotali = 0;

  //costruttore
  constructor(
    id = "",
    nome = "",
    squadraDiAppartenenza = "",
    ruolo = "",
    ruoloMantra = "",
    fuoriLista = "",
    quotazione = "",
    fvmUltime5 = "",
    mvUltime5 = "",
    sommaBonusMalusUltime5 = "",
  ) {
    
    this.setId = id;
    this.setNome = nome;
    this.setSquadraDiAppartenenza = squadraDiAppartenenza;
    this.setRuolo = ruolo;
    this.setRuoloMantra = ruoloMantra;
    this.setFuoriLista = fuoriLista;
    this.setQuotazione = quotazione;
    this.setFvmUltime5 = fvmUltime5;
    this.setMvUltime5 = mvUltime5;
    this.setSommaBonusMalusUltime5 = sommaBonusMalusUltime5;
  }

  //getter Giocatore
  get getId() {
    return parseInt(this.#id);
  }
  get getNome() {
    return this.#nome;
  }
  get getSquadraDiAppartenenza() {
    return this.#squadraDiAppartenenza;
  }
  get getRuolo() {
    return this.#ruolo;
  }
  get getRuoloMantra() {
    return this.#ruoloMantra;
  }
  get getFuoriLista() {
    return this.#fuoriLista;
  }
  get getQuotazione() {
    return this.#quotazione;
  }
  get getPresenze() {
    let tempPresenze = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      if (statistica.getMinutiGiocati > 0) {
        tempPresenze++;
      }
    });
    this.#presenze = tempPresenze;
    return this.#presenze;
  }
  
  get getPresenzeAVoto() {
    let tempPresenzeAVoto = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      if (statistica.getMinutiGiocati > 0 && statistica.getVotoFC_L != "") {
        tempPresenzeAVoto++;
      }
    });
    this.#presenzeAVoto = tempPresenzeAVoto;
    return this.#presenzeAVoto;
  }
  get getFvm() {
    let arrayVotoFCL = [];
    let arrayVotoFCC = [];
    let arrayVotoMI = [];
    let arrayVotoRO = [];
    let temp = 0;

    this.#statisticheDiGiornata.forEach((statisticaCorrente) => {
      temp = 0; //variabile temporanea per calcolare il bonus/malus da aggiungere al voto
      if (statisticaCorrente.getVotoFC_L != "") {
        //se c'è un voto valido per FC_L allora calcolo il bonus/malus e lo aggiungo al voto
        if (statisticaCorrente.getAssistLI != "") {
          temp +=
            statisticaCorrente.getAssistLI * IMPOSTAZIONI.BONUSMALUS.ASSIST;
        }
        if (statisticaCorrente.getGoal != "") {
          temp += statisticaCorrente.getGoal * IMPOSTAZIONI.BONUSMALUS.GOAL;
        }
        if (statisticaCorrente.getAmmonizione != "") {
          temp +=
            statisticaCorrente.getAmmonizione *
            IMPOSTAZIONI.BONUSMALUS.AMMONIZIONE;
        }
        if (statisticaCorrente.getEspulsione != "") {
          temp +=
            statisticaCorrente.getEspulsione *
            IMPOSTAZIONI.BONUSMALUS.ESPULSIONE;
        }
        if (statisticaCorrente.getGoalSubiti != "") {
          temp +=
            statisticaCorrente.getGoalSubiti *
            IMPOSTAZIONI.BONUSMALUS.GOALSUBITO;
        }
        if (statisticaCorrente.getImbattuta != "") {
          temp +=
            statisticaCorrente.getImbattuta *
            IMPOSTAZIONI.BONUSMALUS.CLEENSHEET;
        }
        if (statisticaCorrente.getGoalDecisivoVittoria != "") {
          temp +=
            statisticaCorrente.getGoalDecisivoVittoria *
            IMPOSTAZIONI.BONUSMALUS.GOALDECISIVO;
        }
        if (statisticaCorrente.getRigoreSbagliato != "") {
          temp +=
            statisticaCorrente.getRigoreSbagliato *
            IMPOSTAZIONI.BONUSMALUS.RIGORESBAGLIATO;
        }
        if (statisticaCorrente.getRigoreParato != "") {
          temp +=
            statisticaCorrente.getRigoreParato *
            IMPOSTAZIONI.BONUSMALUS.RIGOREPARATO;
        }
        if (statisticaCorrente.getAutorete != "") {
          temp +=
            statisticaCorrente.getAutorete * IMPOSTAZIONI.BONUSMALUS.AUTOGOAL;
        }
        if (statisticaCorrente.getRigoreSegnato != "") {
          temp +=
            statisticaCorrente.getRigoreSegnato *
            IMPOSTAZIONI.BONUSMALUS.RIGORESEGNATO;
        }

        if (statisticaCorrente.getVotoFC_L != "") {
          arrayVotoFCL.push(parseFloat(statisticaCorrente.getVotoFC_L) + temp);
        }
        if (statisticaCorrente.getVotoFC_C != "") {
          arrayVotoFCC.push(parseFloat(statisticaCorrente.getVotoFC_C) + temp);
        }
        if (statisticaCorrente.getVoto_MI != "") {
          arrayVotoMI.push(parseFloat(statisticaCorrente.getVoto_MI) + temp);
        }
        if (statisticaCorrente.getVotoRO != "") {
          arrayVotoRO.push(parseFloat(statisticaCorrente.getVotoRO) + temp);
        }
      }
    });

    let mediaFCL =
      arrayVotoFCL.length > 0
        ? arrayVotoFCL.reduce((a, b) => a + b, 0) / arrayVotoFCL.length
        : 0;
    let mediaFCC =
      arrayVotoFCC.length > 0
        ? arrayVotoFCC.reduce((a, b) => a + b, 0) / arrayVotoFCC.length
        : 0;
    let mediaMI =
      arrayVotoMI.length > 0
        ? arrayVotoMI.reduce((a, b) => a + b, 0) / arrayVotoMI.length
        : 0;
    let mediaRO =
      arrayVotoRO.length > 0
        ? arrayVotoRO.reduce((a, b) => a + b, 0) / arrayVotoRO.length
        : 0;

    this.#fvm = mediaFCL.toFixed(2);
    return this.#fvm;
  }
  get getFvmUltime5() {
    return this.#fvmUltime5;
  }
  get getMv() {
    let arrayVotoFCL = [];
    let arrayVotoFCC = [];
    let arrayVotoMI = [];
    let arrayVotoRO = [];

    this.#statisticheDiGiornata.forEach((statisticaCorrente) => {
      if (statisticaCorrente.getVotoFC_L != "") {
        arrayVotoFCL.push(parseFloat(statisticaCorrente.getVotoFC_L));
      }
      if (statisticaCorrente.getVotoFC_C != "") {
        arrayVotoFCC.push(parseFloat(statisticaCorrente.getVotoFC_C));
      }
      if (statisticaCorrente.getVoto_MI != "") {
        arrayVotoMI.push(parseFloat(statisticaCorrente.getVoto_MI));
      }
      if (statisticaCorrente.getVotoRO != "") {
        arrayVotoRO.push(parseFloat(statisticaCorrente.getVotoRO));
      }
    });

    let mediaFCL =
      arrayVotoFCL.length > 0
        ? arrayVotoFCL.reduce((a, b) => a + b, 0) / arrayVotoFCL.length
        : 0;
    let mediaFCC =
      arrayVotoFCC.length > 0
        ? arrayVotoFCC.reduce((a, b) => a + b, 0) / arrayVotoFCC.length
        : 0;
    let mediaMI =
      arrayVotoMI.length > 0
        ? arrayVotoMI.reduce((a, b) => a + b, 0) / arrayVotoMI.length
        : 0;
    let mediaRO =
      arrayVotoRO.length > 0
        ? arrayVotoRO.reduce((a, b) => a + b, 0) / arrayVotoRO.length
        : 0;

    this.#mv = mediaFCL.toFixed(2);
    return this.#mv;
  }
  get getMvUltime5() {
    return this.#mvUltime5;
  }
  get getSommaBonusMalus() {
    let contatoreBonusMalus = 0;
    this.#statisticheDiGiornata.forEach((statisticaCorrente) => {
      if (statisticaCorrente.getVotoFC_L != "") {
        contatoreBonusMalus += statisticaCorrente.getGoal * IMPOSTAZIONI.BONUSMALUS.GOAL;
        contatoreBonusMalus += statisticaCorrente.getAssistLI * IMPOSTAZIONI.BONUSMALUS.ASSIST;
        contatoreBonusMalus += statisticaCorrente.getAmmonizione * IMPOSTAZIONI.BONUSMALUS.AMMONIZIONE;
        contatoreBonusMalus += statisticaCorrente.getEspulsione * IMPOSTAZIONI.BONUSMALUS.ESPULSIONE;
        contatoreBonusMalus += statisticaCorrente.getRigoreSegnato * IMPOSTAZIONI.BONUSMALUS.RIGORESEGNATO;
        contatoreBonusMalus += statisticaCorrente.getRigoreSbagliato * IMPOSTAZIONI.BONUSMALUS.RIGORESBAGLIATO;
        contatoreBonusMalus += statisticaCorrente.getRigoreParato * IMPOSTAZIONI.BONUSMALUS.RIGOREPARATO;
        contatoreBonusMalus += statisticaCorrente.getAutorete * IMPOSTAZIONI.BONUSMALUS.AUTOGOAL;
        contatoreBonusMalus += statisticaCorrente.getGoalSubiti * IMPOSTAZIONI.BONUSMALUS.GOALSUBITO;
        contatoreBonusMalus += statisticaCorrente.getImbattuta * IMPOSTAZIONI.BONUSMALUS.CLEENSHEET;
        contatoreBonusMalus += statisticaCorrente.getGoalDecisivoVittoria * IMPOSTAZIONI.BONUSMALUS.GOALDECISIVO;
      }
    });
    this.#sommaBonusMalus = contatoreBonusMalus;

    return this.#sommaBonusMalus;
  }
  get getSommaBonusMalusUltime5() {
    return this.#sommaBonusMalusUltime5;
  }

  get getPossessi() {
    return this.#possessi;
  }
  get getStatisticheDiGiornata() {
    return this.#statisticheDiGiornata;
  }

  // IN CLASSE GIOCATORE:
  get getGoalTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getGoal + statistica.getRigoreSegnato;
    });
    this.#goalTotali = totale;
    return this.#goalTotali;
  }
  get getGoalSubitiTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getGoalSubiti;
    });
    this.#goalSubitiTotali = totale;
    return this.#goalSubitiTotali;
  }
  get getAssistTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getAssistLI;
    });
    this.#assistTotali = totale;
    return this.#assistTotali;
  }
  get getRigoriParatiTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getRigoreParato;
    });
    this.#rigoriParatiTotali = totale;
    return this.#rigoriParatiTotali;
  }
  get getRigoriSbagliatiTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getRigoreSbagliato;
    });
    this.#rigoriSbagliatiTotali = totale;
    return this.#rigoriSbagliatiTotali;
  }
  get getRigoriSegnatiTotali() {
    let totale = 0;
    this.#statisticheDiGiornata.forEach((statistica) => {
      totale += statistica.getRigoreSegnato;
    });
    this.#rigoriSegnatiTotali = totale;
    return this.#rigoriSegnatiTotali;
  }

  //setter Giocatore
  set setId(id) {
    this.#id = id;
  }
  set setNome(nome) {
    nome = typeof nome == "string" ? nome.trim() : undefined; //se è una stringa tolgo gli spazia a dx e sx
    //per essere settato il nome deve essere una stringa di almeno 3 caratteri
    this.#nome =
      typeof nome == "string" && nome.length >= 3
        ? nome.toUpperCase()
        : undefined;
  }
  set setSquadraDiAppartenenza(team) {
    const stringa = typeof team;
    if (stringa != "string" || team.trim().length <= 3) {
      this.#squadraDiAppartenenza = "";
    } else {
      team = team.trim().toUpperCase();
      const squadreValide = [
        "ATALANTA",
        "BOLOGNA",
        "CAGLIARI",
        "COMO",
        "CREMONESE",
        "FIORENTINA",
        "GENOA",
        "INTER",
        "JUVENTUS",
        "LAZIO",
        "LECCE",
        "MILAN",
        "NAPOLI",
        "PARMA",
        "PISA",
        "ROMA",
        "SASSUOLO",
        "TORINO",
        "UDINESE",
        "VERONA",
      ];
      this.#squadraDiAppartenenza = squadreValide.includes(team) ? team : "";
    }
  }
  set setRuolo(ruolo) {
    const ruoliValidi = ["P", "D", "C", "A"];
    this.#ruolo = ruoliValidi.includes(ruolo) ? ruolo : ""; //se il ruolo è valido lo assegno, altrimenti lo imposto a undefined
  }
  set setRuoloMantra(ruoloMantra) {
    const ruoliValidi = ["P", "D", "C", "A"];
    this.#ruoloMantra = ruoliValidi.includes(ruoloMantra) ? ruoloMantra : "";
  }
  set setFuoriLista(fuoriDellaLista) {
    // assegna true se il valore è '*' altrimenti false
    this.#fuoriLista = fuoriDellaLista == "*" ? true : false;
  }

  set setQuotazione(quotazione) {
    if (typeof quotazione == "string") {
      quotazione = parseInt(quotazione.trim());
    }
    if (quotazione == "") {
      throw new Error("La quotazione non può essere vuota");
    }

    this.#quotazione = quotazione;
  }

  set setFvm(fvm) {
    this.#fvm = this.#setFloatValue(fvm);
  }
  set setFvmUltime5(fvmUltime5) {
    this.#fvmUltime5 = this.#setFloatValue(fvmUltime5);
  }

  set setMvUltime5(mvUltime5) {
    this.#mvUltime5 = this.#setFloatValue(mvUltime5);
  }
  set setSommaBonusMalus(sommaBonusMalus) {
    this.#sommaBonusMalus = this.#setFloatValue(sommaBonusMalus);
  }
  set setSommaBonusMalusUltime5(sommaBonusMalusUltime5) {
    this.#sommaBonusMalusUltime5 = this.#setFloatValue(sommaBonusMalusUltime5);
  }

  #setFloatValue(value) {
    let tempValue = typeof value == "string" ? value.trim() : value; //se è una stringa gli tolgo gli spazi esterni
    tempValue = parseFloat(tempValue.replace(",", "."));
    return isNaN(tempValue) ? 0 : tempValue;
  }

  aggiungiPossessi(rosa) {
    //aggiunge una rosa ai possessi del giocatore

    if (rosa != null) {
      //controllo se è null
      if (rosa instanceof Rosa) {
        //controllo se è di tipo Rosa
        if (!this.#possessi.includes(rosa)) {
          //controllo se è già presente
          if (this.getCopieDisponibili > 0) {
            //controllo se ci sono copie disponibili
            this.#possessi.push(rosa); //aggiungo la rosa ai possessi
            return true;
          }
        }
      }
    }
    return false;
  }
  rimuoviPossessi(rosa) {
    const index = this.#possessi.indexOf(rosa);
    if (index !== -1) {
      this.#possessi.splice(index, 1);
      return true;
    }
    return false;
  }

  get getCopieDisponibili() {
    return IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO - this.#possessi.length;
  }

  get getCopieOccupate() {
    return this.#possessi.length;
  }

  controllaGiocatoreValido() {
    if (this.getRuolo == undefined) return false;
    if (this.getFuoriLista) return false;

    const id = this.getId;
    // if (Number.isInteger(id) || id >= 0) {
    //   return false;
    // }
    return true;
  }

  printConsole() {
    console.log(
      `Nome: ${this.#nome}, Squadra: ${this.#squadraDiAppartenenza}, Ruolo: ${
        this.#ruolo
      }, Quotazione: ${this.#quotazione}, Presenze: ${this.#presenze}, FVM: ${
        this.#fvm
      }, MV: ${this.#mv}`,
    );
  }

  addStatisticheDiGiornata(statistiche) {
    if (statistiche instanceof StatisticaDiGiornata) {
      this.#statisticheDiGiornata.push(statistiche);
    }
  }
} //FINE CLASS GIOCATORE**************************************************************

//CLASS ROSA**************************************************************
class Rosa {
  #nomeRosa;
  #nomePresidente;
  #campionatoDiAppartenenza;
  #creditiResidui;
  #slotRosa = {
    P: [], //record di portieri
    D: [], //record di dd
    C: [], //record di cc
    A: [], //record di att
  };

  constructor(nome = "", presidente = "", campionato = "", creditiRes = "") {
    this.setNomeRosa = nome;
    this.setNomePresidente = presidente;
    this.setCampionatoDiAppartenenza = campionato;
    this.setCreditiResidui = creditiRes;
    this.#inizializzaSlot();
  }

  get getPortieri() {
    return this.#slotRosa.P;
  }
  get getDifensori() {
    return this.#slotRosa.D;
  }
  get getCentrocampisti() {
    return this.#slotRosa.C;
  }
  get getAttaccanti() {
    return this.#slotRosa.A;
  }

  get getContaP() {
    let conta = 0;
    for (let i = 0; i < this.#slotRosa.P.length; i++) {
      if (this.#slotRosa.P[i] != null) conta++;
    }
    return conta;
  }
  get getContaD() {
    let conta = 0;
    for (let i = 0; i < this.#slotRosa.D.length; i++) {
      if (this.#slotRosa.D[i] != null) conta++;
    }
    return conta;
  }
  get getContaC() {
    let conta = 0;
    for (let i = 0; i < this.#slotRosa.C.length; i++) {
      if (this.#slotRosa.C[i] != null) conta++;
    }
    return conta;
  }
  get getContaA() {
    let conta = 0;
    for (let i = 0; i < this.#slotRosa.A.length; i++) {
      if (this.#slotRosa.A[i] != null) conta++;
    }
    return conta;
  }

  get getTuttiGliSlot() {
    let array = [];
    this.getPortieri.forEach((el) => array.push(el));
    this.getDifensori.forEach((el) => array.push(el));
    this.getCentrocampisti.forEach((el) => array.push(el));
    this.getAttaccanti.forEach((el) => array.push(el));

    return array;
  }

  get getCreditiResidui() {
    return this.#creditiResidui;
  }

  #inizializzaSlot() {
    for (let i = 0; i < IMPOSTAZIONI.REGOLE.MAX_P; i++) {
      this.#slotRosa.P[i] = null;
    }
    for (let i = 0; i < IMPOSTAZIONI.REGOLE.MAX_D; i++) {
      this.#slotRosa.D[i] = null;
    }
    for (let i = 0; i < IMPOSTAZIONI.REGOLE.MAX_C; i++) {
      this.#slotRosa.C[i] = null;
    }
    for (let i = 0; i < IMPOSTAZIONI.REGOLE.MAX_A; i++) {
      this.#slotRosa.A[i] = null;
    }
  }
  //getter
  get getNomeRosa() {
    return this.#nomeRosa;
  }
  get getNomePresidente() {
    return this.#nomePresidente;
  }
  get getCampionatoDiAppartenenza() {
    return this.#campionatoDiAppartenenza;
  }

  giocatoreToCosto(giocatore) {
    if ((!giocatore) instanceof Giocatore) {
      return 0;
    }
    const slotTrovato = this.getTuttiGliSlot.find((slotCorrente) => {
      if (slotCorrente != null)
        return slotCorrente.getDatiGiocatore.getNome == giocatore.getNome;
    });

    return slotTrovato.getCostoDiAcquisto;
  }

  get getCreditiSpesi() {
    let creditiSpesi = 0;
    this.getTuttiGliSlot.forEach((rec) => {
      if (rec) {
        creditiSpesi += rec.getCostoDiAcquisto;
      }
    });
    return creditiSpesi;
  }
  get getValoreRosa() {
    let sommaQuotazioni = 0;
    this.getTuttiGliSlot.forEach((rec) => {
      if (rec) {
        sommaQuotazioni += rec.getDatiGiocatore.getQuotazione;
      }
    });
    return sommaQuotazioni;
  }

  //setter
  set setCreditiResidui(crediti) {
    if (typeof crediti == "string") {
      crediti = crediti.trim();
      crediti = Number(crediti);
      if (isNaN(crediti)) {
        crediti = 0;
      }
    }
    this.#creditiResidui = crediti;
  }
  set setNomeRosa(nome) {
    if (nome == null || nome.length < 3) {
      //campo Vuoto o minore di 3 caratteri
      this.#nomeRosa = "DA DEFINIRE";
    } else {
      this.#nomeRosa = nome.toUpperCase().trim();
    }
  }
  set setNomePresidente(presidente) {
    if (presidente == null || presidente.length < 3) {
      //campo Vuoto o minore di 3 caratteri
      console.log("Errore Nome Presidente -> non può essere Vuoto");
      this.#nomePresidente = "DA DEFINIRE";
    } else {
      this.#nomePresidente = presidente.toUpperCase().trim();
    }
  }

  set setCampionatoDiAppartenenza(campionato) {
    let campionatoUpper =
      typeof campionato == "string" ? campionato.trim().toUpperCase() : "";
    this.#campionatoDiAppartenenza = IMPOSTAZIONI.CAMPIONATI.TUTTI.includes(
      campionatoUpper,
    )
      ? campionatoUpper
      : "";
  }

  addRecordAcquisto(record) {
    if (!(record instanceof RecordAcquisto)) {
      return -1;
    }
    if (record) {
      const ruolo = record.getDatiGiocatore.getRuolo;
      const indiceSlotVuoto = this.#slotRosa[ruolo].indexOf(null);

      if (indiceSlotVuoto == -1) {
        return -1;
      } else {
        this.#slotRosa[ruolo][indiceSlotVuoto] = record;
        return indiceSlotVuoto;
      }
    }
  }

  contaSlotPieni() {
    let conta = 0;
    this.getTuttiGliSlot.forEach((slot) => {
      if (slot != null) conta++;
    });
    return conta;
  }

  /**
   * controlla se il giocatore passato appartiene alla rosa di riferimento
   * * @param {Giocatore} oggetto - Il giocatore da controllare
   * @returns {boolean} true se è posseduto - false se non è posseduto
   */
  controllaSePresente(player = null) {
    if (!player) {
      this.getTuttiGliSlot.some((el) => {
        // .some() restituisce true non appena trova una corrispondenza
        el != null && el.getDatiGiocatore.getNome == player.getNome;
      });
    }
  }
}

//FINE CLASS ROSA**************************************************************

//CLASS RECORDACQUISTO**************************************************************
class RecordAcquisto {
  #dataDiAcquisto;
  #costoDiAcquisto;
  #giornataDiAcquisto;
  #datiGiocatore;

  constructor(
    datiGiocatore,
    giornataDiAcquisto = "",
    dataDiAcquisto = "",
    costoDiAcquisto = "",
  ) {
    this.setGiornataDiAcquisto = giornataDiAcquisto;
    this.setDataDiAcquisto = dataDiAcquisto;
    this.setCostoDiAcquisto = costoDiAcquisto;
    this.setDatiGiocatore = datiGiocatore;
  }

  //getter
  get getDatiGiocatore() {
    return this.#datiGiocatore;
  }

  get getDataDiAcquisto() {
    return this.#dataDiAcquisto;
  }
  get getCostoDiAcquisto() {
    return this.#costoDiAcquisto;
  }
  get getGiornataDiAcquisto() {
    return this.#giornataDiAcquisto;
  }

  //setter

  set setDataDiAcquisto(dataAcquisto) {
    this.#dataDiAcquisto = dataAcquisto;
  }
  set setGiornataDiAcquisto(giornataDiAcquisto) {
    this.#giornataDiAcquisto = giornataDiAcquisto;
  }
  set setPrezzoDiAcquisto(prezzoDiAcquisto) {
    this.#costoDiAcquisto = prezzoDiAcquisto;
  }
  set setCostoDiAcquisto(costo) {
    costo = parseInt(costo.trim());
    this.#costoDiAcquisto = costo;
  }
  set setDatiGiocatore(giocatore) {
    if (giocatore != null) {
      this.#datiGiocatore = giocatore;
    }
  }
} //FINE CLASS ACQUISTO GIOCATORE**************************************************************

//CLASS STATISTICA DI GIORNATA**************************************************************
class StatisticaDiGiornata {
  #nomeGiocatore;
  #giornata;
  #partita;
  #votoFC_L;
  #votoFC_C;
  #voto_MI;
  #votoRO;
  #assistLI;
  #assistFC;
  #assistMI;
  #assistFE;
  #minutiGiocati;
  #entrato;
  #sostituito;
  #goal;
  #goalSubiti;
  #rigoreSegnato;
  #rigoreSbagliato;
  #rigoreParato;
  #autorete;
  #ammonizione;
  #espulsione;
  #imbattuta;
  #goalDecisivoVittoria;

  constructor(
    nomeGiocatore,
    giornata,
    partita,
    votoFC_L,
    votoFC_C,
    voto_MI,
    votoRO,
    assistLI,
    assistFC,
    assistMI,
    assistFE,
    minutiGiocati,
    entrato,
    sostituito,
    goal,
    goalSubiti,
    rigoreSegnato,
    rigoreSbagliato,
    rigoreParato,
    autorete,
    ammonizione,
    espulsione,
    imbattuta,
    goalDecisivoVittoria,
  ) {
    this.setNomeGiocatore = nomeGiocatore;
    this.setGiornata = giornata;
    this.setPartita = partita;
    this.setVotoFC_L = votoFC_L;
    this.setVotoFC_C = votoFC_C;
    this.setVoto_MI = voto_MI;
    this.setVotoRO = votoRO;
    this.setAssistLI = assistLI;
    this.setAssistFC = assistFC;
    this.setAssistMI = assistMI;
    this.setAssistFE = assistFE;
    this.setMinutiGiocati = minutiGiocati;
    this.setEntrato = entrato;
    this.setSostituito = sostituito;
    this.setGoal = goal;
    this.setGoalSubiti = goalSubiti;
    this.setRigoreSegnato = rigoreSegnato;
    this.setRigoreSbagliato = rigoreSbagliato;
    this.setRigoreParato = rigoreParato;
    this.setAutorete = autorete;
    this.setAmmonizione = ammonizione;
    this.setEspulsione = espulsione;
    this.setImbattuta = imbattuta;
    this.setGoalDecisivoVittoria = goalDecisivoVittoria;
  }

  //getter
  get getNomeGiocatore() {
    return this.#nomeGiocatore;
  }
  get getGiornata() {
    return this.#giornata;
  }
  get getPartita() {
    return this.#partita;
  }
  get getVotoFC_L() {
    return this.#votoFC_L;
  }
  get getVotoFC_C() {
    return this.#votoFC_C;
  }
  get getVoto_MI() {
    return this.#voto_MI;
  }
  get getVotoRO() {
    return this.#votoRO;
  }
  get getAssistLI() {
    return this.#assistLI;
  }
  get getAssistFC() {
    return this.#assistFC;
  }
  get getAssistMI() {
    return this.#assistMI;
  }
  get getAssistFE() {
    return this.#assistFE;
  }
  get getMinutiGiocati() {
    return this.#minutiGiocati;
  }
  get getEntrato() {
    return this.#entrato;
  }
  get getSostituito() {
    return this.#sostituito;
  }
  get getGoal() {
    return this.#goal;
  }
  get getGoalSubiti() {
    return this.#goalSubiti;
  }
  get getRigoreSegnato() {
    return this.#rigoreSegnato;
  }
  get getRigoreSbagliato() {
    return this.#rigoreSbagliato;
  }
  get getRigoreParato() {
    return this.#rigoreParato;
  }
  get getAutorete() {
    return this.#autorete;
  }
  get getAmmonizione() {
    return this.#ammonizione;
  }
  get getEspulsione() {
    return this.#espulsione;
  }
  get getImbattuta() {
    return this.#imbattuta;
  }
  get getGoalDecisivoVittoria() {
    return this.#goalDecisivoVittoria;
  }

  //setter
  set setNomeGiocatore(nome) {
    this.#nomeGiocatore = nome;
  }
  set setGiornata(giornata) {
    this.#giornata = giornata;
  }
  set setPartita(partita) {
    this.#partita = partita;
  }
  set setVotoFC_L(voto) {
    this.#votoFC_L = voto;
  }
  set setVotoFC_C(voto) {
    this.#votoFC_C = voto;
  }
  set setVoto_MI(voto) {
    this.#voto_MI = voto;
  }
  set setVotoRO(voto) {
    this.#votoRO = voto;
  }
  set setAssistLI(assist) {
    this.#assistLI = parseInt(assist);
    if (isNaN(this.#assistLI)) {
      this.#assistLI = 0;
    }
  }
  set setAssistFC(assist) {
    this.#assistFC = assist;
  }
  set setAssistMI(assist) {
    this.#assistMI = assist;
  }
  set setAssistFE(assist) {
    this.#assistFE = assist;
  }
  set setMinutiGiocati(minuti) {
    this.#minutiGiocati = minuti;
  }
  set setEntrato(entrato) {
    this.#entrato = entrato;
  }
  set setSostituito(sostituito) {
    this.#sostituito = sostituito;
  }

  set setGoal(goal) {
    this.#goal = parseInt(goal);
    if (isNaN(this.#goal)) {
      this.#goal = 0;
    }
  }

  set setGoalSubiti(goalSubiti) {
    this.#goalSubiti = goalSubiti;
  }
  set setRigoreSegnato(rigoreSegnato) {
    this.#rigoreSegnato = rigoreSegnato;
  }
  set setRigoreSbagliato(rigoreSbagliato) {
    this.#rigoreSbagliato = rigoreSbagliato;
  }
  set setRigoreParato(rigoreParato) {
    this.#rigoreParato = rigoreParato;
  }
  set setAutorete(autorete) {
    this.#autorete = autorete;
  }
  set setAmmonizione(ammonizione) {
    this.#ammonizione = ammonizione;
  }
  set setEspulsione(espulsione) {
    this.#espulsione = espulsione;
  }
  set setImbattuta(imbattuta) {
    if (isNaN(this.#imbattuta)) {
      this.#imbattuta = 0;
    }
    this.#imbattuta = parseInt(imbattuta);
  }
  set setGoalDecisivoVittoria(goalDecisivoVittoria) {
    this.#goalDecisivoVittoria = goalDecisivoVittoria;
  }
} //FINE CLASS STATISTICA DI GIORNATA**************************************************************

export { Giocatore, Rosa, RecordAcquisto, StatisticaDiGiornata };
