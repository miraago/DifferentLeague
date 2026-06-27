const nav = document.getElementById("navbar");

export function inizializzaNavbar() {
  nav.addEventListener("click", gestisciClickNavbar);
}

function gestisciClickNavbar(event) {
  if (event.target.closest("#icona-menu")) {
    //se è stato cliccato sull'immagine del menu siamo dentri
    const iconaMenu = document.getElementById("icona-menu");

    console.log("gestione click navbar :");
    if (nav.classList.contains("chiuso")) {
      nav.classList.remove("chiuso");
      iconaMenu.src = "./Assets/image/menu/freccia_sx.png";
    } else {
      nav.classList.add("chiuso");
      iconaMenu.src = "./Assets/image/menu/freccia_dx.png";
    }
  }
}
