/**
 * 업데이트된 유틸리티 함수 모음
 */

// 글로벌 변수들
const GAME_DATA = {
    // 플레이어 정보
    player: {
        money: 1000000, // 시작 금액 100만원
        loan: 0,        // 현재 대출금
        stats: {
            baccarat: {
                totalGames: 0,
                playerWins: 0,
                bankerWins: 0,
                ties: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0   // 최대 승리 금액
            },
            blackjack: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                blackjacks: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0   // 최대 승리 금액
            },
            roulette: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0   // 최대 승리 금액
            },
            slots: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                jackpots: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0   // 최대 승리 금액
            },
            poker: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0   // 최대 승리 금액
            }
        },
        // 최근 베팅 이력
        history: {
            baccarat: [],  // 바카라 결과 이력
            blackjack: [], // 블랙잭 결과 이력
            roulette: [],  // 룰렛 결과 이력
            slots: [],     // 슬롯머신 결과 이력
            poker: []      // 포커 결과 이력
        }
    },
    // 게임 설정
    settings: {
        sound: true,      // 소리 활성화 여부
        music: true,      // 배경 음악 활성화 여부
        volume: 80,       // 음량 (0-100)
        autosave: true,   // 자동 저장 활성화 여부
        animation: true,  // 애니메이션 활성화 여부
        dealSpeed: 3,     // 딜 속도 (1-5)
        theme: 'dark',    // 테마 (dark, light, classic, neon)
        autoTheme: false, // 시간에 따른 자동 테마 변경
        tableTheme: 'classic' // 테이블 테마
    },
    // 업적 시스템
    achievements: {
        unlockedAchievements: {},
        winStreak: 0,
        hadLowBalance: false
    },
    // 상점 시스템
    shop: {
        ownedItems: {
            // 기본 아이템 소유 설정
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
    },
    // 프로필 시스템
    profile: {
        name: '플레이어',
        avatar: '😎'
    },
    // 현재 게임 상태
    currentGame: 'baccarat',
    currentSaveId: null,
    lastSave: null        // 마지막 저장 시간
};

// IP 체크 및 해외 접속 차단 (기존 코드와 동일)
async function checkLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // 한국이 아닌 경우 접속 차단
        if (data.country !== 'KR') {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('blocked-access').classList.remove('hidden');
            
            // 로그 전송
            sendLog({
                type: 'FOREIGN_ACCESS_BLOCKED',
                ip: data.ip,
                country: data.country,
                city: data.city,
                region: data.region,
                time: new Date().toISOString()
            });
            
            // 모든 데이터 삭제
            clearAllData();
            return false;
        }
        
        // 접속 로그 전송
        sendLog({
            type: 'ACCESS',
            ip: data.ip,
            country: data.country,
            city: data.city,
            region: data.region,
            time: new Date().toISOString()
        });
        
        return true;
    } catch (error) {
        console.error('IP 확인 중 오류 발생:', error);
        
        // 오류 발생 시 기본적으로 접속 허용
        return true;
    }
}

// 로그 전송 함수 (기존 코드와 동일)
async function sendLog(data) {
    try {
        const webhookUrl = 'https://discord.com/api/webhooks/1344289966787792979/PN2M40OTKZ4FMP6JJl1THVPqY8YsaeZ4aX51UB-gNsB3qZK4seaPw-4kN6TgXazpEj1w';
        
        // 임베드 형식으로 로그 구성
        const embed = {
            title: `${data.type} 로그`,
            color: data.type === 'FOREIGN_ACCESS_BLOCKED' ? 16711680 : 5814783, // 빨간색 또는 파란색
            fields: [
                {
                    name: 'IP 주소',
                    value: data.ip || 'Unknown',
                    inline: true
                },
                {
                    name: '국가',
                    value: data.country || 'Unknown',
                    inline: true
                },
                {
                    name: '지역',
                    value: `${data.city || 'Unknown'}, ${data.region || 'Unknown'}`,
                    inline: true
                },
                {
                    name: '시간',
                    value: data.time || new Date().toISOString(),
                    inline: true
                }
            ],
            footer: {
                text: '럭키 카지노 로그 시스템'
            },
            timestamp: new Date().toISOString()
        };
        
        // 추가 정보가 있는 경우 필드에 추가
        if (data.action) {
            embed.fields.push({
                name: '액션',
                value: data.action,
                inline: true
            });
        }
        
        if (data.details) {
            embed.fields.push({
                name: '상세 정보',
                value: data.details,
                inline: false
            });
        }
        
        // 디스코드 웹훅으로 로그 전송
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        
        if (!response.ok) {
            console.error('로그 전송 실패:', await response.text());
        }
    } catch (error) {
        console.error('로그 전송 중 오류 발생:', error);
    }
}

// 데이터 삭제 함수 (기존 코드와 동일)
function clearAllData() {
    localStorage.clear();
    sessionStorage.clear();
    
    // 쿠키 삭제
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}

// 숫자 포맷 함수 (예: 1000 -> 1,000)
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 통화 포맷 함수 (예: 1000 -> ₩1,000)
function formatCurrency(amount) {
    return `₩${formatNumber(amount)}`;
}

// 날짜 포맷 함수
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    return new Date(date).toLocaleString('ko-KR', options);
}

// 랜덤 정수 생성 함수 (min이상, max이하)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 깊은 복사 함수
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 토스트 메시지 표시 함수
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    // 새 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // 아이콘 추가
    let icon = '';
    switch (type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        default:
            icon = 'ℹ️';
    }
    
    toast.innerHTML = `${icon} ${message}`;
    
    // 토스트 컨테이너에 추가
    toastContainer.appendChild(toast);
    
    // 효과음
    if (GAME_DATA.settings.sound) {
        playSound('toast_' + type);
    }
    
    // 5초 후 제거
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// 게임 알림 표시 함수 (UNO 스타일)
function showGameAlert(message) {
    const animationContainer = document.getElementById('animation-container');
    
    // 알림 요소 생성
    const alert = document.createElement('div');
    alert.className = 'game-alert';
    alert.textContent = message;
    
    // 컨테이너에 추가
    animationContainer.appendChild(alert);
    
    // 애니메이션 완료 후 제거 (3초)
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// 돈 변화 애니메이션 표시 함수
function showMoneyChange(amount, x, y) {
    const animationContainer = document.getElementById('animation-container');
    
    // 애니메이션 비활성화 설정 확인
    if (!GAME_DATA.settings.animation) return;
    
    // 금액 변화 요소 생성
    const moneyChange = document.createElement('div');
    moneyChange.className = `money-change ${amount >= 0 ? 'increase' : 'decrease'}`;
    moneyChange.textContent = `${amount >= 0 ? '+' : ''}${formatCurrency(amount)}`;
    moneyChange.style.left = `${x}px`;
    moneyChange.style.top = `${y}px`;
    
    // 컨테이너에 추가
    animationContainer.appendChild(moneyChange);
    
    // 애니메이션 완료 후 제거 (1.5초)
    setTimeout(() => {
        moneyChange.remove();
    }, 1500);
}

// 반짝임 효과 생성 함수
function createSparkle(x, y) {
    const animationContainer = document.getElementById('animation-container');
    
    // 애니메이션 비활성화 설정 확인
    if (!GAME_DATA.settings.animation) return;
    
    // 반짝임 요소 생성
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.position = 'absolute';
    sparkle.style.transform = 'translate(-50%, -50%)';
    sparkle.style.fontSize = `${getRandomInt(15, 25)}px`;
    sparkle.style.opacity = '0';
    sparkle.style.zIndex = '1000';
    
    // 컨테이너에 추가
    animationContainer.appendChild(sparkle);
    
    // 애니메이션 설정
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 애니메이션 진행에 따른 스타일 변경
        if (progress < 0.5) {
            sparkle.style.opacity = (progress * 2).toString();
            sparkle.style.transform = `translate(-50%, -50%) scale(${progress * 2}) rotate(${progress * 360}deg)`;
        } else {
            sparkle.style.opacity = (2 - progress * 2).toString();
            sparkle.style.transform = `translate(-50%, -50%) scale(${2 - progress * 2}) rotate(${progress * 360}deg)`;
        }
        
        // 애니메이션 완료 여부 확인
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            sparkle.remove();
        }
    }
    
    // 애니메이션 시작
    animate();
}

// 여러 반짝임 효과 생성 함수
function createMultipleSparkles(centerX, centerY, count = 5) {
    // 애니메이션 비활성화 설정 확인
    if (!GAME_DATA.settings.animation) return;
    
    for (let i = 0; i < count; i++) {
        const offsetX = getRandomInt(-50, 50);
        const offsetY = getRandomInt(-50, 50);
        createSparkle(centerX + offsetX, centerY + offsetY);
    }
}

// 요소 진동 효과 함수
function shakeElement(element, intensity = 5, duration = 500) {
    // 애니메이션 비활성화 설정 확인
    if (!GAME_DATA.settings.animation) return;
    
    const originalPosition = element.style.position;
    const originalTransform = element.style.transform;
    
    element.style.position = 'relative';
    
    const startTime = Date.now();
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            clearInterval(interval);
            element.style.transform = originalTransform;
            element.style.position = originalPosition;
            return;
        }
        
        const factor = 1 - (elapsed / duration);
        const x = getRandomInt(-intensity, intensity) * factor;
        const y = getRandomInt(-intensity, intensity) * factor;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
    }, 50);
}

// 숫자 증가/감소 애니메이션 함수
function animateNumber(element, start, end, duration = 1000, formatter = null) {
    // 애니메이션 비활성화 설정 확인
    if (!GAME_DATA.settings.animation) {
        element.textContent = formatter ? formatter(end) : end;
        return;
    }
    
    const startTime = Date.now();
    const difference = end - start;
    
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            clearInterval(interval);
            element.textContent = formatter ? formatter(end) : end;
            return;
        }
        
        const percentage = elapsed / duration;
        const value = Math.floor(start + (difference * percentage));
        element.textContent = formatter ? formatter(value) : value;
    }, 16);
}

// 소리 캐시
const SOUND_CACHE = {};

// 소리 재생 함수
function playSound(soundName) {
    if (!GAME_DATA.settings.sound) return;
    
    // 볼륨 설정
    const volume = GAME_DATA.settings.volume / 100;
    
    // 캐시된 소리가 있으면 재사용
    if (SOUND_CACHE[soundName]) {
        const sound = SOUND_CACHE[soundName];
        sound.volume = volume;
        sound.currentTime = 0;
        sound.play().catch(error => console.error('소리 재생 오류:', error));
        return;
    }
    
    // 소리 매핑 객체 (기존 소리 파일 재사용)
    const soundMap = {
        'card_deal': 'card_deal',
        'card_flip': 'card_flip',
        'chip': 'chip',
        'win': 'win',
        'lose': 'lose',
        'push': 'push',
        'blackjack': 'blackjack',
        'money_gain': 'money_gain',
        'money_loss': 'money_loss',
        'bet_select': 'bet_select',
        'bet_clear': 'bet_clear',
        'special_event': 'special_event',
        'modal_open': 'modal_open',
        'modal_close': 'modal_close',
        'loan': 'loan',
        'repay': 'repay',
        
        // 새로운 게임 소리 (기존 소리 재사용)
        'spin': 'special_event',
        'result': 'win',
        'slot_spin': 'special_event',
        'big_win': 'blackjack',
        'check': 'card_flip',
        'call': 'bet_select',
        'raise': 'chip',
        'fold': 'bet_clear',
        
        // 새로운 기능 소리
        'achievement': 'blackjack',
        'purchase': 'money_gain',
        'select': 'bet_select',
        'theme_change': 'modal_open',
        'menu_open': 'modal_open',
        'menu_close': 'modal_close',
        
        // 토스트 소리
        'toast_success': 'win',
        'toast_error': 'lose',
        'toast_warning': 'bet_clear',
        'toast_info': 'bet_select'
    };
    
    // 매핑된 소리 파일 이름 가져오기
    const mappedSound = soundMap[soundName] || soundName;
    
    // 사운드 요소가 없으면 생성
    const sound = new Audio(`assets/sounds/${mappedSound}.mp3`);
    sound.volume = volume;
    
    // 캐시에 저장
    SOUND_CACHE[soundName] = sound;
    
    // 재생
    sound.play().catch(error => console.error('소리 재생 오류:', error));
}

// 배경 음악 재생 함수
function playBackgroundMusic(musicName) {
    if (!GAME_DATA.settings.music) return;
    
    // 볼륨 설정
    const volume = (GAME_DATA.settings.volume / 100) * 0.5; // 배경 음악은 50% 볼륨으로
    
    // 기존 배경 음악 중지
    stopBackgroundMusic();
    
    // 음악 매핑 객체 (기존 음악 파일 재사용)
    const musicMap = {
        'background': 'background',
        'baccarat_bg': 'baccarat_bg',
        'blackjack_bg': 'blackjack_bg',
        
        // 새로운 게임 음악 (기존 음악 재사용)
        'roulette_bg': 'background',
        'slots_bg': 'background',
        'poker_bg': 'background'
    };
    
    // 매핑된 음악 파일 이름 가져오기
    const mappedMusic = musicMap[musicName] || 'background';
    
    // 새 배경 음악 요소 생성
    const music = new Audio(`assets/sounds/${mappedMusic}.mp3`);
    music.id = 'background-music';
    music.loop = true;
    music.volume = volume;
    
    // DOM에 추가
    music.style.display = 'none';
    document.body.appendChild(music);
    
    // 재생
    music.play().catch(error => console.error('배경 음악 재생 오류:', error));
}

// 배경 음악 중지 함수
function stopBackgroundMusic() {
    const music = document.getElementById('background-music');
    if (music) {
        music.pause();
        music.remove();
    }
}

// 설정 업데이트 시 사운드 적용
function updateSoundSettings() {
    const music = document.getElementById('background-music');
    if (music) {
        if (GAME_DATA.settings.music) {
            music.volume = (GAME_DATA.settings.volume / 100) * 0.5;
            music.play().catch(error => console.error('배경 음악 재생 오류:', error));
        } else {
            music.pause();
        }
    }
}

// 배당률 정보 (확장)
const ODDS = {
    baccarat: {
        player: 2.0,   // 플레이어 베팅 배당률
        banker: 1.95,  // 뱅커 베팅 배당률
        tie: 8.0       // 타이 베팅 배당률
    },
    blackjack: {
        win: 2.0,        // 일반 승리 배당률
        blackjack: 2.5   // 블랙잭 배당률
    },
    roulette: {
        number: 36,      // 숫자 베팅 배당률
        dozen: 3,        // 더즌 베팅 배당률
        column: 3,       // 컬럼 베팅 배당률
        color: 2,        // 색상 베팅 배당률
        half: 2,         // 하프 베팅 배당률
        parity: 2        // 홀짝 베팅 배당률
    },
    slots: {
        cherry: 3,       // 체리 3개 배당률
        lemon: 5,        // 레몬 3개 배당률
        grape: 10,       // 포도 3개 배당률
        bell: 20,        // 종 3개 배당률
        diamond: 50,     // 다이아몬드 3개 배당률
        jackpot: 100,    // 잭팟 3개 배당률
        partial: 0.33    // 2개 같은 심볼 배당률 (기본 배당의 1/3)
    },
    poker: {
        royal_flush: 50,      // 로얄 스트레이트 플러시 배당률
        straight_flush: 20,   // 스트레이트 플러시 배당률
        four_of_a_kind: 10,   // 포카드 배당률
        full_house: 7,        // 풀하우스 배당률
        flush: 5,             // 플러시 배당률
        straight: 4,          // 스트레이트 배당률
        three_of_a_kind: 3,   // 트리플 배당률
        two_pair: 2,          // 투페어 배당률
        one_pair: 1,          // 원페어 배당률
        high_card: 0.5        // 하이카드 배당률
    }
};

// 초기화 함수
function initUtils() {
    // 게임 시작 시 IP 체크
    checkLocation().then(allowed => {
        if (allowed) {
            // 로딩 화면 숨기기
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                
                // 배경 음악 재생
                playBackgroundMusic('background');
                
                // 시작 알림 표시
                showGameAlert('어서오세요, 럭키 카지노에 오신 것을 환영합니다!');
            }, 1500);
        }
    });
    
    // 자동 저장 설정 (10분마다)
    if (GAME_DATA.settings.autosave) {
        setInterval(() => {
            saveGameData('autosave');
            showToast('게임이 자동 저장되었습니다.', 'info');
        }, 10 * 60 * 1000); // 10분 = 600,000ms
    }
    
    // 캐시 프리로드
    preloadSounds();
    
    // 콘솔 경고 메시지
    console.warn(
        '%c경고!', 
        'color: red; font-size: 40px; font-weight: bold;'
    );
    console.warn(
        '%c이 콘솔은 개발자용입니다. 여기에 코드를 붙여넣으면 해킹 또는 사기 피해를 입을 수 있습니다.',
        'font-size: 16px;'
    );
}

// 소리 프리로드
function preloadSounds() {
    const soundsToPreload = [
        'card_deal', 'card_flip', 'chip', 'win', 'lose', 'push', 
        'blackjack', 'money_gain', 'money_loss', 'bet_select', 
        'bet_clear', 'special_event', 'modal_open', 'modal_close'
    ];
    
    // 사운드 파일 프리로드
    soundsToPreload.forEach(sound => {
        const audio = new Audio(`assets/sounds/${sound}.mp3`);
        audio.preload = 'auto';
        SOUND_CACHE[sound] = audio;
    });
}

// 유틸리티 초기화 호출
document.addEventListener('DOMContentLoaded', initUtils);
