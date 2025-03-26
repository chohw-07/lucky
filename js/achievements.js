/**
 * 업적 시스템 구현
 */

// 업적 데이터
const ACHIEVEMENTS = [
    {
        id: 'first_game',
        title: '첫 도전',
        description: '첫 게임을 플레이하세요.',
        icon: '🎮',
        condition: (stats) => stats.baccarat.totalGames + stats.blackjack.totalGames + stats.roulette.totalGames + stats.slots.totalGames + stats.poker.totalGames >= 1,
        reward: 5000,
        progress: (stats) => {
            const total = stats.baccarat.totalGames + stats.blackjack.totalGames + stats.roulette.totalGames + stats.slots.totalGames + stats.poker.totalGames;
            return Math.min(total, 1);
        },
        maxProgress: 1
    },
    {
        id: 'baccarat_master',
        title: '바카라 마스터',
        description: '바카라 게임에서 50번 승리하세요.',
        icon: '🃏',
        condition: (stats) => (stats.baccarat.playerWins + stats.baccarat.bankerWins) >= 50,
        reward: 50000,
        progress: (stats) => stats.baccarat.playerWins + stats.baccarat.bankerWins,
        maxProgress: 50
    },
    {
        id: 'blackjack_master',
        title: '블랙잭 마스터',
        description: '블랙잭 게임에서 30번 승리하세요.',
        icon: '♠️',
        condition: (stats) => stats.blackjack.wins >= 30,
        reward: 50000,
        progress: (stats) => stats.blackjack.wins,
        maxProgress: 30
    },
    {
        id: 'roulette_master',
        title: '룰렛 마스터',
        description: '룰렛 게임에서 20번 승리하세요.',
        icon: '🎡',
        condition: (stats) => stats.roulette.wins >= 20,
        reward: 50000,
        progress: (stats) => stats.roulette.wins,
        maxProgress: 20
    },
    {
        id: 'slots_master',
        title: '슬롯 마스터',
        description: '슬롯머신 게임에서 30번 승리하세요.',
        icon: '🎰',
        condition: (stats) => stats.slots.wins >= 30,
        reward: 50000,
        progress: (stats) => stats.slots.wins,
        maxProgress: 30
    },
    {
        id: 'poker_master',
        title: '포커 마스터',
        description: '포커 게임에서 25번 승리하세요.',
        icon: '♦️',
        condition: (stats) => stats.poker.wins >= 25,
        reward: 50000,
        progress: (stats) => stats.poker.wins,
        maxProgress: 25
    },
    {
        id: 'big_winner',
        title: '큰 승자',
        description: '단일 게임에서 ₩500,000 이상 획득하세요.',
        icon: '💰',
        condition: (stats) => {
            return stats.baccarat.maxWin >= 500000 || 
                   stats.blackjack.maxWin >= 500000 || 
                   stats.roulette.maxWin >= 500000 || 
                   stats.slots.maxWin >= 500000 || 
                   stats.poker.maxWin >= 500000;
        },
        reward: 100000,
        progress: (stats) => {
            const maxWin = Math.max(
                stats.baccarat.maxWin || 0,
                stats.blackjack.maxWin || 0,
                stats.roulette.maxWin || 0,
                stats.slots.maxWin || 0,
                stats.poker.maxWin || 0
            );
            return Math.min(maxWin, 500000);
        },
        maxProgress: 500000
    },
    {
        id: 'jackpot',
        title: '잭팟!',
        description: '슬롯머신에서 잭팟을 터뜨리세요.',
        icon: '🏆',
        condition: (stats) => stats.slots.jackpots >= 1,
        reward: 200000,
        progress: (stats) => Math.min(stats.slots.jackpots, 1),
        maxProgress: 1
    },
    {
        id: 'millionaire',
        title: '백만장자',
        description: '보유 금액이 ₩5,000,000 이상이 되세요.',
        icon: '💵',
        condition: () => GAME_DATA.player.money >= 5000000,
        reward: 500000,
        progress: () => Math.min(GAME_DATA.player.money, 5000000),
        maxProgress: 5000000
    },
    {
        id: 'all_rounder',
        title: '올라운더',
        description: '모든 게임을 10회 이상 플레이하세요.',
        icon: '🎯',
        condition: (stats) => {
            return stats.baccarat.totalGames >= 10 && 
                   stats.blackjack.totalGames >= 10 && 
                   stats.roulette.totalGames >= 10 && 
                   stats.slots.totalGames >= 10 && 
                   stats.poker.totalGames >= 10;
        },
        reward: 100000,
        progress: (stats) => {
            const games = [
                Math.min(stats.baccarat.totalGames, 10),
                Math.min(stats.blackjack.totalGames, 10),
                Math.min(stats.roulette.totalGames, 10),
                Math.min(stats.slots.totalGames, 10),
                Math.min(stats.poker.totalGames, 10)
            ];
            return games.reduce((sum, game) => sum + game, 0);
        },
        maxProgress: 50
    },
    {
        id: 'comeback_king',
        title: '컴백킹',
        description: '₩50,000 이하에서 ₩1,000,000 이상으로 복구하세요.',
        icon: '👑',
        condition: () => {
            return GAME_DATA.achievements.hadLowBalance && GAME_DATA.player.money >= 1000000;
        },
        reward: 100000,
        progress: () => {
            if (GAME_DATA.achievements.hadLowBalance) {
                return Math.min(GAME_DATA.player.money, 1000000);
            }
            if (GAME_DATA.player.money <= 50000) {
                GAME_DATA.achievements.hadLowBalance = true;
            }
            return 0;
        },
        maxProgress: 1000000
    },
    {
        id: 'lucky_streak',
        title: '연승 행진',
        description: '연속으로 5번 승리하세요.',
        icon: '🍀',
        condition: () => GAME_DATA.achievements.winStreak >= 5,
        reward: 50000,
        progress: () => Math.min(GAME_DATA.achievements.winStreak, 5),
        maxProgress: 5
    }
];

// 업적 시스템 초기화
function initAchievements() {
    console.log("업적 시스템 초기화...");
    
    // GAME_DATA에 업적 정보 초기화
    if (!GAME_DATA.achievements) {
        GAME_DATA.achievements = {
            unlockedAchievements: {},
            winStreak: 0,
            hadLowBalance: false
        };
    }
    
    // 업적 모달 설정
    setupAchievementsModal();
    
    // 이벤트 리스너 설정
    document.getElementById('rewards-btn').addEventListener('click', () => {
        openModal('achievements-modal');
        updateAchievementsUI();
    });
    
    // 업적 확인 및 알림 (페이지 로드 시)
    setTimeout(checkAchievements, 2000);
}

// 업적 모달 설정
function setupAchievementsModal() {
    // 업적 모달 UI 생성
    updateAchievementsUI();
    
    // 닫기 버튼 이벤트
    document.getElementById('close-achievements').addEventListener('click', () => {
        closeModal();
    });
}

// 업적 UI 업데이트
function updateAchievementsUI() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 각 업적마다 카드 생성
    ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = GAME_DATA.achievements.unlockedAchievements[achievement.id];
        
        // 업적 진행 상황 계산
        const progress = achievement.progress(GAME_DATA.player.stats);
        const progressPercent = Math.min(Math.floor((progress / achievement.maxProgress) * 100), 100);
        
        // 업적 카드 생성
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-progress-text">${progress}/${achievement.maxProgress}</div>
            </div>
            <div class="achievement-reward">₩${formatNumber(achievement.reward)}</div>
        `;
        
        container.appendChild(card);
    });
}

// 업적 확인 및 알림
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        const achievementId = achievement.id;
        
        // 이미 달성한 업적은 스킵
        if (GAME_DATA.achievements.unlockedAchievements[achievementId]) {
            return;
        }
        
        // 업적 조건 확인
        if (achievement.condition(GAME_DATA.player.stats)) {
            // 업적 달성 처리
            GAME_DATA.achievements.unlockedAchievements[achievementId] = true;
            
            // 보상 지급
            GAME_DATA.player.money += achievement.reward;
            updateUI();
            
            // 알림 표시
            showToast(`업적 달성: ${achievement.title}`, 'success');
            specialEventAnimation(`🏆 업적 달성: ${achievement.title}`, 'success');
            
            // 효과음
            playSound('achievement');
            
            // 데이터 변경 알림
            onDataChange();
        }
    });
}

// 게임 결과에 따른 업적 상태 업데이트
function updateAchievementStats(gameType, result) {
    // 연승 스트릭 업데이트
    if (result === 'win') {
        GAME_DATA.achievements.winStreak++;
    } else {
        GAME_DATA.achievements.winStreak = 0;
    }
    
    // 업적 확인
    checkAchievements();
}

/**
 * 상점 시스템 구현
 */
 
// 상점 아이템 데이터
/*const SHOP_ITEMS = {
    avatars: [
        { id: 'avatar_cool', icon: '😎', name: '멋쟁이', price: 5000, description: '멋진 표정의 아바타입니다.' },
        { id: 'avatar_cowboy', icon: '🤠', name: '카우보이', price: 10000, description: '서부 스타일의 카우보이 아바타입니다.' },
        { id: 'avatar_nerd', icon: '🧐', name: '지식인', price: 15000, description: '지적인 표정의 아바타입니다.' },
        { id: 'avatar_happy', icon: '😊', name: '행복이', price: 20000, description: '밝은 미소의 아바타입니다.' },
        { id: 'avatar_disguise', icon: '🥸', name: '변장', price: 30000, description: '위장한 듯한 아바타입니다.' },
        { id: 'avatar_party', icon: '🥳', name: '파티', price: 40000, description: '축하 분위기의 아바타입니다.' },
        { id: 'avatar_smirk', icon: '😏', name: '능글이', price: 50000, description: '자신감 넘치는 아바타입니다.' },
        { id: 'avatar_money', icon: '🤑', name: '부자', price: 100000, description: '돈을 많이 번 듯한 아바타입니다.' }
    ],
    tables: [
        { id: 'table_classic', name: '클래식 녹색', price: 0, description: '전통적인 카지노 테이블 스타일입니다.', class: 'classic' },
        { id: 'table_modern', name: '모던 블루', price: 30000, description: '현대적인 파란색 테이블 스타일입니다.', class: 'modern' },
        { id: 'table_neon', name: '네온 퍼플', price: 50000, description: '화려한 보라색 네온 테이블 스타일입니다.', class: 'neon' },
        { id: 'table_luxury', name: '럭셔리 골드', price: 100000, description: '고급스러운 금색 테이블 스타일입니다.', class: 'luxury' }
    ],
    cards: [
        { id: 'card_classic', name: '클래식 디자인', price: 0, description: '전통적인 카드 디자인입니다.' },
        { id: 'card_modern', name: '모던 디자인', price: 20000, description: '세련된 현대적 카드 디자인입니다.' },
        { id: 'card_abstract', name: '추상화 디자인', price: 35000, description: '독특한 추상화 스타일의 카드 디자인입니다.' },
        { id: 'card_luxury', name: '금박 디자인', price: 75000, description: '금박이 들어간 고급스러운 카드 디자인입니다.' }
    ],
    effects: [
        { id: 'effect_standard', name: '기본 효과', price: 0, description: '기본 애니메이션 효과입니다.' },
        { id: 'effect_enhanced', name: '강화 효과', price: 25000, description: '강화된 애니메이션 효과입니다.' },
        { id: 'effect_premium', name: '프리미엄 효과', price: 60000, description: '다양한 프리미엄 애니메이션 효과입니다.' },
        { id: 'effect_luxury', name: '럭셔리 효과', price: 120000, description: '최고급 럭셔리 애니메이션 효과입니다.' }
    ]
};*/

// 상점 시스템 초기화
function initShop() {
    console.log("상점 시스템 초기화...");
    
    // GAME_DATA에 상점 정보 초기화
    if (!GAME_DATA.shop) {
        GAME_DATA.shop = {
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
        };
    }
    
    // 이벤트 리스너 설정
    document.getElementById('shop-btn').addEventListener('click', () => {
        openModal('shop-modal');
        updateShopUI('avatars'); // 기본 탭은 아바타
    });
    
    // 상점 탭 이벤트 리스너
    const shopTabs = document.querySelectorAll('.shop-tab');
    shopTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭에서 active 클래스 제거
            shopTabs.forEach(t => t.classList.remove('active'));
            
            // 클릭한 탭에 active 클래스 추가
            tab.classList.add('active');
            
            // 해당 탭 내용 표시
            updateShopUI(tab.dataset.tab);
        });
    });
    
    // 적용된 아이템 설정
    applyActiveItems();
}

// 상점 UI 업데이트
function updateShopUI(category) {
    const container = document.getElementById('shop-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 카테고리에 맞는 아이템 표시
    const items = SHOP_ITEMS[category];
    
    items.forEach(item => {
        const isOwned = GAME_DATA.shop.ownedItems[item.id];
        const isActive = GAME_DATA.shop.activeItems[category.slice(0, -1)] === item.id;
        
        // 상점 아이템 카드 생성
        const itemCard = document.createElement('div');
        itemCard.className = `shop-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`;
        
        let previewContent = '';
        
        // 카테고리에 따른 프리뷰 내용
        if (category === 'avatars') {
            previewContent = `<div class="shop-item-preview" style="font-size: 4rem;">${item.icon}</div>`;
        } else if (category === 'tables') {
            previewContent = `<div class="shop-item-preview ${item.class}"></div>`;
        } else if (category === 'cards') {
            previewContent = `<div class="shop-item-preview">${item.id === 'card_classic' ? '🂡' : item.id === 'card_modern' ? '🃁' : item.id === 'card_abstract' ? '🃑' : '🂱'}</div>`;
        } else {
            previewContent = `<div class="shop-item-preview">${item.id === 'effect_standard' ? '✨' : item.id === 'effect_enhanced' ? '💫' : item.id === 'effect_premium' ? '🌟' : '⭐'}</div>`;
        }
        
        itemCard.innerHTML = `
            ${previewContent}
            <div class="shop-item-content">
                <div class="shop-item-title">${item.name}</div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-price">${formatCurrency(item.price)}</div>
                <div class="shop-item-actions">
                    ${isOwned ? 
                      (isActive ? 
                        '<button class="btn success" disabled>사용 중</button>' : 
                        '<button class="btn primary use-item" data-id="' + item.id + '" data-category="' + category + '">적용하기</button>'
                      ) : 
                      '<button class="btn primary buy-item" data-id="' + item.id + '" data-price="' + item.price + '" data-category="' + category + '">구매하기</button>'
                    }
                </div>
            </div>
        `;
        
        container.appendChild(itemCard);
    });
    
    // 구매 버튼 이벤트 설정
    const buyButtons = document.querySelectorAll('.buy-item');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.id;
            const itemPrice = parseInt(button.dataset.price);
            const category = button.dataset.category;
            
            buyShopItem(itemId, itemPrice, category);
        });
    });
    
    // 아이템 적용 버튼 이벤트 설정
    const useButtons = document.querySelectorAll('.use-item');
    useButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.id;
            const category = button.dataset.category;
            
            useShopItem(itemId, category);
        });
    });
}

// 상점 아이템 구매
function buyShopItem(itemId, price, category) {
    // 돈 확인
    if (GAME_DATA.player.money < price) {
        showToast('보유 금액이 부족합니다.', 'error');
        return;
    }
    
    // 구매 처리
    GAME_DATA.player.money -= price;
    updateUI();
    
    // 소유 아이템에 추가
    GAME_DATA.shop.ownedItems[itemId] = true;
    
    // 자동으로 적용
    GAME_DATA.shop.activeItems[category.slice(0, -1)] = itemId;
    
    // 구매 효과음
    playSound('purchase');
    
    // 구매 알림
    showToast(`${getItemName(itemId, category)}을(를) 구매했습니다!`, 'success');
    
    // UI 업데이트
    updateShopUI(category);
    
    // 구매한 아이템 적용
    applyActiveItems();
    
    // 데이터 변경 알림
    onDataChange();
}

// 상점 아이템 적용
function useShopItem(itemId, category) {
    // 아이템 적용
    GAME_DATA.shop.activeItems[category.slice(0, -1)] = itemId;
    
    // 적용 효과음
    playSound('select');
    
    // 적용 알림
    showToast(`${getItemName(itemId, category)}을(를) 적용했습니다.`, 'info');
    
    // UI 업데이트
    updateShopUI(category);
    
    // 적용한 아이템 설정
    applyActiveItems();
    
    // 데이터 변경 알림
    onDataChange();
}

// 아이템 이름 가져오기
function getItemName(itemId, category) {
    const items = SHOP_ITEMS[category];
    const item = items.find(item => item.id === itemId);
    return item ? item.name : '알 수 없는 아이템';
}

// 활성화된 아이템 적용
function applyActiveItems() {
    // 아바타 적용
    const activeAvatar = GAME_DATA.shop.activeItems.avatar;
    const avatarItem = SHOP_ITEMS.avatars.find(item => item.id === activeAvatar);
    
    if (avatarItem) {
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview) {
            avatarPreview.textContent = avatarItem.icon;
        }
        
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.textContent = avatarItem.icon;
        }
    }
    
    // 테이블 스타일 적용
    const activeTable = GAME_DATA.shop.activeItems.table;
    const tableItem = SHOP_ITEMS.tables.find(item => item.id === activeTable);
    
    if (tableItem) {
        const tables = document.querySelectorAll('.game-table');
        tables.forEach(table => {
            // 기존 클래스 제거
            SHOP_ITEMS.tables.forEach(item => {
                table.classList.remove(item.class);
            });
            
            // 새 클래스 추가
            table.classList.add(tableItem.class);
        });
    }
    
    // 카드 스타일 (나중에 구현)
    
    // 효과 스타일 (나중에 구현)
}

/**
 * 사용자 프로필 시스템 구현
 */
 
// 프로필 시스템 초기화
function initProfile() {
    console.log("프로필 시스템 초기화...");
    
    // GAME_DATA에 프로필 정보 초기화
    if (!GAME_DATA.profile) {
        GAME_DATA.profile = {
            name: '플레이어',
            avatar: '😎'
        };
    }
    
    // 이벤트 리스너 설정
    document.getElementById('profile-btn').addEventListener('click', () => {
        openModal('profile-modal');
        updateProfileUI();
    });
    
    // 프로필 저장 버튼
    document.getElementById('save-profile').addEventListener('click', saveProfile);
    
    // 프로필 취소 버튼
    document.getElementById('profile-cancel').addEventListener('click', () => {
        closeModal();
    });
    
    // 아바타 선택 이벤트
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 선택된 아바타 표시
            avatarOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // 프리뷰 업데이트
            const avatar = option.dataset.avatar;
            document.getElementById('avatar-preview').textContent = avatar;
        });
    });
    
    // 프로필 UI 초기화
    updateProfileUI();
}

// 프로필 UI 업데이트
function updateProfileUI() {
    // 플레이어 이름 설정
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
        nameInput.value = GAME_DATA.profile.name;
    }
    
    // 아바타 설정
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarPreview) {
        avatarPreview.textContent = GAME_DATA.profile.avatar;
    }
    
    // 아바타 옵션 설정
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.classList.remove('active');
        
        if (option.dataset.avatar === GAME_DATA.profile.avatar) {
            option.classList.add('active');
        }
    });
    
    // 통계 차트 생성 (나중에 구현)
}

// 프로필 저장
function saveProfile() {
    // 이름 가져오기
    const nameInput = document.getElementById('player-name');
    const newName = nameInput.value.trim() || '플레이어';
    
    // 아바타 가져오기
    const activeAvatar = document.querySelector('.avatar-option.active');
    const newAvatar = activeAvatar ? activeAvatar.dataset.avatar : '😎';
    
    // 프로필 업데이트
    GAME_DATA.profile.name = newName;
    GAME_DATA.profile.avatar = newAvatar;
    
    // 효과음
    playSound('select');
    
    // 알림
    showToast('프로필이 저장되었습니다.', 'success');
    
    // 모달 닫기
    closeModal();
    
    // 데이터 변경 알림
    onDataChange();
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    initAchievements();
    initShop();
    initProfile();
});
