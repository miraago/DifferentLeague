//funzione che trasforma ogni prima lettera in maiuscolo
export function toCapitalize(stringa) {
  if (typeof stringa !== "string") {
    return -1;
  }

  const caratteri_dopo_maiuscola = [" ", "-", "'", "_"];
  if (stringa) {
    //controllo se esiste
    stringa = stringa.trim(); // togliamo gli spazi iniziali e finali
    stringa = stringa.toLowerCase(); //trasformiamo tutto in minuscolo
    stringa = stringa.charAt(0).toUpperCase() + stringa.slice(1); //trasformiamo solo la prima lettera in maiuscolo

    if (stringa.length > 0) {
      for (
        let i = 0;
        i < stringa.length;
        i++ // controlliamo se la stringa è formata da più parole
      ) {
        //se nella stringa c'è uno spazio andiamo a controllare che il successivo non lo sia e lo trasformiamo in maiuscolo
        if (caratteri_dopo_maiuscola.includes(stringa[i])) {
          if (stringa[i + 1] != " " && stringa[i + 2] != null) {
            stringa =
              stringa.substr(0, i + 1) +
              stringa.charAt(i + 1).toUpperCase() +
              stringa.slice(i + 2);
          }
        }
      }
      return stringa; // ritorniamo la stringa trasformata
    }
  }
  return "";
}
