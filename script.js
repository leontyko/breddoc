(function() {
    // DOM элементы
    const video = document.getElementById('video');
    const snapshotCanvas = document.getElementById('snapshotCanvas');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const detectionStatusDiv = document.getElementById('detectionStatus');
    const resultsBox = document.getElementById('resultsBox');
    const incomeSpan = document.getElementById('incomeValue');
    const creditSpan = document.getElementById('creditValue');
    const alimonySpan = document.getElementById('alimonyValue');
    const gramotnostSpan = document.getElementById('gramotnostValue');
    const diagnosisDiv = document.getElementById('finalDiagnosis');
    const loadingModal = document.getElementById('loadingModal');
    const loadingPhraseSpan = document.getElementById('loadingPhrase');
    const loadingSubSpan = document.getElementById('loadingSub');
    const complainBtn = document.getElementById('complainBtn');
    const subscribeHint = document.getElementById('subscribeHint');
    
    let modelsLoaded = false;
    let stream = null;
    let isAnalyzing = false;
    let lastFaceBox = null;
    
    // Забавные фразы
    const funnyPhrases = [
        { main: "🧠 Подключаем рандомайзер...", sub: "Алгоритм ищет ваш кошелёк по лицу" },
        { main: "⚙️ Калибруем фиолетовый светофор", sub: "Нейросеть перебирает пиксели" },
        { main: "📊 Анализируем финансовую ауру", sub: "Обнаружены следы доширака" },
        { main: "🌀 Генерируем абсурдные коэффициенты", sub: "Погрешность 146% — норма" },
        { main: "🤖 ИИ решает: миллион или ноль", sub: "Спойлер: случайно" },
        { main: "💜 Заряжаем кредитный потенциал", sub: "БредДок одобрит всё" },
        { main: "🎭 Превращаем лицо в финансы", sub: "Нос → НДФЛ" }
    ];
    
    let phraseInterval = null;
    
    function startLoadingModal() {
        loadingModal.classList.add('active');
        if (phraseInterval) clearInterval(phraseInterval);
        const updatePhrase = () => {
            const idx = Math.floor(Math.random() * funnyPhrases.length);
            loadingPhraseSpan.innerText = funnyPhrases[idx].main;
            loadingSubSpan.innerText = funnyPhrases[idx].sub;
        };
        updatePhrase();
        phraseInterval = setInterval(updatePhrase, 1200);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (phraseInterval) clearInterval(phraseInterval);
                phraseInterval = null;
                loadingModal.classList.remove('active');
                resolve();
            }, 5000);
        });
    }
    
    // Загрузка модели face-api
    async function loadModels() {
        detectionStatusDiv.innerText = '⏳ Загружаем детектор лиц...';
        try {
            const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            modelsLoaded = true;
            detectionStatusDiv.innerHTML = '✅ Детектор лиц готов. Включите камеру и сделайте селфи!';
        } catch(e) {
            console.error(e);
            detectionStatusDiv.innerHTML = '⚠️ Ошибка загрузки модели. Проверьте интернет.';
            modelsLoaded = false;
        }
    }
    
    // Включение камеры
    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const constraints = { video: { facingMode: "user" }, audio: false };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            await video.play();
            captureBtn.disabled = false;
            startCameraBtn.textContent = '🔄 Перезапустить камеру';
            detectionStatusDiv.innerHTML = '📸 Камера работает. Нажмите «Сделать фото» для анализа!';
        } catch(err) {
            console.error(err);
            detectionStatusDiv.innerHTML = '❌ Не удалось получить доступ к камере. Проверьте разрешения.';
            captureBtn.disabled = true;
        }
    }
    
    // Детекция лица на изображении
    async function detectFaceOnImage(imgElement) {
        if (!modelsLoaded) {
            detectionStatusDiv.innerHTML = '⏳ Модель ещё не загружена, подождите...';
            return false;
        }
        try {
            detectionStatusDiv.innerHTML = '🧐 Нейросеть ищет лицо...';
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
            const detections = await faceapi.detectAllFaces(imgElement, options);
            if (detections && detections.length > 0) {
                const box = detections[0].box;
                lastFaceBox = { x: box.x, y: box.y, width: box.width, height: box.height };
                detectionStatusDiv.innerHTML = `✅ ЛИЦО РАСПОЗНАНО! Размер: ${Math.round(box.width)}x${Math.round(box.height)} px.`;
                detectionStatusDiv.style.background = "#e6f0ff";
                return true;
            } else {
                lastFaceBox = null;
                detectionStatusDiv.innerHTML = '❌ ЛИЦО НЕ НАЙДЕНО! Сделайте чёткое селфи анфас.';
                detectionStatusDiv.style.background = "#fce4ec";
                return false;
            }
        } catch(err) {
            console.warn(err);
            detectionStatusDiv.innerHTML = '⚠️ Ошибка детекции. Попробуйте другое фото/освещение.';
            return false;
        }
    }
    
    // Генерация абсурдных показателей
    function generateAbsurdStats(faceBox, imgWidth, imgHeight) {
        if (!faceBox) return null;
        let seed = (faceBox.x * 1741 + faceBox.y * 927 + faceBox.width * 523 + faceBox.height * 131) % 98765;
        const r = (n) => {
            const val = Math.sin(seed * (n+1) * 10000 + n) * 10000;
            return val - Math.floor(val);
        };
        const faceSquare = faceBox.width * faceBox.height;
        let income = Math.floor(25000 + faceSquare * 0.65 + r(1) * 520000);
        income = Math.min(1950000, Math.max(15000, income));
        income = Math.round(income / 1000) * 1000;
        
        let creditPotential = Math.floor(70000 + (faceBox.width / imgWidth) * 1500000 + r(2)*500000);
        creditPotential = Math.min(9900000, Math.max(0, creditPotential));
        creditPotential = Math.round(creditPotential / 10000) * 10000;
        
        let alimony = Math.floor(10000 + ((faceBox.y/imgHeight) * 800000) + r(3)*350000);
        alimony = Math.min(1500000, Math.max(0, alimony));
        alimony = Math.round(alimony / 1000) * 1000;
        
        let aspect = faceBox.width / (faceBox.height+0.01);
        let gramBase = 25 + (aspect * 25) + r(4)*40;
        let gramotnost = Math.min(99, Math.max(3, Math.floor(gramBase)));
        
        return { income, creditPotential, alimony, gramotnost };
    }
    
    function getDiagnosisText(income, credit, alimony) {
        if (income > 700000 || credit > 3500000) {
            return "🤡 Вы — идеальный клиент для любого бреда, подпишитесь на рассылки";
        }
        if (alimony > 800000) {
            return "💔 Долг по алиментам зашкаливает! Но БредДок Плюс всё исправит 🤡";
        }
        const phrases = [
            "💜 БредДок: «Кредит одобрен на сумму от 0 до бесконечности»",
            "📉 Ваш финансовый план: купил на хайпе, продал на дне",
            "🏦 ИИ предлагает курс «Как стать финансовым гением за 3 дня»",
            "🤡 Вы — идеальный клиент для любого бреда, подпишитесь на рассылки",
            "✨ Ваш кэшфлоу: то есть, то нет. Подпишитесь на БредДок"
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    function updateUI(stats) {
        if (!stats) return;
        incomeSpan.innerText = stats.income.toLocaleString('ru-RU') + ' ₽';
        creditSpan.innerText = stats.creditPotential.toLocaleString('ru-RU') + ' ₽';
        alimonySpan.innerText = stats.alimony.toLocaleString('ru-RU') + ' ₽';
        gramotnostSpan.innerText = stats.gramotnost + ' %';
        diagnosisDiv.innerHTML = `🤡 Финансовый диагноз: ${getDiagnosisText(stats.income, stats.creditPotential, stats.alimony)}`;
        resultsBox.style.opacity = '1';
        resultsBox.style.filter = 'blur(0px)';
    }
    
    function resetUI() {
        incomeSpan.innerText = '— ₽';
        creditSpan.innerText = '— ₽';
        alimonySpan.innerText = '— ₽';
        gramotnostSpan.innerText = '— %';
        diagnosisDiv.innerHTML = '💜 Сделайте фото с камеры для диагноза';
        resultsBox.style.opacity = '0.5';
        resultsBox.style.filter = 'blur(2px)';
        lastFaceBox = null;
    }
    
    // Сделать фото с камеры и запустить анализ
    async function captureAndAnalyze() {
        if (!modelsLoaded) {
            detectionStatusDiv.innerHTML = '⏳ Модель загружается, секунду...';
            return;
        }
        if (isAnalyzing) {
            detectionStatusDiv.innerHTML = '⏳ Анализ уже идёт, подождите...';
            return;
        }
        if (!video.srcObject || !stream || video.readyState !== 4) {
            detectionStatusDiv.innerHTML = '📸 Сначала включите камеру!';
            return;
        }
        
        isAnalyzing = true;
        captureBtn.disabled = true;
        detectionStatusDiv.innerHTML = '📸 Делаем фото...';
        
        // Снимок с видео на canvas
        const ctx = snapshotCanvas.getContext('2d');
        snapshotCanvas.width = video.videoWidth;
        snapshotCanvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
        
        // Показать снимок поверх видео (для визуального эффекта)
        snapshotCanvas.style.display = 'block';
        setTimeout(() => { snapshotCanvas.style.display = 'none'; }, 1500);
        
        // Создаём временное изображение для детекции
        const tempImg = new Image();
        tempImg.src = snapshotCanvas.toDataURL('image/jpeg', 0.9);
        
        await new Promise((resolve) => { tempImg.onload = resolve; });
        
        // Детекция лица
        const faceFound = await detectFaceOnImage(tempImg);
        if (!faceFound || !lastFaceBox) {
            detectionStatusDiv.innerHTML = '❌ Лицо не найдено на фото. Попробуйте ещё раз с лучшим освещением.';
            isAnalyzing = false;
            captureBtn.disabled = false;
            return;
        }
        
        // Модалка на 5 секунд
        await startLoadingModal();
        
        // Генерация бреда
        const stats = generateAbsurdStats(lastFaceBox, snapshotCanvas.width, snapshotCanvas.height);
        if (stats) {
            updateUI(stats);
            detectionStatusDiv.innerHTML = '🎉 Анализ завершён! Сделайте новое селфи для другого результата.';
            detectionStatusDiv.style.background = "#e6f0ff";
        } else {
            detectionStatusDiv.innerHTML = '⚠️ Ошибка генерации. Попробуйте ещё раз.';
        }
        
        isAnalyzing = false;
        captureBtn.disabled = false;
    }
    
    // Обработчики
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', captureAndAnalyze);
    
    complainBtn.addEventListener('click', () => {
        alert('📢 ЦЕНТРАЛЬНЫЙ БАНК (пародия):\n\n«Ваша жалоба ушла в спам»\n\nБлагодарим за использование БредДок.');
    });
    
    subscribeHint.addEventListener('click', () => {
        alert('💳 БредДок Плюс: случайность станет вдвое случайнее за 199₽/мес. Спишется автоматически.');
    });
    
    // Инициализация
    loadModels();
    resetUI();
    
    // Автозапуск камеры при загрузке
    setTimeout(() => {
        startCamera().catch(e => console.log('автозапуск не удался', e));
    }, 500);
})();
