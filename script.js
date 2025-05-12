let BOARD_SIZE = 20 //Pelikentän koko
const cellSize = calculateCellSize(); // Lasketaan ruudun koko responsiivisesti
let board; //Kenttä tallennetaan tähän
let player; //muuttuja pelaajalle
let ghosts = []; // Lista, johon tallennetaan kaikki ghost-oliot
let isGameRunning = false; // Muuttuja kertoo, onko peli käynnissä vai ei
let ghostInterval; // Muuttujaan tallennetaan haamujen liikkeen aikaväli
let ghostSpeed = 1000; // Aloitusnopeus haamuille (millisekunteina)
let score = 0; //Pistelaskuri


// Haetaan nappi ja lisätään tapahtumankuuntelija
document.getElementById('new-game-btn').addEventListener('click', startGame);


function updateScoreBoard(points){


    // Haetaan HTML-elementti, johon pisteet näytetään
    const scoreBoard = document.getElementById('score-board');


    // Lisätään saatu pistemäärä (points) olemassa oleviin pisteisiin
    score = score + points;


    // Näytetään päivitetty pistemäärä ruudulla muodossa "Pisteet: 150"
    scoreBoard.textContent = `Pisteet: ${score}`;
}


// Tapahtumankuuntelija, joka reagoi näppäimistön painalluksiin
document.addEventListener('keydown', (event) => {
    // Katsdtaan onko peli päällä
    if (isGameRunning) {


        switch (event.key){


            // Tarkistetaan, mikä näppäin on painettu
            case 'ArrowUp':
                player.move(0, -1); // Liikuta pelaajaa yksi askel ylöspäin
                break;


            case 'ArrowDown':
                player.move(0, 1); //Liikuta pelaajaa yksi askel alaspäin
                break;


            case 'ArrowLeft':
                player.move(-1, 0); //Liikuta pelaajaa yksi askel vasemmalle
                break;


            case 'ArrowRight':
                player.move(1, 0); // Liikuta pelaajaa yksi askel oikealle
                break;


            case 'w':
                shootAt(player.x, player.y -1); // Ammutaan ylöspäin
                break;
           
            case 's':
                shootAt(player.x, player.y + 1); // Ammutaan alaspain
                break;


            case 'a':
                shootAt(player.x - 1, player.y); // Ammutaan vasemmalle
                break;


            case 'd':
                shootAt(player.x + 1, player.y); // Ammutaan oikealle


        }
    }    
    event.preventDefault(); // Estetään selaimen oletustoiminnot, kuten sivun vieritys
});


// Asettaa tietyn arvon esim 'P' pelaajalle tiettyyn ruutuun pelikentällä
function setCell(board, x, y, value) {
    board[y][x] = value; // Muutetaan pelikentän (board) koordinaatin (x, y) arvoksi 'value'
}
//Luodaan apufunktio joka hakee tietyn ruudun sisällön pelilaudasta
function getCell(board, x, y) {
    return board[y][x]; //Palautetaan koordinaattien (x, y) kohdalla oleva arvo
}


function calculateCellSize(){
    // Selvitetään selainikkunan leveys ja korkeus ja valitaan näistä pienempi arvo
    const screenSize = Math.min(window.innerWidth, window.innerHeight);


    // Lasketaan pelilaudan koko että jää hieman reunatilaa
    const gameBoardSize = 0.95 * screenSize;
    // Lasketaan yksittäisen ruudun koko jakamalla pelilaudan koko ruutujen määrällä
    return gameBoardSize / BOARD_SIZE;
}


function startGame(){
    // Piilotetaan intro-näkymä ja näytetään pelialue
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';


    // Merkitään peli käynnissä olevaksi
    isGameRunning = true;


    //Luo uuden pelaajan ja sijoittaa sen koordinaatteihin (0,0)
    player = new Player(0, 0);


    board = generateRandomBoard(); //Luo pelikenttä ja piirrä se




    setTimeout(() => {
        ghostInterval = setInterval(moveGhosts, ghostSpeed);
    }, 1000);


    // Nollataan pisteet uuden pelin alussa
    score = 0;
    // Päivitetään pistetaulu näkymään ruudulle
    updateScoreBoard(0);


    drawBoard(board); // Piirretään pelikenttä HTML:n


    console.log('Peli aloitettu');
}


function generateRandomBoard(){
    // Luodaan 2D-taulukko, joka täytetään tyhjillä soluilla (' ')
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(' '));


    // Käydään läpi pelikentän jokainen rivi
    for ( let y = 0; y < BOARD_SIZE; y++){
        // Käydään läpi jokainen sarake kyseisellä rivillä
        for (let x = 0; x < BOARD_SIZE; x++){
            // Tarkistetaan, onko solu pelikentän reunassa
            if (y === 0 || y === BOARD_SIZE - 1 || x === 0 || x === BOARD_SIZE - 1) {
                newBoard[y][x] = 'W'; // Jos solu on reunassa, merkitään se seinäksi ('W')
            }
        }
    }
    generateObstacles(newBoard);


    //Tyhjennetään ghost lista
    ghosts = [];


    for (let i = 0; i < 5; i++){ //Luodaan 5 haamua
        const [ghostX, ghostY] = randomEmptyPosition(newBoard); // Haetaan satunnainen tyhjä paikka kentältä
        setCell(newBoard, ghostX, ghostY, 'H'); // Asetetaan haamu 'H' pelikentän matriisiin
        ghosts.push(new Ghost(ghostX, ghostY)); // Luodaan uusi Ghost-olio ja lisätään se ghost-listaan
    }




    const [playerX, playerY] = randomEmptyPosition(newBoard); // haetaan satunnainen tyhjä paikka
    setCell(newBoard, playerX, playerY, 'P'); // Asetetaan pelaaja tähän kohtaan
    // Päivitetään pelaajan x- ja y-koordinaatit vastaamaan uutta sijaintia
    player.x = playerX;
    player.y = playerY;
       
    return newBoard;
}


//Tämä funktio piirtää pelikentän
function drawBoard(board) {
    //Haetaan HTML-elementti, johon pelikenttä lisätään
    const gameBoard = document.getElementById('game-board');
    // Tyhjennä olemassa oleva sisältö
    gameBoard.innerHTML = '';
    // Asetetaan sarakkeet ja rivit pelikentän koon mukaisesti
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;


    for (let y = 0; y < BOARD_SIZE; y++) { // Käydään läpi pelikentän rivit
        for (let x = 0; x < BOARD_SIZE; x++) { // Käydään läpi jokaisen rivin sarakkeet
            const cell = document.createElement('div'); // Luodaan uusi HTML-elementti (div), joka edustaa yhtä pelikentän ruutua
            cell.classList.add('cell'); // Lisätään ruudulle perusluokka "cell", joka muotoilee ruudun CSS:llä
            // Asetetaan ruudun leveys ja korkeus dynaamisesti laskettuun kokoon, lisätään yksikkö "px"
            cell.style.width = cellSize + "px"
            cell.style.height = cellSize + "px"


            if (getCell(board, x, y) === 'W') {
                cell.classList.add('wall');
            } else if (getCell(board, x, y) === 'P'){ // Pelaaja lisätään ruudukkoon
                cell.classList.add('player'); //'P pelaaja
            } else if (getCell(board, x, y) === 'H'){ //Jos ruudussa on 'H' eli haamu
                cell.classList.add('hornmonster'); // Lisätään haamun CSS-luokka, joka näyttää sen kuvana
            } else if (getCell(board, x, y) === 'B'){
                cell.classList.add('bullet'); //B on ammus
                setTimeout(() => {
                    setCell(board, x, y, ' ')
                }, 500); // Ammus katoaa 0.5 sekunnin jälkeen
            }
            gameBoard.appendChild(cell);
        }
    }
}


function generateObstacles(board){
 //Lista esteitä
    const obstacles = [
        [[0,0],[0,1],[1,0],[1,1]], // Square (neliö)
        [[0,0],[0,1],[0,2],[0,3]], // I-muoto (pysty- tai vaakasuora palkki)
        [[0,0],[1,0],[2,0],[1,1]], // T-muoto
        [[1,0],[2,0],[1,1],[0,2],[1,2]], // Z-muoto
        [[1,0],[2,0],[0,1],[1,1]], // S-muoto
        [[0,0],[1,0],[1,1],[1,2]], // L-muoto
        [[0,2],[0,1],[1,1],[2,1]]  // J-muoto (peilikuva L-muodosta)
    ];
    //Kovakoodatut aloituspaikat esteille pelikentällä
    const positions = [
        { startX: 2, startY: 2 },   // Este kentän vasemmassa yläkulmassa
        { startX: 8, startY: 2 },   // Este ylempänä keskellä
        { startX: 4, startY: 8 },   // Este vasemmalla keskialueella
        { startX: 3, startY: 16 },  // Este alareunan vasemmassa osassa
        { startX: 10, startY: 10 }, // Este keskellä kenttää
        { startX: 12, startY: 5 },  // Este yläkeskialueella
        { startX: 12, startY: 10 }, // Este keskialueella
        { startX: 16, startY: 10 }, // Este oikealla keskialueella
        { startX: 13, startY: 14 }  // Este alhaalla keskellä
    ];
     //Käydään läpi jokainen aloituspaikka ja lisätään sinne satunnainen este
     positions.forEach(pos => {
        // Valitaan satunnainen este obstacles-taulukosta
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];


        //Sijoitetaan valittu este kentälle kyseiseen kohtaan
        placeObstacle(board, randomObstacle, pos.startX, pos.startY);
     });


}


function placeObstacle(board, obstacle, startX, startY){
    // Käydään läpi jokainen esteen määrittelemä ruutu
    for (coordinatePair of obstacle) {
        [x, y] = coordinatePair; //Puretaan koordinaattipari x- ja y-muuttujiin


        // Sijoitetaan esteen ruutu pelikentälle suhteessa aloituspisteeseen
        board[startY + y][startX + x] = 'W';
    }
}
// Luo satunnaisen kokonaisluvun annettujen rajojen sisällä
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Etsii pelikentältä satunnaisen tyhjän ruudun ja palauttaa sen koordinaatit
function randomEmptyPosition(board) {
    x = randomInt(1, BOARD_SIZE - 2); //Satunnainen x-koordinaatti pelikentän sisäalueelta
    y = randomInt(1, BOARD_SIZE - 2); // Satunnainen y-koordinaatti pelikentän sisäalueella


    if (getCell(board, x, y) === ' '){
        return [x, y]; // Jos ruutu on tyhjä (' '), palautetaan se
    } else {
        //14.4 HUOM TÄHÄN return
        return randomEmptyPosition(board); // Jos ruutu ei ole tyhjä, haetaan uusi satunnainen paikka
    }
}


// Luodaan Player-luokka, joka hallitsee pelaajan sijaintia ja liikettä
class Player {
    constructor(x, y) {
        this.x = x; // Tallennetaan pelaajan aloituspaikan x-koordinaatti
        this.y = y; // Tallennetaan pelaajan aloituspaikan y-koordinaatti
    }


    // Funktio pelaajan liikuttamiseen
    move(deltaX, deltaY) {
        // Tallennetaan pelaajan nykyinen sijainti ennen liikettä
        const currentX = player.x;
        const currentY = player.y;


        // Lasketaan uusi sijainti lisäämällä delta-arvot nykyiseen sijaintiin
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        if (getCell(board,newX,newY) === ' '){
            // Päivitetään pelaajan uusi sijainti muuttujissa
            player.x = newX;
            player.y = newY;


            // Päivitetään pelikenttä
            board[currentY][currentX] = ' '; // Tyhjennetään vanha paikka pelikentällä
            board[newY][newX] = 'P'; // Asetetään uusi sijainti pelikentälle pelaajaksi ('P')
        }
        // Piirretään pelikenttä uudelleen, jotta pelaajan liike näkyy visuaalisesti
        drawBoard(board);
    }
}


// Kummitusten luokka
class Ghost {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    moveGhostTowardsPlayer(player, board, oldGhosts){ // Metodi joka liikuttaa haamua kohti pelaajaa
        let dx = player.x - this.x; // Lasketaan x-suuntainen etäisyys pelaajaan
        let dy = player.y - this.y; // Lasketaan y-suuntainen etäisyys pelaajaan


        let moves = []; // Lista mahdollisista siirroista


        if (Math.abs(dx) > Math.abs(dy)){
            if (dx > 0) moves.push({ x: this.x + 1, y: this.y}); // Siirto oikealle
            else moves.push({ x: this.x -1, y: this.y}); // Siirto vasemmalle
            if (dy > 0) moves.push({ x: this.x, y: this.y + 1}); // Siirto alaspäin
            else moves.push({ x: this.x, y: this.y - 1}); // Siirto ylöspäin
        } else {
            if (dy > 0) moves.push({ x: this.x, y: this.y + 1 }) // Siirto alaspäin
            else moves.push({ x: this.x, y: this.y - 1}); // Siirto ylös
            if (dx > 0) moves.push({ x: this.x + 1, y: this.y}); // Siirto oikealle
            else moves.push({ x: this.x -1, y: this.y}); // Siirto vasemmalle
        }


        // Käydään läpi kaikki mahdolliset liikkeet
        for (let move of moves) {
            // Jos uusi ruutu on tyhjä tai siellä on pelaaja ja sinne ei ole jo menossa toinen haamu
            if (
                (board[move.y][move.x] === ' ' || board[move.y][move.x] === 'P') &&
                !oldGhosts.some(h => h.x === move.x && h.y === move.y)
            ) {
                return move; // Palautetaan ensimmäinen sopiva liike
            }
        }
        // Jos mikään liike ei onnistu, pysytään paikallaan
        return { x: this.x, y: this.y };
    }
}


function shootAt(x, y) {


    // Tarkistetaan, osuuko ammus seinään ennen ampumista
    if (getCell(board, x, y) === 'W') {
        //Jos ruudussa on seinä ('W'), ei tehdä mitään
        return;
    }


    // Etsitään, onko haamu samassa ruudussa mihin ammutaan
    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y);


    if (ghostIndex !== -1) {
        //Jos haamu löytyy, poistetaan se haamujen listasta
        ghosts.splice(ghostIndex, 1); // Poistaa yhden haamun listasta
        updateScoreBoard(50); // Lisätään pisteitä (esim. 50 pistettä osumasta)
    }
    // Asetetaan ruutuun 'B' eli ammus, jotta se näkyy pelissä
    setCell(board, x, y, 'B');


    // Piirretään peli uudelleen, jotta ammus näkyy
    drawBoard(board);


    // Tarkistetaan, onko kaikki haamut poistettu pelistä
    if (ghosts.length === 0){
        // Jos kaikki haamut on ammuttu, siirrytään seuraavalle tasolle
        alert('kaikki ammuttu'); //Tämä pois
    }
}


function moveGhosts() {
    // Tallennetaan kaikkien haamujen nykyiset sijainnit (ennen siirtoa)
    const oldGhosts = ghosts.map(ghost => ({ x: ghost.x, y: ghost.y }));


    // Käydään läpi jokainen haamu
    ghosts.forEach(ghost => {
        // Lasketaan uusi sijainti, johon haamu haluaa liikkua
        const newPosition = ghost.moveGhostTowardsPlayer(player, board, oldGhosts);


        // Päivitetään haamun koordinaatit
        ghost.x = newPosition.x;
        ghost.y = newPosition.y;


        // Asetetaan uusi sijainti laudalle
        setCell(board, ghost.x, ghost.y, 'H');


        // Tarkistetaan törmääkö haamu pelaajaan
        if ( ghost.x === player.x && ghost.y === player.y){
            endGame(); // Peli päättyy jos haamu osuu pelaajaan
            return;
        }


       
    });


    // Tyhjennetään vanhat haamujen paikat laudalta (jotta niistä ei jää haamuja näkyviin)
    oldGhosts.forEach(ghost => {
        board[ghost.y][ghost.x] = ' ';
    });


    // Päivitetään uudet sijainnit laudalle (uudelleenvarmistus)
    ghosts.forEach(ghost => {
        board[ghost.y][ghost.x] = 'H';
    });


    // Piirretään kenttä uudestaan näytölle
    drawBoard(board);
}


function endGame(){


    // Asetetaan peli päättyneeksi
    isGameRunning = false;


    // Näytetään ilmoitus pelaajalle, että peli on ohi
    alert('Game Over! The ghost caught you!');


    // Pysäytetään haamujen liike
    clearInterval(ghostInterval);


    // Näytetään aloitusnäkymä uudelleen (pelaaja voi aloittaa uuden pelin)
    document.getElementById('intro-screen').style.display = 'block';


    // Piilotetaan pelinäkymä, koska peli päättyi
    document.getElementById('game-screen').style.display = 'none';
}


function startNextLevel() {


    // Näytettään pelaajalle ilmoitus siitä, että uusi taso alkaa ja haamujen nopeus kasvaa
    alert('Level UP! Haamujen nopeus kasvaa.')


    // Luodaan uusi satunnainen pelikenttä, johon sijoitetaan pelaaja, haamut ja esteet
    board = generateRandomBoard();


    // Piirretään uusi pelikenttä ruudulle, jotta uudet aloitussijainnit tulevat näkyviin
    drawBoard(board);
  

    // Tehdään haamuista nopeampia 
    ghostSpeed = ghostSpeed * 0.9; 
  

    // Lopetetaan vanha setInterval, joka ohjasi haamujen liikettä aiemmalla nopeudella  
    clearInterval(ghostInterval);  
  
  
    // Käynnistetään uusi setInterval 1 sekunnin kuluttua  
    setTimeout(() => {  
        ghostInterval = setInterval(moveGhosts, ghostSpeed);  
    }, 1000); // 1000 ms = 1 sekunti  
} 