import '../scss/styles.scss';

const dateStr = "03/07/2025"; 

const [day, month, year] = dateStr.split('/').map(Number);

const date = new Date(year, month - 1, day);

const solution = {
    1: {
        groupId: 1,
        ids: ["1", "2", "3", "4"],
        texts: ["Manco", "Alcalá", "Molinos", "Siglo de oro"],
        color: "#579c1e", 
        title: "Miguel de Cervantes",
        emoji: "🟩"
    },
    2: {
        groupId: 2,
        ids: ["5", "6", "7", "8"],
        texts: ["Diario", "Anillo", "Diadema", "Serpiente"],
        color: "#1e559c",
        title: "Horrocruxes",
        emoji: "🟦"
    },
    3: {
        groupId: 3,
        ids: ["9", "10", "11", "12"],
        texts: ["Real", "Deportivo", "Atlético", "Rayo"],
        color: "#c230b6",
        title: "Iniciales Equipos de Fútbol'",
        emoji: "🟪"
    },
    4: {
        groupId: 4,
        ids: ["13", "14", "15", "16"],
        texts: ["Amor", "Roma", "Ramo", "Mora"],
        color: "#ecde14",
        title: "Mismas letras",
        emoji: "🟨"
    }
};


const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

// Formatear la fecha como quieres
const dateText = `Jueguito del ${String(day).padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`;


document.getElementById('gametitle').textContent = dateText;

// ——— Configuración de guardado por día ———
const storedData = JSON.parse(localStorage.getItem('conexiones') || '{}');
const todayStr = `${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`;
const localStorageKey = `conexiones`;
const statsKey = 'conexiones-stats';
// Verificar si ya jugaron hoy
if (storedData.lastDate === todayStr) {
  // Ya jugaron hoy: recupera datos
  var gameData = storedData.data;
  console.log("Ya jugaron hoy, recuperando progreso");
} else {
  // No han jugado hoy, inicializa nuevo día
  var gameData = {
    errorCount: 0,
    statistic: [],
    todayResults: [],
    statsUpdated: false,
    checks: 0,
    final: false,
    placedGroups: []
  };
  console.log("Nuevo día, juego reiniciado");
}

const initialStats = {
  totalDays: 0,
  buckets: { 0: 0, 1: 0, 2: 0, 3: 0, fail: 0 },
  streak: 0
};

let globalStats = Object.assign(
  {},
  initialStats,
  JSON.parse(localStorage.getItem(statsKey) || '{}')
);

function saveGameState() {
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({
      lastDate: todayStr,
      data: gameData
    })
  );
}

function saveGlobalStats() {
  localStorage.setItem(statsKey, JSON.stringify(globalStats));
}

let message = "";
let counter = 0;

if(globalStats.totalDays == 0){
    document.querySelector("#instructions").classList.toggle('active');
}


document.querySelector("#open-modal").addEventListener("click", () => { toggleModal("#modal") });
document.querySelectorAll(".close-modal").forEach(element => {
  element.addEventListener("click", () => {
    const grandparent = element.parentElement.parentElement;
    const id = grandparent.getAttribute('id');
    toggleModal(`#${id}`);
  });
});

printGrid();
setTimeout(() => {
    restoreState();
}, 100);

function printGrid(){
    let allElements = [];

    for (const [groupKey, groupData] of Object.entries(solution)) {
        for(let i = 0; i < 4; i++){
            allElements.push({
                id: groupData.ids[i],
                text: groupData.texts[i],
                order: i
            })
        }
    }

    shuffleArray(allElements);

    let row = 1;
    let cellsCounter = 1;

    allElements.forEach(element => {
        if(cellsCounter == 5){
            row++;
            cellsCounter = 1;
        }
        let cell = document.createElement('div');
        cell.classList.add('cell');
        cell.classList.add('row-' + row);
        cell.classList.add('col-' + cellsCounter);
        cell.innerText = element.text;
        cell.setAttribute('data-id', element.id);
        cell.setAttribute('data-order', element.order);
        document.getElementById('grid').appendChild(cell);
        cellsCounter++;
    });
}



function restoreState(){
  
  if(!gameData.final){
     gameData.placedGroups.forEach((groupId, idx) => {
        const group = solution[groupId];
        if(group) reorderCells(group, idx, 0);
    });
    document.querySelector("#messages").innerHTML = "Selecciona cuatro casillas, tienes <b>" + (4 - gameData.errorCount) + "</b> intentos.";
  }else{
    gameData.checks = 0;
    setTimeout(() => gameEnded(), 100);
  }
}


let cells = document.querySelectorAll('.cell');

cells.forEach(cell => {
    cell.addEventListener('click', function(){
        if(!gameData.final){
            message = "";
            if(this.classList.contains('active')){
                this.classList.remove('active');
                counter--;
            }else if(counter < 4){
                this.classList.add('active');
                counter++;
            }else{
                showMessage("Solo puedes seleccionar cuatro casillas");
            }
        }
    })
});

let submit = document.querySelector('#submit');

submit.addEventListener("click", function(){
    let options = [];
    if(counter == 4){
        let cells = document.querySelectorAll('.cell.active');
        let group = null;
        let groupId = 0;
        let correct = true;
        cells.forEach(cell => {            
            let id = cell.getAttribute('data-id');
            group = findGroup(id, solution);
            options.push({
                id: id,
                text: cell.innerText,
                emoji: group.emoji
            });
            if(groupId == 0){
                groupId = group.groupId;
            }else{
                if(group && group.groupId != groupId){
                    correct = false;
                }
            }
        })
        gameData.todayResults.push(options);
        if(correct){
            reorderCells(group, gameData.checks, gameData.checks * 500);
            gameData.placedGroups.push(groupId);
            gameData.checks++;
            gameData.checks = gameData.checks;
            counter = 0;
        }else{
            cells.forEach(cell => {
                cell.classList.add('error');
            })
            setTimeout(() => {                
                cells.forEach(cell => {
                    cell.classList.remove('error');
                })
            }, 1000);
            gameData.errorCount++;
            let errorLI = document.querySelectorAll("#tries li:not(.explode)");
            errorLI[errorLI.length - 1].classList.add('explode');
            document.querySelector("#messages").innerHTML = "Selecciona cuatro casillas, tienes <b>" + (4 - gameData.errorCount) + "</b> intentos.";
        }

        if(gameData.errorCount > 3 || gameData.checks == 4){     
            setTimeout(() => {
                gameEnded(gameData.checks);
            }, 1000);
            gameData.final = true;
            gameData.final = true;
            saveGameState();
        }
    }else{
            showMessage("Debes seleccionar cuatro casillas", "warning");
    }
    saveGameState();
})


function showMessage(text, status = "warning", end = false){
    let messages = document.querySelector("#messages");
    let prevText = messages.innerText;
    messages.innerText = text;
    messages.classList = [status];
    if(!end){
        setTimeout(() => {
            messages.innerText = prevText;
            messages.classList = [];
        }, 2000);
    }

}

function gameEnded(){       
    showMessage("Fin de la partida", "warning", true);
    document.querySelector("#actions").style.display = "none";
    document.querySelector("#submit").style.pointerEvents = "none";
    let round = 1;
    for (const groupId in solution) {
        if (solution.hasOwnProperty(groupId)) { 
            const group = solution[groupId];
            reorderCells(group, gameData.checks++, (round) * 1000);
        }
        round++;
    }
    if (!gameData.statsUpdated) {
        updateGlobalStats();
        gameData.statsUpdated = true;
        saveGameState();
    }

    setTimeout(() => {        
        printTodayResults();
    }, (round + 2) * 1000);
}

function findGroup(id, datos) {
    const idStr = id.toString();    
    for (const [groupKey, groupData] of Object.entries(datos)) {
        if (groupData.ids.includes(idStr)) {
            return groupData;
        }
    }
    return null;
}



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function showTitle(group, row){
    let line = document.createElement('div');

    line.classList.add('solution-line');

    let title = document.createElement('div');
    title.classList.add('title');
    title.innerText = group.title;

    let ul = document.createElement('ul');

    group.texts.forEach(element => {        
        let li = document.createElement('li');
        li.innerText = element;
        ul.appendChild(li);
    });

    line.appendChild(title);
    line.appendChild(ul);
    
    line.style.top = row * (80 + 5) + "px";

    document.getElementById('grid').appendChild(line);
    line.style.backgroundColor = group.color;
    
    setTimeout(() => {
        line.style.opacity = 1;
    }, 1);
    
}

function reorderCells(group, rowVal, delay){
    for(let i = 0; i < group.ids.length; i++){
        let cell = document.querySelector("[data-id='" + group.ids[i] + "']");
        cell.classList.remove('active');
        let row = rowVal + 1;
        let col = i + 1;
        let cellInPos = document.querySelector('.cell.row-' + row + '.col-' + col);
        cellInPos.classList = cell.classList;
        cell.classList = ['cell row-' + row + ' col-' + col];
        cell.classList.add('checked');
        cell.style.backgroundColor = group.color;
    }
    setTimeout(() => {
        showTitle(group, rowVal);
    }, delay);
    
    
    delete solution[group.groupId];
}

function printTodayResults(){
    let emojis = "";
    gameData.todayResults.forEach(line => {
        let div = document.createElement('div');
        line.forEach(pulse => {
            div.innerText += pulse.emoji;
            emojis += pulse.emoji;
        });
        emojis += "%0a";
        document.querySelector("#results").append(div);
    });
    var encodedURL = encodeURIComponent(location.href);
    let linkText = "whatsapp://send?text=¡Vaya juegazo!%0a" + emojis + "%0aJuega aquí: " + encodedURL;
    let telegramText =  "https://t.me/share/url?url=encodedURL&text=¡Vaya juegazo!%0a" + emojis;
    document.querySelector("#whatsapp").setAttribute("href", linkText);
    document.querySelector("#telegram").setAttribute("href", telegramText);
    document.querySelector("#open-modal").style.display = "block";

    const res = document.querySelector("#fullstats");
    const pct = (n) => ((n / globalStats.totalDays) * 100).toFixed(1) + '%';
    const statsHTML = `
        <h2>Estadísticas históricas</h2>
        <ul id="stats">
            <li><span>Sin fallos:</span> <span>${globalStats.buckets[0]} (${pct(globalStats.buckets[0])})</span></li>
            <li><span>1 fallo:</span> <span>${globalStats.buckets[1]} (${pct(globalStats.buckets[1])})</span></li>
            <li><span>2 fallos:</span> <span>${globalStats.buckets[2]} (${pct(globalStats.buckets[2])})</span></li>
            <li><span>3 fallos:</span> <span>${globalStats.buckets[3]} (${pct(globalStats.buckets[3])})</span></li>
            <li><span>No resuelto:</span> <span>${globalStats.buckets.fail} (${pct(globalStats.buckets.fail)})</span></li>
        </ul>
        <p>Racha actual ganando: <b>${globalStats.streak}</b> días</p>
    `;
    res.insertAdjacentHTML('beforeend', statsHTML);


    toggleModal("#modal");
}

function toggleModal(element){
    document.querySelector(element).classList.toggle('active');
}


function updateGlobalStats() {
  globalStats.totalDays++;
  const errs = gameData.errorCount;
  if (errs >= 0 && errs <= 3) {
    globalStats.buckets[errs]++;
    globalStats.streak++;
  } else {
    globalStats.buckets.fail++;
    globalStats.streak = 0;
  }
  saveGlobalStats();
}