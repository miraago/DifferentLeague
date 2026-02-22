// source/js/caricamentoDati.js
import { Giocatore, Rosa, RecordAcquisto } from "./ccc.js";
import { IMPOSTAZIONI } from "./impostazioni.js";

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
  console.log("Modulo Dati: caricaGiocatori");
  const response = await fetch("Assets/file/quotazioni_gg26.txt");
  if (!response.ok) throw new Error("Errore network");

  const datiGiocatori = (await response.text())
    .replaceAll("\t", "|")
    .toUpperCase();

  let player = [];
  let recordInvalidi = 0;

  let arrayGiocatori = datiGiocatori.split("\n");

  for (let i = 1; i < arrayGiocatori.length; i++) {
    let temp = arrayGiocatori[i].split("|");

    if (temp.length > 1) {
      if (temp.length < 14) {
        recordInvalidi++;
        continue;
      }

      player.push(
        new Giocatore(
          temp[0],
          temp[1],
          temp[2],
          temp[3],
          temp[4],
          temp[5],
          temp[6],
          temp[7],
          temp[8],
          temp[9],
          temp[10],
          temp[11],
          temp[12],
          temp[13],
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

      acquisti.push(record); // <--- MANCAVA! Aggiungiamo il record all'array

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
