import { player } from "./script.js";
import { IMPOSTAZIONI } from "./impostazioni.js";
let modalStatistiche = null;

export function gestisciClickNomeGiocatore(e) {
  const trCliccata = e.target.closest("tr");
  // Se non c'è una riga (tr) OPPURE se la riga non ha l'attributo data-nome, interrompi.
  if (!trCliccata || !trCliccata.dataset.nome) return;

  popupStatisticheGiocatore(nomeToGiocatore(trCliccata.dataset.nome));

  //logica per chiamare la card del giocatore
}

function popupStatisticheGiocatore(giocatore) {
  if (!giocatore) return; //controllo sicurezza

  // 1. Controlliamo se il popup esiste già nel documento
  modalStatistiche = document.getElementById("modal-statistiche");
  let popupStatistiche = document.getElementById("popup-statistiche");
  if (!modalStatistiche) // se non esiste lo creiamo
  {
    modalStatistiche = document.createElement("div");
    modalStatistiche.id = "modal-statistiche";
    document.querySelector("body").append(modalStatistiche);
    modalStatistiche.addEventListener("click", gestisciClickAnnulla);
    modalStatistiche.addEventListener("keydown", gestisciClickAnnulla);
    modalStatistiche.setAttribute("tabindex", "-1");
    modalStatistiche.focus();

    //adesso creiamo il popup vero è proprio
    popupStatistiche = document.createElement("div");
    popupStatistiche.id = "popup-statistiche";
    modalStatistiche.append(popupStatistiche);
  } else {
    //se esiste lo rendiamo visibile
    modalStatistiche.style.display = "flex";
  }

  //ci ricaviamo i possessi che andremo a mettere in una tabella
  let righeTabella = "";
  let tabella = "";

  const contaPossessi = giocatore.getPossessi.length;
  if (contaPossessi > 0) {
    giocatore.getPossessi.forEach((possessoCorrente) => {
      righeTabella += `<tr>
                        <td> ${possessoCorrente.getNomeRosa}</td> 
                        <td> ${possessoCorrente.getCampionatoDiAppartenenza}</td>
                        <td> ${possessoCorrente.giocatoreToCosto(giocatore)}</td>  
                        
                      </tr>`;
    });

    //costruiamo la tabella
    tabella = `<table>
                  <caption> Squadre che posseggono ${giocatore.getNome}</caption>
                  <thead>
                    <th>Squadra</th>
                    <th>Campionato</th>
                    <th>Costo</th>
                  </thead>
                  <tbody>
                    ${righeTabella}
                  </tbody>
                </table>`;
  } else {
    // se i possessi sono 0 avvisiamo che non è posseduto
    tabella = ` Nessuna squadra possiede ${giocatore.getNome}`;
  }

  popupStatistiche.innerHTML = `
  <div class="x"> X </div>
    <div>
      
      <div class="container-info-giocatore">
        <div class="campo-nome">${giocatore.getNome}</div>
        <div>
          <div class="campo-ruolo">
          <span class="${giocatore.getRuolo}">${giocatore.getRuolo}</span></div>
        
          <div class="campo-squadra">
          <img src="Assets/image/loghi_team_serie_A/${giocatore.getSquadraDiAppartenenza.toLowerCase()}.png"  title="${giocatore.getSquadraDiAppartenenza}"/> ${giocatore.getSquadraDiAppartenenza}</div>
      
        </div>
      </div>

    <div class="container-statistiche-giocatore">
    
      <div class="campo">
         <div class="valore">${giocatore.getQuotazione}</div>
         <div class="etichetta">Quotazione</div>          
      </div>

      <div class="campo">
         <div class="valore">${giocatore.getPresenze}</div>
         <div class="etichetta">Presenze</div>          
      </div>

      <div class="campo">
         <div class="valore">${giocatore.getRuolo != "P" ? giocatore.getGoalTotali : giocatore.getGoalSubitiTotali}</div>
         <div class="etichetta">${giocatore.getRuolo != "P" ? "Goal" : "Goal Subiti"}</div>          
      </div>

      <div class="campo">
         <div class="valore">${giocatore.getRuolo != "P" ? giocatore.getAssistTotali : giocatore.getRigoriParatiTotali}</div>
         <div class="etichetta">${giocatore.getRuolo != "P" ? "Assist" : "Rigori Parati"}</div>          
      </div>
    </div>


    <div class="container-statistiche-giocatore">
      <div class="campo">
        <div class="valore">${giocatore.getMv}</div>
        <div class="etichetta">Media Voto</div>
      </div>
      <div class="campo">
        <div class="valore">${giocatore.getFvm}</div>
        <div class="etichetta">Fanta Media Voto</div>
      </div>
    </div>
      
      
      <hr></hr>
      <div class="container-statistiche-giocatore">
      <div class="campo">
        <div class="valore">${giocatore.getPresenzeUltime5}</div>
        <div class="etichetta">Presenze ultime 5</div>
      </div>
      
      <div class="campo">
        <div class="valore">${giocatore.getMvUltime5}</div>
        <div class="etichetta">MV ultime 5</div>
      </div>
      <div class="campo">
        <div class="valore">${giocatore.getFvmUltime5}</div>
        <div class="etichetta">FMV ultime 5</div>
      </div>
      <div class="campo">
        <div class="valore">${giocatore.getSommaBonusMalusUltime5}</div>
        <div class="etichetta">B/M ultime 5</div>
      </div>
      </div>
    </div>

    <hr></hr>

      ${creaTabellaStatistiche(giocatore)}
      <hr></hr>
      ${tabella}
    </div>`;
}

function gestisciClickAnnulla(e) {
  console.log(e);
  if (!e.target.closest(".x") && e.key != "Escape") return; //controllo sicurezza

  const popupStatistiche = document.getElementById("popup-statistiche");
  if (!popupStatistiche) return;

  popupStatistiche.innerHTML = ""; //pulisco il box
  popupStatistiche.parentNode.style.display = "none"; //nascondo il modal
}

function creaTabellaStatistiche(giocatore) {
  if (!giocatore) return; //controllo sicurezza
  //costruzione tabella con le statistiche del giocatore

  //TH TABELLA STATISTICHE
  const thTabellaStatistiche = `<tr>
  <th title="Giornata di riferimento">GG</th>
  <th title="Incontro">P</th>
  <th title="Voto Base">Vt</th>
  <th title="Minuti Giocati">M.G.</th>
  <th title="Entrato al minuto">E.</th>
  <th title="Sostituito al minuto">S.</th>  
  <th title="Bonus Malus">B/M</th> 
  <th title="Ammonizione o Espulsione">A/E</th>
  </tr>`;

  //RIGHE TABELLA STATISTICHE

  let righeTabellaStatistiche = "";
  giocatore.getStatisticheDiGiornata.forEach((statisticaCorrente) => {
    let giornata = statisticaCorrente.getGiornata;

    //partita
    /* "partita esempio ": "Milan - Genoa", */
    let partita = statisticaCorrente.getPartita;
    let squadraCasa = partita.split(" - ")[0];
    let squadraOspite = partita.split(" - ")[1];
    squadraCasa = squadraCasa.trim();
    squadraOspite = squadraOspite.trim();
    squadraCasa = `<img src='Assets/image/loghi_team_serie_A/${squadraCasa.toLowerCase()}.png' class='icona-statistiche' title='${squadraCasa}'/>`;
    squadraOspite = `<img src='Assets/image/loghi_team_serie_A/${squadraOspite.toLowerCase()}.png' class='icona-statistiche' title='${squadraOspite}'/>`;
    partita = squadraCasa + " - " + squadraOspite;

    let minuti =
      statisticaCorrente.getMinutiGiocati != 0
        ? statisticaCorrente.getMinutiGiocati + "'"
        : " ";
    let entrato =
      statisticaCorrente.getEntrato != 0
        ? statisticaCorrente.getEntrato + "'"
        : " ";
    let sostituito =
      statisticaCorrente.getSostituito != 0
        ? statisticaCorrente.getSostituito + "'"
        : " ";
    let voto =
      statisticaCorrente.getVotoFC_L != 0
        ? statisticaCorrente.getVotoFC_L
        : " ";

    //ASSIST
    let assist =
      statisticaCorrente.getAssistLI != 0
        ? statisticaCorrente.getAssistLI
        : " ";
    if (assist != " ") {
      let tempAssist = "";
      for (let i = 0; i < assist; i++) {
        tempAssist += `<img src='Assets/image/imageStatistiche/assist.png' class='icona-statistiche' title='Assist'/>`;
      }
      assist = tempAssist;
    }

    //GOAL
    let goal =
      statisticaCorrente.getGoal != 0 ? statisticaCorrente.getGoal : " ";
    if (goal != " ") {
      let tempGoal = "";
      for (let i = 0; i < goal; i++) {
        tempGoal += `<img src='Assets/image/imageStatistiche/golFatto.png' class='icona-statistiche' title='Goal ${IMPOSTAZIONI.BONUSMALUS.GOAL}'/>`;
      }
      goal = tempGoal;
    }
    //GOAL SUBITI
    let goalSubiti =
      statisticaCorrente.getGoalSubiti != 0
        ? statisticaCorrente.getGoalSubiti
        : " ";
    if (goalSubiti != " ") {
      let tempGoalSubiti = "";
      for (let i = 0; i < goalSubiti; i++) {
        tempGoalSubiti +=
          "<img src='Assets/image/imageStatistiche/golSubito.png' class='icona-statistiche' title='Goal subito'/>";
      }
      goalSubiti = tempGoalSubiti;
    }

    //RIGORE SEGNATO
    let rigoreSegnato =
      statisticaCorrente.getRigoreSegnato != 0
        ? statisticaCorrente.getRigoreSegnato
        : " ";
    if (rigoreSegnato != " ") {
      let tempRigoreSegnato = "";
      for (let i = 0; i < rigoreSegnato; i++) {
        tempRigoreSegnato +=
          "<img src='Assets/image/imageStatistiche/rigoreSegnato.png' class='icona-statistiche' title='Rigore segnato'/>";
      }
      rigoreSegnato = tempRigoreSegnato;
    }

    //RIGORE SBAGLIATO
    let rigoreSbagliato =
      statisticaCorrente.getRigoreSbagliato != 0
        ? statisticaCorrente.getRigoreSbagliato
        : " ";
    if (rigoreSbagliato != " ") {
      let tempRigoreSbagliato = "";
      for (let i = 0; i < rigoreSbagliato; i++) {
        tempRigoreSbagliato +=
          "<img src='Assets/image/imageStatistiche/rigoreSbagliato.png' class='icona-statistiche' title='Rigore sbagliato'/>";
      }
      rigoreSbagliato = tempRigoreSbagliato;
    }

    //RIGORE PARATO
    let rigoreParato =
      statisticaCorrente.getRigoreParato != 0
        ? statisticaCorrente.getRigoreParato
        : " ";
    if (rigoreParato != " ") {
      let tempRigoreParato = "";
      for (let i = 0; i < rigoreParato; i++) {
        tempRigoreParato +=
          "<img src='Assets/image/imageStatistiche/rigoreParato.png' class='icona-statistiche' title='Rigore parato'/>";
      }
      rigoreParato = tempRigoreParato;
    }

    //AUTORETE
    let autorete =
      statisticaCorrente.getAutorete != 0
        ? statisticaCorrente.getAutorete
        : " ";
    if (autorete != " ") {
      let tempAutorete = "";
      for (let i = 0; i < autorete; i++) {
        tempAutorete +=
          "<img src='Assets/image/imageStatistiche/autorete.png' class='icona-statistiche' title='Autorete'/>";
      }
      autorete = tempAutorete;
    }

    //AMMONIZIONE
    let ammonizione =
      statisticaCorrente.getAmmonizione != 0
        ? statisticaCorrente.getAmmonizione
        : " ";
    if (ammonizione != " ") {
      let tempAmmonizione = "";
      for (let i = 0; i < ammonizione; i++) {
        tempAmmonizione +=
          "<img src='Assets/image/imageStatistiche/ammonito.png' class='icona-statistiche' title='Ammonizione'/>";
      }
      ammonizione = tempAmmonizione;
    }

    //ESPULSIONE
    let espulsione =
      statisticaCorrente.getEspulsione != 0
        ? statisticaCorrente.getEspulsione
        : " ";
    if (espulsione != " ") {
      let tempEspulsione = "";
      for (let i = 0; i < espulsione; i++) {
        tempEspulsione +=
          "<img src='Assets/image/imageStatistiche/espulso.png' class='icona-statistiche' title='Espulsione'/>";
      }
      espulsione = tempEspulsione;
    }

    //IMBATTUTA
    let imbattuta = statisticaCorrente.getIbattuta;
    if (imbattuta) {
      imbattuta =
        "<img src='Assets/image/imageStatistiche/portiereImbattuto.png' class='icona-statistiche' title='Imbattuto'/>";
    } else {
      imbattuta = "";
    }

    //GOAL DECISIVO VITTORIA
    let goalDecisivoVittoria =
      statisticaCorrente.getGoalDecisivoVittoria != 0
        ? statisticaCorrente.getGoalDecisivoVittoria
        : " ";
    if (goalDecisivoVittoria != " ") {
      let tempGoalDecisivoVittoria = "";
      for (let i = 0; i < goalDecisivoVittoria; i++) {
        tempGoalDecisivoVittoria +=
          "<img src='Assets/image/imageStatistiche/goalDecisivoVittoria.png' class='icona-statistiche' title='Goal decisivo vittoria'/>";
      }
      goalDecisivoVittoria = tempGoalDecisivoVittoria;
    }

    righeTabellaStatistiche += `<tr>
                        <td> ${giornata}</td> 
                        <td> ${partita}</td>
                        <td> ${voto}</td>
                        <td> ${minuti}</td> 
                        <td> ${entrato}</td>
                        <td> ${sostituito}</td>                      
                        <td> ${autorete}${goalSubiti}${rigoreParato}${imbattuta}${goal}${assist}${rigoreSegnato}${rigoreSbagliato}${goalDecisivoVittoria}</td> 
                        <td> ${ammonizione}${espulsione}</td>                                                     
                      </tr>`;
  });

  const tabellaStatistiche = `<div>  
    <table>
      <caption> Statistiche ${giocatore.getNome} </caption>
      <thead>
        ${thTabellaStatistiche}
      </thead>
      <tbody>
        ${righeTabellaStatistiche}
      </tbody>
    </table>      
  </div>`;

  return tabellaStatistiche;
}

/**
 * passando una stringa con il nome del giocatore restituisce il riferimento al giocatore
 * @param {string} nomeGiocatore
 * @returns {Giocatore} ritorna il giocatore di riferimento
 */
function nomeToGiocatore(nomeGiocatore) {
  if (!nomeGiocatore) return;
  nomeGiocatore = nomeGiocatore.toUpperCase(); //trasformiamo il nome in maiuscolo
  const giocatoreTrovato = player.find((giocatoreCorrente) => {
    return giocatoreCorrente.getNome == nomeGiocatore;
  });
  if (!giocatoreTrovato) {
    return;
  }

  return giocatoreTrovato;
}
