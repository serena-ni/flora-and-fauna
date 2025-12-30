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

// initialize dots
function initDots() {
    plantDots = Array.from({length: Math.min(Math.floor(plants/2), 50)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height}));
    herbDots = Array.from({length: Math.min(herbivores, 30)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height}));
    predDots = Array.from({length: Math.min(predators, 15)}, ()=>({x:Math.random()*canvas.width, y:Math.random()*canvas.height}));
}

// update dots to match population
function updateDots() {
    while (plantDots.length < Math.min(Math.floor(plants/2),50)) plantDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height});
    while (herbDots.length < Math.min(herbivores,30)) herbDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height});
    while (predDots.length < Math.min(predators,15)) predDots.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height});
    
    if(plantDots.length>Math.min(Math.floor(plants/2),50)) plantDots.splice(Math.min(Math.floor(plants/2),50));
    if(herbDots.length>Math.min(herbivores,30)) herbDots.splice(Math.min(herbivores,30));
    if(predDots.length>Math.min(predators,15)) predDots.splice(Math.min(predators,15));
}

// log helper
function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;
}

// calculate balance
function calculateBalance() {
    const idealHerbivores = plants / 5;
    const idealPredators = herbivores / 3;
    const devHerb = Math.abs(herbivores - idealHerbivores)/(idealHerbivores||1);
    const devPred = Math.abs(predators - idealPredators)/(idealPredators||1);
    return Math.max(Math.round(100 - Math.min((devHerb+devPred)/2*100,100)),0);
}

// animate bars
function animateBars() {
    const maxHeight = 100;
    const targets = [
        {el: document.getElementById('plants-bar'), target: Math.min(plants/maxPlants*maxHeight,maxHeight)},
        {el: document.getElementById('herbivores-bar'), target: Math.min(herbivores/maxHerbivores*maxHeight,maxHeight)},
        {el: document.getElementById('predators-bar'), target: Math.min(predators/maxPredators*maxHeight,maxHeight)}
    ];
    targets.forEach(b=>{
        let current = parseFloat(b.el.style.height)||0;
        b.el.style.height = (current + (b.target - current)*0.1) + 'px';
    });
}

// update status text
function updateStatus() {
    document.getElementById('status-text').innerHTML = `<strong>turn ${turn}</strong><br>⚖️ ecosystem balance: ${calculateBalance()}%`;
}

// move dot toward nearest target
function moveTowardTarget(dot, targets, speed){
    if(targets.length===0) return;
    let nearest = targets.reduce((a,b)=>{
        return ((a.x-dot.x)**2+(a.y-dot.y)**2) < ((b.x-dot.x)**2+(b.y-dot.y)**2) ? a : b;
    });
    const dx = nearest.x - dot.x;
    const dy = nearest.y - dot.y;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if(dist>0.1){
        dot.x += (dx/dist)*speed + (Math.random()-0.5)*0.2; // jitter for liveliness
        dot.y += (dy/dist)*speed + (Math.random()-0.5)*0.2;
    }
}

// draw ecosystem
function drawEcosystem() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    plantDots.forEach(d=>{
        ctx.fillStyle="#2e7d32";
        ctx.beginPath();
        ctx.arc(d.x,d.y,5,0,Math.PI*2);
        ctx.fill();
        // small drift for plants
        d.x += (Math.random()-0.5)*0.2;
        d.y += (Math.random()-0.5)*0.2;
    });

    herbDots.forEach(d=>{
        moveTowardTarget(d, plantDots, 0.5);
        ctx.fillStyle="#fdd835";
        ctx.beginPath();
        ctx.arc(d.x,d.y,8,0,Math.PI*2);
        ctx.fill();
    });

    predDots.forEach(d=>{
        moveTowardTarget(d, herbDots, 1);
        ctx.fillStyle="#d32f2f";
        ctx.beginPath();
        ctx.arc(d.x,d.y,10,0,Math.PI*2);
        ctx.fill();
    });

    animateBars();
    requestAnimationFrame(drawEcosystem);
}

// ecosystem dynamics
function growPlants(){ plants += Math.floor(plants*0.1)+5; }

function herbivoresEat(){
    const needed = herbivores*2;
    if(plants>=needed){ plants-=needed; } 
    else{ const deficit = needed-plants; plants=0; herbivores-=Math.ceil(deficit/2);}
    herbivores = Math.max(herbivores,0);
}

function predatorsEat(){
    const needed = predators*1;
    if(herbivores>=needed){ herbivores-=needed; }
    else{ const deficit=needed-herbivores; herbivores=0; predators-=deficit;}
    predators = Math.max(predators,0);
}

function reproduce(){
    herbivores += Math.floor(herbivores*0.2);
    predators += Math.floor(predators*0.1);
}

function randomEvent(){
    const roll = Math.random();
    if(roll<0.05){ const loss=Math.floor(plants*0.2); plants-=loss; log(`🌵 drought! plants -${loss}`);}
    else if(roll<0.08){ const loss=Math.floor(herbivores*0.3); herbivores-=loss; log(`🤢 disease! herbivores -${loss}`);}
    else if(roll<0.1){ const bonus=1+Math.floor(Math.random()*2); predators+=bonus; log(`🐺 predator migration! +${bonus}`);}
    plants=Math.max(plants,0);
    herbivores=Math.max(herbivores,0);
    predators=Math.max(predators,0);
}

// player action
function playerAction(action){
    if(turn>maxTurns) return;

    switch(action){
        case 'plant': 
            plants+=10; 
            log("🌱 you planted 10 seeds!");
            const bonusHerb = Math.floor(10/10);
            if(bonusHerb>0){ herbivores+=bonusHerb; log(`🐐 herbivores increased by ${bonusHerb} thanks to extra food!`);}
            break;
        case 'herbivore': herbivores+=2; log("🐐 you added 2 herbivores!"); break;
        case 'predator': predators+=1; log("🐺 you added 1 predator!"); break;
        case 'skip': log("⏳ you did nothing this turn."); break;
    }

    growPlants();
    herbivoresEat();
    predatorsEat();
    reproduce();
    randomEvent();

    updateDots();
    updateStatus();
    turn++;

    if(plants<=0 && herbivores<=0 && predators<=0){ log("⚠️ ecosystem collapsed!"); endGame(); return; }
    if(turn>maxTurns) endGame();
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

// init
initDots();
drawEcosystem();
updateStatus();
log("welcome to flora & fauna! 🌿 keep your ecosystem balanced.");
