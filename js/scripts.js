import '../scss/styles.scss';


const solution = {
    1: {
        ids: ["1", "2", "3", "4"],
        texts: ["Comisiones", "Solidaridad", "Unión", "Confederación"],
        color: "#579c1e", 
        title: "Inicial de sindicato",
        emoji: "🟩"
    },
    2: {
        ids: ["5", "6", "7", "8"],
        texts: ["Esponja", "Coral", "Crucero", "Ola"],
        color: "#1e559c",
        title: "En el mar",
        emoji: "🟦"
    },
    3: {
        ids: ["9", "10", "11", "12"],
        texts: ["Apatía", "Cabeza", "Entuerto", "Parasol"],
        color: "#c230b6",
        title: "Comienzan con una preposición",
        emoji: "🟪"
    },
    4: {
        ids: ["13", "14", "15", "16"],
        texts: ["Crew", "Asamblea", "Colectivo", "Peña"],
        color: "#ecde14",
        title: "Grupo de personas",
        emoji: "🟨"
    }
};

let statistic = [];


let allElements = [];
for (const [groupKey, groupData] of Object.entries(solution)) {
    let counterPosition = 0;
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




let cells = document.querySelectorAll('.cell');
let counter = 0;
let message = "";
let errorCount = 0;
let checks = 0;
let final = false;


cells.forEach(cell => {
    cell.addEventListener('click', function(){
        if(!final){
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
        statistic.push(options);
        if(correct){
            reorderCells(group);// ---> CREAR UNA FUNCIÓN DE REORDENACIÓN PARA LLAMAR AQUí Y EN GAMEENDED.
            checks++;
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
            errorCount++;
            let errorLI = document.querySelectorAll("#tries li:not(.explode)");
            errorLI[errorLI.length - 1].classList.add('explode');
            document.querySelector("#messages").innerHTML = "Selecciona cuatro casillas, tienes <b>" + (4 - errorCount) + "</b> intentos.";
        }

        if(errorCount > 3 || checks == 4){            
            showMessage("Fin de la partida", "warning", true);
            gameEnded(checks, statistic);
            final = true;
        }
    }else{
            showMessage("Debes seleccionar cuatro casillas", "warning");
    }
})


function showMessage(text, status = "warning", end = false){
    //let modal = document.querySelector("#modal");
    //let message = document.querySelector("#message");
    let messages = document.querySelector("#messages");
    let prevText = messages.innerText;
    //message.innerText = text;
    //message.classList = [status];
    messages.innerText = text;
    messages.classList = [status];
    //modal.classList.add('active');
    if(!end){
        setTimeout(() => {
            //modal.classList.remove('active');
            messages.innerText = prevText;
            messages.classList = [];
        }, 2000);
    }

}

function gameEnded(checks, statistic){
    document.querySelector("#actions").style.opacity = 0;
    document.querySelector("#submit").style.pointerEvents = "none";
    if(checks < 4){
        for(let i = checks; i < 4; i++){
            setTimeout(() => {
                let unchecked = document.querySelector(".cell:not(.checked)");            
                let id = unchecked.getAttribute('data-id');
                let group = findGroup(id, solution);
                group.ids.forEach(id => {                    
                    let cell = document.querySelector('[data-id = "' + id + '"]');
                    cell.classList.add('checked');
                    cell.style.backgroundColor = group.color;
                    showTitle(id, i)
                });
                reorderCells();
            }, (i - checks) * 1000);
        }
    }
    console.log(statistic);
    //MOSTRAR STATISTICS
}

function findGroup(id, datos) {
    const idStr = id.toString();    
    for (const [groupKey, groupData] of Object.entries(datos)) {
        if (groupData.ids.includes(idStr)) {
            return {
                groupId: groupKey,
                ids: groupData.ids,
                color: groupData.color,
                title: groupData.title,
                texts: groupData.texts,
                emoji: groupData.emoji
            };
        }
    }
    return null; // Si no se encuentra el ID en ningún grupo
}



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function showTitle(groupId, row){
    const group = findGroup(groupId, solution);
    
    let line = document.createElement('div');

    line.classList.add('solution-line');

    let title = document.createElement('div');
    title.classList.add('title');
    title.innerText = group.title;

    let ul = document.createElement('ul');

    console.log(group);

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

function reorderCells(group){
    group.ids.forEach(id => {
        let cell = document.querySelector("[data-id='"+id+"']");
        cell.classList.remove('active');
        let row = checks + 1;
        let col = parseInt(cell.getAttribute('data-order')) + 1;
        let cellInPos = document.querySelector('.cell.row-' + row + '.col-' + col);
        cellInPos.classList = cell.classList;
        cell.classList = ['cell row-' + row + ' col-' + col];
        cell.classList.add('checked');
        cell.style.backgroundColor = group.color;
    });
    let groupId =  group.id;
    showTitle(group.ids[0], checks);
}