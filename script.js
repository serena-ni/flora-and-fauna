let turn = 1;
const maxTurns = 30;

let plants = 50;
let herbivores = 10;
let predators = 3;

// Species parameters
const plantGrowthRate = 5;
const herbivoreFoodNeed = 2;
const predatorFoodNeed = 1;
const herbivoreReproduceThreshold = 6;
const predatorReproduceThreshold = 2;

// Utility function to log messages
function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.textContent += msg + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Update the status display
function updateStatus() {
    document.getElementById('status').innerHTML = 
        `<strong>Turn ${turn}</strong><br>
        🌱 Plants: ${plants}<br>
        🐐 Herbivores: ${herbivores}<br>
        🐺 Predators: ${predators}`;
}

// Plant growth
function growPlants() {
    const growth = plantGrowthRate + Math.floor(Math.random() * 5) - 2; // +/-2 variation
    plants += Math.max(growth, 0);
}

// Herbivores eat plants
function herbivoresEat() {
    const totalNeeded = herbivores * herbivoreFoodNeed;
    if (plants >= totalNeeded) {
        plants -= totalNeeded;
    } else {
        const starved = Math.floor((totalNeeded - plants) / herbivoreFoodNeed);
        herbivores -= Math.min(starved, herbivores);
        plants = 0;
    }
}

// Predators eat herbivores
function predatorsEat() {
    const totalNeeded = predators * predatorFoodNeed;
    if (herbivores >= totalNeeded) {
        herbivores -= totalNeeded;
    } else {
        const starved = Math.floor((totalNeeded - herbivores) / predatorFoodNeed);
        predators -= Math.min(starved, predators);
        herbivores = 0;
    }
}

// Reproduction
function reproduce() {
    herbivores += Math.floor(herbivores / herbivoreReproduceThreshold);
    predators += Math.floor(predators / predatorReproduceThreshold);
}

// Random events
function randomEvent() {
    const roll = Math.random();
    if (roll < 0.05) {
        const loss = Math.floor(plants / 2);
        plants -= loss;
        log(`🌵 Drought! Plants reduced by ${loss}.`);
    } else if (roll < 0.10) {
        const loss = Math.floor(herbivores / 2);
        herbivores -= loss;
        log(`🤢 Disease strikes! Herbivores reduced by ${loss}.`);
    } else if (roll < 0.12) {
        const bonus = 2;
        predators += bonus;
        log(`🐺 Predator migration! ${bonus} new predators arrived.`);
    }
}

// Handle player actions
function playerAction(action) {
    if (turn > maxTurns) return;

    switch(action) {
        case 'plant':
            plants += 10;
            log("🌱 You planted 10 seeds!");
            break;
        case 'herbivore':
            herbivores += 2;
            log("🐐 You added 2 herbivores!");
            break;
        case 'predator':
            predators += 1;
            log("🐺 You added 1 predator!");
            break;
        case 'skip':
            log("⏳ You did nothing this turn.");
            break;
    }

    // Ecosystem updates
    growPlants();
    herbivoresEat();
    predatorsEat();
    reproduce();
    randomEvent();

    updateStatus();

    // Check for extinction
    if (plants <= 0 && herbivores <= 0 && predators <= 0) {
        log("⚠️ The ecosystem collapsed! All species are extinct.");
        endGame();
        return;
    }

    turn++;
    if (turn > maxTurns) endGame();
}

// End the game
function endGame() {
    log("\nSimulation ended.");
    log(`🌱 Plants: ${plants}`);
    log(`🐐 Herbivores: ${herbivores}`);
    log(`🐺 Predators: ${predators}`);
    log("Thanks for playing Flora & Fauna! 🌎");
    document.getElementById('actions').style.display = 'none';
}

// Initial status
updateStatus();
log("Welcome to Flora & Fauna! 🌿 Manage your ecosystem and keep it balanced.");
