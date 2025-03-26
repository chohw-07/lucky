/**
 * 블랙잭 게임 로직
 */

// 블랙잭 게임 상태
const BLACKJACK = {
    deck: [],           // 카드 덱
    playerCards: [],    // 플레이어 카드
    dealerCards: [],    // 딜러 카드
    playerScore: 0,     // 플레이어 점수
    dealerScore: 0,     // 딜러 점수
    bet: 0,             // 현재 베팅 금액
    isGameInProgress: false, // 게임 진행 중 여부
    canDouble: false,   // 더블 가능 여부
    playerBlackjack: false, // 플레이어 블랙잭
    dealerBlackjack: false, // 딜러 블랙잭
    result: '',         // 게임 결과
    dealerHiddenCard: null // 딜러의 숨겨진 카드
};

// 블랙잭 게임 초기화
function initBlackjack() {
    // 게임 상태 초기화
    resetBlackjackGame();
    
    // 칩 선택 이벤트
    const chips = document.querySelectorAll('#blackjack-game .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (BLACKJACK.isGameInProgress) return;
            
            const chipValue = parseInt(chip.dataset.value);
            placeBlackjackBet(chipValue);
        });
    });
    
    // 베팅 취소 버튼 이벤트
    const clearBetBtn = document.getElementById('bj-clear-bet');
    clearBetBtn.addEventListener('click', clearBlackjackBet);
    
    // 딜 버튼 이벤트
    const dealBtn = document.getElementById('bj-deal-btn');
    dealBtn.addEventListener('click', startBlackjackGame);
    
    // 게임 액션 버튼 이벤트
    document.getElementById('hit-btn').addEventListener('click', playerHit);
    document.getElementById('stand-btn').addEventListener('click', playerStand);
    document.getElementById('double-btn').addEventListener('click', playerDouble);
}

// 블랙잭 게임 리셋
function resetBlackjackGame() {
    // 카드 덱 생성 및 셔플
    BLACKJACK.deck = shuffleDeck(createDeck());
    
    // 카드 및 점수 초기화
    BLACKJACK.playerCards = [];
    BLACKJACK.dealerCards = [];
    BLACKJACK.playerScore = 0;
    BLACKJACK.dealerScore = 0;
    
    // 게임 상태 초기화
    BLACKJACK.bet = 0;
    BLACKJACK.isGameInProgress = false;
    BLACKJACK.canDouble = false;
    BLACKJACK.playerBlackjack = false;
    BLACKJACK.dealerBlackjack = false;
    BLACKJACK.result = '';
    BLACKJACK.dealerHiddenCard = null;
    
    // UI 초기화
    document.getElementById('bj-player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('bj-player-total').textContent = '0';
    document.getElementById('dealer-total').textContent = '0';
    document.getElementById('blackjack-bet').textContent = '₩0';
    
    // 결과 표시 숨기기
    const resultDisplay = document.getElementById('bj-result-display');
    resultDisplay.classList.remove('show');
    
    // 게임 버튼 숨기기
    document.querySelectorAll('#blackjack-game .game-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // 딜 및 취소 버튼 표시
    document.getElementById('bj-deal-btn').classList.remove('hidden');
    document.getElementById('bj-clear-bet').classList.remove('hidden');
}

// 블랙잭 베팅 실행
function placeBlackjackBet(amount) {
    if (BLACKJACK.isGameInProgress) return;
    
    // 금액 확인
    if (GAME_DATA.player.money < amount) {
        showToast('베팅할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 베팅 금액 추가
    BLACKJACK.bet += amount;
    document.getElementById('blackjack-bet').textContent = formatCurrency(BLACKJACK.bet);
    
    // 베팅 애니메이션
    addChipAnimation(document.querySelector('#blackjack-game .bet-option[data-bet="blackjack"]'), amount);
    
    // 금액 차감
    GAME_DATA.player.money -= amount;
    updateUI();
    
    // 효과음 재생
    playSound('chip');
}

// 블랙잭 베팅 취소
function clearBlackjackBet() {
    if (BLACKJACK.isGameInProgress) return;
    
    // 베팅 금액 반환
    GAME_DATA.player.money += BLACKJACK.bet;
    
    // 베팅 초기화
    BLACKJACK.bet = 0;
    document.getElementById('blackjack-bet').textContent = '₩0';
    
    updateUI();
    
    // 효과음 재생
    playSound('bet_clear');
    
    // 알림 표시
    showToast('베팅이 취소되었습니다.', 'info');
}

// 블랙잭 게임 시작
function startBlackjackGame() {
    // 베팅 확인
    if (BLACKJACK.bet === 0) {
        showToast('베팅 후 게임을 시작해주세요.', 'warning');
        return;
    }
    
    // 게임 진행 상태 설정
    BLACKJACK.isGameInProgress = true;
    
    // 딜 및 취소 버튼 숨기기
    document.getElementById('bj-deal-btn').classList.add('hidden');
    document.getElementById('bj-clear-bet').classList.add('hidden');
    
    // 카드 컨테이너 참조
    const playerCardsContainer = document.getElementById('bj-player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    
    // 카드 컨테이너 초기화
    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    
    // 결과 표시 숨기기
    const resultDisplay = document.getElementById('bj-result-display');
    resultDisplay.classList.remove('show');
    
    // 게임 시작 알림
    specialEventAnimation('게임 시작!', 'info');
    
    // 초기 카드 배포 (2장씩)
    setTimeout(() => {
        // 플레이어 첫 번째 카드
        const playerCard1 = BLACKJACK.deck.pop();
        BLACKJACK.playerCards.push(playerCard1);
        dealCardAnimation(playerCard1, playerCardsContainer, 0);
        
        // 딜러 첫 번째 카드 (앞면)
        setTimeout(() => {
            const dealerCard1 = BLACKJACK.deck.pop();
            BLACKJACK.dealerCards.push(dealerCard1);
            dealCardAnimation(dealerCard1, dealerCardsContainer, 0);
            
            // 플레이어 두 번째 카드
            setTimeout(() => {
                const playerCard2 = BLACKJACK.deck.pop();
                BLACKJACK.playerCards.push(playerCard2);
                dealCardAnimation(playerCard2, playerCardsContainer, 0);
                
                // 딜러 두 번째 카드 (뒷면)
                setTimeout(() => {
                    const dealerCard2 = BLACKJACK.deck.pop();
                    BLACKJACK.dealerCards.push(dealerCard2);
                    BLACKJACK.dealerHiddenCard = dealerCard2;
                    dealCardAnimation(dealerCard2, dealerCardsContainer, 0, true);
                    
                    // 초기 점수 계산
                    setTimeout(() => {
                        calculateBlackjackScores();
                        updateBlackjackScores(true); // 딜러 카드 숨김
                        
                        // 블랙잭 체크
                        setTimeout(() => {
                            checkInitialBlackjack();
                        }, 1000);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}

// 블랙잭 점수 계산
function calculateBlackjackScores() {
    // 플레이어 점수
    BLACKJACK.playerScore = calculateBlackjackHandValue(BLACKJACK.playerCards);
    
    // 딜러 점수 (숨김 카드 포함/제외)
    BLACKJACK.dealerScore = calculateBlackjackHandValue(BLACKJACK.dealerCards);
}

// 블랙잭 핸드 값 계산
function calculateBlackjackHandValue(cards) {
    let total = 0;
    let aces = 0;
    
    // 먼저 에이스를 제외한 모든 카드의 값 합산
    for (const card of cards) {
        let value = 0;
        if (['J', 'Q', 'K'].includes(card.value)) {
            value = 10;
        } else if (card.value === 'A') {
            value = 11; // 에이스는 일단 11로 계산
            aces++;
        } else {
            value = parseInt(card.value);
        }
        
        total += value;
    }
    
    // 21을 초과하면 에이스를 1로 계산 (필요한 만큼)
    while (total > 21 && aces > 0) {
        total -= 10; // 11에서 1로 변경하므로 10 감소
        aces--;
    }
    
    return total;
}

// 블랙잭 점수 UI 업데이트
function updateBlackjackScores(hideDealer = false) {
    document.getElementById('bj-player-total').textContent = BLACKJACK.playerScore;
    
    if (hideDealer) {
        // 딜러의 첫 번째 카드만 공개된 상태에서의 점수 계산
        const visibleCards = [BLACKJACK.dealerCards[0]];
        const visibleScore = calculateBlackjackHandValue(visibleCards);
        document.getElementById('dealer-total').textContent = `${visibleScore}+?`;
    } else {
        document.getElementById('dealer-total').textContent = BLACKJACK.dealerScore;
    }
}

// 초기 블랙잭 확인
function checkInitialBlackjack() {
    // 플레이어 블랙잭 확인
    BLACKJACK.playerBlackjack = (BLACKJACK.playerScore === 21 && BLACKJACK.playerCards.length === 2);
    
    // 딜러 블랙잭 확인
    BLACKJACK.dealerBlackjack = (BLACKJACK.dealerScore === 21 && BLACKJACK.dealerCards.length === 2);
    
    if (BLACKJACK.playerBlackjack || BLACKJACK.dealerBlackjack) {
        // 딜러의 숨겨진 카드 공개
        revealDealerCard();
        
        // 블랙잭 결과 처리
        setTimeout(() => {
            if (BLACKJACK.playerBlackjack) {
                // 플레이어 블랙잭 애니메이션
                blackjackAnimation();
            }
            
            // 게임 종료
            setTimeout(() => {
                endBlackjackGame();
            }, 1500);
        }, 1000);
    } else {
        // 플레이어 선택 버튼 표시
        showPlayerOptions();
    }
}

// 딜러의 숨겨진 카드 공개
function revealDealerCard() {
    const hiddenCard = document.querySelector('#dealer-cards .card.hidden');
    if (hiddenCard) {
        flipCardAnimation(hiddenCard);
        
        // 점수 업데이트 (딜러 카드 공개)
        setTimeout(() => {
            updateBlackjackScores(false);
        }, 300);
    }
}

// 플레이어 선택 버튼 표시
function showPlayerOptions() {
    // 히트/스탠드 버튼 표시
    document.getElementById('hit-btn').classList.remove('hidden');
    document.getElementById('stand-btn').classList.remove('hidden');
    
    // 더블 가능 여부 확인 (첫 두 장에만 가능)
    if (BLACKJACK.playerCards.length === 2 && GAME_DATA.player.money >= BLACKJACK.bet) {
        document.getElementById('double-btn').classList.remove('hidden');
        BLACKJACK.canDouble = true;
    } else {
        document.getElementById('double-btn').classList.add('hidden');
        BLACKJACK.canDouble = false;
    }
}

// 플레이어 히트
function playerHit() {
    if (!BLACKJACK.isGameInProgress) return;
    
    // 더블 버튼 숨기기 (첫 히트 이후 더블 불가)
    document.getElementById('double-btn').classList.add('hidden');
    BLACKJACK.canDouble = false;
    
    // 카드 한 장 추가
    const card = BLACKJACK.deck.pop();
    BLACKJACK.playerCards.push(card);
    
    // 카드 애니메이션
    const playerCardsContainer = document.getElementById('bj-player-cards');
    dealCardAnimation(card, playerCardsContainer, 0);
    
    // 효과음 재생
    playSound('card_deal');
    
    // 점수 계산
    setTimeout(() => {
        calculateBlackjackScores();
        updateBlackjackScores(true);
        
        // 버스트 또는 21 확인
        if (BLACKJACK.playerScore > 21) {
            // 버스트
            showToast('버스트!', 'error');
            specialEventAnimation('버스트!', 'error');
            
            // 게임 버튼 숨기기
            hideGameButtons();
            
            // 게임 종료
            setTimeout(() => {
                // 딜러 카드 공개
                revealDealerCard();
                
                setTimeout(() => {
                    endBlackjackGame();
                }, 1000);
            }, 1000);
        } else if (BLACKJACK.playerScore === 21) {
            // 21 도달 (자동 스탠드)
            showToast('21 도달!', 'success');
            specialEventAnimation('21!', 'success');
            
            // 게임 버튼 숨기기
            hideGameButtons();
            
            // 자동 스탠드
            setTimeout(() => {
                playerStand();
            }, 1000);
        }
    }, 500);
}

// 플레이어 스탠드
function playerStand() {
    if (!BLACKJACK.isGameInProgress) return;
    
    // 게임 버튼 숨기기
    hideGameButtons();
    
    // 스탠드 알림
    showToast('스탠드', 'info');
    specialEventAnimation('스탠드!', 'info');
    
    // 딜러 카드 공개
    setTimeout(() => {
        revealDealerCard();
        
        // 딜러 턴
        setTimeout(() => {
            dealerTurn();
        }, 1000);
    }, 500);
}

// 플레이어 더블
function playerDouble() {
    if (!BLACKJACK.isGameInProgress || !BLACKJACK.canDouble) return;
    
    // 베팅 금액 확인
    if (GAME_DATA.player.money < BLACKJACK.bet) {
        showToast('더블 베팅에 필요한 금액이 부족합니다.', 'error');
        return;
    }
    
    // 베팅 금액 추가
    GAME_DATA.player.money -= BLACKJACK.bet;
    BLACKJACK.bet *= 2;
    
    // 베팅 표시 업데이트
    document.getElementById('blackjack-bet').textContent = formatCurrency(BLACKJACK.bet);
    updateUI();
    
    // 더블 알림
    showToast('더블!', 'info');
    specialEventAnimation('더블!', 'warning');
    
    // 카드 한 장만 추가하고 스탠드
    setTimeout(() => {
        // 게임 버튼 숨기기
        hideGameButtons();
        
        // 마지막 카드 추가
        const card = BLACKJACK.deck.pop();
        BLACKJACK.playerCards.push(card);
        
        // 카드 애니메이션
        const playerCardsContainer = document.getElementById('bj-player-cards');
        dealCardAnimation(card, playerCardsContainer, 0);
        
        // 효과음 재생
        playSound('card_deal');
        
        // 점수 계산
        setTimeout(() => {
            calculateBlackjackScores();
            updateBlackjackScores(true);
            
            // 버스트 확인
            if (BLACKJACK.playerScore > 21) {
                // 버스트
                showToast('버스트!', 'error');
                specialEventAnimation('버스트!', 'error');
                
                // 게임 종료
                setTimeout(() => {
                    // 딜러 카드 공개
                    revealDealerCard();
                    
                    setTimeout(() => {
                        endBlackjackGame();
                    }, 1000);
                }, 1000);
            } else {
                // 스탠드로 진행
                setTimeout(() => {
                    // 딜러 카드 공개
                    revealDealerCard();
                    
                    // 딜러 턴
                    setTimeout(() => {
                        dealerTurn();
                    }, 1000);
                }, 1000);
            }
        }, 500);
    }, 500);
}

// 게임 버튼 숨기기
function hideGameButtons() {
    document.querySelectorAll('#blackjack-game .game-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
}

// 딜러 턴
function dealerTurn() {
    // 플레이어가 버스트인 경우 딜러는 카드를 뽑지 않음
    if (BLACKJACK.playerScore > 21) {
        endBlackjackGame();
        return;
    }
    
    // 딜러가 17 미만이면 카드를 계속 뽑음
    if (BLACKJACK.dealerScore < 17) {
        // 딜러 히트 알림
        specialEventAnimation('딜러 히트', 'info');
        
        // 카드 추가
        const card = BLACKJACK.deck.pop();
        BLACKJACK.dealerCards.push(card);
        
        // 카드 애니메이션
        const dealerCardsContainer = document.getElementById('dealer-cards');
        dealCardAnimation(card, dealerCardsContainer, 0);
        
        // 효과음 재생
        playSound('card_deal');
        
        // 점수 계산
        setTimeout(() => {
            calculateBlackjackScores();
            updateBlackjackScores(false);
            
            // 다음 턴
            setTimeout(() => {
                dealerTurn();
            }, 1000);
        }, 500);
    } else {
        // 딜러 스탠드 알림
        specialEventAnimation('딜러 스탠드', 'info');
        
        // 게임 종료
        setTimeout(() => {
            endBlackjackGame();
        }, 1000);
    }
}

// 블랙잭 게임 종료
function endBlackjackGame() {
    let resultText = '';
    let isWin = false;
    
    // 결과 계산
    if (BLACKJACK.playerScore > 21) {
        BLACKJACK.result = 'loss';
        resultText = '버스트! 패배';
        isWin = false;
    } else if (BLACKJACK.dealerScore > 21) {
        BLACKJACK.result = 'win';
        resultText = '딜러 버스트! 승리';
        isWin = true;
    } else if (BLACKJACK.playerBlackjack && !BLACKJACK.dealerBlackjack) {
        BLACKJACK.result = 'blackjack';
        resultText = '블랙잭! 승리';
        isWin = true;
    } else if (!BLACKJACK.playerBlackjack && BLACKJACK.dealerBlackjack) {
        BLACKJACK.result = 'loss';
        resultText = '딜러 블랙잭! 패배';
        isWin = false;
    } else if (BLACKJACK.playerBlackjack && BLACKJACK.dealerBlackjack) {
        BLACKJACK.result = 'push';
        resultText = '블랙잭 푸시';
        isWin = null;
    } else if (BLACKJACK.playerScore > BLACKJACK.dealerScore) {
        BLACKJACK.result = 'win';
        resultText = '승리!';
        isWin = true;
    } else if (BLACKJACK.playerScore < BLACKJACK.dealerScore) {
        BLACKJACK.result = 'loss';
        resultText = '패배';
        isWin = false;
    } else {
        BLACKJACK.result = 'push';
        resultText = '푸시';
        isWin = null;
    }
    
    // 결과 표시
    showResultAnimation(document.getElementById('blackjack-game'), resultText, isWin);
    
    // 베팅 결과 정산
    setTimeout(() => {
        settleBlackjackBets();
        
        // 게임 이력 업데이트
        GAME_DATA.player.history.blackjack.push(BLACKJACK.result);
        updateHistoryAnimation(document.getElementById('blackjack-history'), BLACKJACK.result, 'blackjack');
        
        // 통계 업데이트
        switch (BLACKJACK.result) {
            case 'win':
                GAME_DATA.player.stats.blackjack.wins++;
                break;
            case 'loss':
                GAME_DATA.player.stats.blackjack.losses++;
                break;
            case 'push':
                GAME_DATA.player.stats.blackjack.pushes++;
                break;
            case 'blackjack':
                GAME_DATA.player.stats.blackjack.wins++;
                GAME_DATA.player.stats.blackjack.blackjacks++;
                break;
        }
        
        // 게임 카운트 증가
        GAME_DATA.player.stats.blackjack.totalGames++;
        
        // UI 업데이트
        updateUI();
        
        // 딜 및 취소 버튼 다시 표시
        document.getElementById('bj-deal-btn').classList.remove('hidden');
        document.getElementById('bj-clear-bet').classList.remove('hidden');
        
        // 게임 종료 알림
        specialEventAnimation('게임 종료!', 'info');
        
        // 게임 상태 초기화
        setTimeout(() => {
            resetBlackjackGame();
        }, 3000);
        
        // 로그 전송
        sendLog({
            type: 'GAME_COMPLETED',
            action: '블랙잭 게임 완료',
            details: `결과: ${BLACKJACK.result}, 플레이어 스코어: ${BLACKJACK.playerScore}, 딜러 스코어: ${BLACKJACK.dealerScore}`
        });
        
        // 데이터 변경 알림
        onDataChange();
    }, 2000);
}

// 블랙잭 베팅 정산
function settleBlackjackBets() {
    let winAmount = 0;
    
    // 결과별 정산
    switch (BLACKJACK.result) {
        case 'win':
            // 일반 승리 (2배)
            winAmount = Math.floor(BLACKJACK.bet * ODDS.blackjack.win);
            
            // 베팅 금액 포함 반환
            GAME_DATA.player.money += (BLACKJACK.bet + winAmount);
            
            // 통계 업데이트
            GAME_DATA.player.stats.blackjack.moneyWon += winAmount;
            break;
        
        case 'blackjack':
            // 블랙잭 승리 (2.5배)
            winAmount = Math.floor(BLACKJACK.bet * ODDS.blackjack.blackjack);
            
            // 베팅 금액 포함 반환
            GAME_DATA.player.money += (BLACKJACK.bet + winAmount);
            
            // 통계 업데이트
            GAME_DATA.player.stats.blackjack.moneyWon += winAmount;
            break;
        
        case 'push':
            // 푸시 (원금 반환)
            GAME_DATA.player.money += BLACKJACK.bet;
            break;
        
        case 'loss':
            // 패배 (베팅 금액 잃음)
            GAME_DATA.player.stats.blackjack.moneyLost += BLACKJACK.bet;
            break;
    }
    
    // 전체 이익이 있으면 애니메이션 표시
    if (winAmount > 0) {
        // 돈 변화 애니메이션
        moneyChangeAnimation(winAmount);
        
        // 승리 메시지
        const winMessage = winAmount >= 100000 ? '대박 승리!' : '승리!';
        specialEventAnimation(winMessage, 'success');
        
        // 큰 금액 승리 시 추가 효과
        if (winAmount >= 500000) {
            // 배경 효과
            document.body.classList.add('bg-pulse');
            setTimeout(() => {
                document.body.classList.remove('bg-pulse');
            }, 5000);
            
            // 추가 알림
            setTimeout(() => {
                specialEventAnimation('대박 승리! ' + formatCurrency(winAmount), 'success');
            }, 1500);
        }
    } else if (BLACKJACK.result === 'loss') {
        // 패배 알림
        if (BLACKJACK.bet >= 100000) {
            specialEventAnimation('큰 손실이 발생했습니다...', 'error');
            moneyChangeAnimation(-BLACKJACK.bet);
        }
    }
}

// 블랙잭 게임 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initBlackjack);
