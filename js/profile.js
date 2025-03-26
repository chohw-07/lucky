/**
 * 사용자 프로필 관리 기능
 */

// 프로필 초기화
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
    setupProfileEventListeners();
    
    // 프로필 UI 초기화
    updateProfileUI();
}

// 프로필 이벤트 리스너 설정
function setupProfileEventListeners() {
    // 프로필 버튼 클릭 이벤트
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            openModal('profile-modal');
            updateProfileUI();
        });
    }
    
    // 프로필 저장 버튼 이벤트
    const saveProfileBtn = document.getElementById('save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // 프로필 취소 버튼 이벤트
    const profileCancelBtn = document.getElementById('profile-cancel');
    if (profileCancelBtn) {
        profileCancelBtn.addEventListener('click', () => {
            closeModal();
        });
    }
    
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
/**
 * 프로필 저장
 */
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
    
    // 데이터 변경 알림 대신 직접 UI 업데이트 및 저장
    updateUI();
    if (typeof saveGameData === 'function') {
        saveGameData('autosave');
    }
}

// 헤더에 프로필 정보 표시
function updateHeaderProfile() {
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar && GAME_DATA.profile) {
        userAvatar.textContent = GAME_DATA.profile.avatar;
    }
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', initProfile);
