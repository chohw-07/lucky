/**
 * 업데이트된 메인 애플리케이션 코드
 */

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 초기 로딩 설정
    initApp();
});

// 애플리케이션 초기화 함수
function initApp() {
    // 모든 모듈 초기화
    console.log('럭키 카지노 애플리케이션 초기화 중...');
    
    // IP 체크 및 해외 접속 차단
    checkLocation().then(allowed => {
        if (!allowed) {
            // 접속 차단됨 - 이미 utils.js에서 처리됨
            return;
        }
        
        // 게임 초기화
        initGameModules();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 자동 저장 설정
        setupAutoSave();
        
        // 화면 크기에 따른 최적화
        adjustLayoutForScreenSize();
        
        // 시작 안내
        setTimeout(() => {
            showGameAlert('안녕하세요! 럭키 카지노에 오신 것을 환영합니다.');
        }, 2000);
    }).catch(error => {
        console.error('초기화 중 오류 발생:', error);
    });
}

// 게임 모듈 초기화
function initGameModules() {
    // 기본적으로 바카라 게임으로 시작 (또는 저장된 마지막 게임)
    switchGame(GAME_DATA.currentGame || 'baccarat');
    
    // 기존 게임 모듈 초기화 (각 모듈 스크립트에서 DOMContentLoaded 이벤트로 처리됨)
    
    // 신규 기능 모듈 초기화
    initAchievements(); // 업적 시스템
    initShop();        // 상점 시스템
    initProfile();     // 프로필 시스템
    initUI();          // 향상된 UI 시스템
    
    console.log('게임 모듈 초기화 완료');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로고 클릭 이벤트 - 게임 선택 화면으로 이동
    document.querySelector('.logo').addEventListener('click', () => {
        switchGame('game-selection');
    });
    
    // 게임 선택 화면의 게임 선택 이벤트
    const gameOptions = document.querySelectorAll('#game-selection .game-option');
    gameOptions.forEach(option => {
        option.addEventListener('click', () => {
            const game = option.dataset.game;
            if (game && game !== 'coming-soon') {
                switchGame(game);
            } else if (game === 'coming-soon') {
                showToast('해당 게임은 준비 중입니다.', 'info');
            }
        });
    });
    
    // 설정 버튼 클릭 이벤트
    document.getElementById('settings-btn').addEventListener('click', () => {
        openModal('settings-modal');
    });
    
    // 설정 저장 버튼 이벤트
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // 설정 취소 버튼 이벤트
    document.getElementById('settings-cancel').addEventListener('click', () => {
        closeModal();
    });
    
    // 전체 데이터 초기화 버튼 이벤트
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('정말로 모든 게임 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            resetAllData();
        }
    });
    
    // 화면 크기 변경 시 레이아웃 조정
    window.addEventListener('resize', () => {
        adjustLayoutForScreenSize();
    });
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts();
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // 포커스된 요소가 입력 필드인 경우 단축키 무시
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // 단축키 처리
        switch (e.key) {
            // 게임 스핀/딜 (스페이스바)
            case ' ':
                // 현재 게임에 따라 적절한 액션 버튼 클릭
                if (GAME_DATA.currentGame === 'baccarat') {
                    document.getElementById('deal-btn').click();
                } else if (GAME_DATA.currentGame === 'blackjack') {
                    document.getElementById('bj-deal-btn').click();
                } else if (GAME_DATA.currentGame === 'roulette') {
                    document.getElementById('roulette-spin-btn').click();
                } else if (GAME_DATA.currentGame === 'slots') {
                    document.getElementById('spin-button').click();
                } else if (GAME_DATA.currentGame === 'poker') {
                    document.getElementById('deal-poker-btn').click();
                }
                break;
                
            // 게임 탐색 (숫자키)
            case '1': // 바카라
                switchGame('baccarat');
                break;
            case '2': // 블랙잭
                switchGame('blackjack');
                break;
            case '3': // 룰렛
                switchGame('roulette');
                break;
            case '4': // 슬롯머신
                switchGame('slots');
                break;
            case '5': // 포커
                switchGame('poker');
                break;
            case '0': // 게임 선택 화면
                switchGame('game-selection');
                break;
        }
    });
}

// 자동 저장 설정
function setupAutoSave() {
    if (GAME_DATA.settings.autosave) {
        // 10분마다 자동 저장
        setInterval(() => {
            saveGameData('autosave');
            showToast('게임 데이터가 자동 저장되었습니다.', 'info');
        }, 10 * 60 * 1000); // 10분
        
        // 데이터 변경 시마다 저장 (onDataChange 함수에서 처리)
        console.log('자동 저장 설정 완료');
    }
}

// 전체 데이터 초기화
function resetAllData() {
    // 기본 GAME_DATA 상태로 복원
    GAME_DATA.player = {
        money: 1000000,
        loan: 0,
        stats: {
            baccarat: {
                totalGames: 0,
                playerWins: 0,
                bankerWins: 0,
                ties: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            },
            blackjack: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                blackjacks: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            },
            roulette: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            },
            slots: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                jackpots: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            },
            poker: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            }
        },
        history: {
            baccarat: [],
            blackjack: [],
            roulette: [],
            slots: [],
            poker: []
        }
    };
    
    // 업적, 상점, 프로필 초기화
    GAME_DATA.achievements = {
        unlockedAchievements: {},
        winStreak: 0,
        hadLowBalance: false
    };
    
    GAME_DATA.shop = {
        ownedItems: {
            'avatar_cool': true,
            'table_classic': true,
            'card_classic': true,
            'effect_standard': true
        },
        activeItems: {
            avatar: 'avatar_cool',
            table: 'table_classic',
            card: 'card_classic',
            effect: 'effect_standard'
        }
    };
    
    GAME_DATA.profile = {
        name: '플레이어',
        avatar: '😎'
    };
    
    // 설정은 유지 (테마, 소리 등)
    
    // UI 업데이트
    updateUI();
    
    // 게임 선택 화면으로 이동
    switchGame('game-selection');
    
    // 로컬 스토리지에 저장
    saveGameData('autosave');
    
    // 알림
    showToast('모든 게임 데이터가 초기화되었습니다.', 'success');
    
    // 로그 전송
    sendLog({
        type: 'DATA_RESET',
        action: '전체 데이터 초기화',
        details: '사용자가 모든 게임 데이터를 초기화함'
    });
}

// 설정 저장
/**
 * 게임 설정을 저장하는 함수
 */
function saveSettings() {
    // 설정 값 가져오기
    GAME_DATA.settings.sound = document.getElementById('sound-toggle').checked;
    GAME_DATA.settings.music = document.getElementById('music-toggle').checked;
    GAME_DATA.settings.volume = parseInt(document.getElementById('volume-control').value);
    GAME_DATA.settings.autosave = document.getElementById('autosave-toggle').checked;
    GAME_DATA.settings.animation = document.getElementById('animation-toggle').checked;
    GAME_DATA.settings.dealSpeed = parseInt(document.getElementById('deal-speed-control').value);
    
    // 테마 업데이트
    const activeThemeOption = document.querySelector('.theme-option.active');
    if (activeThemeOption) {
        GAME_DATA.settings.theme = activeThemeOption.dataset.theme;
    }
    
    // 사운드 설정 업데이트
    updateSoundSettings();
    
    // 애니메이션 설정 반영
    if (GAME_DATA.settings.animation) {
        document.body.classList.remove('reduce-motion');
    } else {
        document.body.classList.add('reduce-motion');
    }
    
    // 딜 속도 업데이트
    const dealSpeed = 0.6 - (GAME_DATA.settings.dealSpeed - 1) * 0.1; // 1(빠름)~5(느림)
    document.documentElement.style.setProperty('--transition-speed', `${dealSpeed}s`);
    
    // 자동 저장 설정
    setupAutoSave();
    
    // 저장
    saveGameData('autosave');
    
    // 모달 닫기
    closeModal();
    
    // 알림 표시
    showToast('설정이 저장되었습니다.', 'success');
    
    // 데이터 변경 알림
    onDataChange();
}
// 오디오 컨텍스트 초기화
function initAudioContext() {
    // 사용자 인터랙션 필요 (iOS Safari 등에서 필요)
    document.addEventListener('click', function initAudio() {
        // 빈 오디오 컨텍스트 생성 및 재생
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const emptySource = context.createBufferSource();
        emptySource.start();
        emptySource.stop();
        
        // 리스너 제거
        document.removeEventListener('click', initAudio);
    }, { once: true });
}

// 프리로드 함수 - 게임 로딩 전 미리 리소스 준비
function preloadResources() {
    // 필요한 모든 게임 리소스들을 미리 로드
    console.log('게임 리소스 프리로딩 중...');
    
    // 오디오 컨텍스트 초기화
    initAudioContext();
}

// 게임 모듈이 로드되었는지 확인
function checkModulesLoaded() {
    const requiredModules = [
        'utils.js', 'storage.js', 'animations.js', 'ui.js',
        'baccarat.js', 'blackjack.js', 'roulette.js', 'slots.js', 'poker.js'
    ];
    
    // 각 모듈 스크립트 확인
    const loadedScripts = Array.from(document.scripts).map(script => {
        const src = script.src;
        if (!src) return null;
        const parts = src.split('/');
        return parts[parts.length - 1];
    }).filter(Boolean);
    
    // 필요한 모든 모듈이 로드되었는지 확인
    const allLoaded = requiredModules.every(module => loadedScripts.includes(module));
    
    if (!allLoaded) {
        console.warn('일부 게임 모듈이 로드되지 않았습니다.');
    }
    
    return allLoaded;
}

// 리소스 프리로드 실행
preloadResources();

// 모듈 로드 확인
window.addEventListener('load', checkModulesLoaded);
