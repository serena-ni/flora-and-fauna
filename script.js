const canvas = document.getElementById('ecosystemCanvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let turn = 1;
const maxTurns = 30;

// populations
let plants = 50;
let herbivores = 10;
let predators = 3;

// moving dots
let plantDots = [];
let herbDots = [];
let predDots = [];

// maximum values for bar scaling
const maxPlants = 200;
const maxHerbivores = 50;
const maxPredators = 20;

// initial dots
function initDots() {
    plantDots = Array.from({length: Math.min(Math.floor(plants/2), 50)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height, dx:0, dy:0}));
    herbDots = Array.from({length: Math.min(herbivores, 30)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height, dx:(Math.random()-0.5)*2, dy:(Math.random()-0.5)*2}));
    predDots = Array.from({length: Math.min(predators, 15)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height, dx:(Math.random()-0.5)*3, dy:(Math.random()-0.5)*3}));
}

// add new dots when population grows, keep existing dots
function updateDots() {
    const desiredPlantDots = Math.min(Math.floor(plants/2), 50);
    while (plantDots.length < desiredPlantDots) plantDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, dx:0, dy:0});
    if (plantDots.length > desiredPlantDots) plantDots.splice(desiredPlantDots);

    const desiredHerbDots = Math.min(herbivores, 30);
    while (herbDots.length < desiredHerbDots) herbDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, dx:(Math.random()-0.5)*2, dy:(Math.random()-0.5)*2});
    if (herbDots.length > desiredHerbDots) herbDots.splice(desiredHerbDots);

    const desiredPredDots = Math.min(predators, 15);
    while (predDots.length < desiredPredDots) predDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, dx:(Math.random()-0.5)*3, dy:(Math.random()-0.5)*3});
    if (predDots.length > desiredPredDots) predDots.splice(desiredPredDots);

    // horizontal spacing
    function spaceDots(dots) {
        const spacing = canvas.width / (dots.length + 1);
        for(let i=0;i<dots.length;i++){
            dots[i].x = spacing*(i+1);
        }
    }
    spaceDots(plantDots);
    spaceDots(herbDots);
    spaceDots(predDots);
}

// log helper
function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;
}

// calculate ecosystem balance
function calculateBalance() {
    const idealHerbivores = plants / 5;
    const idealPredators = herbivores / 3;

    const devHerb = Math.abs(herbivores - idealHerbivores) / (idealHerbivores || 1);
    const devPred = Math.abs(predators - idealPredators) / (idealPredators || 1);

    let balance = 100 - Math.min((devHerb + devPred)/2 * 100, 100);
    return Math.max(Math.round(balance), 0);
}

// update bars and text
function updateStatus() {
    const maxHeight = 100;
    document.getElementById('plants-bar').style.height = `${Math.min(plants / maxPlants * maxHeight, maxHeight)}px`;
    document.getElementById('herbivores-bar').style.height = `${Math.min(herbivores / maxHerbivores * maxHeight, maxHeight)}px`;
    document.getElementById('predators-bar').style.height = `${Math.min(predators / maxPredators * maxHeight, maxHeight)}px`;

    document.getElementById('status-text').innerHTML = `<strong>turn ${turn}</strong><br>⚖️ ecosystem balance: ${calculateBalance()}%`;
}

// draw dots
function drawEcosystem() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    function drawDots(dots, color, radius){
        ctx.fillStyle = color;
        for(let d of dots){
            ctx.beginPath();
            ctx.arc(d.x, d.y, radius,0,Math.PI*2);
            ctx.fill();
            d.x += d.dx;
            d.y += d.dy;
            if(d.x<0||d.x>canvas.width) d.dx*=-1;
            if(d.y<0||d.y>canvas.height) d.dy*=-1;
        }
    }

    drawDots(plantDots, "#2e7d32", 5);
    drawDots(herbDots, "#fdd835", 8);
    drawDots(predDots, "#d32f2f", 10);

    requestAnimationFrame(drawEcosystem);
}

// ecosystem dynamics

function growPlants() {
    plants += Math.floor(plants*0.1) + 5; // 10% + 5 seeds per turn
}

function herbivoresEat() {
    const needed = herbivores * 2;
    if(plants >= needed){
        plants -= needed;
    } else {
        const deficit = needed - plants;
        plants = 0;
        herbivores -= Math.ceil(deficit / 2);
    }
    herbivores = Math.max(herbivores, 0);
}

function predatorsEat() {
    const needed = predators * 1;
    if(herbivores >= needed){
        herbivores -= needed;
    } else {
        const deficit = needed - herbivores;
        herbivores = 0;
        predators -= deficit;
    }
    predators = Math.max(predators, 0);
}

function reproduce() {
    herbivores += Math.floor(herbivores*0.2);  // 20% growth
    predators += Math.floor(predators*0.1);      // 10% growth
}

function randomEvent() {
    const roll = Math.random();
    if(roll<0.05){
        const loss=Math.floor(plants*0.2);
        plants-=loss;
        log(`🌵 drought! plants -${loss}`);
    } else if(roll<0.08){
        const loss=Math.floor(herbivores*0.3);
        herbivores-=loss;
        log(`🤢 disease! herbivores -${loss}`);
    } else if(roll<0.1){
        const bonus = 1 + Math.floor(Math.random()*2);
        predators+=bonus;
        log(`🐺 predator migration! +${bonus}`);
    }

    plants = Math.max(plants,0);
    herbivores = Math.max(herbivores,0);
    predators = Math.max(predators,0);
}

// handle player action
function playerAction(action){
    if(turn>maxTurns) return;

    switch(action){
        case 'plant': 
            plants += 10; 
            log("🌱 you planted 10 seeds!");
            const bonusHerb = Math.floor(10 / 10); // 1 herbivore per 10 plants
            if(bonusHerb>0){
                herbivores += bonusHerb;
                log(`🐐 herbivores increased by ${bonusHerb} thanks to extra food!`);
            }
            break;
        case 'herbivore': 
            herbivores += 2; 
            log("🐐 you added 2 herbivores!"); 
            break;
        case 'predator': 
            predators += 1; 
            log("🐺 you added 1 predator!"); 
            break;
        case 'skip': 
            log("⏳ you did nothing this turn."); 
            break;
    }

    // ecosystem updates
    growPlants();
    herbivoresEat();
    predatorsEat();
    reproduce();
    randomEvent();

    updateDots();
    updateStatus();
    turn++;

    if(plants <= 0 && herbivores <= 0 && predators <= 0){
        log("⚠️ ecosystem collapsed!");
        endGame();
        return;
    }

    if(turn > maxTurns) endGame();
}

// end game
function endGame(){
    log("\nsimulation ended.");
    log(`🌱 plants: ${plants}`);
    log(`🐐 herbivores: ${herbivores}`);
    log(`🐺 predators: ${predators}`);
    log("thanks for playing flora & fauna! 🌎");
    document.getElementById('actions').style.display='none';
}

// initial setup
initDots();
drawEcosystem();
updateStatus();
log("welcome to flora & fauna! 🌿 keep your ecosystem balanced.");
