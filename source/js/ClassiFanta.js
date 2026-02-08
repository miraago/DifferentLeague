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
  #presenze;
  #fvm;
  #fvmUltime5;
  #mv;
  #mvUltime5;
  #sommaBonusMalus;
  #sommaBonusMalusUltime5;
  #possessi = [];
  //#statisticheDiGiornata = [];

  //costruttore
  constructor(
    id = "",
    nome = "",
    squadraDiAppartenenza = "",
    ruolo = "",
    ruoloMantra = "",
    fuoriLista = "",
    quotazione = "",
    presenze = "",
    fvm = "",
    fvmUltime5 = "",
    mv = "",
    mvUltime5 = "",
    sommaBonusMalus = "",
    sommaBonusMalusUltime5 = "",
  ) {
    // Use property assignment so the defined setters are invoked
    this.setId = id;
    this.setNome = nome;
    this.setSquadraDiAppartenenza = squadraDiAppartenenza;
    this.setRuolo = ruolo;
    this.setRuoloMantra = ruoloMantra;
    this.setFuoriLista = fuoriLista;
    this.setQuotazione = quotazione;
    this.setPresenze = presenze;
    this.setFvm = fvm;
    this.setFvmUltime5 = fvmUltime5;
    this.setMv = mv;
    this.setMvUltime5 = mvUltime5;
    this.setSommaBonusMalus = sommaBonusMalus;
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
    return this.#ruolo; //this.#ruolo == null ? "" : this.#ruolo;
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
    return this.#presenze;
  }
  get getFvm() {
    return this.#fvm;
  }
  get getFvmUltime5() {
    return this.#fvmUltime5;
  }
  get getMv() {
    return this.#mv;
  }
  get getMvUltime5() {
    return this.#mvUltime5;
  }
  get getSommaBonusMalus() {
    return this.#sommaBonusMalus;
  }
  get getSommaBonusMalusUltime5() {
    return this.#sommaBonusMalusUltime5;
  }

  get getPossessi() {
    return this.#possessi;
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
  set setPresenze(presenze) {
    presenze =
      typeof presenze == "string" ? parseInt(presenze.trim()) : presenze; //se è una stringa la converto in numero
    presenze = Math.floor(presenze); //prendo solo la parte intera
    this.#presenze = presenze >= 0 && presenze <= 38 ? presenze : 0; //se è compresa tra 0 e 38 la considero valida
  }
  set setFvm(fvm) {
    this.#fvm = this.#setFloatValue(fvm);
  }
  set setFvmUltime5(fvmUltime5) {
    this.#fvmUltime5 = this.#setFloatValue(fvmUltime5);
  }
  set setMv(mv) {
    this.#mv = this.#setFloatValue(mv);
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
  //controlla se il giocatore passato appartiene alla rosa di riferimento
  controllaSePresente(player = null) {
    if (!player) {
      this.getTuttiGliSlot.some((el) => {
        // .some() restituisce true non appena trova una corrispondenza
        el != null && el.getDatiGiocatore.getNome == player.getNome;
      });
    }
  }
} //FINE CLASS ROSA**************************************************************

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
  #voto;
  #fvm;
  #goal;
  #assist;
  #ammonizione;
  #espilsione;
  #rigoreParato;
  #rigoreSbagliato;
  #rigoreSegnato;
  #goalSubito;
  #autogoal;
  constructor(nomeGiocatore = "", giornata = "") {
    this.setNomeGiocatore = nomeGiocatore;
    this.setGiornata = giornata;
  }

  //getter  }
  get getNomeGiocatore() {
    return this.#nomeGiocatore;
  }
  get getGiornata() {
    return this.#giornata;
  }
  get getVoto() {
    return this.#voto;
  }
  get getFvm() {
    return this.#fvm;
  }
  get getGoal() {
    return this.#goal;
  }
  get getAssist() {
    return this.#assist;
  }
  get getAmmonizione() {
    return this.#ammonizione;
  }
  get getEspulsione() {
    return this.#espilsione;
  }
  get getRigoreParato() {
    return this.#rigoreParato;
  }
  get getRigoreSbagliato() {
    return this.#rigoreSbagliato;
  }
  get getRigoreSegnato() {
    return this.#rigoreSegnato;
  }
  get getGoalSubito() {
    return this.#goalSubito;
  }
  get getAutogoal() {
    return this.#autogoal;
  }

  //setter
  set setNomeGiocatore(nomeGiocatore) {
    this.#nomeGiocatore = nomeGiocatore;
  }
  set setGiornata(giornata) {
    this.#giornata = giornata;
  }
  set setVoto(voto) {
    this.#voto = voto;
  }
  set setFvm(fvm) {
    this.#fvm = fvm;
  }
  set setGoal(goal) {
    this.#goal = goal;
  }
  set setAssist(assist) {
    this.#assist = assist;
  }
  set setAmmonizione(ammonizione) {
    this.#ammonizione = ammonizione;
  }
  set setEspulsione(espulsione) {
    this.#espilsione = espulsione;
  }
  set setRigoreParato(rigoreParato) {
    this.#rigoreParato = rigoreParato;
  }
  set setRigoreSbagliato(rigoreSbagliato) {
    this.#rigoreSbagliato = rigoreSbagliato;
  }
  set setRigoreSegnato(rigoreSegnato) {
    this.#rigoreSegnato = rigoreSegnato;
  }
  set setGoalSubito(goalSubito) {
    this.#goalSubito = goalSubito;
  }
  set setAutogoal(autogoal) {
    this.#autogoal = autogoal;
  }
} //FINE CLASS STATISTICA DI GIORNATA**************************************************************

export { Giocatore, Rosa, RecordAcquisto, StatisticaDiGiornata };
