const cardContainer = document.getElementById('card-container');
const themeSelector = document.getElementById('theme-selector');
const gridSelector = document.getElementById('grid-selector'); // 選擇網格大小
const timerSelector = document.getElementById('timer-selector'); // 取得倒數秒數選單
const timerDisplay = document.getElementById('timer'); // 倒數計時顯示元素
const timerContainer = document.getElementById('timer-container'); // 倒數計時容器
const startGameButton = document.getElementById('start-game'); // 開始遊戲按鈕
let selectedTheme = 'anime'; // 默認主題為動漫主題
let selectedGrid = '4x4'; // 默認網格大小為 4x4
let firstCard, secondCard; // 用於比較的兩張卡片
let lockBoard = false; // 防止在比對期間翻更多卡片
let countdown; // 用於儲存倒數計時器的變數
let startTime; // 用於儲存遊戲開始的時間
let playTime; // 用於儲存遊戲中的計時器
let matchCount = 0; // 計算成功配對的次數
let gameStarted = false; // 遊戲是否開始的標記
const flipDuration = 800; // 卡片翻轉動畫時長 (800毫秒)
let gameStartTime; // 計算遊戲真正開始的時間（倒數後）

// 聲音檔案
const matchSound = document.getElementById('match-sound'); // 成功配對的聲音
const failSound = document.getElementById('fail-sound'); // 配對失敗的聲音

// 動漫主題的圖片
const animeImages = {
    front: 'anime_image/img1.jpg', // 正面圖片
    back: [
        'anime_image/img2.jpg', 'anime_image/img3.jpg', 'anime_image/img4.jpg', 'anime_image/img5.jpg',
        'anime_image/img6.jpg', 'anime_image/img7.jpg', 'anime_image/img8.jpg', 'anime_image/img9.jpg',
        'anime_image/img10.jpg', 'anime_image/img11.jpg', 'anime_image/img12.jpg', 'anime_image/img13.jpg',
        'anime_image/img14.jpg', 'anime_image/img15.jpg', 'anime_image/img16.jpg', 'anime_image/img17.jpg',
        'anime_image/img18.jpg', 'anime_image/img19.jpg'
    ]
};

// 工具主題的圖片
const toolsImages = {
    front: 'tools/tools1.jpg', // 正面圖片
    back: [
        'tools/tools2.jpg', 'tools/tools3.jpg', 'tools/tools4.jpg', 'tools/tools5.jpg',
        'tools/tools6.jpg', 'tools/tools7.jpg', 'tools/tools8.jpg', 'tools/tools9.jpg',
        'tools/tools10.jpg', 'tools/tools11.jpg', 'tools/tools12.jpg', 'tools/tools13.jpg',
        'tools/tools14.jpg', 'tools/tools15.jpg', 'tools/tools16.jpg', 'tools/tools17.jpg',
        'tools/tools18.jpg', 'tools/tools19.jpg'
    ]
};

// 播放聲音函數
function playSound(type) {
    if (type === 'match') {
        matchSound.play();
    } else if (type === 'fail') {
        failSound.play();
    }
}

// 洗牌功能
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交換位置
    }
    return array;
}

function updateGrid() {
    let gridTemplateColumns;
    let cardCount;

    // 根據選擇的網格大小動態調整樣式
    if (selectedGrid === '2x2') {
        gridTemplateColumns = 'repeat(2, 1fr)';
        cardCount = 4;
        cardContainer.setAttribute('data-grid', '2x2');
    } else if (selectedGrid === '4x4') {
        gridTemplateColumns = 'repeat(4, 1fr)';
        cardCount = 16;
        cardContainer.setAttribute('data-grid', '4x4');
    } else if (selectedGrid === '6x6') {
        gridTemplateColumns = 'repeat(6, 1fr)';
        cardCount = 36;
        cardContainer.setAttribute('data-grid', '6x6');
    }

    cardContainer.style.display = 'grid'; // 確保顯示卡片容器
    cardContainer.style.gridTemplateColumns = gridTemplateColumns;
    generateCards(cardCount); // 生成相應數量的卡片
}

// 生成指定數量的卡片
function generateCards(cardCount) {
    cardContainer.innerHTML = ''; // 清空現有卡片

    const backImages = selectedTheme === 'anime' ? animeImages.back : toolsImages.back;
    let allBackImages = backImages.slice(0, cardCount / 2).concat(backImages.slice(0, cardCount / 2)); // 生成背面圖片

    allBackImages = shuffle(allBackImages); // 隨機排列背面圖片

    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-back', allBackImages[i]); // 將背面圖片儲存為屬性
        card.innerHTML = `
            <div class="card-face card-front">
                <img src="${selectedTheme === 'anime' ? animeImages.front : toolsImages.front}" alt="卡牌正面">
            </div>
            <div class="card-face card-back">
                <img src="${allBackImages[i]}" alt="卡牌背面">
            </div>
        `;
        cardContainer.appendChild(card);
        card.addEventListener('click', flipCard);
    }
}


function checkForMatch() {
    let isMatch = firstCard.getAttribute('data-back') === secondCard.getAttribute('data-back');
    
    if (isMatch) {
        // 播放成功聲音並禁用卡片點擊
        playSound('match');
        disableCards(); // 確保卡片不再可點擊

        matchCount++; // 增加配對數

        // 延遲後隱藏匹配成功的卡片
        setTimeout(() => {
            firstCard.classList.add('hidden');
            secondCard.classList.add('hidden');
            resetBoard(); // 隱藏後重置狀態
        }, flipDuration); // 等待翻轉動畫完成後隱藏卡片

        // 檢查是否完成所有配對
        if (matchCount === document.querySelectorAll('.card').length / 2) {
            setTimeout(() => {
                const endTime = Date.now();
                const timeSpent = Math.floor((endTime - gameStartTime) / 1000); // 計算從開始後的秒數
                clearInterval(playTime); // 停止計時
                alert(`恭喜！你花了 ${timeSpent} 秒完成配對！`);
            }, flipDuration + 500);  // 等待動畫完全結束
        }
    } else {
        // 播放失敗聲音並將卡片翻回
        playSound('fail');
        unflipCards(); // 如果不匹配，將卡片翻回去
    }
}



function flipCard() {
    if (lockBoard || this === firstCard || !gameStarted) return; // 防止在翻牌期間再點擊

    this.classList.add('flipped'); // 翻牌

    if (!firstCard) {
        firstCard = this;
    } else if (!secondCard) {
        secondCard = this;
        lockBoard = true;
        checkForMatch(); // 檢查是否匹配
    }
}




// 匹配後禁用卡片，不重置狀態，保持背面可見
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
}



// 卡片不匹配時翻回去
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped'); // 翻回正面
        secondCard.classList.remove('flipped'); // 翻回正面
        resetBoard(); // 重置狀態
    }, flipDuration); // 確保動畫時間一致
}





// 重置卡片狀態
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// 依次翻轉卡片
function flipCards(action, delay = 200) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            if (action === 'show-back') {
                card.classList.add('flipped'); // 顯示背面
            } else if (action === 'show-front') {
                card.classList.remove('flipped'); // 顯示正面
            }
        }, index * delay); // 設置每張卡片的延遲時間
    });
}

// 開始遊戲正式計時功能
function startGameTimer() {
    gameStartTime = Date.now(); // 記錄真正開始的時間
    playTime = setInterval(() => {
        const currentTime = Math.floor((Date.now() - gameStartTime) / 1000);
        timerDisplay.textContent = `遊戲時間：${currentTime} 秒`; // 顯示遊戲時間
    }, 1000); // 每秒更新
}

// 更新倒數計時的結束行為
function startCountdown(seconds) {
    let remainingTime = seconds;
    timerContainer.style.display = 'block'; // 顯示計時器
    timerDisplay.textContent = `倒數：${remainingTime}`;

    countdown = setInterval(() => {
        remainingTime--;
        timerDisplay.textContent = `倒數：${remainingTime}`;

        if (remainingTime === 0) {
            clearInterval(countdown); // 清除倒數計時器

            // 等待額外 800 毫秒，讓翻牌動畫結束後再翻回正面
            setTimeout(() => {
                flipCards('show-front', 200); // 翻回正面
                timerDisplay.textContent = '遊戲開始！';
                gameStarted = true; // 現在可以進行配對了
                lockBoard = false; // 解鎖卡片
                startGameTimer(); // 開始正式計時
            }, 800); // 延遲 800 毫秒，確保翻牌動畫完成
        }
    }, 1000);
}

// 清除倒數計時和遊戲計時器
function resetTimers() {
    clearInterval(countdown); // 清除倒數計時
    clearInterval(playTime); // 清除遊戲計時
    timerDisplay.textContent = ''; // 清空顯示的時間
    timerContainer.style.display = 'none'; // 隱藏計時器
}

// 當選擇網格大小時更新
gridSelector.addEventListener('change', function () {
    selectedGrid = gridSelector.value; // 更新網格大小
    cardContainer.style.display = 'none'; // 切換網格大小時隱藏卡片，等待開始遊戲按鈕
    resetTimers(); // 切換網格大小時重置計時器
    lockBoard = false; // 重置板狀態
    matchCount = 0; // 重置配對計數
});

// 當選擇主題時重新生成卡片
themeSelector.addEventListener('change', function () {
    selectedTheme = themeSelector.value; // 更新選擇的主題
    cardContainer.style.display = 'none'; // 切換主題時隱藏卡片，等待開始遊戲按鈕
    resetTimers(); // 切換主題時重置計時器
    lockBoard = false; // 重置板狀態
    matchCount = 0; // 重置配對計數
});

// 修改開始遊戲按鈕的監聽器，根據選擇的秒數開始倒數
startGameButton.addEventListener('click', function () {
    matchCount = 0; // 重置配對數
    lockBoard = true; // 禁止點擊卡片，直到倒數計時結束
    gameStarted = false; // 遊戲還沒開始
    selectedGrid = gridSelector.value; // 確保使用當前選擇的網格大小
    resetTimers(); // 重置計時器
    updateGrid(); // 根據選擇的網格大小生成卡片
    flipCards('show-back', 200); // 卡片先翻到背面

    const countdownSeconds = parseInt(timerSelector.value); // 根據選擇的秒數進行倒數
    startCountdown(countdownSeconds); // 開始倒數選擇的秒數後再翻回正面
});
