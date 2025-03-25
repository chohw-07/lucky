/**
 * 바카라 게임 로직
 */

// 바카라 게임 상태
const BACCARAT = {
    deck: [],            // 카드 덱
    playerCards: [],     // 플레이어 카드
    bankerCards: [],     // 뱅커 카드
    playerScore: 0,      // 플레이어 점수
    bankerScore: 0,      // 뱅커 점수
    playerBet: 0,        // 플레이어 베팅 금액
    bankerBet: 0,        // 뱅커 베팅 금액
    tieBet: 0,           // 타이 베팅 금액
    currentBetType: '',  // 현재 베팅 유형
    isGameInProgress: false, // 게임 진행 중 여부
    result: '',          // 게임 결과
    activeBetOptions: [] // 활성화된 베팅 옵션
};

// 바카라 게임 초기화
function initBaccarat() {
    // 게임 상태 초기화
    resetBaccaratGame();
    
    // 베팅 옵션 클릭 이벤트
    const betOptions = document.querySelectorAll('#baccarat-game .bet-option');
    betOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (BACCARAT.isGameInProgress) return;
            
            const betType = option.dataset.bet;
            selectBaccaratBet(betType);
        });
    });
    
    // 칩 선택 이벤트
    const chips = document.querySelectorAll('#baccarat-game .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (BACCARAT.isGameInProgress || !BACCARAT.currentBetType) return;
            
            const chipValue = parseInt(chip.dataset.value);
            placeBaccaratBet(chipValue);
        });
    });
    
    // 베팅 취소 버튼 이벤트
    const clearBetBtn = document.getElementById('clear-bet');
    clearBetBtn.addEventListener('click', clearBaccaratBet);
    
    // 딜 버튼 이벤트
    const dealBtn = document.getElementById('deal-btn');
    dealBtn.addEventListener('click', startBaccaratGame);
}

// 바카라 게임 리셋
function resetBaccaratGame() {
    // 카드 덱 생성 및 셔플
    BACCARAT.deck = shuffleDeck(createDeck());
    
    // 카드 및 점수 초기화
    BACCARAT.playerCards = [];
    BACCARAT.bankerCards = [];
    BACCARAT.playerScore = 0;
    BACCARAT.bankerScore = 0;
    
    // 베팅 초기화
    BACCARAT.playerBet = 0;
    BACCARAT.bankerBet = 0;
    BACCARAT.tieBet = 0;
    BACCARAT.currentBetType = '';
    BACCARAT.activeBetOptions = [];
    
    // 게임 진행 상태 초기화
    BACCARAT.isGameInProgress = false;
    BACCARAT.result = '';
    
    // UI 초기화
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('banker-cards').innerHTML = '';
    document.getElementById('player-total').textContent = '0';
    document.getElementById('banker-total').textContent = '0';
    document.getElementById('player-bet').textContent = '₩0';
    document.getElementById('banker-bet').textContent = '₩0';
    document.getElementById('tie-bet').textContent = '₩0';
    
    // 결과 표시 숨기기
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.classList.remove('show');
    
    // 베팅 옵션 초기화
    const betOptions = document.querySelectorAll('#baccarat-game .bet-option');
    betOptions.forEach(option => {
        option.classList.remove('active');
    });
}

// 바카라 베팅 옵션 선택
function selectBaccaratBet(betType) {
    if (BACCARAT.isGameInProgress) return;
    
    // 이미 베팅 중인 타입인 경우 선택 취소
    if (BACCARAT.currentBetType === betType) {
        BACCARAT.currentBetType = '';
        document.querySelector(`#baccarat-game .bet-option[data-bet="${betType}"]`).classList.remove('active');
        return;
    }
    
    // 베팅 타입 업데이트
    BACCARAT.currentBetType = betType;
    
    // UI 업데이트
    const betOptions = document.querySelectorAll('#baccarat-game .bet-option');
    betOptions.forEach(option => {
        if (option.dataset.bet === betType) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 효과음 재생
    playSound('bet_select');
}

// 바카라 베팅 실행
function placeBaccaratBet(amount) {
    if (BACCARAT.isGameInProgress || !BACCARAT.currentBetType) return;
    
    // 금액 확인
    if (GAME_DATA.player.money < amount) {
        showToast('베팅할 금액이 부족합니다.', 'error');
        return;
    }
    
    // 베팅 유형에 따라 금액 추가
    switch (BACCARAT.currentBetType) {
        case 'player':
            BACCARAT.playerBet += amount;
            document.getElementById('player-bet').textContent = formatCurrency(BACCARAT.playerBet);
            addChipAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="player"]'), amount);
            break;
        case 'banker':
            BACCARAT.bankerBet += amount;
            document.getElementById('banker-bet').textContent = formatCurrency(BACCARAT.bankerBet);
            addChipAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="banker"]'), amount);
            break;
        case 'tie':
            BACCARAT.tieBet += amount;
            document.getElementById('tie-bet').textContent = formatCurrency(BACCARAT.tieBet);
            addChipAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="tie"]'), amount);
            break;
    }
    
    // 베팅한 옵션 기록
    if (!BACCARAT.activeBetOptions.includes(BACCARAT.currentBetType)) {
        BACCARAT.activeBetOptions.push(BACCARAT.currentBetType);
    }
    
    // 금액 차감
    GAME_DATA.player.money -= amount;
    updateUI();
    
    // 효과음 재생
    playSound('chip');
}

// 바카라 베팅 취소
function clearBaccaratBet() {
    if (BACCARAT.isGameInProgress) return;
    
    // 베팅 금액 반환
    const totalBet = BACCARAT.playerBet + BACCARAT.bankerBet + BACCARAT.tieBet;
    GAME_DATA.player.money += totalBet;
    
    // 베팅 초기화
    BACCARAT.playerBet = 0;
    BACCARAT.bankerBet = 0;
    BACCARAT.tieBet = 0;
    BACCARAT.currentBetType = '';
    BACCARAT.activeBetOptions = [];
    
    // UI 업데이트
    document.getElementById('player-bet').textContent = '₩0';
    document.getElementById('banker-bet').textContent = '₩0';
    document.getElementById('tie-bet').textContent = '₩0';
    
    const betOptions = document.querySelectorAll('#baccarat-game .bet-option');
    betOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    updateUI();
    
    // 효과음 재생
    playSound('bet_clear');
    
    // 알림 표시
    if (totalBet > 0) {
        showToast('모든 베팅이 취소되었습니다.', 'info');
    }
}

// 바카라 게임 시작
function startBaccaratGame() {
    // 베팅 확인
    const totalBet = BACCARAT.playerBet + BACCARAT.bankerBet + BACCARAT.tieBet;
    if (totalBet === 0) {
        showToast('베팅 후 게임을 시작해주세요.', 'warning');
        return;
    }
    
    // 게임 진행 상태 설정
    BACCARAT.isGameInProgress = true;
    
    // 버튼 비활성화
    document.getElementById('deal-btn').disabled = true;
    document.getElementById('clear-bet').disabled = true;
    
    // 카드 컨테이너 참조
    const playerCardsContainer = document.getElementById('player-cards');
    const bankerCardsContainer = document.getElementById('banker-cards');
    
    // 카드 컨테이너 초기화
    playerCardsContainer.innerHTML = '';
    bankerCardsContainer.innerHTML = '';
    
    // 게임 시작 알림
    specialEventAnimation('게임 시작!', 'info');
    
    // 초기 카드 배포 (2장씩)
    setTimeout(() => {
        // 플레이어 첫 번째 카드
        const playerCard1 = BACCARAT.deck.pop();
        BACCARAT.playerCards.push(playerCard1);
        dealCardAnimation(playerCard1, playerCardsContainer, 0);
        
        // 뱅커 첫 번째 카드
        setTimeout(() => {
            const bankerCard1 = BACCARAT.deck.pop();
            BACCARAT.bankerCards.push(bankerCard1);
            dealCardAnimation(bankerCard1, bankerCardsContainer, 0);
            
            // 플레이어 두 번째 카드
            setTimeout(() => {
                const playerCard2 = BACCARAT.deck.pop();
                BACCARAT.playerCards.push(playerCard2);
                dealCardAnimation(playerCard2, playerCardsContainer, 0);
                
                // 뱅커 두 번째 카드
                setTimeout(() => {
                    const bankerCard2 = BACCARAT.deck.pop();
                    BACCARAT.bankerCards.push(bankerCard2);
                    dealCardAnimation(bankerCard2, bankerCardsContainer, 0);
                    
                    // 초기 점수 계산
                    setTimeout(() => {
                        calculateBaccaratScores();
                        updateBaccaratScores();
                        
                        // 추가 카드 규칙 적용
                        setTimeout(() => {
                            applyBaccaratRules();
                        }, 1000);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }, 500);
}

// 바카라 점수 계산
function calculateBaccaratScores() {
    // 플레이어 점수
    BACCARAT.playerScore = calculateBaccaratHandValue(BACCARAT.playerCards);
    
    // 뱅커 점수
    BACCARAT.bankerScore = calculateBaccaratHandValue(BACCARAT.bankerCards);
}

// 바카라 핸드 값 계산
function calculateBaccaratHandValue(cards) {
    let total = 0;
    
    // 모든 카드의 값 합산
    for (const card of cards) {
        let value = 0;
        if (['10', 'J', 'Q', 'K'].includes(card.value)) {
            value = 0;
        } else if (card.value === 'A') {
            value = 1;
        } else {
            value = parseInt(card.value);
        }
        
        total += value;
    }
    
    // 바카라 규칙: 일의 자리 숫자만 사용
    return total % 10;
}

// 바카라 점수 UI 업데이트
function updateBaccaratScores() {
    document.getElementById('player-total').textContent = BACCARAT.playerScore;
    document.getElementById('banker-total').textContent = BACCARAT.bankerScore;
}

// 바카라 추가 카드 규칙 적용
function applyBaccaratRules() {
    const playerCardsContainer = document.getElementById('player-cards');
    const bankerCardsContainer = document.getElementById('banker-cards');
    
    // 내추럴 8 또는 9인 경우 (추가 카드 없음)
    if (BACCARAT.playerScore >= 8 || BACCARAT.bankerScore >= 8) {
        specialEventAnimation('내추럴!', 'success');
        setTimeout(() => {
            endBaccaratGame();
        }, 1500);
        return;
    }
    
    // 플레이어 추가 카드 규칙
    if (BACCARAT.playerScore <= 5) {
        // 플레이어는 5 이하면 추가 카드
        setTimeout(() => {
            specialEventAnimation('플레이어 카드 추가', 'info');
            
            const playerCard3 = BACCARAT.deck.pop();
            BACCARAT.playerCards.push(playerCard3);
            dealCardAnimation(playerCard3, playerCardsContainer, 0);
            
            // 점수 재계산
            setTimeout(() => {
                calculateBaccaratScores();
                updateBaccaratScores();
                
                // 뱅커 추가 카드 규칙
                setTimeout(() => {
                    applyBankerThirdCardRule(playerCard3);
                }, 1000);
            }, 500);
        }, 1000);
    } else {
        // 플레이어가 추가 카드를 받지 않는 경우
        setTimeout(() => {
            specialEventAnimation('플레이어 스탠드', 'info');
            
            // 뱅커 추가 카드 규칙 (플레이어 추가 없을 때)
            setTimeout(() => {
                if (BACCARAT.bankerScore <= 5) {
                    // 뱅커는 5 이하면 추가 카드
                    specialEventAnimation('뱅커 카드 추가', 'info');
                    
                    const bankerCard3 = BACCARAT.deck.pop();
                    BACCARAT.bankerCards.push(bankerCard3);
                    dealCardAnimation(bankerCard3, bankerCardsContainer, 0);
                    
                    // 점수 재계산
                    setTimeout(() => {
                        calculateBaccaratScores();
                        updateBaccaratScores();
                        
                        // 게임 종료
                        setTimeout(() => {
                            endBaccaratGame();
                        }, 1000);
                    }, 500);
                } else {
                    // 뱅커가 추가 카드를 받지 않는 경우
                    specialEventAnimation('뱅커 스탠드', 'info');
                    
                    // 게임 종료
                    setTimeout(() => {
                        endBaccaratGame();
                    }, 1000);
                }
            }, 1000);
        }, 1000);
    }
}

// 뱅커 세 번째 카드 규칙
function applyBankerThirdCardRule(playerThirdCard) {
    const bankerCardsContainer = document.getElementById('banker-cards');
    let shouldDraw = false;
    
    // 뱅커 점수에 따른 규칙
    switch (BACCARAT.bankerScore) {
        case 0:
        case 1:
        case 2:
            // 항상 카드를 받음
            shouldDraw = true;
            break;
        case 3:
            // 플레이어의 세 번째 카드가 8이 아니면 카드를 받음
            shouldDraw = !(playerThirdCard.value === '8');
            break;
        case 4:
            // 플레이어의 세 번째 카드가 0, 1, 8, 9가 아니면 카드를 받음
            shouldDraw = !(['2', '3', '4', '5', '6', '7'].includes(playerThirdCard.value));
            break;
        case 5:
            // 플레이어의 세 번째 카드가 4, 5, 6, 7이면 카드를 받음
            shouldDraw = ['4', '5', '6', '7'].includes(playerThirdCard.value);
            break;
        case 6:
            // 플레이어의 세 번째 카드가 6, 7이면 카드를 받음
            shouldDraw = ['6', '7'].includes(playerThirdCard.value);
            break;
        case 7:
            // 카드를 받지 않음
            shouldDraw = false;
            break;
    }
    
    if (shouldDraw) {
        // 뱅커 추가 카드
        specialEventAnimation('뱅커 카드 추가', 'info');
        
        const bankerCard3 = BACCARAT.deck.pop();
        BACCARAT.bankerCards.push(bankerCard3);
        dealCardAnimation(bankerCard3, bankerCardsContainer, 0);
        
        // 점수 재계산
        setTimeout(() => {
            calculateBaccaratScores();
            updateBaccaratScores();
            
            // 게임 종료
            setTimeout(() => {
                endBaccaratGame();
            }, 1000);
        }, 500);
    } else {
        // 뱅커가 추가 카드를 받지 않는 경우
        specialEventAnimation('뱅커 스탠드', 'info');
        
        // 게임 종료
        setTimeout(() => {
            endBaccaratGame();
        }, 1000);
    }
}

// 바카라 게임 종료
function endBaccaratGame() {
    // 결과 계산
    if (BACCARAT.playerScore > BACCARAT.bankerScore) {
        BACCARAT.result = 'player';
        showResultAnimation(document.getElementById('baccarat-game'), '플레이어 승!', true);
    } else if (BACCARAT.bankerScore > BACCARAT.playerScore) {
        BACCARAT.result = 'banker';
        showResultAnimation(document.getElementById('baccarat-game'), '뱅커 승!', true);
    } else {
        BACCARAT.result = 'tie';
        showResultAnimation(document.getElementById('baccarat-game'), '타이!', null);
    }
    
    // 베팅 결과 정산
    setTimeout(() => {
        settleBaccaratBets();
        
        // 게임 이력 업데이트
        GAME_DATA.player.history.baccarat.push(BACCARAT.result);
        updateHistoryAnimation(document.getElementById('baccarat-history'), BACCARAT.result, 'baccarat');
        
        // 통계 업데이트
        switch (BACCARAT.result) {
            case 'player':
                GAME_DATA.player.stats.baccarat.playerWins++;
                break;
            case 'banker':
                GAME_DATA.player.stats.baccarat.bankerWins++;
                break;
            case 'tie':
                GAME_DATA.player.stats.baccarat.ties++;
                break;
        }
        
        // 게임 카운트 증가
        GAME_DATA.player.stats.baccarat.totalGames++;
        
        // UI 업데이트
        updateUI();
        
        // 버튼 활성화
        document.getElementById('deal-btn').disabled = false;
        document.getElementById('clear-bet').disabled = false;
        
        // 게임 종료 알림
        specialEventAnimation('게임 종료!', 'info');
        
        // 게임 상태 초기화
        setTimeout(() => {
            resetBaccaratGame();
        }, 3000);
        
        // 로그 전송
        sendLog({
            type: 'GAME_COMPLETED',
            action: '바카라 게임 완료',
            details: `결과: ${BACCARAT.result}, 플레이어 스코어: ${BACCARAT.playerScore}, 뱅커 스코어: ${BACCARAT.bankerScore}`
        });
        
        // 데이터 변경 알림
        onDataChange();
    }, 2000);
}

// 바카라 베팅 정산
function settleBaccaratBets() {
    let totalWin = 0;
    
    // 각 베팅 옵션별 정산
    switch (BACCARAT.result) {
        case 'player':
            // 플레이어 베팅이 있으면 2배 지급
            if (BACCARAT.playerBet > 0) {
                const winAmount = Math.floor(BACCARAT.playerBet * ODDS.baccarat.player);
                totalWin += winAmount;
                
                // 베팅 금액 포함 반환
                GAME_DATA.player.money += (BACCARAT.playerBet + winAmount);
                
                // 베팅 영역 승리 애니메이션
                winAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="player"]'));
                
                // 통계 업데이트
                GAME_DATA.player.stats.baccarat.moneyWon += winAmount;
            } else {
                // 플레이어 베팅이 없으면 패배 금액 기록
                GAME_DATA.player.stats.baccarat.moneyLost += (BACCARAT.bankerBet + BACCARAT.tieBet);
            }
            break;
        
        case 'banker':
            // 뱅커 베팅이 있으면 1.95배 지급 (5% 커미션)
            if (BACCARAT.bankerBet > 0) {
                const winAmount = Math.floor(BACCARAT.bankerBet * ODDS.baccarat.banker);
                totalWin += winAmount;
                
                // 베팅 금액 포함 반환
                GAME_DATA.player.money += (BACCARAT.bankerBet + winAmount);
                
                // 베팅 영역 승리 애니메이션
                winAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="banker"]'));
                
                // 통계 업데이트
                GAME_DATA.player.stats.baccarat.moneyWon += winAmount;
            } else {
                // 뱅커 베팅이 없으면 패배 금액 기록
                GAME_DATA.player.stats.baccarat.moneyLost += (BACCARAT.playerBet + BACCARAT.tieBet);
            }
            break;
        
        case 'tie':
            // 타이 베팅이 있으면 8배 지급
            if (BACCARAT.tieBet > 0) {
                const winAmount = Math.floor(BACCARAT.tieBet * ODDS.baccarat.tie);
                totalWin += winAmount;
                
                // 베팅 금액 포함 반환
                GAME_DATA.player.money += (BACCARAT.tieBet + winAmount);
                
                // 베팅 영역 승리 애니메이션
                winAnimation(document.querySelector('#baccarat-game .bet-option[data-bet="tie"]'));
                
                // 통계 업데이트
                GAME_DATA.player.stats.baccarat.moneyWon += winAmount;
            }
            
            // 타이인 경우 플레이어와 뱅커 베팅 반환 (타이 베팅만 8배)
            GAME_DATA.player.money += BACCARAT.playerBet;
            GAME_DATA.player.money += BACCARAT.bankerBet;
            break;
    }
    
    // 전체 이익이 있으면 애니메이션 표시
    if (totalWin > 0) {
        // 돈 변화 애니메이션
        moneyChangeAnimation(totalWin);
        
        // 승리 메시지
        const winMessage = totalWin >= 100000 ? '대박 승리!' : '승리!';
        specialEventAnimation(winMessage, 'success');
        
        // 큰 금액 승리 시 추가 효과
        if (totalWin >= 500000) {
            // 배경 효과
            document.body.classList.add('bg-pulse');
            setTimeout(() => {
                document.body.classList.remove('bg-pulse');
            }, 5000);
            
            // 추가 알림
            setTimeout(() => {
                specialEventAnimation('대박 승리! ' + formatCurrency(totalWin), 'success');
            }, 1500);
        }
    } else {
        // 패배 알림
        const totalLoss = BACCARAT.playerBet + BACCARAT.bankerBet + BACCARAT.tieBet - totalWin;
        if (totalLoss > 0) {
            // 돈 변화 애니메이션
            moneyChangeAnimation(-totalLoss);
            
            // 패배 메시지
            if (totalLoss >= 100000) {
                specialEventAnimation('큰 손실이 발생했습니다...', 'error');
            }
        }
    }
}

// 바카라 게임 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initBaccarat);
