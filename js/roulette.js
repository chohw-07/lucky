/**
 * 룰렛 게임 로직
 */

// 룰렛 게임 상태
const ROULETTE = {
    numbers: [], // 룰렛 번호 배열 (0-36)
    colors: {}, // 번호별 색상 (red, black, green)
    currentBets: {}, // 현재 베팅 정보
    spinInProgress: false, // 스핀 진행 중 여부
    lastResult: null, // 마지막 결과
    history: [], // 게임 이력
    currentNumber: null, // 현재 선택된 번호 (베팅용)
    pockets: [] // 룰렛 포켓 정보
};

// 룰렛 초기화
function initRoulette() {
    console.log("룰렛 게임 초기화...");
    
    // 룰렛 번호 (0-36) 및 색상 정의
    ROULETTE.numbers = Array.from({length: 37}, (_, i) => i);
    
    // 0은 녹색
    ROULETTE.colors[0] = 'green';
    
    // 빨간색 번호: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    redNumbers.forEach(num => {
        ROULETTE.colors[num] = 'red';
    });
    
    // 나머지는 검은색
    ROULETTE.numbers.forEach(num => {
        if (!ROULETTE.colors[num]) {
            ROULETTE.colors[num] = 'black';
        }
    });
    
    // 룰렛 포켓 배열 (실제 휠의 배치와 같음)
    ROULETTE.pockets = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
        11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
        22, 18, 29, 7, 28, 12, 35, 3, 26
    ];
    
    // 베팅 초기화
    resetRouletteBets();
    
    // 룰렛 휠 생성
    createRouletteWheel();
    
    // 룰렛 보드 생성
    createRouletteBoard();
    
    // 이벤트 리스너 설정
    setupRouletteEventListeners();
    
    // 이전 결과 표시 초기화
    updatePreviousNumbers();
}

// 룰렛 베팅 초기화
function resetRouletteBets() {
    ROULETTE.currentBets = {
        numbers: {}, // 번호별 베팅 (예: {'17': 1000})
        colors: { // 색상별 베팅
            red: 0,
            black: 0
        },
        columns: {1: 0, 2: 0, 3: 0}, // 컬럼별 베팅
        dozens: {1: 0, 2: 0, 3: 0}, // 더즌별 베팅
        halves: {1: 0, 2: 0}, // 하프별 베팅
        parities: { // 홀짝 베팅
            odd: 0,
            even: 0
        }
    };
    
    // UI 업데이트
    updateRouletteBetUI();
}

// 룰렛 휠 생성
function createRouletteWheel() {
    const wheelInner = document.getElementById('roulette-wheel-inner');
    if (!wheelInner) return;
    
    wheelInner.innerHTML = '';
    
    // 각 포켓마다 37등분(각도)
    const angleDeg = 360 / ROULETTE.pockets.length;
    
    // 각 포켓 생성
    ROULETTE.pockets.forEach((number, index) => {
        const sector = document.createElement('div');
        sector.className = 'roulette-sector';
        
        // 각도 계산
        const rotateAngle = angleDeg * index;
        sector.style.transform = `rotate(${rotateAngle}deg)`;
        
        // 색상 설정
        const color = ROULETTE.colors[number];
        sector.style.backgroundColor = color === 'red' ? '#d32f2f' : color === 'black' ? '#000000' : '#43a047';
        
        // 섹터 너비 설정 (37등분)
        sector.style.width = '50%';
        sector.style.height = '50%';
        sector.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
        
        // 번호 텍스트 추가
        const content = document.createElement('div');
        content.className = 'roulette-sector-content';
        content.textContent = number;
        content.style.transform = `rotate(${90 - rotateAngle}deg)`;
        content.style.fontSize = '12px';
        
        sector.appendChild(content);
        wheelInner.appendChild(sector);
    });
}

// 룰렛 보드 생성
function createRouletteBoard() {
    const board = document.getElementById('roulette-board');
    if (!board) return;
    
    board.innerHTML = '';
    
    // 0 (그린)
    const zeroSpot = document.createElement('div');
    zeroSpot.className = 'roulette-bet-spot number green';
    zeroSpot.textContent = '0';
    zeroSpot.dataset.number = '0';
    zeroSpot.style.gridColumn = '1';
    zeroSpot.style.gridRow = '1 / span 3';
    board.appendChild(zeroSpot);
    
    // 숫자 1-36
    for (let i = 1; i <= 36; i++) {
        const spot = document.createElement('div');
        spot.className = `roulette-bet-spot number ${ROULETTE.colors[i]}`;
        spot.textContent = i.toString();
        spot.dataset.number = i.toString();
        
        // 그리드 위치 계산
        const column = Math.ceil(i / 3);
        const row = ((i - 1) % 3) + 1;
        
        spot.style.gridColumn = (column + 1).toString(); // +1은 0이 첫번째 열이므로
        spot.style.gridRow = row.toString();
        
        board.appendChild(spot);
    }
    
    // 컬럼 베팅
    for (let col = 1; col <= 3; col++) {
        const spot = document.createElement('div');
        spot.className = 'roulette-bet-spot section';
        spot.textContent = `컬럼 ${col}`;
        spot.dataset.column = col.toString();
        spot.style.gridColumn = (13 - col).toString(); // 역순으로 배치
        spot.style.gridRow = '4';
        board.appendChild(spot);
    }
    
    // 더즌 베팅
    for (let dozen = 1; dozen <= 3; dozen++) {
        const spot = document.createElement('div');
        spot.className = 'roulette-bet-spot section';
        
        // 텍스트 설정
        switch (dozen) {
            case 1: spot.textContent = '1-12'; break;
            case 2: spot.textContent = '13-24'; break;
            case 3: spot.textContent = '25-36'; break;
        }
        
        spot.dataset.dozen = dozen.toString();
        spot.style.gridColumn = `${(dozen - 1) * 4 + 2} / span 4`;
        spot.style.gridRow = '5';
        board.appendChild(spot);
    }
    
    // 하프 베팅, 홀짝 베팅, 색상 베팅
    const betTypes = [
        { text: '1-18', type: 'half', value: '1', gridColumn: '2 / span 2' },
        { text: '홀수', type: 'parity', value: 'odd', gridColumn: '4 / span 2' },
        { text: '레드', type: 'color', value: 'red', gridColumn: '6 / span 2', color: '#d32f2f' },
        { text: '블랙', type: 'color', value: 'black', gridColumn: '8 / span 2', color: '#000000' },
        { text: '짝수', type: 'parity', value: 'even', gridColumn: '10 / span 2' },
        { text: '19-36', type: 'half', value: '2', gridColumn: '12 / span 2' }
    ];
    
    betTypes.forEach(bet => {
        const spot = document.createElement('div');
        spot.className = 'roulette-bet-spot section';
        spot.textContent = bet.text;
        spot.dataset[bet.type] = bet.value;
        spot.style.gridColumn = bet.gridColumn;
        spot.style.gridRow = '6';
        
        if (bet.color) {
            spot.style.backgroundColor = bet.color;
            spot.style.color = 'white';
        }
        
        board.appendChild(spot);
    });
}

// 이벤트 리스너 설정
function setupRouletteEventListeners() {
    // 베팅 스팟 클릭 이벤트
    const board = document.getElementById('roulette-board');
    if (board) {
        board.addEventListener('click', handleRouletteBoardClick);
    }
    
    // 스핀 버튼 클릭 이벤트
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spinRouletteWheel);
    }
    
    // 베팅 취소 버튼 클릭 이벤트
    const clearBetBtn = document.getElementById('roulette-clear-bet');
    if (clearBetBtn) {
        clearBetBtn.addEventListener('click', resetRouletteBets);
    }
    
    // 칩 선택 클릭 이벤트
    const chips = document.querySelectorAll('#roulette-game .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            if (ROULETTE.spinInProgress) return;
            
            const chipValue = parseInt(chip.dataset.value);
            if (ROULETTE.currentNumber !== null) {
                placeRouletteBet(ROULETTE.currentNumber, chipValue);
            }
        });
    });
    
    // 특수 베팅 옵션 클릭 이벤트 (레드, 블랙, 홀수, 짝수)
    const specialBets = document.querySelectorAll('#roulette-game .bet-option');
    specialBets.forEach(bet => {
        bet.addEventListener('click', function() {
            if (ROULETTE.spinInProgress) return;
            
            const betType = bet.dataset.bet;
            ROULETTE.currentNumber = betType;
        });
    });
}

// 룰렛 보드 클릭 핸들러
function handleRouletteBoardClick(event) {
    if (ROULETTE.spinInProgress) return;
    
    const target = event.target;
    
    // 번호 베팅
    if (target.dataset.number) {
        ROULETTE.currentNumber = { type: 'number', value: parseInt(target.dataset.number) };
    }
    // 컬럼 베팅
    else if (target.dataset.column) {
        ROULETTE.currentNumber = { type: 'column', value: parseInt(target.dataset.column) };
    }
    // 더즌 베팅
    else if (target.dataset.dozen) {
        ROULETTE.currentNumber = { type: 'dozen', value: parseInt(target.dataset.dozen) };
    }
    // 하프 베팅
    else if (target.dataset.half) {
        ROULETTE.currentNumber = { type: 'half', value: parseInt(target.dataset.half) };
    }
    // 홀짝 베팅
    else if (target.dataset.parity) {
        ROULETTE.currentNumber = { type: 'parity', value: target.dataset.parity };
    }
    // 색상 베팅
    else if (target.dataset.color) {
        ROULETTE.currentNumber = { type: 'color', value: target.dataset.color };
    }
    
    // 베팅 스팟 하이라이트
    highlightCurrentBet(target);
}

// 현재 베팅 하이라이트
function highlightCurrentBet(target) {
    // 이전 하이라이트 제거
    const spots = document.querySelectorAll('.roulette-bet-spot.highlight');
    spots.forEach(spot => spot.classList.remove('highlight'));
    
    // 새 하이라이트 추가
    if (target) {
        target.classList.add('highlight');
    }
}

// 룰렛 베팅 실행
function placeRouletteBet(betInfo, amount) {
    if (ROULETTE.spinInProgress) return;
    
    // 금액 확인
    if (GAME_DATA.player.money < amount) {
        showToast('베팅할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 베팅 유형에 따라 처리
    switch (betInfo.type) {
        case 'number':
            // 번호 베팅
            if (!ROULETTE.currentBets.numbers[betInfo.value]) {
                ROULETTE.currentBets.numbers[betInfo.value] = 0;
            }
            ROULETTE.currentBets.numbers[betInfo.value] += amount;
            break;
        
        case 'color':
            // 색상 베팅
            ROULETTE.currentBets.colors[betInfo.value] += amount;
            break;
        
        case 'column':
            // 컬럼 베팅
            ROULETTE.currentBets.columns[betInfo.value] += amount;
            break;
        
        case 'dozen':
            // 더즌 베팅
            ROULETTE.currentBets.dozens[betInfo.value] += amount;
            break;
        
        case 'half':
            // 하프 베팅
            ROULETTE.currentBets.halves[betInfo.value] += amount;
            break;
        
        case 'parity':
            // 홀짝 베팅
            ROULETTE.currentBets.parities[betInfo.value] += amount;
            break;
    }
    
    // 금액 차감
    GAME_DATA.player.money -= amount;
    updateUI();
    
    // 효과음
    playSound('chip');
    
    // 베팅 UI 업데이트
    updateRouletteBetUI();
    
    // 베팅 애니메이션 (해당 스팟에)
    const betSpots = document.querySelectorAll('.roulette-bet-spot.highlight');
    betSpots.forEach(spot => {
        addChipAnimation(spot, amount);
    });
    
    // 특수 베팅의 경우 해당 베팅 옵션에도 애니메이션 추가
    if (betInfo.type === 'color' || betInfo.type === 'parity') {
        const betOption = document.querySelector(`#roulette-game .bet-option[data-bet="${betInfo.value}"]`);
        if (betOption) {
            addChipAnimation(betOption, amount);
            
            // 베팅 금액 표시 업데이트
            const betAmountElement = betOption.querySelector('.bet-amount');
            if (betAmountElement) {
                let currentBet = 0;
                
                if (betInfo.type === 'color') {
                    currentBet = ROULETTE.currentBets.colors[betInfo.value];
                } else if (betInfo.type === 'parity') {
                    currentBet = ROULETTE.currentBets.parities[betInfo.value];
                }
                
                betAmountElement.textContent = formatCurrency(currentBet);
            }
        }
    }
}

// 룰렛 베팅 UI 업데이트
function updateRouletteBetUI() {
    // 특수 베팅 옵션 금액 업데이트
    const redBetElement = document.getElementById('red-bet');
    const blackBetElement = document.getElementById('black-bet');
    const oddBetElement = document.getElementById('odd-bet');
    const evenBetElement = document.getElementById('even-bet');
    
    if (redBetElement) redBetElement.textContent = formatCurrency(ROULETTE.currentBets.colors.red);
    if (blackBetElement) blackBetElement.textContent = formatCurrency(ROULETTE.currentBets.colors.black);
    if (oddBetElement) oddBetElement.textContent = formatCurrency(ROULETTE.currentBets.parities.odd);
    if (evenBetElement) evenBetElement.textContent = formatCurrency(ROULETTE.currentBets.parities.even);
    
    // 베팅 스팟 시각화 (숫자 위에 칩 표시)
    const spots = document.querySelectorAll('.roulette-bet-spot');
    spots.forEach(spot => {
        // 기존 칩 표시 제거
        const existingChip = spot.querySelector('.bet-chip-indicator');
        if (existingChip) {
            existingChip.remove();
        }
        
        let betAmount = 0;
        
        // 베팅 유형에 따라 금액 확인
        if (spot.dataset.number) {
            const number = parseInt(spot.dataset.number);
            betAmount = ROULETTE.currentBets.numbers[number] || 0;
        } else if (spot.dataset.color) {
            betAmount = ROULETTE.currentBets.colors[spot.dataset.color];
        } else if (spot.dataset.column) {
            betAmount = ROULETTE.currentBets.columns[parseInt(spot.dataset.column)];
        } else if (spot.dataset.dozen) {
            betAmount = ROULETTE.currentBets.dozens[parseInt(spot.dataset.dozen)];
        } else if (spot.dataset.half) {
            betAmount = ROULETTE.currentBets.halves[parseInt(spot.dataset.half)];
        } else if (spot.dataset.parity) {
            betAmount = ROULETTE.currentBets.parities[spot.dataset.parity];
        }
        
        // 베팅이 있으면 칩 표시
        if (betAmount > 0) {
            const chip = document.createElement('div');
            chip.className = 'bet-chip-indicator';
            chip.style.position = 'absolute';
            chip.style.top = '50%';
            chip.style.left = '50%';
            chip.style.transform = 'translate(-50%, -50%)';
            chip.style.width = '25px';
            chip.style.height = '25px';
            chip.style.borderRadius = '50%';
            chip.style.backgroundColor = getChipColor(betAmount);
            chip.style.display = 'flex';
            chip.style.alignItems = 'center';
            chip.style.justifyContent = 'center';
            chip.style.fontSize = '0.6rem';
            chip.style.fontWeight = 'bold';
            chip.style.color = '#fff';
            chip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
            chip.style.zIndex = '2';
            
            // 베팅 금액에 따라 표시 방식 변경
            if (betAmount >= 10000) {
                chip.textContent = Math.floor(betAmount / 1000) + 'K';
            } else if (betAmount >= 1000) {
                chip.textContent = (betAmount / 1000).toFixed(1) + 'K';
            } else {
                chip.textContent = betAmount;
            }
            
            spot.appendChild(chip);
        }
    });
    
    // 총 베팅 금액 계산
    const totalBet = calculateTotalRouletteBet();
    
    // 스핀 버튼 활성화/비활성화
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) {
        spinBtn.disabled = totalBet === 0;
        if (totalBet === 0) {
            spinBtn.classList.add('disabled');
        } else {
            spinBtn.classList.remove('disabled');
        }
    }
}

// 총 베팅 금액 계산
function calculateTotalRouletteBet() {
    let total = 0;
    
    // 번호 베팅
    Object.values(ROULETTE.currentBets.numbers).forEach(amount => {
        total += amount;
    });
    
    // 색상 베팅
    total += ROULETTE.currentBets.colors.red + ROULETTE.currentBets.colors.black;
    
    // 컬럼 베팅
    Object.values(ROULETTE.currentBets.columns).forEach(amount => {
        total += amount;
    });
    
    // 더즌 베팅
    Object.values(ROULETTE.currentBets.dozens).forEach(amount => {
        total += amount;
    });
    
    // 하프 베팅
    Object.values(ROULETTE.currentBets.halves).forEach(amount => {
        total += amount;
    });
    
    // 홀짝 베팅
    total += ROULETTE.currentBets.parities.odd + ROULETTE.currentBets.parities.even;
    
    return total;
}

// 룰렛 휠 스핀
function spinRouletteWheel() {
    if (ROULETTE.spinInProgress) return;
    
    // 베팅 확인
    const totalBet = calculateTotalRouletteBet();
    if (totalBet === 0) {
        showToast('베팅 후 스핀해주세요.', 'warning');
        return;
    }
    
    // 스핀 진행 중 설정
    ROULETTE.spinInProgress = true;
    
    // 스핀 버튼 비활성화
    const spinBtn = document.getElementById('roulette-spin-btn');
    if (spinBtn) {
        spinBtn.disabled = true;
        spinBtn.classList.add('disabled');
    }
    
    // 베팅 취소 버튼 비활성화
    const clearBetBtn = document.getElementById('roulette-clear-bet');
    if (clearBetBtn) {
        clearBetBtn.disabled = true;
        clearBetBtn.classList.add('disabled');
    }
    
    // 효과음
    playSound('spin');
    
    // 랜덤 결과 생성
    const randomIndex = Math.floor(Math.random() * ROULETTE.pockets.length);
    const result = ROULETTE.pockets[randomIndex];
    ROULETTE.lastResult = result;
    
    // 휠 애니메이션
    const wheel = document.getElementById('roulette-wheel-inner');
    const ball = document.getElementById('roulette-ball');
    
    if (wheel && ball) {
        // 회전 각도 계산 (랜덤 회전 + 결과 위치)
        const totalRotation = 360 * 10 + (360 - randomIndex * (360 / ROULETTE.pockets.length));
        
        // 휠 회전 애니메이션
        wheel.style.transition = 'transform 5s cubic-bezier(0.35, 0, 0.25, 1)';
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        
        // 볼 회전 애니메이션
        ball.style.transition = 'transform 5s cubic-bezier(0.35, 0, 0.25, 1)';
        ball.style.transform = `translate(-50%, -50%) rotate(${-totalRotation}deg) translate(140px) rotate(${totalRotation}deg)`;
        
        // 결과 처리 (애니메이션 완료 후)
        setTimeout(() => {
            // 결과 표시
            showRouletteResult(result);
            
            // 이력 업데이트
            ROULETTE.history.push(result);
            if (ROULETTE.history.length > 10) {
                ROULETTE.history.shift();
            }
            
            // 이전 결과 UI 업데이트
            updatePreviousNumbers();
            
            // 상금 정산
            setTimeout(() => {
                calculateRouletteWinnings(result);
                
                // 게임 상태 리셋
                setTimeout(() => {
                    // 스핀 진행 중 해제
                    ROULETTE.spinInProgress = false;
                    
                    // 버튼 활성화
                    if (spinBtn) {
                        spinBtn.disabled = false;
                        spinBtn.classList.remove('disabled');
                    }
                    
                    if (clearBetBtn) {
                        clearBetBtn.disabled = false;
                        clearBetBtn.classList.remove('disabled');
                    }
                    
                    // 베팅 초기화
                    resetRouletteBets();
                    
                }, 3000);
            }, 2000);
        }, 5000);
    }
}

// 이전 결과 UI 업데이트
function updatePreviousNumbers() {
    const prevNumbersContainer = document.getElementById('roulette-prev-numbers');
    if (!prevNumbersContainer) return;
    
    prevNumbersContainer.innerHTML = '';
    
    // 표시할 개수 제한 (최대 10개)
    const historyToShow = ROULETTE.history.slice(-10);
    
    // 이전 결과 표시
    historyToShow.forEach(number => {
        const color = ROULETTE.colors[number];
        
        const bubble = document.createElement('div');
        bubble.className = 'previous-number';
        bubble.textContent = number;
        bubble.style.width = '30px';
        bubble.style.height = '30px';
        bubble.style.borderRadius = '50%';
        bubble.style.backgroundColor = color === 'red' ? '#d32f2f' : color === 'black' ? '#000000' : '#43a047';
        bubble.style.color = 'white';
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.style.justifyContent = 'center';
        bubble.style.margin = '0 5px';
        bubble.style.fontWeight = 'bold';
        bubble.style.fontSize = '0.8rem';
        bubble.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        
        prevNumbersContainer.appendChild(bubble);
    });
    
    // 컨테이너 스타일 설정
    prevNumbersContainer.style.display = 'flex';
    prevNumbersContainer.style.gap = '8px';
    prevNumbersContainer.style.justifyContent = 'center';
    prevNumbersContainer.style.margin = '15px 0';
}

// 룰렛 결과 표시
function showRouletteResult(result) {
    // 효과음
    playSound('result');
    
    // 결과 알림
    const color = ROULETTE.colors[result];
    const colorName = color === 'red' ? '빨강' : color === 'black' ? '검정' : '그린';
    
    // 결과 애니메이션
    specialEventAnimation(`${result} ${colorName}!`, 'success');
    
    // 결과 기록 (히스토리)
    const historyContainer = document.getElementById('roulette-history');
    if (historyContainer) {
        const dot = document.createElement('div');
        dot.className = 'history-dot';
        
        // 색상에 따른 클래스 추가
        if (color === 'red') {
            dot.style.backgroundColor = '#d32f2f';
        } else if (color === 'black') {
            dot.style.backgroundColor = '#000000';
        } else {
            dot.style.backgroundColor = '#43a047';
        }
        
        dot.textContent = result;
        
        // 애니메이션 효과로 추가
        dot.style.opacity = '0';
        dot.style.transform = 'scale(0.5)';
        historyContainer.appendChild(dot);
        
        setTimeout(() => {
            dot.style.transition = 'all 0.3s ease';
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1)';
        }, 10);
        
        // 최대 표시 개수 제한 (최신 20개)
        const dots = historyContainer.querySelectorAll('.history-dot');
        if (dots.length > 20) {
            dots[0].remove();
        }
    }
}

// 룰렛 상금 계산
function calculateRouletteWinnings(result) {
    let totalWinnings = 0;
    const winningBets = [];
    
    // 결과의 색상
    const resultColor = ROULETTE.colors[result];
    
    // 결과의 특성
    const isEven = result !== 0 && result % 2 === 0;
    const isFirstHalf = result >= 1 && result <= 18;
    const resultDozen = result !== 0 ? Math.ceil(result / 12) : 0;
    const resultColumn = result !== 0 ? (result - 1) % 3 + 1 : 0;
    
    // 번호 베팅 확인
    if (ROULETTE.currentBets.numbers[result]) {
        const betAmount = ROULETTE.currentBets.numbers[result];
        const winAmount = betAmount * 36; // 번호 베팅은 36배
        totalWinnings += winAmount;
        winningBets.push({ type: 'number', winAmount, betAmount });
    }
    
    // 색상 베팅 확인
    if (resultColor !== 'green' && ROULETTE.currentBets.colors[resultColor]) {
        const betAmount = ROULETTE.currentBets.colors[resultColor];
        const winAmount = betAmount * 2; // 색상 베팅은 2배
        totalWinnings += winAmount;
        winningBets.push({ type: 'color', color: resultColor, winAmount, betAmount });
    }
    
    // 홀짝 베팅 확인
    if (result !== 0) {
        const parity = isEven ? 'even' : 'odd';
        if (ROULETTE.currentBets.parities[parity]) {
            const betAmount = ROULETTE.currentBets.parities[parity];
            const winAmount = betAmount * 2; // 홀짝 베팅은 2배
            totalWinnings += winAmount;
            winningBets.push({ type: 'parity', parity, winAmount, betAmount });
        }
    }
    
    // 하프 베팅 확인
    if (result !== 0) {
        const half = isFirstHalf ? 1 : 2;
        if (ROULETTE.currentBets.halves[half]) {
            const betAmount = ROULETTE.currentBets.halves[half];
            const winAmount = betAmount * 2; // 하프 베팅은 2배
            totalWinnings += winAmount;
            winningBets.push({ type: 'half', half, winAmount, betAmount });
        }
    }
    
    // 더즌 베팅 확인
    if (resultDozen !== 0 && ROULETTE.currentBets.dozens[resultDozen]) {
        const betAmount = ROULETTE.currentBets.dozens[resultDozen];
        const winAmount = betAmount * 3; // 더즌 베팅은 3배
        totalWinnings += winAmount;
        winningBets.push({ type: 'dozen', dozen: resultDozen, winAmount, betAmount });
    }
    
    // 컬럼 베팅 확인
    if (resultColumn !== 0 && ROULETTE.currentBets.columns[resultColumn]) {
        const betAmount = ROULETTE.currentBets.columns[resultColumn];
        const winAmount = betAmount * 3; // 컬럼 베팅은 3배
        totalWinnings += winAmount;
        winningBets.push({ type: 'column', column: resultColumn, winAmount, betAmount });
    }
    
    // 승리 메시지 생성
    if (totalWinnings > 0) {
        // 돈 증가
        GAME_DATA.player.money += totalWinnings;
        updateUI();
        
        // 효과음
        playSound('win');
        
        // 돈 변화 애니메이션
        moneyChangeAnimation(totalWinnings);
        
        // 승리 메시지
        let winMessage = `${formatCurrency(totalWinnings)} 획득!`;
        
        // 고배당 획득 시 추가 이펙트
        if (totalWinnings >= 100000) {
            specialEventAnimation('대박 승리! ' + winMessage, 'success');
            
            // 배경 효과
            document.body.classList.add('bg-pulse');
            setTimeout(() => {
                document.body.classList.remove('bg-pulse');
            }, 5000);
        } else {
            specialEventAnimation(winMessage, 'success');
        }
        
        // 승리 베팅 하이라이트
        highlightWinningBets(result);
        
        // 통계 업데이트
        GAME_DATA.player.stats.roulette.wins++;
        GAME_DATA.player.stats.roulette.moneyWon += totalWinnings;
    } else {
        // 패배 메시지
        specialEventAnimation('아쉽게도 패배했습니다.', 'error');
        
        // 효과음
        playSound('lose');
        
        // 통계 업데이트
        GAME_DATA.player.stats.roulette.losses++;
        
        // 총 베팅액 계산
        const totalBet = calculateTotalRouletteBet();
        GAME_DATA.player.stats.roulette.moneyLost += totalBet;
        
        // 손실 애니메이션
        moneyChangeAnimation(-totalBet);
    }
    
    // 게임 카운트 증가
    GAME_DATA.player.stats.roulette.totalGames++;
    
    // 로그 전송
    sendLog({
        type: 'GAME_COMPLETED',
        action: '룰렛 게임 완료',
        details: `결과: ${result}, 색상: ${resultColor}, 총 상금: ${totalWinnings}`
    });
    
    // 데이터 변경 알림
    onDataChange();
}

// 승리 베팅 하이라이트
function highlightWinningBets(result) {
    // 결과의 색상, 특성
    const resultColor = ROULETTE.colors[result];
    const isEven = result !== 0 && result % 2 === 0;
    const isFirstHalf = result >= 1 && result <= 18;
    const resultDozen = result !== 0 ? Math.ceil(result / 12) : 0;
    const resultColumn = result !== 0 ? (result - 1) % 3 + 1 : 0;
    
    // 번호 하이라이트
    const numberSpot = document.querySelector(`.roulette-bet-spot[data-number="${result}"]`);
    if (numberSpot) {
        winAnimation(numberSpot);
    }
    
    // 색상 하이라이트
    if (resultColor !== 'green') {
        const colorSpot = document.querySelector(`.roulette-bet-spot[data-color="${resultColor}"]`);
        if (colorSpot) {
            winAnimation(colorSpot);
        }
        
        const colorOption = document.querySelector(`#roulette-game .bet-option[data-bet="${resultColor}"]`);
        if (colorOption) {
            winAnimation(colorOption);
        }
    }
    
    // 홀짝 하이라이트
    if (result !== 0) {
        const parity = isEven ? 'even' : 'odd';
        const paritySpot = document.querySelector(`.roulette-bet-spot[data-parity="${parity}"]`);
        if (paritySpot) {
            winAnimation(paritySpot);
        }
        
        const parityOption = document.querySelector(`#roulette-game .bet-option[data-bet="${parity}"]`);
        if (parityOption) {
            winAnimation(parityOption);
        }
    }
    
    // 하프 하이라이트
    if (result !== 0) {
        const half = isFirstHalf ? '1' : '2';
        const halfSpot = document.querySelector(`.roulette-bet-spot[data-half="${half}"]`);
        if (halfSpot) {
            winAnimation(halfSpot);
        }
    }
    
    // 더즌 하이라이트
    if (resultDozen !== 0) {
        const dozenSpot = document.querySelector(`.roulette-bet-spot[data-dozen="${resultDozen}"]`);
        if (dozenSpot) {
            winAnimation(dozenSpot);
        }
    }
    
    // 컬럼 하이라이트
    if (resultColumn !== 0) {
        const columnSpot = document.querySelector(`.roulette-bet-spot[data-column="${resultColumn}"]`);
        if (columnSpot) {
            winAnimation(columnSpot);
        }
    }
}

// 룰렛 게임 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initRoulette);
