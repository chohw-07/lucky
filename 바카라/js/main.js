/**
 * 메인 애플리케이션 코드
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
    // 기본적으로 바카라 게임으로 시작
    switchGame(GAME_DATA.currentGame || 'baccarat');
    
    // 필요한 모듈 초기화 (이미 각 모듈에서 DOMContentLoaded에서 초기화됨)
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
    
    // 대출 기능 이벤트
    document.querySelector('.money-display').addEventListener('click', () => {
        // 대출 모달 열기
        openModal('loan-modal');
    });
    
    // ESC 키 누르면 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // 브라우저 종료 전 자동 저장
    window.addEventListener('beforeunload', () => {
        saveGameData('autosave');
    });
    
    // 화면 크기 변경 시 레이아웃 조정
    window.addEventListener('resize', adjustLayoutForScreenSize);
    
    // 소리 설정 이벤트
    document.getElementById('sound-toggle').addEventListener('change', updateSoundSettings);
    document.getElementById('music-toggle').addEventListener('change', updateSoundSettings);
    document.getElementById('volume-control').addEventListener('input', updateSoundSettings);
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

// 화면 크기에 따른 레이아웃 조정
function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    
    // 모바일 화면 조정
    if (width < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
    
    // 기타 레이아웃 조정...
}

// 필요한 에셋 미리 로드
function preloadAssets() {
    // 사운드 파일 미리 로드
    const sounds = [
        'background', 'baccarat_bg', 'blackjack_bg', 
        'card_deal', 'card_flip', 'chip', 
        'win', 'lose', 'push', 
        'blackjack', 'money_gain', 'money_loss', 
        'bet_select', 'bet_clear', 'special_event',
        'modal_open', 'modal_close', 'loan', 'repay'
    ];
    
    sounds.forEach(sound => {
        const audio = new Audio(`assets/sounds/${sound}.mp3`);
        audio.preload = 'auto';
    });
    
    // 이미지 파일 미리 로드
    const images = [
        'casino-logo.svg', 'card-back-pattern.svg',
        'baccarat-icon.svg', 'blackjack-icon.svg',
        'coming-soon.svg', 'sparkle.svg'
    ];
    
    images.forEach(image => {
        const img = new Image();
        img.src = `assets/images/${image}`;
    });
}

// 앱 초기화 시 에셋 미리 로드
preloadAssets();

/**
 * 에셋 파일 구조 안내
 * 
 * 프로젝트는 다음과 같은 폴더 구조를 가집니다:
 * 
 * - index.html (메인 HTML 파일)
 * - css/
 *   - styles.css (메인 스타일시트)
 *   - animations.css (애니메이션 스타일)
 * - js/
 *   - utils.js (유틸리티 함수)
 *   - storage.js (저장 및 불러오기 기능)
 *   - animations.js (애니메이션 기능)
 *   - ui.js (UI 관련 기능)
 *   - baccarat.js (바카라 게임 로직)
 *   - blackjack.js (블랙잭 게임 로직)
 *   - main.js (메인 애플리케이션 코드)
 * - assets/
 *   - images/ (이미지 파일)
 *     - casino-logo.svg (카지노 로고)
 *     - card-back-pattern.svg (카드 뒷면 패턴)
 *     - baccarat-icon.svg (바카라 아이콘)
 *     - blackjack-icon.svg (블랙잭 아이콘)
 *     - coming-soon.svg (준비 중 아이콘)
 *     - sparkle.svg (반짝임 효과)
 *   - sounds/ (사운드 파일)
 *     - background.mp3 (배경 음악)
 *     - baccarat_bg.mp3 (바카라 배경 음악)
 *     - blackjack_bg.mp3 (블랙잭 배경 음악)
 *     - card_deal.mp3 (카드 딜 효과음)
 *     - card_flip.mp3 (카드 뒤집기 효과음)
 *     - chip.mp3 (칩 효과음)
 *     - win.mp3 (승리 효과음)
 *     - lose.mp3 (패배 효과음)
 *     - push.mp3 (푸시 효과음)
 *     - blackjack.mp3 (블랙잭 효과음)
 *     - money_gain.mp3 (돈 획득 효과음)
 *     - money_loss.mp3 (돈 손실 효과음)
 *     - bet_select.mp3 (베팅 선택 효과음)
 *     - bet_clear.mp3 (베팅 취소 효과음)
 *     - special_event.mp3 (특별 이벤트 효과음)
 *     - modal_open.mp3 (모달 열기 효과음)
 *     - modal_close.mp3 (모달 닫기 효과음)
 *     - loan.mp3 (대출 효과음)
 *     - repay.mp3 (상환 효과음)
 * 
 * 모든 에셋 파일은 사용 전에 미리 로드되어야 합니다.
 */
