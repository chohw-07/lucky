/**
 * 향상된 UI 및 모바일 최적화 기능
 */

// 모바일 메뉴 토글 상태
let mobileMenuOpen = false;

// 현재 테마
let currentTheme = 'dark';

// UI 초기화 함수 (기존)
function initUI() {
    // 기존 코드 유지
    setupModalControls();
    setupGameNavigation();
    setupMobileMenu();
    setupThemeToggle();
    updateThemeBasedOnTime();
    
    // 초기 UI 업데이트
    updateUI();
    
    // 화면 크기에 따른 최적화
    adjustLayoutForScreenSize();
    
    // 모바일 터치 이벤트 최적화
    setupTouchEvents();
}
/**
 * UI 업데이트 함수
 * 게임 데이터 변경 시 UI를 업데이트합니다.
 */
function updateUI() {
    try {
        // 머니 디스플레이 업데이트
        const moneyElement = document.getElementById('money-amount');
        if (moneyElement) {
            moneyElement.textContent = formatCurrency(GAME_DATA.player.money);
        }
        
        // 바카라 통계 업데이트
        const playerWinsElement = document.getElementById('player-wins');
        const bankerWinsElement = document.getElementById('banker-wins');
        const tiesElement = document.getElementById('ties');
        
        if (playerWinsElement) playerWinsElement.textContent = GAME_DATA.player.stats.baccarat.playerWins;
        if (bankerWinsElement) bankerWinsElement.textContent = GAME_DATA.player.stats.baccarat.bankerWins;
        if (tiesElement) tiesElement.textContent = GAME_DATA.player.stats.baccarat.ties;
        
        // 블랙잭 통계 업데이트
        const bjWinsElement = document.getElementById('bj-wins');
        const bjLossesElement = document.getElementById('bj-losses');
        const bjPushesElement = document.getElementById('bj-pushes');
        const bjBlackjacksElement = document.getElementById('bj-blackjacks');
        
        if (bjWinsElement) bjWinsElement.textContent = GAME_DATA.player.stats.blackjack.wins;
        if (bjLossesElement) bjLossesElement.textContent = GAME_DATA.player.stats.blackjack.losses;
        if (bjPushesElement) bjPushesElement.textContent = GAME_DATA.player.stats.blackjack.pushes;
        if (bjBlackjacksElement) bjBlackjacksElement.textContent = GAME_DATA.player.stats.blackjack.blackjacks;
        
        // 룰렛 통계 업데이트
        const rouletteWinsElement = document.getElementById('roulette-wins');
        const rouletteLossesElement = document.getElementById('roulette-losses');
        
        if (rouletteWinsElement) rouletteWinsElement.textContent = GAME_DATA.player.stats.roulette.wins;
        if (rouletteLossesElement) rouletteLossesElement.textContent = GAME_DATA.player.stats.roulette.losses;
        
        // 슬롯 통계 업데이트
        const slotsWinsElement = document.getElementById('slots-wins');
        const slotsLossesElement = document.getElementById('slots-losses');
        const slotsJackpotsElement = document.getElementById('slots-jackpots');
        
        if (slotsWinsElement) slotsWinsElement.textContent = GAME_DATA.player.stats.slots.wins;
        if (slotsLossesElement) slotsLossesElement.textContent = GAME_DATA.player.stats.slots.losses;
        if (slotsJackpotsElement) slotsJackpotsElement.textContent = GAME_DATA.player.stats.slots.jackpots;
        
        // 포커 통계 업데이트
        const pokerWinsElement = document.getElementById('poker-wins');
        const pokerLossesElement = document.getElementById('poker-losses');
        
        if (pokerWinsElement) pokerWinsElement.textContent = GAME_DATA.player.stats.poker.wins;
        if (pokerLossesElement) pokerLossesElement.textContent = GAME_DATA.player.stats.poker.losses;
        
        // 프로필 정보 업데이트
        const profileNameElement = document.getElementById('player-name');
        const avatarPreviewElement = document.getElementById('avatar-preview');
        
        if (profileNameElement && GAME_DATA.profile) {
            profileNameElement.value = GAME_DATA.profile.name;
        }
        
        if (avatarPreviewElement && GAME_DATA.profile) {
            avatarPreviewElement.textContent = GAME_DATA.profile.avatar;
        }
        
        // 설정 업데이트
        const soundToggle = document.getElementById('sound-toggle');
        const musicToggle = document.getElementById('music-toggle');
        const volumeControl = document.getElementById('volume-control');
        const autosaveToggle = document.getElementById('autosave-toggle');
        const animationToggle = document.getElementById('animation-toggle');
        const dealSpeedControl = document.getElementById('deal-speed-control');
        
        if (soundToggle && GAME_DATA.settings) {
            soundToggle.checked = GAME_DATA.settings.sound;
        }
        
        if (musicToggle && GAME_DATA.settings) {
            musicToggle.checked = GAME_DATA.settings.music;
        }
        
        if (volumeControl && GAME_DATA.settings) {
            volumeControl.value = GAME_DATA.settings.volume;
        }
        
        if (autosaveToggle && GAME_DATA.settings) {
            autosaveToggle.checked = GAME_DATA.settings.autosave;
        }
        
        if (animationToggle && GAME_DATA.settings) {
            animationToggle.checked = GAME_DATA.settings.animation;
        }
        
        if (dealSpeedControl && GAME_DATA.settings) {
            dealSpeedControl.value = GAME_DATA.settings.dealSpeed;
        }
        
        // 테마 옵션 업데이트
        const themeOptions = document.querySelectorAll('.theme-option');
        if (themeOptions.length > 0 && GAME_DATA.settings) {
            themeOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === GAME_DATA.settings.theme) {
                    option.classList.add('active');
                }
            });
        }
        
        // 현재 게임 활성화
        const navItems = document.querySelectorAll('nav li');
        navItems.forEach(item => {
            if (item.dataset.game === GAME_DATA.currentGame) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        console.log('UI가 성공적으로 업데이트되었습니다.');
    } catch (error) {
        console.error('UI 업데이트 중 오류 발생:', error);
    }
}
// 모달 컨트롤 설정
function setupModalControls() {
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
}

// 게임 내비게이션 설정
function setupGameNavigation() {
    // 게임 메뉴 클릭 이벤트
    const navItems = document.querySelectorAll('nav li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const gameType = item.dataset.game;
            switchGame(gameType);
            
            // 모바일 메뉴 열려있으면 닫기
            if (mobileMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
}

// 모바일 메뉴 설정
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuButton && navMenu) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuOpen) {
        // 메뉴 닫기
        navMenu.classList.remove('open');
        playSound('menu_close');
    } else {
        // 메뉴 열기
        navMenu.classList.add('open');
        playSound('menu_open');
    }
    
    // 상태 업데이트
    mobileMenuOpen = !mobileMenuOpen;
}

// 테마 토글 설정
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = currentTheme === 'light';
        
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // 테마 옵션 클릭 이벤트
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            setTheme(theme);
            
            // 선택된 테마 표시
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// 시간에 따른 테마 자동 설정
function updateThemeBasedOnTime() {
    const hour = new Date().getHours();
    
    // 저녁/밤에는 다크 테마, 아침/낮에는 라이트 테마
    if (GAME_DATA.settings && GAME_DATA.settings.autoTheme) {
        const newTheme = (hour >= 19 || hour < 7) ? 'dark' : 'light';
        setTheme(newTheme);
    }
}

/**
 * 테마 설정
 */
function setTheme(theme) {
    currentTheme = theme;
    
    // 테마 스위치 업데이트
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = theme === 'light';
    }
    
    // 테마 옵션 업데이트
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
    
    // 바디 클래스 업데이트
    document.body.className = `${theme}-theme`;
    
    // 효과음
    //playSound('theme_change');
    
    // 저장
    if (GAME_DATA.settings) {
        GAME_DATA.settings.theme = theme;
        
        // 이 부분이 문제 - onDataChange가 정의되지 않음
        // 수정: onDataChange 직접 호출 대신 변경 내용만 저장
        if (typeof saveGameData === 'function') {
            saveGameData('autosave');
        }
    }
}

// 화면 크기에 따른 레이아웃 조정
function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    
    // 모바일 화면 감지 및 최적화
    if (width < 768) {
        document.body.classList.add('mobile-view');
        optimizeForMobile();
    } else {
        document.body.classList.remove('mobile-view');
        optimizeForDesktop();
    }
    
    // 태블릿 화면 최적화
    if (width >= 768 && width < 1200) {
        document.body.classList.add('tablet-view');
        optimizeForTablet();
    } else {
        document.body.classList.remove('tablet-view');
    }
    
    // 게임 테이블 및 카드 크기 조정
    resizeGameElements();
}

// 모바일 환경 최적화
function optimizeForMobile() {
    // 게임 테이블 최적화
    const gameTables = document.querySelectorAll('.game-table');
    gameTables.forEach(table => {
        table.style.padding = '15px';
    });
    
    // 베팅 영역 최적화
    const betOptions = document.querySelectorAll('.bet-options');
    betOptions.forEach(options => {
        options.style.flexDirection = 'column';
    });
    
    // 칩 크기 축소
    document.documentElement.style.setProperty('--chip-size', '50px');
    
    // 카드 크기 축소
    document.documentElement.style.setProperty('--card-width', '80px');
    document.documentElement.style.setProperty('--card-height', '120px');
    
    // 모바일에서 긴 텍스트 줄임
    const descriptions = document.querySelectorAll('.game-option p, .shop-item-description');
    descriptions.forEach(desc => {
        desc.style.overflow = 'hidden';
        desc.style.textOverflow = 'ellipsis';
        desc.style.display = '-webkit-box';
        desc.style.webkitLineClamp = '2';
        desc.style.webkitBoxOrient = 'vertical';
    });
}

// 태블릿 환경 최적화
function optimizeForTablet() {
    // 게임 테이블 최적화
    const gameTables = document.querySelectorAll('.game-table');
    gameTables.forEach(table => {
        table.style.padding = '20px';
    });
    
    // 칩 크기 조정
    document.documentElement.style.setProperty('--chip-size', '55px');
    
    // 카드 크기 조정
    document.documentElement.style.setProperty('--card-width', '100px');
    document.documentElement.style.setProperty('--card-height', '150px');
}

// 데스크톱 환경 최적화
function optimizeForDesktop() {
    // 게임 테이블 최적화
    const gameTables = document.querySelectorAll('.game-table');
    gameTables.forEach(table => {
        table.style.padding = '30px';
    });
    
    // 칩 크기 복원
    document.documentElement.style.setProperty('--chip-size', '60px');
    
    // 카드 크기 복원
    document.documentElement.style.setProperty('--card-width', '120px');
    document.documentElement.style.setProperty('--card-height', '180px');
    
    // 텍스트 표시 복원
    const descriptions = document.querySelectorAll('.game-option p, .shop-item-description');
    descriptions.forEach(desc => {
        desc.style.overflow = 'visible';
        desc.style.textOverflow = 'clip';
        desc.style.display = 'block';
        desc.style.webkitLineClamp = 'none';
    });
}

// 게임 요소 크기 조정
function resizeGameElements() {
    const width = window.innerWidth;
    
    // 룰렛 휠 크기 조정
    const rouletteWheel = document.querySelector('.roulette-wheel');
    if (rouletteWheel) {
        if (width < 768) {
            rouletteWheel.style.width = '250px';
            rouletteWheel.style.height = '250px';
        } else {
            rouletteWheel.style.width = '300px';
            rouletteWheel.style.height = '300px';
        }
    }
    
    // 슬롯 릴 크기 조정
    const slotReels = document.querySelectorAll('.slot-reel');
    if (slotReels.length > 0) {
        if (width < 768) {
            slotReels.forEach(reel => {
                reel.style.width = '80px';
                reel.style.height = '200px';
            });
        } else {
            slotReels.forEach(reel => {
                reel.style.width = '100px';
                reel.style.height = '250px';
            });
        }
    }
}

// 모바일 터치 이벤트 최적화
function setupTouchEvents() {
    // 카드 터치 최적화
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            // 터치 시작 시 약간 확대 효과
            card.style.transform = 'scale(1.05)';
            card.style.zIndex = '10';
        });
        
        card.addEventListener('touchend', () => {
            // 터치 종료 시 원래 크기로
            card.style.transform = 'scale(1)';
            card.style.zIndex = '1';
        });
    });
    
    // 칩 터치 최적화
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('touchstart', () => {
            // 터치 시작 시 약간 확대 효과
            chip.style.transform = 'scale(1.1)';
        });
        
        chip.addEventListener('touchend', () => {
            // 터치 종료 시 원래 크기로
            chip.style.transform = 'scale(1)';
        });
    });
    
    // 스와이프로 게임 전환 기능
    setupSwipeNavigation();
}

// 스와이프 내비게이션 설정
function setupSwipeNavigation() {
    let startX, endX;
    const minSwipeDistance = 50; // 최소 스와이프 거리 (px)
    
    // 터치 시작 위치 기록
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    // 터치 종료 시 스와이프 방향 확인 및 게임 전환
    document.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        
        // 스와이프 거리 계산
        const distance = endX - startX;
        
        // 충분한 거리를 스와이프했는지 확인
        if (Math.abs(distance) >= minSwipeDistance) {
            const gameTypes = ['baccarat', 'blackjack', 'roulette', 'slots', 'poker'];
            const currentIndex = gameTypes.indexOf(GAME_DATA.currentGame);
            
            if (currentIndex !== -1) {
                let newIndex;
                
                // 오른쪽으로 스와이프: 이전 게임
                if (distance > 0) {
                    newIndex = (currentIndex - 1 + gameTypes.length) % gameTypes.length;
                } 
                // 왼쪽으로 스와이프: 다음 게임
                else {
                    newIndex = (currentIndex + 1) % gameTypes.length;
                }
                
                // 게임 전환
                switchGame(gameTypes[newIndex]);
            }
        }
    });
}

// 성능 최적화: 애니메이션 프레임 제한
function limitAnimationFrames() {
    // 저사양 기기 감지
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || /Android [1-4]|iPhone OS [6-9]/.test(navigator.userAgent);
    
    // 저사양 기기는 애니메이션 효과 줄이기
    if (isLowEndDevice) {
        document.body.classList.add('reduce-motion');
        
        // 애니메이션 시간 줄이기
        document.documentElement.style.setProperty('--transition-speed', '0.2s');
        
        // 복잡한 배경 효과 비활성화
        const gameTable = document.querySelectorAll('.game-table');
        gameTable.forEach(table => {
            table.style.backgroundImage = 'none';
        });
    }
}

// UI 성능 향상을 위한 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 화면 리사이즈 이벤트에 디바운스 적용
window.addEventListener('resize', debounce(() => {
    adjustLayoutForScreenSize();
}, 200));

// 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    limitAnimationFrames();
    
    // 로컬 스토리지에서 저장된 테마 로드
    if (GAME_DATA.settings && GAME_DATA.settings.theme) {
        setTheme(GAME_DATA.settings.theme);
    }
});

// 다크 모드 미디어 쿼리 변경 감지
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
darkModeMediaQuery.addEventListener('change', (e) => {
    // 자동 테마 설정이 활성화된 경우에만 적용
    if (GAME_DATA.settings && GAME_DATA.settings.autoTheme) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// 레이지 로딩 구현
function setupLazyLoading() {
    // 게임 선택 화면에만 표시되는 요소 지연 로드
    const gameSelection = document.getElementById('game-selection');
    if (gameSelection && !gameSelection.classList.contains('hidden')) {
        // 게임 옵션 이미지 로드
        const gameOptionImages = gameSelection.querySelectorAll('.game-icon');
        gameOptionImages.forEach(img => {
            if (img.dataset.src) {
                img.textContent = img.dataset.src;
                delete img.dataset.src;
            }
        });
    }
}

// 게임 전환 시 레이지 로딩 실행
if (typeof window.switchGame === 'function') {
    const originalSwitchGame = window.switchGame;
    window.switchGame = function(gameType) {
        originalSwitchGame(gameType);
        if (typeof setupLazyLoading === 'function') {
            setupLazyLoading();
        }
    };
} else {
    window.switchGame = function(gameType) {
        // 기본 게임 전환 로직
        const gameScreens = document.querySelectorAll('main > section');
        gameScreens.forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const newGameScreen = document.getElementById(`${gameType}-game`);
        if (newGameScreen) {
            newGameScreen.classList.remove('hidden');
        } else if (gameType === 'game-selection') {
            document.getElementById('game-selection').classList.remove('hidden');
        }
        
        // GAME_DATA 업데이트
        if (typeof GAME_DATA !== 'undefined') {
            GAME_DATA.currentGame = gameType;
        }
        
        // 추가 기능 실행
        if (typeof setupLazyLoading === 'function') {
            setupLazyLoading();
        }
    };
}
