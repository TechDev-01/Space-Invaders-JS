const canvas = document.getElementById('gameCanvas'); //Obtenemos el canvas del DOM
const ctx = canvas.getContext('2d'); //Obtenemos el contexto 2d del canvas

//Variables globales
let isRunning = false;
let isPaused = false;
let isGameOver = false;
let score = 0;

canvas.width = 800;
canvas.height = 700;

//Carga de las imagenes, para la carga de imagenes se debe de crear un objeto Image y asignarle la ruta de la imagen
const shipImg = new Image();
const enemyImg = new Image();
const missileImg = new Image();

shipImg.src = 'assets/ship.png';
enemyImg.src = 'assets/red.png';
missileImg.src = 'assets/missile.png';

let imagesLoaded = 0; //flag para saber si las imagenes se cargaron correctamente

//Esta funcion se asegura de que todas las imagenes se hayan cargado correctamente, si es asi ejecuta el gameLoop.
function imageLoaded(){
    imagesLoaded++; //Incrementamos el contador de imagenes cargadas, en caso de ser 3 esperamos a la señal del boton start
    if(imagesLoaded === 3){
        /*gameLoop();*/ //Comentamos esta linea para que el juego no inicie automaticamente si no cuando se presione start.
    }
}

//Aqui se definene los eventos de carga de las imagenes 
shipImg.onload = imageLoaded;
enemyImg.onload = imageLoaded;
missileImg.onload = imageLoaded;


//Configuracion de la nave
 const ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 30,
    speed: 5,
    dx: 0,
 }

 //Configuracion de los enenmigos
 const enemies = [];
 const enemyRows = 4;
 const enemyCols = 10;
 const enemyWidth = 50;
 const enemyHeight = 40;
 const enemyGap = 20;
 const enemyOffsetTop = 100;
 const enemySpeed = 2;
 let enemySpawnInterval = 1000; //Intervalo de aparicion de los enemigos

//Configuración de los misiles
const missiles = [];
const missileSpeed = 7;
const missileWidth = 10;
const missileHeight = 30;

//Con esta funcion obtenemos una posicion aleatoria para los enemigos
function getRandomPosition(){
    const x = Math.random() * (canvas.width - enemyWidth); //Con esta linea obtenemos una posición aleatoria en el eje X
    const y = -enemyHeight; //Aparacen los enemigos arriba del canvas (afuera)
    enemies.push({x, y, width: enemyWidth, height: enemyHeight, dy: enemySpeed});
}

/*
 FUNCIONES PARA DIBUJAR LOS ENEMIGOS, NAVE Y MISILES
*/

//Función que se encaraga de dibujar la nave en pantalla
function drawShip(){
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

//Función que se encarga de dibujar los enemigos en pantalla
function drawEnemies(){
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

//Función que se encarga de dibujar los misiles en pantalla
function drawMissiles(){
    missiles.forEach(missile => {
        ctx.drawImage(missileImg, missile.x, missile.y, missileWidth, missileHeight);
    });
}

/*
  FUNCIONES PARA MOVER LOS ENEMIGOS, NAVE Y MISILES
*/

//Función que se encarga de mover la nave en pantalla
function moveShip(){
    ship.x += ship.dx; //Actualizamos la posición de la nave en el eje X sumando la velocidad (ship.dx)

    //Validamos que la nave no se salga del canvas
    if(ship.x < 0){
        ship.x = 0;
    }

    //Validamos que la nave no se salga del canvas calculando la posición de la nave sumado al ancho de la nave
    //Si la suma de la posición de la nave y el ancho de la nave es mayor al ancho del canvas, entonces la nave se sale del
    //canvas, por lo tanto se ajusta la posición de la nave restando el ancho de la nave.
    if(ship.x + ship.width > canvas.width){
        ship.x = canvas.width - ship.width;
    }
}

//Función que se encarga de mover los misiles en pantalla
function moveMissiles(){
    for(let i = missiles.length - 1; i >= 0; i--) { //Iteramos en inversa sobre el array de misiles para evitar problemas a la hora de eleminar los misiles
        const missile = missiles[i];
        missile.y -= missileSpeed; // Actualizamos la posición de los misiles en el eje Y

        // Eliminamos los misiles que se salen de la pantalla
        if (missile.y < 0) {
            missiles.splice(i, 1);
        }
    }
}

//Funcion para dispara los misiles
function shootMissile(){
    missiles.push({
        x: ship.x + ship.width / 2 - missileWidth / 2, 
        y: ship.y,
        width: missileWidth,
        height: missileHeight
    });
}

//Función que se encarga de mover los enemigos en pantalla
function moveEnemies(){
    enemies.forEach(enemy => {
        enemy.y += enemy.dy; // Actualizamos la posición de los enemigos en el eje Y

        // Si el enemigo se sale del canvas, lo eliminamos y generamos uno nuevo
        enemies.forEach((enemy, index) => {
            if(enemy.y > canvas.height){
                enemies.splice(index, 1);//Eliminamos el emenigo que se salio del canvas
            }
        })
    });
}

//Funcion que se encarga de mover los enemigos hacia abajo
function moveEnemiesDown(){
    enemies.forEach(enemy => {
        enemy.y += enemy.dy; // Actualizamos la posición de los enemigos en el eje Y
    });
}

//Dectectamos las colisiones entre los misiles y los enemigos
//Los bucles forEach tienen la finalidad de recorrer los arrays de los misiles y los enemigos permitiendonos comparar las posiciones
//de los elementos y detectar si hubo una colision.
//La manera en la que detectamos las colisiones es comparando las posiciones de los elementos mas las dimensiones correspondientes
//Si estas se cruzan quiere decir que hubo una colision entre los elementos.
function detectCollisions(){
        missiles.forEach((missile, missileIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                missile.x < enemy.x + enemy.width &&
                missile.x + missile.width > enemy.x &&
                missile.y < enemy.y + enemy.height &&
                missile.y + missile.height > enemy.y
            ) {
                // Eliminar el enemigo y el misil
                enemies.splice(enemyIndex, 1);
                missiles.splice(missileIndex, 1);
            }
        });
    });
}

//Detectamos las colisiones entre los enemigos y la nave
//Aqui las colisiones se detectan de la misma manera que en la funcion detectCollisions
function detectEnemyShipCollision(){
    enemies.forEach(enemy => {
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.y + ship.height > enemy.y
        ) {
            // Mostrar mensaje de game over
            isRunning = false;
            isGameOver = true;
            alert('Game Over');
        }
    });
}

//Con esta funcion nos aeguramos de reiniciar el juego y todas las variables a su estado inicial
function resetGame(){
    //Primero reiniciamos la nave a su estado inicial
    ship.x = canvas.width / 2 - 25;
    ship.y = canvas.height - 80;

    //Aqui se limpian los arrays de los enemigos y los misiles
    enemies.length = 0;
    missiles.length = 0;

    //Reiniciar el estado del juego
    isRunning = true;
    isGameOver = false;
}

//Detectamos las teclas presionadas
function keyDown(e){
    if(e.key === 'ArrowRight' || e.key === 'Right') {
        ship.dx = ship.speed;
    }else if(e.key === 'ArrowLeft' || e.key === 'Left'){
        ship.dx = -ship.speed;
    }else if(e.key === ' '){
        e.preventDefault();
        shootMissile();
    }
}

//Detectamos las teclas liberadas
function keyUp(e){
    if(e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Right' || e.key === 'Left'){
        ship.dx = 0;
    }
}

//Función principal del juego (gameLoop)
function gameLoop(){
    if(!isRunning || isPaused) return; //Si el juego no esta corriendo, salimos de la función
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpiamos el canvas antes de dibujar los elementos

    drawShip(); //Dibujamos la nave
    drawEnemies(); //Dibujamos los enemigos
    moveEnemies(); //Movemos los enemigos
    moveEnemiesDown(); //Movemos los enemigos hacia abajo
    drawMissiles(); //Dibujamos los misiles
    moveShip(); //Movemos la nave
    moveMissiles(); //Movemos los misiles
    detectCollisions(); //Detectamos las colisiones
    detectEnemyShipCollision(); //Detectamos las colisiones entre los enemigos y la nave

    requestAnimationFrame(gameLoop); //Llamamos recursivamente a la función gameLoop  
}

//Funcion para el ciclo de aparicion de los enemigos
function startEnemySpawn(){
    setInterval(getRandomPosition, enemySpawnInterval);
}

//Funcion para iniciar el juego
function startGame(){
    if(!isRunning && !isGameOver){
        isRunning = true;
        startEnemySpawn();
        gameLoop();
    }
}

//Funcion para pausar el juego
function pauseGame(){
    if(isRunning){
        isPaused = !isPaused;
        if(!isPaused){
            gameLoop(); 
        }
    }
}

//Funcion para reiniciar el juego despues de un game over
function restartGame(){
    resetGame();
    gameLoop();
}

//Eventos de teclado
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseButton').addEventListener('click', pauseGame);
document.getElementById('restartButton').addEventListener('click', restartGame);

