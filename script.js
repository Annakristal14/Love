const btn = document.getElementById('decryptBtn');
const terminal = document.getElementById('terminal');
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

// Ваши фразы
const wordsArray = ["I love you", "You are my everything", "Forever yours", "My heart beats for you", "Together forever", "You complete me", "My love for you is endless"];

let particles = [];
let animationFrameId;
let pulseTime = 0; 
let centerTextAlpha = 0;
let isHeartInitialized = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Если анимация уже запущена, при изменении экрана пересчитываем координаты точек
    if (isHeartInitialized) {
        particles = [];
        initHeart();
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getHeartPoint(t, scale) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return {
        x: x * scale,
        y: -y * scale
    };
}

class WordParticle {
    constructor(targetX, targetY, word) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.word = word;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 0.02 + Math.random() * 0.03;
        
        // Размер шрифта подстраивается под экран: на смартфонах буквы будут чуть компактнее
        const baseSize = canvas.width < 500 ? 9 : 11;
        this.fontSize = Math.floor(Math.random() * 4) + baseSize; 
        this.alpha = 0;
    }

    update() {
        this.x += (this.targetX - this.x) * this.speed;
        this.y += (this.targetY - this.y) * this.speed;
        if (this.alpha < 1) this.alpha += 0.02;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 51, 102, ${this.alpha * 0.75})`;
        ctx.font = `${this.fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.word, this.x, this.y);
    }
}

function initHeart() {
    if (!wordsArray || wordsArray.length === 0) {
        wordsArray.push("I love you");
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Динамический масштаб самого сердца для разных экранов
    const scale = Math.min(canvas.width, canvas.height) / (canvas.width < 500 ? 33 : 40);
    
    let wordIndex = 0;

    // 1. Контур
    const contourParticles = canvas.width < 500 ? 180 : 250; // Меньше частиц на телефонах, чтобы не было каши
    for (let i = 0; i < contourParticles; i++) {
        const t = (i / contourParticles) * Math.PI * 2;
        const point = getHeartPoint(t, scale);
        
        const offsetX = (Math.random() - 0.5) * (canvas.width < 500 ? 8 : 15);
        const offsetY = (Math.random() - 0.5) * (canvas.width < 500 ? 8 : 15);

        const targetX = centerX + point.x + offsetX;
        const targetY = centerY + point.y + offsetY;
        
        const currentWord = wordsArray[wordIndex];
        particles.push(new WordParticle(targetX, targetY, currentWord));
        
        wordIndex = (wordIndex + 1) % wordsArray.length;
    }

    // 2. Внутреннее наполнение
    const innerLines = canvas.width < 500 ? 18 : 25; 
    for (let j = 0; j < innerLines; j++) {
        const shrinkFactor = 0.1 + (j / innerLines) * 0.8; 
        const particlesInLine = Math.floor((canvas.width < 500 ? 10 : 15) * shrinkFactor);

        for (let i = 0; i < particlesInLine; i++) {
            const t = (i / particlesInLine) * Math.PI * 2;
            const point = getHeartPoint(t, scale * shrinkFactor);

            // Ограничение центральной зоны подстраивается под экран
            const limitX = canvas.width < 500 ? 50 : 80;
            const limitY = canvas.width < 500 ? 20 : 30;
            if (Math.abs(point.x) < limitX && Math.abs(point.y) < limitY) {
                continue;
            }

            const offsetX = (Math.random() - 0.5) * (canvas.width < 500 ? 12 : 20);
            const offsetY = (Math.random() - 0.5) * (canvas.width < 500 ? 12 : 20);
            const targetX = centerX + point.x + offsetX;
            const targetY = centerY + point.y + offsetY;

            const currentWord = wordsArray[wordIndex];
            particles.push(new WordParticle(targetX, targetY, currentWord));
            
            wordIndex = (wordIndex + 1) % wordsArray.length;
        }
    }
}

function drawCenterText() {
    if (centerTextAlpha < 1) centerTextAlpha += 0.01;
    
    pulseTime += 0.05; 
    const pulseScale = 1.0 + Math.sin(pulseTime * 2) * 0.03; 

    ctx.save();
    ctx.shadowBlur = 20 + Math.sin(pulseTime * 2) * 3;
    ctx.shadowColor = "#ff6699";
    ctx.fillStyle = `rgba(255, 255, 255, ${centerTextAlpha})`;
    
    // Адаптивный базовый размер центрального знака (60px для телефонов, 90px для ПК)
    const baseFontSize = canvas.width < 500 ? 60 : 90;
    const currentFontSize = Math.floor(baseFontSize * pulseScale);
    
    ctx.font = `${currentFontSize}px Arial, sans-serif`; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.fillText("I love you. \u{1F496}", canvas.width / 2, canvas.height / 2); 
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.shadowBlur = 2;
    ctx.shadowColor = "#ff3366";
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    ctx.shadowBlur = 0;
    drawCenterText();
    
    animationFrameId = requestAnimationFrame(animate);
}

btn.addEventListener('click', () => {
    terminal.style.opacity = '0';
    setTimeout(() => {
        terminal.style.display = 'none';
        canvas.style.opacity = '1';
        isHeartInitialized = true;
        initHeart();
        animate();
    }, 1000);
});