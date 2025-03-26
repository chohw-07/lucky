/**
 * 슬롯머신 게임 로직
 */

// 슬롯머신 게임 상태
const SLOTS = {
    reels: [], // 릴 배열 (3개)
    symbols: ['🍒', '🍋', '🍇', '🔔', '💎', '🎰'], // 심볼 배열
    symbolValues: { // 심볼별 배당률
        '🍒': 3,  // 체리: 3배
        '🍋': 5,  // 레몬: 5배
        '🍇': 10,  // 포도: 10배
        '🔔': 20,  // 종: 20배
        '💎': 50,  // 다이아몬드: 50배
        '🎰': 100  // 잭팟: 100배
    },
    currentBet: 1000, // 현재 베팅 금액
    isSpinning: false, // 스핀 진행 중 여부
    autoSpinInterval: null, // 자동 스핀 인터벌
    lastWin: 0, // 마지막 당첨 금액
    history: [] // 게임 이력
};

// 슬롯머신 초기화
function initSlots() {
    console.log("슬롯머신 게임 초기화...");
    
    // 릴 생성
    createSlotReels();
    
    // 이벤트 리스너 설정
    setupSlotEventListeners();
    
    // 베팅 금액 초기화
    updateBetAmount(SLOTS.currentBet);
}

// 슬롯 릴 생성
function createSlotReels() {
    SLOTS.reels = [];
    
    // 각 릴마다 심볼 배열 생성 (랜덤 순서로)
    for (let i = 0; i < 3; i++) {
        // 심볼 배열 생성 (각 심볼 여러 개씩, 희귀도에 따라 수량 조절)
        const reelSymbols = [];
        
        // 체리 (가장 흔함)
        for (let j = 0; j < 10; j++) reelSymbols.push('🍒');
        
        // 레몬
        for (let j = 0; j < 8; j++) reelSymbols.push('🍋');
        
        // 포도
        for (let j = 0; j < 6; j++) reelSymbols.push('🍇');
        
        // 종
        for (let j = 0; j < 4; j++) reelSymbols.push('🔔');
        
        // 다이아몬드
        for (let j = 0; j < 2; j++) reelSymbols.push('💎');
        
        // 잭팟 (가장 희귀)
        reelSymbols.push('🎰');
        
        // 심볼 배열 섞기
        shuffleArray(reelSymbols);
        
        SLOTS.reels.push(reelSymbols);
    }
    
    // UI에 릴 표시
    renderSlotReels();
}

// 배열 섞기 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 슬롯 릴 렌더링
function renderSlotReels() {
    for (let i = 0; i < 3; i++) {
        const reelContainer = document.getElementById(`slot-reel-inner-${i+1}`);
        if (!reelContainer) continue;
        
        reelContainer.innerHTML = '';
        
        // 각 릴마다 심볼 15개씩 표시 (화면에 3개만 보이고 나머지는 위아래로 스크롤)
        const reelSymbols = SLOTS.reels[i];
        
        // 초기 위치 랜덤 설정
        const startIdx = Math.floor(Math.random() * reelSymbols.length);
        
        for (let j = 0; j < 15; j++) {
            const symbolIdx = (startIdx + j) % reelSymbols.length;
            const symbol = reelSymbols[symbolIdx];
            
            const symbolElement = document.createElement('div');
            symbolElement.className = 'slot-symbol';
            symbolElement.textContent = symbol;
            
            reelContainer.appendChild(symbolElement);
        }
        
        // 중간 위치로 설정 (5번째 심볼이 중앙에 오도록)
        reelContainer.style.transform = 'translateY(-400px)';
    }
}

// 이벤트 리스너 설정
function setupSlotEventListeners() {
    // 스핀 버튼 클릭 이벤트
    const spinButton = document.getElementById('spin-button');
    if (spinButton) {
        spinButton.addEventListener('click', () => {
            if (!SLOTS.isSpinning) {
                spinSlots();
            }
        });
    }
    
    // 자동 스핀 버튼 클릭 이벤트
    const autoSpinButton = document.getElementById('auto-spin');
    if (autoSpinButton) {
        autoSpinButton.addEventListener('click', toggleAutoSpin);
    }
    
    // 베팅 금액 증가 버튼
    const increaseBetButton = document.getElementById('increase-bet');
    if (increaseBetButton) {
        increaseBetButton.addEventListener('click', () => {
            if (!SLOTS.isSpinning) {
                increaseBet();
            }
        });
    }
    
    // 베팅 금액 감소 버튼
    const decreaseBetButton = document.getElementById('decrease-bet');
    if (decreaseBetButton) {
        decreaseBetButton.addEventListener('click', () => {
            if (!SLOTS.isSpinning) {
                decreaseBet();
            }
        });
    }
}

// 베팅 금액 증가
function increaseBet() {
    let newBet = SLOTS.currentBet;
    
    // 베팅 금액 단계별 증가
    if (newBet < 5000) {
        newBet += 1000;
    } else if (newBet < 10000) {
        newBet += 5000;
    } else if (newBet < 50000) {
        newBet += 10000;
    } else if (newBet < 100000) {
        newBet += 50000;
    } else {
        // 최대 베팅액은 100,000
        newBet = 100000;
    }
    
    // 보유 금액 확인
    if (newBet > GAME_DATA.player.money) {
        showToast('보유 금액이 부족합니다.', 'warning');
        return;
    }
    
    updateBetAmount(newBet);
    playSound('bet_select');
}

// 베팅 금액 감소
function decreaseBet() {
    let newBet = SLOTS.currentBet;
    
    // 베팅 금액 단계별 감소
    if (newBet > 50000) {
        newBet -= 50000;
    } else if (newBet > 10000) {
        newBet -= 10000;
    } else if (newBet > 5000) {
        newBet -= 5000;
    } else if (newBet > 1000) {
        newBet -= 1000;
    } else {
        // 최소 베팅액은 1,000
        newBet = 1000;
    }
    
    updateBetAmount(newBet);
    playSound('bet_select');
}

// 베팅 금액 업데이트
function updateBetAmount(amount) {
    SLOTS.currentBet = amount;
    
    // UI 업데이트
    const betAmountElement = document.getElementById('bet-amount');
    if (betAmountElement) {
        betAmountElement.textContent = formatCurrency(amount);
    }
    
    const slotsCurrentBetElement = document.getElementById('slots-current-bet');
    if (slotsCurrentBetElement) {
        slotsCurrentBetElement.textContent = formatCurrency(amount);
    }
}

// 자동 스핀 토글
function toggleAutoSpin() {
    const autoSpinButton = document.getElementById('auto-spin');
    
    if (SLOTS.autoSpinInterval) {
        // 자동 스핀 중지
        clearInterval(SLOTS.autoSpinInterval);
        SLOTS.autoSpinInterval = null;
        
        if (autoSpinButton) {
            autoSpinButton.textContent = '자동 스핀';
            autoSpinButton.classList.remove('active');
        }
        
        showToast('자동 스핀이 중지되었습니다.', 'info');
    } else {
        // 자동 스핀 시작
        // 보유 금액 확인
        if (GAME_DATA.player.money < SLOTS.currentBet) {
            showToast('보유 금액이 부족합니다.', 'warning');
            return;
        }
        
        // 즉시 한 번 스핀
        if (!SLOTS.isSpinning) {
            spinSlots();
        }
        
        // 자동 스핀 시작 (3초마다)
        SLOTS.autoSpinInterval = setInterval(() => {
            // 보유 금액 확인
            if (GAME_DATA.player.money < SLOTS.currentBet) {
                showToast('보유 금액이 부족하여 자동 스핀이 중지되었습니다.', 'warning');
                toggleAutoSpin();
                return;
            }
            
            // 스핀 중이 아닌 경우에만 스핀
            if (!SLOTS.isSpinning) {
                spinSlots();
            }
        }, 3000);
        
        if (autoSpinButton) {
            autoSpinButton.textContent = '자동 중지';
            autoSpinButton.classList.add('active');
        }
        
        showToast('자동 스핀이 시작되었습니다.', 'info');
    }
}

// 슬롯 스핀 실행
function spinSlots() {
    // 스핀 중이면 실행 안함
    if (SLOTS.isSpinning) return;
    
    // 보유 금액 확인
    if (GAME_DATA.player.money < SLOTS.currentBet) {
        showToast('보유 금액이 부족합니다.', 'warning');
        
        // 자동 스핀 중인 경우 중지
        if (SLOTS.autoSpinInterval) {
            toggleAutoSpin();
        }
        
        return;
    }
    
    // 스핀 상태로 변경
    SLOTS.isSpinning = true;
    
    // 베팅 금액 차감
    GAME_DATA.player.money -= SLOTS.currentBet;
    updateUI();
    
    // 스핀 버튼 비활성화
    const spinButton = document.getElementById('spin-button');
    if (spinButton) {
        spinButton.disabled = true;
    }
    
    // 스핀 효과음
    playSound('slot_spin');
    
    // 릴별로 랜덤 결과 생성
    const results = [];
    for (let i = 0; i < 3; i++) {
        const reelSymbols = SLOTS.reels[i];
        const randomIdx = Math.floor(Math.random() * reelSymbols.length);
        results.push(reelSymbols[randomIdx]);
    }
    
    // 릴 스핀 애니메이션
    spinReelAnimation(results);
}

// 릴 스핀 애니메이션
function spinReelAnimation(results) {
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`slot-reel-inner-${i+1}`);
        if (!reel) continue;
        
        // 초기 위치 설정
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(-400px)';
        
        // 강제 리플로우
        void reel.offsetHeight;
        
        // 결과 인덱스 찾기
        const resultSymbol = results[i];
        const reelSymbols = SLOTS.reels[i];
        const resultIdx = reelSymbols.indexOf(resultSymbol);
        
        // 결과 위치로 이동 (중간에 오도록)
        const spinHeight = -400 - (resultIdx * 100);
        
        // 이 릴의 스핀 지속 시간 (각 릴마다 약간 다르게)
        const duration = 2 + (i * 0.5);
        
        // 애니메이션 시작
        setTimeout(() => {
            reel.style.transition = `transform ${duration}s cubic-bezier(0.1, 0.3, 0.3, 1)`;
            reel.style.transform = `translateY(${spinHeight}px)`;
            
            // 마지막 릴이면 결과 처리
            if (i === 2) {
                setTimeout(() => {
                    // 결과 확인
                    checkSlotResults(results);
                    
                    // 스핀 상태 해제
                    SLOTS.isSpinning = false;
                    
                    // 스핀 버튼 활성화
                    const spinButton = document.getElementById('spin-button');
                    if (spinButton) {
                        spinButton.disabled = false;
                    }
                }, duration * 1000 + 500);
            }
        }, 100);
    }
}

// 슬롯 결과 확인
function checkSlotResults(results) {
    // 결과 화면에 표시
    const resultSymbols = results.join(' ');
    
    // 당첨 여부 확인
    let winAmount = 0;
    let isWin = false;
    
    // 모든 심볼이 같은 경우
    if (results[0] === results[1] && results[1] === results[2]) {
        isWin = true;
        const symbol = results[0];
        const multiplier = SLOTS.symbolValues[symbol];
        winAmount = SLOTS.currentBet * multiplier;
    }
    // 2개의 심볼이 같은 경우 (부분 당첨)
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        isWin = true;
        // 두 개 이상 같은 심볼 찾기
        let duplicateSymbol;
        if (results[0] === results[1]) {
            duplicateSymbol = results[0];
        } else if (results[1] === results[2]) {
            duplicateSymbol = results[1];
        } else {
            duplicateSymbol = results[0];
        }
        
        // 2개 같은 경우는 배당의 1/3
        const multiplier = SLOTS.symbolValues[duplicateSymbol] / 3;
        winAmount = SLOTS.currentBet * multiplier;
    }
    
    // 마지막 당첨 금액 업데이트
    SLOTS.lastWin = winAmount;
    const lastWinElement = document.getElementById('slots-last-win');
    if (lastWinElement) {
        lastWinElement.textContent = formatCurrency(winAmount);
    }
    
    // 이력 업데이트
    const result = {
        symbols: results,
        bet: SLOTS.currentBet,
        win: winAmount
    };
    SLOTS.history.push(result);
    
    // 이력이 10개 이상이면 가장 오래된 항목 제거
    if (SLOTS.history.length > 10) {
        SLOTS.history.shift();
    }
    
    // 이력 UI 업데이트
    updateSlotHistory(result, isWin);
    
    // 당첨된 경우
    if (isWin) {
        // 효과음
        if (winAmount >= SLOTS.currentBet * 10) {
            playSound('big_win');
        } else {
            playSound('win');
        }
        
        // 당첨 애니메이션
        highlightWinningSymbols(results);
        
        // 당첨 메시지
        specialEventAnimation(`${formatCurrency(winAmount)} 획득!`, 'success');
        
        // 잭팟인 경우 특별 애니메이션
        if (results[0] === '🎰' && results[1] === '🎰' && results[2] === '🎰') {
            specialEventAnimation('🎰 잭팟! 🎰', 'success');
            
            // 배경 효과
            document.body.classList.add('bg-pulse');
            setTimeout(() => {
                document.body.classList.remove('bg-pulse');
            }, 5000);
            
            // 통계 업데이트
            GAME_DATA.player.stats.slots.jackpots++;
        }
        
        // 돈 증가
        GAME_DATA.player.money += winAmount;
        updateUI();
        
        // 돈 변화 애니메이션
        moneyChangeAnimation(winAmount);
        
        // 통계 업데이트
        GAME_DATA.player.stats.slots.wins++;
        GAME_DATA.player.stats.slots.moneyWon += winAmount;
    } else {
        // 패배 효과음
        playSound('lose');
        
        // 패배 메시지
        specialEventAnimation('아쉽게도 당첨되지 않았습니다.', 'error');
        
        // 돈 변화 애니메이션
        moneyChangeAnimation(-SLOTS.currentBet);
        
        // 통계 업데이트
        GAME_DATA.player.stats.slots.losses++;
        GAME_DATA.player.stats.slots.moneyLost += SLOTS.currentBet;
    }
    
    // 게임 카운트 증가
    GAME_DATA.player.stats.slots.totalGames++;
    
    // 로그 전송
    sendLog({
        type: 'GAME_COMPLETED',
        action: '슬롯머신 게임 완료',
        details: `결과: ${resultSymbols}, 베팅: ${SLOTS.currentBet}, 당첨: ${winAmount}`
    });
    
    // 데이터 변경 알림
    onDataChange();
}

// 당첨 심볼 하이라이트
function highlightWinningSymbols(results) {
    // 모든 심볼 요소 찾기
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`slot-reel-inner-${i+1}`);
        if (!reel) continue;
        
        // 현재 표시된 심볼들 중 가운데 심볼 (결과 심볼)
        const symbols = reel.querySelectorAll('.slot-symbol');
        if (symbols.length >= 7) { // 중간 심볼은 7번째 (0-based index로는 6)
            const middleSymbol = symbols[6];
            
            // 당첨 심볼인 경우 애니메이션 효과 적용
            if (middleSymbol.textContent === results[i]) {
                // 깜빡임 효과
                let blinks = 0;
                const blinkInterval = setInterval(() => {
                    middleSymbol.style.transform = blinks % 2 === 0 ? 'scale(1.3)' : 'scale(1)';
                    middleSymbol.style.transition = 'transform 0.15s ease';
                    
                    blinks++;
                    if (blinks >= 6) {
                        clearInterval(blinkInterval);
                        middleSymbol.style.transform = 'scale(1)';
                    }
                }, 150);
                
                // 당첨 효과 (반짝임)
                const rect = middleSymbol.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // 여러 반짝임 생성
                createMultipleSparkles(centerX, centerY, 5);
            }
        }
    }
}

// 슬롯 이력 UI 업데이트
function updateSlotHistory(result, isWin) {
    const historyContainer = document.getElementById('slots-history');
    if (!historyContainer) return;
    
    // 새 이력 아이콘 생성
    const icon = document.createElement('div');
    icon.className = 'history-icon';
    
    // 당첨 여부에 따라 클래스 추가
    if (isWin) {
        icon.classList.add('win');
        
        // 잭팟 여부 확인
        if (result.symbols[0] === '🎰' && result.symbols[1] === '🎰' && result.symbols[2] === '🎰') {
            icon.classList.add('blackjack'); // 잭팟도 blackjack 클래스 재활용
            icon.textContent = '🎰';
        } else {
            icon.textContent = 'W';
        }
    } else {
        icon.classList.add('loss');
        icon.textContent = 'L';
    }
    
    // 애니메이션 효과로 추가
    icon.style.opacity = '0';
    icon.style.transform = 'scale(0.5)';
    historyContainer.appendChild(icon);
    
    setTimeout(() => {
        icon.style.transition = 'all 0.3s ease';
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1)';
    }, 10);
    
    // 최대 표시 개수 제한 (최신 20개)
    const icons = historyContainer.querySelectorAll('.history-icon');
    if (icons.length > 20) {
        icons[0].remove();
    }
}

// 슬롯머신 게임 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initSlots);
