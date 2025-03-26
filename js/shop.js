/**
 * 상점 시스템 구현
 */

// 상점 아이템 데이터
const SHOP_ITEMS = {
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
};

// 상점 초기화
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
    setupShopEventListeners();
    
    // 적용된 아이템 설정
    applyActiveItems();
}

// 상점 이벤트 리스너 설정
function setupShopEventListeners() {
    // 상점 버튼 클릭 이벤트
    const shopBtn = document.getElementById('shop-btn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            openModal('shop-modal');
            updateShopUI('avatars'); // 기본 탭은 아바타
        });
    }
    
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
    
    // 상점 닫기 버튼 이벤트
    const closeShopBtn = document.getElementById('close-shop');
    if (closeShopBtn) {
        closeShopBtn.addEventListener('click', () => {
            closeModal();
        });
    }
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
    
    // 카드 스타일 적용
    const activeCard = GAME_DATA.shop.activeItems.card;
    if (activeCard) {
        // 카드 클래스 설정은 새 카드가 생성될 때 처리됨
        // 기존 코드는 유지
    }
    
    // 효과 스타일 적용
    const activeEffect = GAME_DATA.shop.activeItems.effect;
    if (activeEffect) {
        // 효과 클래스 설정
        document.body.dataset.effect = activeEffect.replace('effect_', '');
    }
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', initShop);
