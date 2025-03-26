/**
 * 게임 애니메이션 관련 기능
 */

// 카드 덱 생성 함수
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({
                suit: suit,
                value: value,
                name: `${value} of ${suit}`,
                code: `${value}${suit.charAt(0).toUpperCase()}`
            });
        }
    }
    
    return deck;
}

// 덱 셔플 함수
function shuffleDeck(deck) {
    const shuffled = [...deck];
    
    // Fisher-Yates 알고리즘
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// 카드 HTML 생성 함수
function createCardHTML(card, isHidden = false) {
    // 카드의 색상 설정 (하트와 다이아몬드는 빨간색, 클럽과 스페이드는 검은색)
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#d32f2f' : '#000000';
    
    // 카드 값에 따른 표시 설정
    let displayValue = card.value;
    let suitSymbol = '';
    
    switch (card.suit) {
        case 'hearts':
            suitSymbol = '♥';
            break;
        case 'diamonds':
            suitSymbol = '♦';
            break;
        case 'clubs':
            suitSymbol = '♣';
            break;
        case 'spades':
            suitSymbol = '♠';
            break;
    }
    
    // 카드 요소 생성
    const cardElement = document.createElement('div');
    cardElement.className = `card ${isHidden ? 'hidden' : ''}`;
    
    // 카드 앞면 및 뒷면 구성
    cardElement.innerHTML = `
        <div class="back"></div>
        <div class="front" style="color: ${color}">
            <div class="card-corner top-left">
                <div class="card-value">${displayValue}</div>
                <div class="card-suit">${suitSymbol}</div>
            </div>
            <div class="card-center">${suitSymbol}</div>
            <div class="card-corner bottom-right">
                <div class="card-value">${displayValue}</div>
                <div class="card-suit">${suitSymbol}</div>
            </div>
        </div>
    `;
    
    return cardElement;
}

// 카드를 테이블에 배치하는 애니메이션
function dealCardAnimation(card, container, delay = 0, isHidden = false) {
    // 카드 요소 생성
    const cardElement = createCardHTML(card, isHidden);
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'translateY(-100px) rotateY(90deg)';
    
    // 컨테이너에 추가
    container.appendChild(cardElement);
    
    // 딜레이 후 애니메이션 실행
    setTimeout(() => {
        playSound('card_deal');
        cardElement.style.transition = 'all 0.5s ease';
        cardElement.style.opacity = '1';
        cardElement.style.transform = 'translateY(0) rotateY(0)';
    }, delay);
    
    return cardElement;
}

// 카드 뒤집기 애니메이션
function flipCardAnimation(cardElement, delay = 0) {
    setTimeout(() => {
        playSound('card_flip');
        cardElement.classList.add('card-flip');
        
        // 카드 뒤집는 중간 지점에서 클래스 변경
        setTimeout(() => {
            cardElement.classList.remove('hidden');
            cardElement.classList.remove('card-flip');
        }, 300);
    }, delay);
}

// 카드 제거 애니메이션
function removeCardAnimation(cardElement, delay = 0) {
    setTimeout(() => {
        cardElement.style.transition = 'all 0.5s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateY(-100px) rotateY(90deg)';
        
        // 애니메이션 완료 후 요소 제거
        setTimeout(() => {
            cardElement.remove();
        }, 500);
    }, delay);
}

// 결과 표시 애니메이션
function showResultAnimation(container, text, isWin = false) {
    const resultElement = container.querySelector('.result-display');
    
    if (resultElement) {
        // 결과 타입에 따른 클래스 설정
        resultElement.className = 'result-display';
        if (isWin) {
            resultElement.classList.add('win');
        } else if (isWin === false) {
            resultElement.classList.add('loss');
        } else {
            resultElement.classList.add('push');
        }
        
        // 텍스트 설정 및 표시
        resultElement.textContent = text;
        resultElement.classList.add('show');
        
        // 적절한 사운드 재생
        if (isWin) {
            playSound('win');
        } else if (isWin === false) {
            playSound('lose');
        } else {
            playSound('push');
        }
        
        // 5초 후 숨기기
        setTimeout(() => {
            resultElement.classList.remove('show');
        }, 5000);
    }
}

// 베팅 칩 추가 애니메이션
function addChipAnimation(betContainer, amount) {
    // 베팅 금액 요소
    const betAmountElement = betContainer.querySelector('.bet-amount');
    
    // 현재 베팅 금액 가져오기
    const currentBet = parseInt(betAmountElement.textContent.replace(/[^\d]/g, '')) || 0;
    
    // 새 베팅 금액
    const newBet = currentBet + amount;
    
    // 베팅 금액 업데이트
    betAmountElement.textContent = formatCurrency(newBet);
    
    // 칩 애니메이션 효과
    const chipAnimation = document.createElement('div');
    chipAnimation.className = 'chip-animation';
    chipAnimation.style.position = 'absolute';
    chipAnimation.style.top = '50%';
    chipAnimation.style.left = '50%';
    chipAnimation.style.transform = 'translate(-50%, -50%)';
    chipAnimation.style.width = '40px';
    chipAnimation.style.height = '40px';
    chipAnimation.style.borderRadius = '50%';
    chipAnimation.style.backgroundColor = getChipColor(amount);
    chipAnimation.style.opacity = '0';
    chipAnimation.style.zIndex = '10';
    
    // 컨테이너에 추가
    betContainer.appendChild(chipAnimation);
    
    // 애니메이션 실행
    setTimeout(() => {
        chipAnimation.style.transition = 'all 0.3s ease';
        chipAnimation.style.opacity = '1';
        chipAnimation.style.width = '60px';
        chipAnimation.style.height = '60px';
        
        playSound('chip');
        
        // 애니메이션 완료 후 요소 제거
        setTimeout(() => {
            chipAnimation.style.opacity = '0';
            setTimeout(() => {
                chipAnimation.remove();
            }, 300);
        }, 300);
    }, 10);
    
    // 베팅 컨테이너 하이라이트
    betContainer.classList.add('bet-highlight');
    setTimeout(() => {
        betContainer.classList.remove('bet-highlight');
    }, 1000);
}

// 칩 색상 가져오기
function getChipColor(amount) {
    switch (amount) {
        case 1000:
            return '#29b6f6';
        case 5000:
            return '#66bb6a';
        case 10000:
            return '#ffd54f';
        case 50000:
            return '#ab47bc';
        case 100000:
            return '#e57373';
        default:
            return '#29b6f6';
    }
}

// 승리 애니메이션 (베팅 영역에 적용)
function winAnimation(betContainer) {
    betContainer.classList.add('win-pulse');
    
    // 반짝임 효과 추가
    const rect = betContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 여러 반짝임 생성
    createMultipleSparkles(centerX, centerY, 8);
    
    // 애니메이션 종료 후 클래스 제거
    setTimeout(() => {
        betContainer.classList.remove('win-pulse');
    }, 1000);
}

// 게임 특수 이벤트 애니메이션 (UNO 스타일)
function specialEventAnimation(text, type = 'info') {
    const animationContainer = document.getElementById('animation-container');
    
    // 특수 이벤트 요소 생성
    const specialEvent = document.createElement('div');
    specialEvent.className = 'game-alert';
    specialEvent.textContent = text;
    
    // 타입에 따른 스타일 적용
    switch (type) {
        case 'success':
            specialEvent.style.background = 'linear-gradient(135deg, var(--success-color) 0%, #2e7d32 100%)';
            break;
        case 'warning':
            specialEvent.style.background = 'linear-gradient(135deg, var(--warning-color) 0%, #f57f17 100%)';
            break;
        case 'error':
            specialEvent.style.background = 'linear-gradient(135deg, var(--error-color) 0%, #b71c1c 100%)';
            break;
        default:
            specialEvent.style.background = 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)';
    }
    
    // 컨테이너에 추가
    animationContainer.appendChild(specialEvent);
    
    // 적절한 사운드 재생
    playSound('special_event');
    
    // 애니메이션 완료 후 제거 (3초)
    setTimeout(() => {
        specialEvent.remove();
    }, 3000);
}

// 블랙잭 특별 애니메이션
function blackjackAnimation() {
    const animationContainer = document.getElementById('animation-container');
    
    // 블랙잭 요소 생성
    const blackjackElement = document.createElement('div');
    blackjackElement.className = 'blackjack-celebration';
    blackjackElement.textContent = 'BLACKJACK!';
    
    // 컨테이너에 추가
    animationContainer.appendChild(blackjackElement);
    
    // 반짝임 효과 추가
    const rect = blackjackElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 여러 반짝임 생성
    setTimeout(() => {
        createMultipleSparkles(centerX, centerY, 12);
    }, 300);
    
    // 특별한 사운드 재생
    playSound('blackjack');
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
        blackjackElement.remove();
    }, 2500);
}

// 돈 획득/손실 애니메이션
function moneyChangeAnimation(amount) {
    // 화면 중앙에서 시작
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // 화면 상단의 돈 표시 위치
    const moneyDisplay = document.querySelector('.money-display');
    const moneyRect = moneyDisplay.getBoundingClientRect();
    const targetX = moneyRect.left + moneyRect.width / 2;
    const targetY = moneyRect.top + moneyRect.height / 2;
    
    // 애니메이션 요소 생성
    const moneyElement = document.createElement('div');
    moneyElement.className = `money-change ${amount >= 0 ? 'increase' : 'decrease'}`;
    moneyElement.textContent = `${amount >= 0 ? '+' : ''}${formatCurrency(amount)}`;
    moneyElement.style.position = 'fixed';
    moneyElement.style.left = `${centerX}px`;
    moneyElement.style.top = `${centerY}px`;
    moneyElement.style.transform = 'translate(-50%, -50%)';
    moneyElement.style.fontSize = '2rem';
    moneyElement.style.fontWeight = 'bold';
    moneyElement.style.zIndex = '1000';
    moneyElement.style.opacity = '0';
    moneyElement.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    // 문서에 추가
    document.body.appendChild(moneyElement);
    
    // 페이드 인
    setTimeout(() => {
        moneyElement.style.transition = 'all 0.3s ease';
        moneyElement.style.opacity = '1';
        
        // 페이드 인 후 대상으로 이동
        setTimeout(() => {
            moneyElement.style.transition = 'all 0.8s ease';
            moneyElement.style.left = `${targetX}px`;
            moneyElement.style.top = `${targetY}px`;
            moneyElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
            
            // 적절한 사운드 재생
            if (amount >= 0) {
                playSound('money_gain');
            } else {
                playSound('money_loss');
            }
            
            // 이동 완료 후 제거
            setTimeout(() => {
                moneyElement.remove();
                
                // 돈 표시 강조 효과
                moneyDisplay.classList.add('highlight');
                setTimeout(() => {
                    moneyDisplay.classList.remove('highlight');
                }, 500);
            }, 800);
        }, 500);
    }, 10);
}

// 카드 히스토리 업데이트 애니메이션
function updateHistoryAnimation(container, result, gameType) {
    if (gameType === 'baccarat') {
        // 바카라 결과 표시 (P: 플레이어, B: 뱅커, T: 타이)
        const dot = document.createElement('div');
        dot.className = 'history-dot';
        
        switch (result) {
            case 'player':
                dot.classList.add('player');
                dot.textContent = 'P';
                break;
            case 'banker':
                dot.classList.add('banker');
                dot.textContent = 'B';
                break;
            case 'tie':
                dot.classList.add('tie');
                dot.textContent = 'T';
                break;
        }
        
        // 애니메이션 효과로 추가
        dot.style.opacity = '0';
        dot.style.transform = 'scale(0.5)';
        container.appendChild(dot);
        
        setTimeout(() => {
            dot.style.transition = 'all 0.3s ease';
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1)';
        }, 10);
        
        // 최대 표시 개수 제한 (최신 20개)
        const dots = container.querySelectorAll('.history-dot');
        if (dots.length > 20) {
            dots[0].remove();
        }
    } else if (gameType === 'blackjack') {
        // 블랙잭 결과 표시 (W: 승리, L: 패배, P: 푸시, BJ: 블랙잭)
        const icon = document.createElement('div');
        icon.className = 'history-icon';
        
        switch (result) {
            case 'win':
                icon.classList.add('win');
                icon.textContent = 'W';
                break;
            case 'loss':
                icon.classList.add('loss');
                icon.textContent = 'L';
                break;
            case 'push':
                icon.classList.add('push');
                icon.textContent = 'P';
                break;
            case 'blackjack':
                icon.classList.add('blackjack');
                icon.textContent = 'BJ';
                break;
        }
        
        // 애니메이션 효과로 추가
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.5)';
        container.appendChild(icon);
        
        setTimeout(() => {
            icon.style.transition = 'all 0.3s ease';
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1)';
        }, 10);
        
        // 최대 표시 개수 제한 (최신 20개)
        const icons = container.querySelectorAll('.history-icon');
        if (icons.length > 20) {
            icons[0].remove();
        }
    }
}

// 초기화 함수
function initAnimations() {
    // 애니메이션 및 효과 리소스 미리 로드
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', initAnimations);
