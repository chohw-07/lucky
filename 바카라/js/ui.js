/**
 * UI 관련 기능
 */

// 현재 열린 모달
let currentModal = null;

// 모달 열기 함수
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContainer = document.getElementById('modal-container');
    
    if (modal && modalContainer) {
        // 기존 모달 닫기
        if (currentModal) {
            currentModal.classList.add('hidden');
        }
        
        // 새 모달 표시
        modal.classList.remove('hidden');
        modalContainer.classList.remove('hidden');
        currentModal = modal;
        
        // 모달 열기 효과음
        playSound('modal_open');
    }
}

// 모달 닫기 함수
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    
    if (modalContainer && currentModal) {
        modalContainer.classList.add('hidden');
        currentModal.classList.add('hidden');
        currentModal = null;
        
        // 모달 닫기 효과음
        playSound('modal_close');
    }
}

// 게임 화면 전환 함수
function switchGame(gameType) {
    // 현재 게임 유형 업데이트
    GAME_DATA.currentGame = gameType;
    
    // 모든 게임 화면 숨기기
    const gameScreens = document.querySelectorAll('main > section');
    gameScreens.forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // 내비게이션 메뉴 업데이트
    const navItems = document.querySelectorAll('nav li');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.game === gameType) {
            item.classList.add('active');
        }
    });
    
    // 선택한 게임 화면 표시
    switch (gameType) {
        case 'baccarat':
            document.getElementById('baccarat-game').classList.remove('hidden');
            // 바카라 배경 음악 재생
            playBackgroundMusic('baccarat_bg');
            break;
        case 'blackjack':
            document.getElementById('blackjack-game').classList.remove('hidden');
            // 블랙잭 배경 음악 재생
            playBackgroundMusic('blackjack_bg');
            break;
        case 'game-selection':
            document.getElementById('game-selection').classList.remove('hidden');
            // 기본 배경 음악 재생
            playBackgroundMusic('background');
            break;
        default:
            // 기본적으로 게임 선택 화면 표시
            document.getElementById('game-selection').classList.remove('hidden');
            playBackgroundMusic('background');
    }
}

// UI 업데이트 함수
function updateUI() {
    // 돈 표시 업데이트
    const moneyElement = document.getElementById('money-amount');
    if (moneyElement) {
        moneyElement.textContent = formatCurrency(GAME_DATA.player.money);
    }
    
    // 바카라 통계 업데이트
    const playerWinsElement = document.getElementById('player-wins');
    const bankerWinsElement = document.getElementById('banker-wins');
    const tiesElement = document.getElementById('ties');
    
    if (playerWinsElement) {
        playerWinsElement.textContent = GAME_DATA.player.stats.baccarat.playerWins;
    }
    
    if (bankerWinsElement) {
        bankerWinsElement.textContent = GAME_DATA.player.stats.baccarat.bankerWins;
    }
    
    if (tiesElement) {
        tiesElement.textContent = GAME_DATA.player.stats.baccarat.ties;
    }
    
    // 블랙잭 통계 업데이트
    const bjWinsElement = document.getElementById('bj-wins');
    const bjLossesElement = document.getElementById('bj-losses');
    const bjPushesElement = document.getElementById('bj-pushes');
    const bjBlackjacksElement = document.getElementById('bj-blackjacks');
    
    if (bjWinsElement) {
        bjWinsElement.textContent = GAME_DATA.player.stats.blackjack.wins;
    }
    
    if (bjLossesElement) {
        bjLossesElement.textContent = GAME_DATA.player.stats.blackjack.losses;
    }
    
    if (bjPushesElement) {
        bjPushesElement.textContent = GAME_DATA.player.stats.blackjack.pushes;
    }
    
    if (bjBlackjacksElement) {
        bjBlackjacksElement.textContent = GAME_DATA.player.stats.blackjack.blackjacks;
    }
    
    // 설정 업데이트
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const volumeControl = document.getElementById('volume-control');
    const autosaveToggle = document.getElementById('autosave-toggle');
    
    if (soundToggle) {
        soundToggle.checked = GAME_DATA.settings.sound;
    }
    
    if (musicToggle) {
        musicToggle.checked = GAME_DATA.settings.music;
    }
    
    if (volumeControl) {
        volumeControl.value = GAME_DATA.settings.volume;
    }
    
    if (autosaveToggle) {
        autosaveToggle.checked = GAME_DATA.settings.autosave;
    }
    
    // 대출 정보 업데이트
    const currentLoanElement = document.getElementById('current-loan');
    if (currentLoanElement) {
        currentLoanElement.textContent = formatCurrency(GAME_DATA.player.loan);
    }
    
    // 바카라 게임 이력 업데이트
    const baccaratHistory = document.getElementById('baccarat-history');
    if (baccaratHistory) {
        baccaratHistory.innerHTML = '';
        GAME_DATA.player.history.baccarat.slice(-20).forEach(result => {
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
            
            baccaratHistory.appendChild(dot);
        });
    }
    
    // 블랙잭 게임 이력 업데이트
    const blackjackHistory = document.getElementById('blackjack-history');
    if (blackjackHistory) {
        blackjackHistory.innerHTML = '';
        GAME_DATA.player.history.blackjack.slice(-20).forEach(result => {
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
            
            blackjackHistory.appendChild(icon);
        });
    }
}

// 설정 저장 함수
function saveSettings() {
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const volumeControl = document.getElementById('volume-control');
    const autosaveToggle = document.getElementById('autosave-toggle');
    
    // 설정 값 가져오기
    GAME_DATA.settings.sound = soundToggle.checked;
    GAME_DATA.settings.music = musicToggle.checked;
    GAME_DATA.settings.volume = parseInt(volumeControl.value);
    GAME_DATA.settings.autosave = autosaveToggle.checked;
    
    // 사운드 설정 업데이트
    updateSoundSettings();
    
    // 저장
    saveGameData('autosave');
    
    // 모달 닫기
    closeModal();
    
    // 알림 표시
    showToast('설정이 저장되었습니다.', 'success');
}

// 대출 신청 함수
function applyLoan(amount) {
    // 음수 금액 방지
    if (amount <= 0) {
        showToast('올바른 대출 금액을 입력해주세요.', 'error');
        return false;
    }
    
    // 한도 초과 검사 (최대 1000만원)
    const totalLoan = GAME_DATA.player.loan + amount;
    if (totalLoan > 10000000) {
        showToast('대출 한도를 초과했습니다. 최대 대출 한도는 1,000만원입니다.', 'error');
        return false;
    }
    
    // 대출금 추가
    GAME_DATA.player.loan += amount;
    
    // 돈 추가
    GAME_DATA.player.money += amount;
    
    // UI 업데이트
    updateUI();
    
    // 알림 표시
    showToast(`${formatCurrency(amount)}이 대출되었습니다.`, 'info');
    
    // 대출 효과음
    playSound('loan');
    
    // 돈 획득 애니메이션
    moneyChangeAnimation(amount);
    
    // 로그 전송
    sendLog({
        type: 'LOAN_APPLIED',
        action: '대출 신청',
        details: `대출 금액: ${formatCurrency(amount)}, 총 대출금: ${formatCurrency(GAME_DATA.player.loan)}`
    });
    
    // 대출 알림
    if (totalLoan >= 5000000) {
        specialEventAnimation('대출금이 많습니다. 상환을 고려하세요!', 'warning');
    }
    
    // 데이터 변경 알림
    onDataChange();
    
    return true;
}

// 대출금 상환 함수
function repayLoan(amount) {
    // 음수 금액 방지
    if (amount <= 0) {
        showToast('올바른 상환 금액을 입력해주세요.', 'error');
        return false;
    }
    
    // 금액 부족 검사
    if (amount > GAME_DATA.player.money) {
        showToast('보유 금액이 부족합니다.', 'error');
        return false;
    }
    
    // 대출금 초과 검사
    if (amount > GAME_DATA.player.loan) {
        showToast(`현재 대출금은 ${formatCurrency(GAME_DATA.player.loan)}입니다.`, 'error');
        return false;
    }
    
    // 대출금 감소
    GAME_DATA.player.loan -= amount;
    
    // 돈 감소
    GAME_DATA.player.money -= amount;
    
    // UI 업데이트
    updateUI();
    
    // 알림 표시
    showToast(`${formatCurrency(amount)}이 상환되었습니다.`, 'success');
    
    // 상환 효과음
    playSound('repay');
    
    // 돈 감소 애니메이션
    moneyChangeAnimation(-amount);
    
    // 로그 전송
    sendLog({
        type: 'LOAN_REPAID',
        action: '대출금 상환',
        details: `상환 금액: ${formatCurrency(amount)}, 남은 대출금: ${formatCurrency(GAME_DATA.player.loan)}`
    });
    
    // 대출 완료 알림
    if (GAME_DATA.player.loan === 0) {
        specialEventAnimation('모든 대출금이 상환되었습니다!', 'success');
    }
    
    // 데이터 변경 알림
    onDataChange();
    
    return true;
}

// 대출금 전액 상환 함수
function repayAllLoan() {
    const currentLoan = GAME_DATA.player.loan;
    
    // 대출금이 없는 경우
    if (currentLoan === 0) {
        showToast('상환할 대출금이 없습니다.', 'info');
        return false;
    }
    
    // 금액 부족 검사
    if (currentLoan > GAME_DATA.player.money) {
        showToast('보유 금액이 부족합니다.', 'error');
        return false;
    }
    
    // 대출금 상환
    GAME_DATA.player.money -= currentLoan;
    GAME_DATA.player.loan = 0;
    
    // UI 업데이트
    updateUI();
    
    // 알림 표시
    showToast(`${formatCurrency(currentLoan)}이 전액 상환되었습니다.`, 'success');
    
    // 상환 효과음
    playSound('repay');
    
    // 돈 감소 애니메이션
    moneyChangeAnimation(-currentLoan);
    
    // 로그 전송
    sendLog({
        type: 'LOAN_REPAID_ALL',
        action: '대출금 전액 상환',
        details: `상환 금액: ${formatCurrency(currentLoan)}`
    });
    
    // 대출 완료 알림
    specialEventAnimation('모든 대출금이 상환되었습니다!', 'success');
    
    // 데이터 변경 알림
    onDataChange();
    
    return true;
}

// UI 초기화 함수
function initUI() {
    // 모달 닫기 버튼 이벤트 설정
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // 모달 외부 클릭 시 닫기
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModal();
            }
        });
    }
    
    // 게임 메뉴 클릭 이벤트
    const navItems = document.querySelectorAll('nav li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const gameType = item.dataset.game;
            switchGame(gameType);
        });
    });
    
    // 설정 버튼 클릭 이벤트
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openModal('settings-modal');
        });
    }
    
    // 설정 저장 버튼 이벤트
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // 대출 관련 이벤트
    const loanOptions = document.querySelectorAll('.loan-option');
    loanOptions.forEach(option => {
        option.addEventListener('click', () => {
            const amount = parseInt(option.dataset.amount);
            applyLoan(amount);
        });
    });
    
    // 대출 커스텀 금액 적용 버튼
    const applyCustomLoanBtn = document.getElementById('apply-custom-loan');
    if (applyCustomLoanBtn) {
        applyCustomLoanBtn.addEventListener('click', () => {
            const customLoanInput = document.getElementById('custom-loan');
            const amount = parseInt(customLoanInput.value);
            if (applyLoan(amount)) {
                customLoanInput.value = '';
            }
        });
    }
    
    // 대출 전액 상환 버튼
    const repayAllBtn = document.getElementById('repay-all');
    if (repayAllBtn) {
        repayAllBtn.addEventListener('click', repayAllLoan);
    }
    
    // 대출 커스텀 상환 버튼
    const applyCustomRepayBtn = document.getElementById('apply-custom-repay');
    if (applyCustomRepayBtn) {
        applyCustomRepayBtn.addEventListener('click', () => {
            const customRepayInput = document.getElementById('custom-repay');
            const amount = parseInt(customRepayInput.value);
            if (repayLoan(amount)) {
                customRepayInput.value = '';
            }
        });
    }
    
    // UI 초기 업데이트
    updateUI();
}

// 문서 로드 완료 시 UI 초기화
document.addEventListener('DOMContentLoaded', initUI);
