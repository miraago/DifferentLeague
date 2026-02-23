import { IMPOSTAZIONI } from "./impostazioni.js";
import { toCapitalize } from "./funzioniAgo.js";

export const containerFiltri = document.getElementById("container-filtri");

//GESTIONE FILTRI
export const STATO_FILTRI = {
  qt: {
    //filtro quotazioni
    min: 1, //quotazione minima
    max: 1, //quotazione massima
    minSelezionato: 1, //quotazione minima selezionata nel filtro
    maxSelezionato: 1, //quotazione massima selezionata nel filtro
  },
  presenze: {
    //filtro presenze
    min: 0,
    max: 0,
    minSelezionato: 0,
  },
  ruolo: [], //filtro ruolo
  lega: [], //filtro lega, tiene traccia del campionato cliccato
  squadraSA: [], //filtro squadra serie A selezionata
  caricaFuoriLista: false, //  tiene traccia se mostrare o meno i fuori lista. se è true significa che è selezionato tutti
  rosaPresidente: "", // tiene traccia del presidente selezionato
};
export function creaFiltroSelezionaCampionato() {
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">
          <label>Lega</label>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR1}"id="logo-premier" class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR1.toLowerCase().replace(" ", "_")}.png" title="Premier League" alt="Premier League" ></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR2}"id="logo-liga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR2.toLowerCase().replace(" ", "_")}.png" title="Liga Spagnola" alt="Liga Spagnola"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR3}"id="logo-bundesliga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR3.toLowerCase().replace(" ", "_")}.png" title="Bundesliga" alt="Bundesliga"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR4}"id="logo-ligue1"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR4.toLowerCase().replace(" ", "_")}.png" title="Ligue 1" alt="Ligue 1"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR5}"id="logo-seriea"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR5.toLowerCase().replace(" ", "_")}.png" title="Serie A" alt="Serie A"></div>
    </section>`,
  );

  //console.log("creazione filtro seleziona campionato completata.");
}
export function gestisciFiltroSelezionaCampionato(evento) {
  console.log("function gestisciFiltroSelezionaCampionato(evento)");
  const elemento_cliccato = evento.target;

  if (elemento_cliccato.className.includes("logo-campionato")) {
    if (STATO_FILTRI.lega.includes(elemento_cliccato.name)) {
      //se il campionato è già incluso nel filtro, lo rimuoviamo
      const indice = STATO_FILTRI.lega.indexOf(elemento_cliccato.name); //troviamo l'indice del campionato da rimuovere
      STATO_FILTRI.lega.splice(indice, 1); //rimuoviamo il campionato dal filtro
      elemento_cliccato.classList.remove("selected");
    } else {
      //altrimenti lo aggiungiamo al filtro
      STATO_FILTRI.lega.push(elemento_cliccato.name); //aggiungiamo il campionato al filtro
      elemento_cliccato.classList.add("selected"); //aggiungiamo la classe selected per evidenziare il filtro selezionato
    }
  }
}

export function applicaFiltriGiocatori(player) {
  let arrayFiltrato;
  // APPLICAZIONE FILTRI

  const contaElementiFiltroBox =
    document.querySelectorAll(".box-filtro").length; // conta gli elementi nel contenitore di filtri

  // Se non sono presenti filtri, restituisci l'array completo (copia)
  if (contaElementiFiltroBox === 0) return player.slice();

  // filtra per ruolo
  arrayFiltrato = player.filter((giocatoreCorrente) => {
    return ruoliFiltrati().includes(giocatoreCorrente.getRuolo);
  });

  // filtro ricerca giocatore (solo se esiste il controllo e contiene testo)
  const TAG_RICERCA = document.getElementById("input-ricerca-giocatore");
  if (TAG_RICERCA && TAG_RICERCA.value && TAG_RICERCA.value.trim() !== "") {
    const regex = new RegExp(TAG_RICERCA.value.trim(), "i");
    arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
      return regex.test(giocatoreCorrente.getNome);
    });
  }

  // filtro per quotazione
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return checkQuotazione(giocatoreCorrente.getQuotazione);
  });

  // filtro per squadra
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    if (STATO_FILTRI.squadraSA.length == 0) return true;
    return STATO_FILTRI.squadraSA.includes(
      giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase(),
    );
  });

  // filtro per presenze minime
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return (
      giocatoreCorrente.getPresenze >= STATO_FILTRI.presenze.minSelezionato
    );
  });

  // filto per escludere o meno i fuorilista
  if (!STATO_FILTRI.caricaFuoriLista) {
    arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
      return !giocatoreCorrente.getFuoriLista;
    });
  }

  return arrayFiltrato;
}

export function applicaFiltroTeams(presidenti) {
  let arraySquadre = presidenti.filter((teamsCorrente) => {
    return STATO_FILTRI.lega.includes(
      teamsCorrente.getCampionatoDiAppartenenza,
    );
  });

  if (arraySquadre.length == 0) {
    //se non è applicato nessun filtro deve caricare tutte le rose
    arraySquadre = presidenti.map((squadraCorrente) => squadraCorrente);
  }

  return arraySquadre;
}

export function creaFiltroPresenzeMinime() {
  let selectPresenzeHTML = ""; //partiamo da 0 fino al max presenze tra i giocatori
  for (let i = 0; i <= STATO_FILTRI.presenze.max; i++) {
    selectPresenzeHTML += `<option>${i}</option>`;
  }
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">    
      <label title="Presenze Minime">Pres. Min.</label>
        <select id="select-presenze-minime">
          ${selectPresenzeHTML}
        </select>          
    </section>`,
  );
}
export function creaFiltroRosa(presidenti) {
  let optionsRosaHTML = "";

  //SE già esiste il filtro rosa lo azzeriamo
  const filtroRosaEsistente = document.getElementById("select-scegli-rosa");
  if (filtroRosaEsistente) {
    filtroRosaEsistente.parentNode.remove();
  }

  optionsRosaHTML += `<option value="tutte">Tutte le rose</option>`;

  presidenti.forEach((teamCorrente) => {
    if (STATO_FILTRI.rosaPresidente == teamCorrente.getNomeRosa.toLowerCase()) {
      optionsRosaHTML += `<option value="${teamCorrente.getNomeRosa.toLowerCase()}" selected>${toCapitalize(teamCorrente.getNomeRosa)}</option>`;
    } else {
      optionsRosaHTML += `<option value="${teamCorrente.getNomeRosa.toLowerCase()}">${toCapitalize(teamCorrente.getNomeRosa)}</option>`;
    }
  });

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
  <section class="box-filtro">
          <label>Scegli la rosa</label>
          <select id="select-scegli-rosa">
            ${optionsRosaHTML}
        </section>`,
  );
}

export function gestisciFiltroRosa(event) {
  console.log("function gestisciFiltroRosa(event)");
  const TAG = event.target;

  if (TAG.id == "select-scegli-rosa") {
    STATO_FILTRI.rosaPresidente = TAG.value;
  }
}

export function gestisciFiltroPresenzeMinime(event) {
  console.log("function gestisciFiltroPresenzeMinime(event)");
  const TAG = event.target;
  if (TAG.id == "select-presenze-minime") {
    //verifichiamo che il change provenga dal filtro presenze minime
    STATO_FILTRI.presenze.minSelezionato = parseInt(TAG.value);
  }
}

export function creaFiltroTeam(player) {
  let tuttiTeam = new Set();

  player.forEach((giocatoreCorrente) => {
    if (giocatoreCorrente.getSquadraDiAppartenenza != "") {
      tuttiTeam.add(giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase());
    }
  });

  let teamsOrdinati = [...tuttiTeam].sort((a, b) => a.localeCompare(b));

  let rigadicostruzionefiltrisquadre = `<section class='box-filtro' id="id-box-team"> <label> Squadra</label>`;
  for (let i = 0; i < teamsOrdinati.length; i++) {
    rigadicostruzionefiltrisquadre += `<div class="box-team" name="${teamsOrdinati[i]}">
      <img src="Assets/image/loghi_team_serie_A/${teamsOrdinati[i]}.png" 
      alt="${teamsOrdinati[i]}" 
      name="${teamsOrdinati[i]}"/>
      <p name="${teamsOrdinati[i]}">${teamsOrdinati[i].slice(0, 3).toUpperCase()}</p>
    </div>`;
  }
  rigadicostruzionefiltrisquadre += "</section>";

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    rigadicostruzionefiltrisquadre,
  );
}
export function gestisciFiltroTeam(evento) {
  console.log("function gestisciFiltroTeam(evento)");
  const elemento_cliccato = evento.target;

  const nodo_parente = elemento_cliccato.parentElement;

  if (nodo_parente.className.includes("box-team")) {
    {
      const nomeSquadra = nodo_parente.getAttribute("name");

      if (STATO_FILTRI.squadraSA.includes(nomeSquadra)) {
        const indice = STATO_FILTRI.squadraSA.indexOf(nomeSquadra);
        STATO_FILTRI.squadraSA.splice(indice, 1);
        nodo_parente.classList.remove("selected");
      } else {
        STATO_FILTRI.squadraSA.push(nomeSquadra);
        nodo_parente.classList.add("selected");
      }
    }
  }
}

export function creaFiltroQuotazioneMinEMax() {
  console.log("function creaFiltroQuotazioneMinEMax()");
  //riempiamo i due select in base ai giocatori attualment in memoria
  let popolaMinEMaxHTML = ""; //partiamo da 1 fino al maxQuotazione
  for (let i = 0; i < parseInt(STATO_FILTRI.qt.max); i++) {
    popolaMinEMaxHTML += "<option>" + (i + 1) + "</option>";
  }

  //inseriamo il filtro nel box (inserimento senza riconstruire tutto il contenuto precedente)
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">
    <label>Qt Min e Max</label>
    <select id="select-qt-min">
      ${popolaMinEMaxHTML}      
    </select>    
    <select id="select-qt-max">
      ${popolaMinEMaxHTML}  
    </select>
    </section>`,
  );

  //selezionamo il min ed il max nel filtro

  const TagSelectMin = document.getElementById("select-qt-min");
  const TagSelectMax = document.getElementById("select-qt-max");

  //imposta il valore minimo selezionato (se non presente usa il primo)

  TagSelectMin.value = STATO_FILTRI.qt.minSelezionato;
  TagSelectMax.value = STATO_FILTRI.qt.maxSelezionato;
}
export function gestisciFiltroQuotazioneMinEMax(event) {
  console.log("function gestisciFiltroQuotazioneMinEMax(event)");
  //capiamo se il change proviene dal select min o max

  const TAG = event.target;
  const TAGMAX = document.getElementById("select-qt-max");
  const TAGMIN = document.getElementById("select-qt-min");

  if (TAG.id == "select-qt-max" || TAG.id == "select-qt-min") {
    if (TAG.id == "select-qt-max") {
      //se è stato cambiato il val max
      TAGMAX.value = STATO_FILTRI.qt.maxSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (STATO_FILTRI.qt.maxSelezionato != STATO_FILTRI.qt.max) {
      } else {
      }
    } //se è stato cambiato il val min
    else {
      TAGMIN.value = STATO_FILTRI.qt.minSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (STATO_FILTRI.qt.minSelezionato != STATO_FILTRI.qt.min) {
      } else {
      }
    }

    if (
      STATO_FILTRI.qt.minSelezionato > STATO_FILTRI.qt.maxSelezionato ||
      STATO_FILTRI.qt.maxSelezionato < STATO_FILTRI.qt.minSelezionato
    ) {
      TAGMAX.value = STATO_FILTRI.qt.maxSelezionato = STATO_FILTRI.qt.max;
    }
  }
}

export function creaFiltroRicercaGiocatore() {
  console.log("function creaFiltroRicercaGiocatore()");
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
  <section class="box-filtro">
          <input type="search" id="input-ricerca-giocatore" placeholder="Cerca Giocatore" />
          <label>Ricerca Giocatore</label>
        </section>`,
  );
}

export function creaFiltroRuolo() {
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `  
    <section class="box-filtro" id="filtro-ruolo">
    <label>Ruolo</label>
      <div data-tipo-ruolo="P" class="ruolo ${STATO_FILTRI.ruolo.includes("P") ? "selected" : ""}">P</div>
      <div data-tipo-ruolo="D" class="ruolo ${STATO_FILTRI.ruolo.includes("D") ? "selected" : ""}">D</div>
      <div data-tipo-ruolo="C" class="ruolo ${STATO_FILTRI.ruolo.includes("C") ? "selected" : ""}">C</div>
      <div data-tipo-ruolo="A" class="ruolo ${STATO_FILTRI.ruolo.includes("A") ? "selected" : ""}">A</div>
    </section>
  `,
  );
}
export function gestisciFiltroRuolo(evento) {
  const elemento_cliccato = evento.target;

  if (elemento_cliccato.dataset.tipoRuolo != undefined) {
    const ruolo_cliccato = elemento_cliccato.dataset.tipoRuolo; //ci memorizziamo il ruolo

    if (STATO_FILTRI.ruolo.includes(ruolo_cliccato)) {
      //se il ruolo è già incluso nel filtro lo rimuoviamo
      const indice = STATO_FILTRI.ruolo.indexOf(ruolo_cliccato);
      STATO_FILTRI.ruolo.splice(indice, 1);
    } else {
      STATO_FILTRI.ruolo.push(ruolo_cliccato);
    } // se filtroruolo è true fallo diventare false, altrimenti essendo falso lo fai diventare true

    if (
      elemento_cliccato.classList.contains("selected")
    ) // se l'elemento cliccato ha già la classe selected la rimuovi altrimenti la inserisci
    {
      elemento_cliccato.classList.remove("selected");
    } else {
      elemento_cliccato.classList.add("selected");
    }
  }
}

export function creaFiltroFuoriLista() {
  console.log("function creaFiltroFuoriLista()");
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
        <section class="box-filtro" id="container-filtro-fuoriLista"> 
          <label>Fuori Lista</label>
          <input type="radio" name="carica-FuoriLista" value="si"  ${
            STATO_FILTRI.caricaFuoriLista ? "checked" : ""
          }> si
          <input type="radio" name="carica-FuoriLista" value="no"  ${
            STATO_FILTRI.caricaFuoriLista ? "" : "checked"
          }> no 
        </section>
        `,
  );
  // filtro fuori lista aggiunto senza ricreare il contenuto esistente
}

export function gestisciFiltroFuoriLista(evento) {
  console.log("function gestisciFiltroFuoriLista(evento)");
  //capiamo da dove viene il click e gestiamo solo se proviene da un elemento proveniente dal radiobutton con nome carica-FuoriLista

  if (evento.target.name == "carica-FuoriLista") {
    // se e si controlliamo il valore se e si o se e no, e ne cambiamo lo stato
    if (evento.target.value == "si") {
      STATO_FILTRI.caricaFuoriLista = true;
    } else {
      STATO_FILTRI.caricaFuoriLista = false;
    }
  }
}

export function azzeraFiltri() {
  console.log("function azzeraFiltri()");
  STATO_FILTRI.ruolo = []; //azzero i filtri selezionati
  STATO_FILTRI.qt.maxSelezionato = STATO_FILTRI.qt.max;
  STATO_FILTRI.qt.minSelezionato = STATO_FILTRI.qt.min;
  STATO_FILTRI.caricaFuoriLista = false;
  STATO_FILTRI.lega = [];
  STATO_FILTRI.squadraSA = [];
  STATO_FILTRI.presenze.minSelezionato = 0;
  containerFiltri.innerHTML = "";
}

export function creaFiltriPaginaGiocatoriSeMancante(player) {
  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroRicercaGiocatore();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam(player);
    creaFiltroPresenzeMinime();
    creaFiltroFuoriLista();
  }
}

export function inizializzaFiltri(player) {
  //inizializzazione filtro quotazione min e max

  player.forEach((playerCorrente) => {
    const quotazione = playerCorrente.getQuotazione; //quotazione del giocatore corrente
    const presenze = playerCorrente.getPresenze; //presenze del giocatore corrente

    if (quotazione > STATO_FILTRI.qt.max) {
      STATO_FILTRI.qt.max = quotazione;
    }
    if (STATO_FILTRI.presenze.max < presenze) {
      STATO_FILTRI.presenze.max = presenze; //presenze massime del giocatore
    }
  });

  STATO_FILTRI.qt.maxSelezionato = STATO_FILTRI.qt.max;
}

function checkQuotazione(quotazione = 0) {
  console.log("function checkQuotazione(quotazione = 0)");
  if (
    quotazione >= STATO_FILTRI.qt.minSelezionato &&
    quotazione <= STATO_FILTRI.qt.maxSelezionato
  ) {
    return true;
  } else {
    return false;
  }
}

function ruoliFiltrati() {
  if (STATO_FILTRI.ruolo.length == 0) {
    return ["P", "D", "C", "A"];
  }
  return STATO_FILTRI.ruolo;
}
