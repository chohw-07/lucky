/**
 * 포커 게임 로직 (시각화된 파이브 카드 드로우 포커)
 */

// 포커 게임 상태
const POKER = {
    deck: [],            // 카드 덱
    playerHand: [],      // 플레이어 카드 패
    dealerHand: [],      // 딜러(컴퓨터) 카드 패
    communityCards: [],  // 공용 카드 (텍사스 홀덤 스타일)
    potAmount: 0,        // 팟 금액
    currentBet: 0,       // 현재 베팅 금액
    minimumBet: 1000,    // 최소 베팅 금액
    roundBet: 0,         // 현재 라운드 베팅 금액
    gameStage: 'idle',   // 게임 단계 (idle, dealing, betting, player-turn, dealer-turn, showdown)
    currentTurn: null,   // 현재 턴 (player, dealer)
    raiseAmount: 1000,   // 레이즈 금액
    playerHandRank: null, // 플레이어 핸드 랭크
    dealerHandRank: null, // 딜러 핸드 랭크
    history: []          // 게임 이력
};

// 카드 족보 정의
const HAND_RANKS = {
    ROYAL_FLUSH: 9,
    STRAIGHT_FLUSH: 8,
    FOUR_OF_A_KIND: 7,
    FULL_HOUSE: 6,
    FLUSH: 5,
    STRAIGHT: 4,
    THREE_OF_A_KIND: 3,
    TWO_PAIR: 2,
    ONE_PAIR: 1,
    HIGH_CARD: 0
};

// 포커 게임 초기화
function initPoker() {
    console.log("포커 게임 초기화...");
    
    // 기본 상태 초기화
    resetPokerGame();
    
    // 이벤트 리스너 설정
    setupPokerEventListeners();
}

// 포커 게임 리셋
function resetPokerGame() {
    // 덱 생성 및 셔플
    POKER.deck = shuffleDeck(createDeck());
    
    // 핸드 초기화
    POKER.playerHand = [];
    POKER.dealerHand = [];
    POKER.communityCards = [];
    
    // 게임 상태 초기화
    POKER.potAmount = 0;
    POKER.currentBet = 0;
    POKER.roundBet = 0;
    POKER.gameStage = 'idle';
    POKER.currentTurn = null;
    POKER.raiseAmount = 1000;
    POKER.playerHandRank = null;
    POKER.dealerHandRank = null;
    
    // UI 초기화
    document.getElementById('player-poker-cards').innerHTML = '';
    document.getElementById('dealer-poker-cards').innerHTML = '';
    document.getElementById('community-cards').innerHTML = '';
    document.getElementById('poker-pot').textContent = '₩0';
    document.getElementById('poker-bet').textContent = '₩0';
    document.getElementById('player-hand-name').textContent = '';
    document.getElementById('dealer-hand-name').textContent = '';
    document.getElementById('dealer-status').textContent = '대기 중...';
    
    // 레이즈 슬라이더 초기화
    const raiseSlider = document.getElementById('raise-slider');
    if (raiseSlider) {
        raiseSlider.min = POKER.minimumBet;
        raiseSlider.max = Math.min(100000, GAME_DATA.player.money);
        raiseSlider.value = POKER.minimumBet;
        
        document.getElementById('raise-amount').textContent = formatCurrency(POKER.minimumBet);
    }
    
    // 레이즈 컨트롤 숨기기
    document.getElementById('poker-raise-controls').style.display = 'none';
    
    // 게임 버튼 상태 업데이트
    updatePokerButtons('idle');
}

// 포커 게임 이벤트 리스너 설정
function setupPokerEventListeners() {
    // 딜 버튼 클릭 이벤트
    document.getElementById('deal-poker-btn').addEventListener('click', startPokerGame);
    
    // 폴드 버튼 클릭 이벤트
    document.getElementById('fold-btn').addEventListener('click', playerFold);
    
    // 체크 버튼 클릭 이벤트
    document.getElementById('check-btn').addEventListener('click', playerCheck);
    
    // 콜 버튼 클릭 이벤트
    document.getElementById('call-btn').addEventListener('click', playerCall);
    
    // 레이즈 버튼 클릭 이벤트
    document.getElementById('raise-btn').addEventListener('click', toggleRaiseControls);
    
    // 레이즈 슬라이더 이벤트
    const raiseSlider = document.getElementById('raise-slider');
    raiseSlider.addEventListener('input', function() {
        const value = parseInt(raiseSlider.value);
        document.getElementById('raise-amount').textContent = formatCurrency(value);
        POKER.raiseAmount = value;
    });
    
    // 칩 선택 클릭 이벤트
    const chips = document.querySelectorAll('#poker-game .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            if (POKER.gameStage !== 'idle') return;
            
            const chipValue = parseInt(chip.dataset.value);
            placePokerBet(chipValue);
        });
    });
}

// 포커 게임 버튼 상태 업데이트
function updatePokerButtons(stage) {
    // 모든 버튼 숨기기
    document.getElementById('fold-btn').style.display = 'none';
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('call-btn').style.display = 'none';
    document.getElementById('raise-btn').style.display = 'none';
    document.getElementById('deal-poker-btn').style.display = 'none';
    
    // 현재 단계에 맞는 버튼 표시
    switch (stage) {
        case 'idle':
            // 게임 시작 전 - 딜 버튼만 표시
            document.getElementById('deal-poker-btn').style.display = 'block';
            break;
            
        case 'player-turn':
            // 플레이어 턴 - 액션 버튼 표시
            document.getElementById('fold-btn').style.display = 'block';
            
            // 라운드 베팅이 있으면 체크 대신 콜 버튼 표시
            if (POKER.roundBet > 0) {
                document.getElementById('call-btn').style.display = 'block';
            } else {
                document.getElementById('check-btn').style.display = 'block';
            }
            
            // 레이즈 버튼 표시 (돈이 충분한 경우)
            if (GAME_DATA.player.money > POKER.roundBet) {
                document.getElementById('raise-btn').style.display = 'block';
            }
            break;
            
        case 'dealer-turn':
            // 딜러 턴 - 모든 버튼 비활성화
            break;
            
        case 'showdown':
            // 게임 종료 - 딜 버튼만 표시
            document.getElementById('deal-poker-btn').style.display = 'block';
            break;
    }
}

// 포커 베팅 실행
function placePokerBet(amount) {
    if (POKER.gameStage !== 'idle') return;
    
    // 금액 확인
    if (GAME_DATA.player.money < amount) {
        showToast('베팅할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 베팅 금액 추가
    POKER.currentBet += amount;
    document.getElementById('poker-bet').textContent = formatCurrency(POKER.currentBet);
    
    // 금액 차감
    GAME_DATA.player.money -= amount;
    updateUI();
    
    // 베팅 애니메이션
    const betOption = document.querySelector('#poker-game .bet-option');
    addChipAnimation(betOption, amount);
    
    // 효과음
    playSound('chip');
}

// 포커 게임 시작
function startPokerGame() {
    // 베팅 확인
    if (POKER.currentBet < POKER.minimumBet) {
        showToast(`최소 ${formatCurrency(POKER.minimumBet)} 이상 베팅해주세요.`, 'warning');
        return;
    }
    
    // 게임 상태 변경
    POKER.gameStage = 'dealing';
    
    // 팟에 베팅 금액 추가
    POKER.potAmount = POKER.currentBet;
    document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '카드 배분 중...';
    
    // 카드 딜
    dealPokerCards();
}

// 포커 카드 딜
function dealPokerCards() {
    // 플레이어 및 딜러에게 카드 5장씩 배분
    const playerCards = [];
    const dealerCards = [];
    
    for (let i = 0; i < 5; i++) {
        playerCards.push(POKER.deck.pop());
        dealerCards.push(POKER.deck.pop());
    }
    
    POKER.playerHand = playerCards;
    POKER.dealerHand = dealerCards;
    
    // 카드 패 표시 (플레이어)
    const playerCardsContainer = document.getElementById('player-poker-cards');
    playerCardsContainer.innerHTML = '';
    
    playerCards.forEach((card, index) => {
        const cardElement = createCardHTML(card);
        cardElement.style.opacity = '0';
        playerCardsContainer.appendChild(cardElement);
        
        // 카드 딜 애니메이션
        setTimeout(() => {
            cardElement.style.transition = 'all 0.5s ease';
            cardElement.style.opacity = '1';
            
            // 카드 내려오는 효과
            cardElement.style.transform = 'translateY(0)';
            cardElement.classList.add('dealt');
            
            // 효과음
            playSound('card_deal');
        }, index * 300);
    });
    
    // 카드 패 표시 (딜러 - 뒷면으로)
    const dealerCardsContainer = document.getElementById('dealer-poker-cards');
    dealerCardsContainer.innerHTML = '';
    
    dealerCards.forEach((card, index) => {
        const cardElement = createCardHTML(card, true); // 뒷면으로 표시
        cardElement.style.opacity = '0';
        dealerCardsContainer.appendChild(cardElement);
        
        // 카드 딜 애니메이션
        setTimeout(() => {
            cardElement.style.transition = 'all 0.5s ease';
            cardElement.style.opacity = '1';
            
            // 카드 내려오는 효과
            cardElement.style.transform = 'translateY(0)';
            cardElement.classList.add('dealt');
            
            // 효과음
            playSound('card_deal');
            
            // 마지막 카드 딜 후 게임 진행
            if (index === 4) {
                setTimeout(() => {
                    // 플레이어 핸드 평가
                    POKER.playerHandRank = evaluatePokerHand(POKER.playerHand);
                    document.getElementById('player-hand-name').textContent = getHandName(POKER.playerHandRank);
                    
                    // 게임 상태 변경
                    POKER.gameStage = 'player-turn';
                    POKER.currentTurn = 'player';
                    
                    // 딜러 상태 업데이트
                    document.getElementById('dealer-status').textContent = '플레이어 턴';
                    
                    // 카드 교체 여부 결정 (나중에 구현)
                    
                    // 버튼 상태 업데이트
                    updatePokerButtons('player-turn');
                    
                    // 특수 이벤트 알림
                    specialEventAnimation('당신의 턴입니다!', 'info');
                }, 500);
            }
        }, (index + 5) * 300); // 플레이어 카드가 모두 딜된 후 딜러 카드 배분
    });
}

// 포커 핸드 평가
function evaluatePokerHand(cards) {
    // 값과 무늬로 분리
    const values = cards.map(card => {
        // 값 숫자로 변환
        if (card.value === 'A') return 14; // 에이스는 14
        if (card.value === 'K') return 13;
        if (card.value === 'Q') return 12;
        if (card.value === 'J') return 11;
        return parseInt(card.value);
    });
    
    const suits = cards.map(card => card.suit);
    
    // 값 정렬 (내림차순)
    values.sort((a, b) => b - a);
    
    // 플러시 체크 (모든 카드가 같은 무늬)
    const isFlush = suits.every(suit => suit === suits[0]);
    
    // 스트레이트 체크 (연속된 값)
    let isStraight = true;
    for (let i = 1; i < values.length; i++) {
        if (values[i-1] !== values[i] + 1) {
            isStraight = false;
            break;
        }
    }
    
    // A-5-4-3-2 스트레이트 특별 처리
    if (!isStraight && values[0] === 14) {
        // 에이스를 1로 취급하고 다시 체크
        const lowAceValues = [5, 4, 3, 2, 1];
        isStraight = true;
        for (let i = 0; i < 5; i++) {
            if (values[i] !== (i === 0 ? 14 : lowAceValues[i-1])) {
                isStraight = false;
                break;
            }
        }
    }
    
    // 로얄 스트레이트 플러시
    if (isFlush && isStraight && values[0] === 14) {
        return { rank: HAND_RANKS.ROYAL_FLUSH, values };
    }
    
    // 스트레이트 플러시
    if (isFlush && isStraight) {
        return { rank: HAND_RANKS.STRAIGHT_FLUSH, values };
    }
    
    // 같은 값 개수 카운트
    const valueCounts = {};
    values.forEach(val => {
        valueCounts[val] = (valueCounts[val] || 0) + 1;
    });
    
    // 카운트별로 값 그룹화
    const groups = {};
    Object.keys(valueCounts).forEach(val => {
        const count = valueCounts[val];
        if (!groups[count]) groups[count] = [];
        groups[count].push(parseInt(val));
    });
    
    // 각 그룹 내부를 내림차순 정렬
    Object.keys(groups).forEach(count => {
        groups[count].sort((a, b) => b - a);
    });
    
    // 포카드 (같은 값 4장)
    if (groups[4]) {
        return { rank: HAND_RANKS.FOUR_OF_A_KIND, values: [...groups[4], ...(groups[1] || [])] };
    }
    
    // 풀하우스 (같은 값 3장 + 같은 값 2장)
    if (groups[3] && groups[2]) {
        return { rank: HAND_RANKS.FULL_HOUSE, values: [...groups[3], ...groups[2]] };
    }
    
    // 풀하우스 (같은 값 3장 + 같은 값 1장 + 같은 값 1장)
    if (groups[3] && groups[1] && groups[1].length === 2) {
        return { rank: HAND_RANKS.FULL_HOUSE, values: [...groups[3], groups[1][0]] };
    }
    
    // 플러시
    if (isFlush) {
        return { rank: HAND_RANKS.FLUSH, values };
    }
    
    // 스트레이트
    if (isStraight) {
        return { rank: HAND_RANKS.STRAIGHT, values };
    }
    
    // 트리플 (같은 값 3장)
    if (groups[3]) {
        return { rank: HAND_RANKS.THREE_OF_A_KIND, values: [...groups[3], ...(groups[1] || [])] };
    }
    
    // 투페어 (같은 값 2장 + 같은 값 2장)
    if (groups[2] && groups[2].length === 2) {
        return { rank: HAND_RANKS.TWO_PAIR, values: [...groups[2], ...(groups[1] || [])] };
    }
    
    // 원페어 (같은 값 2장)
    if (groups[2]) {
        return { rank: HAND_RANKS.ONE_PAIR, values: [...groups[2], ...(groups[1] || [])] };
    }
    
    // 하이카드
    return { rank: HAND_RANKS.HIGH_CARD, values };
}

// 핸드 랭크 이름 반환
function getHandName(handRank) {
    if (!handRank) return '';
    
    switch (handRank.rank) {
        case HAND_RANKS.ROYAL_FLUSH:
            return '로얄 스트레이트 플러시';
        case HAND_RANKS.STRAIGHT_FLUSH:
            return '스트레이트 플러시';
        case HAND_RANKS.FOUR_OF_A_KIND:
            return '포카드';
        case HAND_RANKS.FULL_HOUSE:
            return '풀하우스';
        case HAND_RANKS.FLUSH:
            return '플러시';
        case HAND_RANKS.STRAIGHT:
            return '스트레이트';
        case HAND_RANKS.THREE_OF_A_KIND:
            return '트리플';
        case HAND_RANKS.TWO_PAIR:
            return '투페어';
        case HAND_RANKS.ONE_PAIR:
            return '원페어';
        case HAND_RANKS.HIGH_CARD:
            return '하이카드';
        default:
            return '';
    }
}

// 플레이어 폴드
function playerFold() {
    if (POKER.gameStage !== 'player-turn' || POKER.currentTurn !== 'player') return;
    
    // 게임 상태 변경
    POKER.gameStage = 'showdown';
    
    // 특수 이벤트 알림
    specialEventAnimation('폴드!', 'error');
    
    // 폴드 효과음
    playSound('fold');
    
    // 딜러 패 공개
    revealDealerCards();
    
    // 게임 결과 처리 (플레이어 패)
    setTimeout(() => {
        // 딜러 승리
        showToast('폴드하여 게임에서 패배했습니다.', 'error');
        
        // 딜러 상태 업데이트
        document.getElementById('dealer-status').textContent = '승리';
        
        // 효과음
        playSound('lose');
        
        // 게임 이력 업데이트
        updatePokerHistory('loss');
        
        // 통계 업데이트
        GAME_DATA.player.stats.poker.losses++;
        GAME_DATA.player.stats.poker.totalGames++;
        GAME_DATA.player.stats.poker.moneyLost += POKER.currentBet;
        
        // 데이터 변경 알림
        onDataChange();
        
        // 버튼 상태 업데이트
        updatePokerButtons('showdown');
    }, 1500);
}

// 플레이어 체크
function playerCheck() {
    if (POKER.gameStage !== 'player-turn' || POKER.currentTurn !== 'player') return;
    
    // 특수 이벤트 알림
    specialEventAnimation('체크!', 'info');
    
    // 효과음
    playSound('check');
    
    // 라운드 베팅 없으면 체크 가능
    if (POKER.roundBet === 0) {
        // 턴 넘기기
        POKER.currentTurn = 'dealer';
        
        // 딜러 상태 업데이트
        document.getElementById('dealer-status').textContent = '딜러 턴';
        
        // 버튼 상태 업데이트
        updatePokerButtons('dealer-turn');
        
        // 딜러 턴 시작
        setTimeout(dealerTurn, 1500);
    } else {
        // 라운드 베팅이 있으면 체크 불가 (콜해야 함)
        showToast('라운드 베팅이 있을 때는 체크할 수 없습니다.', 'warning');
    }
}

// 플레이어 콜
function playerCall() {
    if (POKER.gameStage !== 'player-turn' || POKER.currentTurn !== 'player') return;
    
    // 콜 금액 (라운드 베팅만큼)
    const callAmount = POKER.roundBet;
    
    // 보유 금액 확인
    if (GAME_DATA.player.money < callAmount) {
        showToast('콜할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 금액 차감
    GAME_DATA.player.money -= callAmount;
    updateUI();
    
    // 팟에 금액 추가
    POKER.potAmount += callAmount;
    document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
    
    // 특수 이벤트 알림
    specialEventAnimation('콜!', 'info');
    
    // 효과음
    playSound('call');
    
    // 턴 넘기기
    POKER.currentTurn = 'dealer';
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '딜러 턴';
    
    // 버튼 상태 업데이트
    updatePokerButtons('dealer-turn');
    
    // 딜러 턴 시작
    setTimeout(dealerTurn, 1500);
}

// 레이즈 컨트롤 토글
function toggleRaiseControls() {
    const raiseControls = document.getElementById('poker-raise-controls');
    
    if (raiseControls.style.display === 'none' || raiseControls.style.display === '') {
        // 레이즈 컨트롤 표시
        raiseControls.style.display = 'flex';
        
        // 초기 레이즈 금액 설정 (라운드 베팅의 2배 또는 최소 베팅액)
        const initialRaise = Math.max(POKER.roundBet * 2, POKER.minimumBet);
        const raiseSlider = document.getElementById('raise-slider');
        
        // 최대 레이즈 금액 (보유 금액)
        const maxRaise = Math.min(100000, GAME_DATA.player.money);
        
        // 슬라이더 설정
        raiseSlider.min = initialRaise;
        raiseSlider.max = maxRaise;
        raiseSlider.value = initialRaise;
        
        // 표시 금액 업데이트
        document.getElementById('raise-amount').textContent = formatCurrency(initialRaise);
        POKER.raiseAmount = initialRaise;
        
        // 레이즈 버튼 변경
        document.getElementById('raise-btn').textContent = '레이즈 확정';
        
        // 레이즈 버튼 클릭 이벤트 변경
        document.getElementById('raise-btn').onclick = playerRaise;
    } else {
        // 레이즈 컨트롤 숨기기
        raiseControls.style.display = 'none';
        
        // 레이즈 버튼 복원
        document.getElementById('raise-btn').textContent = '레이즈';
        
        // 레이즈 버튼 클릭 이벤트 복원
        document.getElementById('raise-btn').onclick = toggleRaiseControls;
    }
}

// 플레이어 레이즈
function playerRaise() {
    if (POKER.gameStage !== 'player-turn' || POKER.currentTurn !== 'player') return;
    
    // 레이즈 금액
    const raiseAmount = POKER.raiseAmount;
    
    // 보유 금액 확인
    if (GAME_DATA.player.money < raiseAmount) {
        showToast('레이즈할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 레이즈 컨트롤 숨기기
    document.getElementById('poker-raise-controls').style.display = 'none';
    
    // 레이즈 버튼 복원
    document.getElementById('raise-btn').textContent = '레이즈';
    document.getElementById('raise-btn').onclick = toggleRaiseControls;
    
    // 금액 차감
    GAME_DATA.player.money -= raiseAmount;
    updateUI();
    
    // 팟에 금액 추가
    POKER.potAmount += raiseAmount;
    document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
    
    // 라운드 베팅 업데이트
    POKER.roundBet = raiseAmount;
    
    // 특수 이벤트 알림
    specialEventAnimation(`레이즈! ${formatCurrency(raiseAmount)}`, 'info');
    
    // 효과음
    playSound('raise');
    
    // 턴 넘기기
    POKER.currentTurn = 'dealer';
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '딜러 턴';
    
    // 버튼 상태 업데이트
    updatePokerButtons('dealer-turn');
    
    // 딜러 턴 시작
    setTimeout(dealerTurn, 1500);
}

// 딜러 턴
function dealerTurn() {
    if (POKER.currentTurn !== 'dealer') return;
    
    // 딜러 패 공개
    revealDealerCards();
    
    // 딜러 핸드 평가
    POKER.dealerHandRank = evaluatePokerHand(POKER.dealerHand);
    document.getElementById('dealer-hand-name').textContent = getHandName(POKER.dealerHandRank);
    
    // 딜러의 게임 로직 (간단한 AI)
    setTimeout(() => {
        // 딜러 핸드 랭크에 따른 전략
        const dealerRank = POKER.dealerHandRank.rank;
        
        // 라운드 베팅이 있는 경우
        if (POKER.roundBet > 0) {
            // 좋은 패를 가진 경우 레이즈
            if (dealerRank >= HAND_RANKS.TWO_PAIR) {
                // 레이즈 금액 (라운드 베팅의 2배)
                const raiseAmount = POKER.roundBet * 2;
                
                // 팟에 금액 추가
                POKER.potAmount += raiseAmount;
                document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
                
                // 라운드 베팅 업데이트
                POKER.roundBet = raiseAmount;
                
                // 특수 이벤트 알림
                specialEventAnimation(`딜러 레이즈! ${formatCurrency(raiseAmount)}`, 'warning');
                
                // 효과음
                playSound('raise');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '레이즈';
                
                // 턴 넘기기
                POKER.currentTurn = 'player';
                
                // 버튼 상태 업데이트
                updatePokerButtons('player-turn');
            }
            // 중간 패를 가진 경우 콜
            else if (dealerRank >= HAND_RANKS.ONE_PAIR) {
                // 콜 금액 (라운드 베팅만큼)
                const callAmount = POKER.roundBet;
                
                // 팟에 금액 추가
                POKER.potAmount += callAmount;
                document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
                
                // 특수 이벤트 알림
                specialEventAnimation('딜러 콜!', 'info');
                
                // 효과음
                playSound('call');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '콜';
                
                // 쇼다운으로 진행
                setTimeout(showdown, 1000);
            }
            // 약한 패를 가진 경우 폴드
            else {
                // 특수 이벤트 알림
                specialEventAnimation('딜러 폴드!', 'success');
                
                // 효과음
                playSound('fold');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '폴드';
                
                // 플레이어 승리
                setTimeout(() => {
                    // 승리 메시지
                    specialEventAnimation('딜러가 폴드하여 승리!', 'success');
                    
                    // 상금 지급 (팟 전액)
                    const winAmount = POKER.potAmount;
                    GAME_DATA.player.money += winAmount;
                    updateUI();
                    
                    // 돈 변화 애니메이션
                    moneyChangeAnimation(winAmount);
                    
                    // 효과음
                    playSound('win');
                    
                    // 게임 이력 업데이트
                    updatePokerHistory('win');
                    
                    // 통계 업데이트
                    GAME_DATA.player.stats.poker.wins++;
                    GAME_DATA.player.stats.poker.totalGames++;
                    GAME_DATA.player.stats.poker.moneyWon += winAmount;
                    
                    // 데이터 변경 알림
                    onDataChange();
                    
                    // 게임 상태 변경
                    POKER.gameStage = 'showdown';
                    
                    // 버튼 상태 업데이트
                    updatePokerButtons('showdown');
                }, 1000);
            }
        }
        // 라운드 베팅이 없는 경우 (체크 또는 첫 턴)
        else {
            // 좋은 패를 가진 경우 베팅
            if (dealerRank >= HAND_RANKS.TWO_PAIR) {
                // 베팅 금액 (최소 베팅액의 2배)
                const betAmount = POKER.minimumBet * 2;
                
                // 팟에 금액 추가
                POKER.potAmount += betAmount;
                document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
                
                // 라운드 베팅 업데이트
                POKER.roundBet = betAmount;
                
                // 특수 이벤트 알림
                specialEventAnimation(`딜러 베팅! ${formatCurrency(betAmount)}`, 'warning');
                
                // 효과음
                playSound('chip');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '베팅';
                
                // 턴 넘기기
                POKER.currentTurn = 'player';
                
                // 버튼 상태 업데이트
                updatePokerButtons('player-turn');
            }
            // 중간 패를 가진 경우 작은 베팅
            else if (dealerRank >= HAND_RANKS.ONE_PAIR) {
                // 베팅 금액 (최소 베팅액)
                const betAmount = POKER.minimumBet;
                
                // 팟에 금액 추가
                POKER.potAmount += betAmount;
                document.getElementById('poker-pot').textContent = formatCurrency(POKER.potAmount);
                
                // 라운드 베팅 업데이트
                POKER.roundBet = betAmount;
                
                // 특수 이벤트 알림
                specialEventAnimation(`딜러 베팅! ${formatCurrency(betAmount)}`, 'info');
                
                // 효과음
                playSound('chip');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '베팅';
                
                // 턴 넘기기
                POKER.currentTurn = 'player';
                
                // 버튼 상태 업데이트
                updatePokerButtons('player-turn');
            }
            // 약한 패를 가진 경우 체크
            else {
                // 특수 이벤트 알림
                specialEventAnimation('딜러 체크!', 'info');
                
                // 효과음
                playSound('check');
                
                // 딜러 상태 업데이트
                document.getElementById('dealer-status').textContent = '체크';
                
                // 쇼다운으로 진행
                setTimeout(showdown, 1000);
            }
        }
    }, 1500);
}

// 딜러 카드 공개
function revealDealerCards() {
    const dealerCards = document.querySelectorAll('#dealer-poker-cards .card');
    
    dealerCards.forEach((cardElement, index) => {
        // 카드 뒤집기 애니메이션
        setTimeout(() => {
            cardElement.classList.remove('hidden');
            cardElement.querySelector('.front').style.transform = 'rotateY(0deg)';
            cardElement.querySelector('.back').style.transform = 'rotateY(180deg)';
            
            // 효과음
            playSound('card_flip');
        }, index * 300);
    });
}

// 쇼다운 (결과 비교)
function showdown() {
    // 게임 상태 변경
    POKER.gameStage = 'showdown';
    
    // 카드 패 공개 (이미 공개된 상태)
    
    // 결과 비교
    const playerRank = POKER.playerHandRank.rank;
    const dealerRank = POKER.dealerHandRank.rank;
    
    // 핸드 랭크가 높은 쪽이 승리
    if (playerRank > dealerRank) {
        // 플레이어 승리
        playerWin();
    } else if (playerRank < dealerRank) {
        // 딜러 승리
        dealerWin();
    } else {
        // 랭크가 같은 경우, 높은 카드 비교
        const playerValues = POKER.playerHandRank.values;
        const dealerValues = POKER.dealerHandRank.values;
        
        let winner = null;
        for (let i = 0; i < playerValues.length; i++) {
            if (playerValues[i] > dealerValues[i]) {
                winner = 'player';
                break;
            } else if (playerValues[i] < dealerValues[i]) {
                winner = 'dealer';
                break;
            }
        }
        
        if (winner === 'player') {
            // 플레이어 승리
            playerWin();
        } else if (winner === 'dealer') {
            // 딜러 승리
            dealerWin();
        } else {
            // 무승부
            tie();
        }
    }
}

// 플레이어 승리 처리
function playerWin() {
    // 승리 메시지
    specialEventAnimation('승리!', 'success');
    
    // 상금 지급 (팟 전액)
    const winAmount = POKER.potAmount;
    GAME_DATA.player.money += winAmount;
    updateUI();
    
    // 돈 변화 애니메이션
    moneyChangeAnimation(winAmount);
    
    // 효과음
    playSound('win');
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '패배';
    
    // 게임 이력 업데이트
    updatePokerHistory('win');
    
    // 통계 업데이트
    GAME_DATA.player.stats.poker.wins++;
    GAME_DATA.player.stats.poker.totalGames++;
    GAME_DATA.player.stats.poker.moneyWon += winAmount;
    
    // 최고 승리 금액 업데이트
    if (winAmount > GAME_DATA.player.stats.poker.maxWin) {
        GAME_DATA.player.stats.poker.maxWin = winAmount;
    }
    
    // 데이터 변경 알림
    onDataChange();
    
    // 버튼 상태 업데이트
    updatePokerButtons('showdown');
}

// 딜러 승리 처리
function dealerWin() {
    // 패배 메시지
    specialEventAnimation('패배!', 'error');
    
    // 효과음
    playSound('lose');
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '승리';
    
    // 게임 이력 업데이트
    updatePokerHistory('loss');
    
    // 통계 업데이트
    GAME_DATA.player.stats.poker.losses++;
    GAME_DATA.player.stats.poker.totalGames++;
    GAME_DATA.player.stats.poker.moneyLost += POKER.currentBet;
    
    // 데이터 변경 알림
    onDataChange();
    
    // 버튼 상태 업데이트
    updatePokerButtons('showdown');
}

// 무승부 처리
function tie() {
    // 무승부 메시지
    specialEventAnimation('무승부!', 'info');
    
    // 베팅 금액 반환 (시작 베팅만)
    GAME_DATA.player.money += POKER.currentBet;
    updateUI();
    
    // 효과음
    playSound('push');
    
    // 딜러 상태 업데이트
    document.getElementById('dealer-status').textContent = '무승부';
    
    // 게임 이력 업데이트
    updatePokerHistory('push');
    
    // 통계 업데이트
    GAME_DATA.player.stats.poker.pushes++;
    GAME_DATA.player.stats.poker.totalGames++;
    
    // 데이터 변경 알림
    onDataChange();
    
    // 버튼 상태 업데이트
    updatePokerButtons('showdown');
}

// 포커 이력 UI 업데이트
function updatePokerHistory(result) {
    const historyContainer = document.getElementById('poker-history');
    if (!historyContainer) return;
    
    // 새 이력 아이콘 생성
    const icon = document.createElement('div');
    icon.className = 'history-icon';
    
    // 결과에 따라 클래스 추가
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

// 포커 게임 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initPoker);
