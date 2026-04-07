// source/js/caricamentoDati.js
import {
  Giocatore,
  Rosa,
  RecordAcquisto,
  StatisticaDiGiornata,
} from "./classiFanta.js";
import { IMPOSTAZIONI } from "./impostazioni.js";
import { player } from "./script.js";

export async function caricaTuttiIDati() {
  try {
    // 1. Carica Presidenti e DatiGiocatori (che ora contiene lista + massimali)
    const [listaPresidenti, datiGiocatori] = await Promise.all([
      caricaPresidenti(),
      caricaGiocatori(),
    ]);

    // 2. Carica gli acquisti passando gli array
    // NOTA: Passiamo datiGiocatori.lista perché ora è un oggetto!
    const listaAcquisti = await caricaAcquisti(
      listaPresidenti,
      datiGiocatori.lista,
    );
    datiGiocatori.lista = await personalizzaRuoliGiocatori(datiGiocatori.lista); //modifica i ruoli personalizzati dei giocatori, se presenti, altrimenti lascia quelli originali

    //carichiamo i voti
    await caricaVoti(datiGiocatori.lista);

    // 3. Impacchetta tutto in un grande oggetto e spediscilo a script.js
    return {
      presidenti: listaPresidenti,
      giocatori: datiGiocatori.lista,
      acquisti: listaAcquisti,
    };
  } catch (errore) {
    console.error("Errore fatale nel caricamento dati:", errore);
    throw errore;
  }
}

// ---------------- FUNZIONI PRIVATE ----------------

async function caricaPresidenti() {
  console.log("Modulo Dati: caricaPresidenti");
  const response = await fetch("Assets/file/presidenti.txt");
  if (!response.ok) throw new Error("Errore network");

  const datiPresidenti = (await response.text())
    .replaceAll("\t", "|")
    .toUpperCase();
  let presidenti = [];
  let arrayPresidenti = datiPresidenti.split("\n");

  for (let i = 0; i < arrayPresidenti.length; i++) {
    let temp = arrayPresidenti[i].split("|");
    if (temp.length > 1) {
      presidenti.push(new Rosa(temp[0], temp[1], temp[2], temp[3]));
    }
  }
  return presidenti;
}

async function caricaGiocatori() {
  //caricahiamo i dati della giornata attuale
  const response = await fetch(
    `Assets/file/quotazioni/quotazioni_gg${IMPOSTAZIONI.GIORNATAATTUALE.giornata}.txt`,
  );
  if (!response.ok) throw new Error("Errore Caricamento Quotazioni"); //in caso di errore

  const datiGiocatori = (await response.text())
    .replaceAll("\t", "|") //rimpiazziamo i tab con pipe per facilitare lo split
    .toUpperCase(); //rimpiazziamo tutto con maiuscolo per uniformare i dati e facilitare le ricerche

  let player = []; //array vuoto che andremo a riempire con i giocatori validi
  let recordInvalidi = 0;

  let arrayGiocatori = datiGiocatori.split("\n"); //creiamo un array di stringhe, ogni stringa è una riga del file txt

  for (let i = 1; i < arrayGiocatori.length; i++) {
    let temp = arrayGiocatori[i].split("|");

    if (temp.length > 1) {
      if (temp.length < 14) {
        recordInvalidi++;
        continue;
      }

      player.push(
        new Giocatore(
          temp[0], //ID
          temp[1], //Giocatore
          temp[2], //Squadra
          temp[3], //Ruolo
          temp[4], //Ruolo Mod. Av.
          temp[5], //Fuori lista
          temp[6], //Quotazione
          temp[9], //Media recente
          temp[11], //Media recente pagella
          temp[13], //Somma bonus malus ultime 5
        ),
      );
    }
  }

  // Restituiamo la lista
  return {
    lista: player,
  };
}

async function caricaAcquisti(presidenti, player) {
  console.log("Modulo Dati: caricaAcquisti");
  const response = await fetch("Assets/file/file_rose.txt");
  if (!response.ok) throw new Error("Errore network");

  let datiRose = (await response.text()).toUpperCase().replaceAll("\t", "|");

  let acquisti = []; // <--- MANCAVA! Creiamo l'array vuoto
  let arrayRose = datiRose.split("\n").filter((line) => line.trim());

  for (let i = 0; i < arrayRose.length; i++) {
    let temp = arrayRose[i].split("|");
    let tempNomeSquadra = temp[0];
    let tempNomeGiocatore = temp[1];
    let tempPrezzoAcquisto = temp[7];

    const giocatoreTrovato = player.find((p) => p.getNome == tempNomeGiocatore);

    if (giocatoreTrovato) {
      const record = new RecordAcquisto(
        giocatoreTrovato,
        11,
        "",
        tempPrezzoAcquisto,
      );

      acquisti.push(record); // <---  Aggiungiamo il record all'array

      const presidenteTrovato = presidenti.find(
        (p) => p.getNomeRosa == tempNomeSquadra,
      );

      if (presidenteTrovato) {
        presidenteTrovato.addRecordAcquisto(record);
        giocatoreTrovato.aggiungiPossessi(presidenteTrovato);
      }
    }
  }

  return acquisti; // <--- MANCAVA! Restituiamo l'array riempito
}

async function caricaVoti(player) {
  console.log("Modulo Dati: caricaVoti");
  //carichiamo i dati .json della giornata 1
  for (
    let giornata = 1;
    giornata < IMPOSTAZIONI.GIORNATAATTUALE.giornata;
    giornata++
  ) {
    let response = await fetch(`Assets/file/voti/giornata_${giornata}.json`);
    if (!response.ok) {
      throw new Error(
        `Errore network - non siamo riusciti a caricare i voti della giornata ${giornata}`,
      );
    }

    const datiVoti = await response.json();
    //scorriamo le statistiche di giornata
    datiVoti.forEach((dt) => {
      //statistca corrente
      const statistica = new StatisticaDiGiornata(
        dt.nome,
        giornata,
        dt.partita,
        dt.votoFCL,
        dt.votoFCC,
        dt.votoMI,
        dt.votoRO,
        dt.assistLI,
        dt.assistFC,
        dt.assistMI,
        dt.assistFE,
        dt.minuti_giocati,
        dt.entrato,
        dt.sostituito,
        dt.goal,
        dt.goal_subiti,
        dt.rigore_segnato,
        dt.rigore_sbagliato,
        dt.rigore_parato,
        dt.autorete,
        dt.ammonizione,
        dt.espulsione,
        dt.imbattuta,
        dt.goaldecisivovittoria,
      );

      //troviamo tra i giocatori a chi appartiene la statistica
      const trovaGiocatore = player.find((p) => {
        return p.getNome == statistica.getNomeGiocatore;
      });

      if (trovaGiocatore) {
        trovaGiocatore.addStatisticheDiGiornata(statistica);
      }
    });
  }
}

async function personalizzaRuoliGiocatori(listaGiocatoriOriginale) {
  try {
    const response = await fetch(
      "Assets/file/quotazioni/personalizzazioneRuoli.txt",
    );

    // 1. Se il file non esiste (è opzionale!), non blocchiamo il caricamento
    if (!response.ok) {
      console.log(
        "Nessun file personalizzazioneRuoli.txt trovato. Uso i dati standard.",
      );
      return listaGiocatoriOriginale;
    }

    const testoFile = (await response.text())
      .replaceAll("\t", "|")
      .toUpperCase();
    let righe = testoFile.split("\n");

    // 2. Scorriamo le righe del file testuale
    for (let i = 0; i < righe.length; i++) {
      let temp = righe[i].split("|");

      // Verifichiamo che la riga abbia almeno le colonne necessarie
      if (temp.length >= 7) {
        const nomeCustom = temp[1].trim();
        const ruoloCustom = temp[3].trim();
        const quotazioneCustom = temp[6].trim();

        // 3. Cerchiamo il giocatore nella lista PRINCIPALE
        const giocatoreDaModificare = listaGiocatoriOriginale.find(
          (g) => g.getNome === nomeCustom,
        );

        // 4. Se esiste, gli sovrascriviamo il ruolo e la quotazione!
        if (giocatoreDaModificare) {
          giocatoreDaModificare.setRuolo = ruoloCustom;
          giocatoreDaModificare.setQuotazione = quotazioneCustom;
        }
      }
    }

    console.log("Ruoli e quotazioni personalizzate applicate con successo!");
    return listaGiocatoriOriginale;
  } catch (error) {
    console.error("Errore durante la personalizzazione: ", error);
    // In caso di errore strano, restituiamo comunque la lista originale intatta
    return listaGiocatoriOriginale;
  }
}
