const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

// Настройки размеров (можно менять)
const PLAYER_SIZE = {
    width: 96,
    height: 96
};

const BULLET_SIZE = {
    width: 128,
    height: 128
};

// Загрузка изображений
const images = {
    player: new Image(),
    bullet: new Image()
};

images.player.src = 'assets/player.png';
images.bullet.src = 'assets/bullet.png';

// Настройки игры
canvas.width = 800;
canvas.height = 800;

let player = {
    x: 400,
    y: 750,
    ...PLAYER_SIZE, // Используем заданные размеры
    speed: 0,
    maxSpeed: 7
};

const ENEMY_TEXTS = [
    ["4/", "10"],
    ["СМОТРИ", "ТУДА"],
    ["ЛЮБЛЮ", "ТЕБЯ"],
    ["-ЛЮБЛЮ", "-НОРМ"],
    ["ЛОООХ", "🤡"],
    ["ZZZ", "ZOV"],
    ["-😽😽😽","-😽😽😽"]
];
const ENEMY_SIZE = 80; // Размер квадратного врага

let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;
let gameInterval;
let animationFrame;
let keys = {};

const winModal = document.getElementById('winModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// Проверка победы
function checkVictory() {
    if (score >= 3000) {
        gameOver();
        showWinModal();
    }
}

function showWinModal() {
    winModal.style.display = 'block';
}

function hideWinModal() {
    winModal.style.display = 'none';
}

closeModalBtn.addEventListener('click', hideWinModal);

// Блокировка прокрутки
document.addEventListener('keydown', (e) => {
    if(['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
});

// Обработчики клавиатуры
document.addEventListener('keydown', (e) => {
    keys[e.code] = true; // Используем e.code вместо e.key
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function handleInput() {
    // Стрельба на стрелку вверх
    if(keys['KeyW'] && !player.isShooting) {
        shoot();
        player.isShooting = true;
        setTimeout(() => player.isShooting = false, 300);
    }
    
    // Движение
    if(keys['KeyA']) {
        player.speed = -player.maxSpeed;
    } else if(keys['KeyD']) {
        player.speed = player.maxSpeed;
    } else {
        player.speed *= 0.85;
    }
    
    player.x += player.speed;
    player.x = Math.max(0, Math.min(canvas.width - player.width + 100, player.x));
}

function shoot() {
    bullets.push({
        x: player.x + PLAYER_SIZE.width/2 - BULLET_SIZE.width/2 + 15,
        y: player.y - PLAYER_SIZE.height/2,
        ...BULLET_SIZE, // Используем заданные размеры
        speed: -12
    });
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - ENEMY_SIZE),
        y: -ENEMY_SIZE,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        speed: Math.random() * 2 + 2,
        texts: ENEMY_TEXTS[Math.floor(Math.random() * ENEMY_TEXTS.length)]
    });
}

function update() {
    // Обновление пуль
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y > -bullet.height;
    });

    // Обновление врагов
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;

        // Проверка достижения нижней границы
        if (enemy.y >= canvas.height - enemy.height) {
            lives--;
            document.getElementById('lives').textContent = '❤️'.repeat(lives);
            return false;
        }

        return true;
    });

    // Проверка попаданий
    bullets.forEach((bullet, bIdx) => {
        enemies.forEach((enemy, eIdx) => {
            if (checkCollision(bullet, enemy)) {
                bullets.splice(bIdx, 1);
                enemies.splice(eIdx, 1);
                score += 100;
                document.getElementById('score').textContent = score;
                checkVictory(); // Проверяем победу после увеличения очков
            }
        });
    });

    // Обновление жизней
    document.getElementById('lives').textContent = '❤️'.repeat(lives);
    if (lives <= 0) gameOver();
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игрока
    ctx.drawImage(
        images.player,
        player.x - PLAYER_SIZE.width/2,
        player.y - PLAYER_SIZE.height/2,
        PLAYER_SIZE.width,
        PLAYER_SIZE.height
    );

    // Отрисовка пуль
    bullets.forEach(bullet => {
        ctx.drawImage(
            images.bullet,
            bullet.x - BULLET_SIZE.width/2,
            bullet.y - BULLET_SIZE.height/2,
            BULLET_SIZE.width,
            BULLET_SIZE.height
        );
    });

    // Отрисовка врагов (оставить старую реализацию или добавить спрайты)
    ctx.fillStyle = '#a83232';
    enemies.forEach(enemy => {
        // Квадрат
        ctx.fillStyle = '#ff4d6d';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Текст
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        
        // Распределение текста по вертикали
        const lineHeight = 25;
        const startY = enemy.y + (enemy.height - (enemy.texts.length * lineHeight)) / 2 + 20;
        
        enemy.texts.forEach((text, index) => {
            ctx.fillText(
                text,
                enemy.x + enemy.width/2,
                startY + (index * lineHeight)
            );
        });
    });
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function gameLoop() {
    handleInput();
    update();
    draw();
    animationFrame = requestAnimationFrame(gameLoop);
}

function gameOver() {
    cancelAnimationFrame(animationFrame);
    clearInterval(gameInterval);
    startBtn.style.display = 'block';
}

function startGame() {
    // Скрываем заголовок и показываем игровую часть
    const gameTitle = document.getElementById('gameTitle');
    const gameCanvas = document.getElementById('gameCanvas');
    const hud = document.querySelector('.hud');
    
    gameTitle.style.display = 'none';
    gameCanvas.style.display = 'block';
    hud.style.display = 'block';
    
    // Сброс состояния игры
    player.x = 400;
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    keys = {};
    
    document.getElementById('score').textContent = '0';
    document.getElementById('lives').textContent = '❤️❤️❤️';
    startBtn.style.display = 'none';
    
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnEnemy, Math.random() * 300 + 300);
    gameLoop();
}

startBtn.addEventListener('click', startGame);