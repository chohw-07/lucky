/**
 * 게임 데이터 저장 및 불러오기 관련 기능
 */

// 저장 목록을 불러오는 함수
function getSavedGames() {
    try {
        // 저장된 목록 정보 가져오기
        const savedListJSON = localStorage.getItem('luckyCasino_savedGames');
        if (!savedListJSON) return [];
        
        return JSON.parse(savedListJSON);
    } catch (error) {
        console.error('저장 목록 불러오기 오류:', error);
        showToast('저장 목록을 불러오는 중 오류가 발생했습니다.', 'error');
        return [];
    }
}

// 저장 목록 업데이트 함수
function updateSavedGamesList(newSave) {
    try {
        let savedList = getSavedGames();
        
        // 새 저장 데이터 추가 또는 업데이트
        const existingIndex = savedList.findIndex(save => save.id === newSave.id);
        if (existingIndex !== -1) {
            savedList[existingIndex] = newSave;
        } else {
            savedList.push(newSave);
        }
        
        // 목록 저장
        localStorage.setItem('luckyCasino_savedGames', JSON.stringify(savedList));
        
        // 로그 전송
        sendLog({
            type: 'GAME_SAVED',
            action: '게임 저장',
            details: `저장 이름: ${newSave.name}, 시간: ${newSave.saveDate}`
        });
        
        return true;
    } catch (error) {
        console.error('저장 목록 업데이트 오류:', error);
        showToast('저장 목록 업데이트 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 저장 데이터를 삭제하는 함수
function deleteSavedGame(saveId) {
    try {
        // 저장 목록 불러오기
        let savedList = getSavedGames();
        
        // ID로 저장 데이터 찾기
        const saveIndex = savedList.findIndex(save => save.id === saveId);
        if (saveIndex === -1) {
            showToast('삭제할 저장 데이터를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        // 저장 파일 삭제
        localStorage.removeItem(`luckyCasino_saveData_${saveId}`);
        
        // 목록에서 제거
        savedList.splice(saveIndex, 1);
        localStorage.setItem('luckyCasino_savedGames', JSON.stringify(savedList));
        
        // 로그 전송
        sendLog({
            type: 'GAME_DELETED',
            action: '저장 데이터 삭제',
            details: `저장 ID: ${saveId}`
        });
        
        showToast('저장 데이터가 삭제되었습니다.', 'info');
        return true;
    } catch (error) {
        console.error('저장 데이터 삭제 오류:', error);
        showToast('저장 데이터 삭제 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 게임 데이터를 저장하는 함수
function saveGameData(saveName = null) {
    try {
        // 저장 이름이 없는 경우 현재 날짜/시간 사용
        if (!saveName) {
            saveName = `저장 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        }
        
        // 고유 ID 생성 (현재 ID가 있으면 유지, 없으면 새로 생성)
        const saveId = GAME_DATA.currentSaveId || `save_${Date.now()}`;
        GAME_DATA.currentSaveId = saveId;
        
        // 현재 게임 데이터를 복사
        const dataToSave = deepCopy(GAME_DATA);
        
        // 마지막 저장 시간 업데이트
        dataToSave.lastSave = new Date().toISOString();
        
        // 저장 메타데이터 생성
        const saveMetadata = {
            id: saveId,
            name: saveName,
            saveDate: new Date().toISOString(),
            money: dataToSave.player.money,
            currentGame: dataToSave.currentGame,
            stats: {
                baccarat: {
                    totalGames: dataToSave.player.stats.baccarat.totalGames
                },
                blackjack: {
                    totalGames: dataToSave.player.stats.blackjack.totalGames
                }
            }
        };
        
        // 데이터를 JSON으로 변환
        const jsonData = JSON.stringify(dataToSave);
        
        // JSON 데이터를 DAT 형식으로 변환 (Base64 인코딩)
        const dataBlob = new Blob([jsonData], { type: 'application/octet-stream' });
        const reader = new FileReader();
        
        reader.onload = function() {
            // Base64 데이터
            const base64Data = reader.result.split(',')[1];
            
            // 로컬스토리지에 저장
            localStorage.setItem(`luckyCasino_saveData_${saveId}`, base64Data);
            
            // 저장 목록 업데이트
            updateSavedGamesList(saveMetadata);
            
            // 저장 모달 업데이트
            updateSaveModal();
            
            // 다운로드 파일로 제공
            if (saveName !== 'autosave') {
                downloadSaveFile(saveId, saveName);
            }
            
            showToast('게임이 성공적으로 저장되었습니다.', 'success');
        };
        
        reader.readAsDataURL(dataBlob);
        return true;
    } catch (error) {
        console.error('게임 저장 오류:', error);
        showToast('게임 저장 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 저장 파일 다운로드 함수
function downloadSaveFile(saveId, saveName) {
    try {
        // 저장 데이터 가져오기
        const base64Data = localStorage.getItem(`luckyCasino_saveData_${saveId}`);
        if (!base64Data) {
            showToast('다운로드할 저장 데이터를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        // Base64 데이터를 Blob으로 변환
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'application/octet-stream' });
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `LuckyCasino_${saveName.replace(/[^a-zA-Z0-9]/g, '_')}.dat`;
        
        // 링크 클릭 (다운로드 시작)
        document.body.appendChild(link);
        link.click();
        
        // 링크 제거
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
        
        return true;
    } catch (error) {
        console.error('저장 파일 다운로드 오류:', error);
        showToast('저장 파일 다운로드 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 게임 데이터를 불러오는 함수
function loadGameData(saveId) {
    try {
        // 저장 데이터 가져오기
        const base64Data = localStorage.getItem(`luckyCasino_saveData_${saveId}`);
        if (!base64Data) {
            showToast('불러올 저장 데이터를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        // Base64 데이터를 JSON으로 변환
        const binary = atob(base64Data);
        const jsonData = decodeURIComponent(
            Array.from(binary, char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        
        // JSON 파싱
        const loadedData = JSON.parse(jsonData);
        
        // 게임 데이터 업데이트
        GAME_DATA.player = loadedData.player;
        GAME_DATA.settings = loadedData.settings;
        GAME_DATA.currentGame = loadedData.currentGame;
        GAME_DATA.lastSave = loadedData.lastSave;
        GAME_DATA.currentSaveId = saveId;
        
        // UI 업데이트
        updateUI();
        
        // 현재 게임 화면 전환
        switchGame(GAME_DATA.currentGame);
        
        // 로그 전송
        sendLog({
            type: 'GAME_LOADED',
            action: '게임 불러오기',
            details: `저장 ID: ${saveId}, 불러온 금액: ${GAME_DATA.player.money}`
        });
        
        showToast('게임이 성공적으로 불러와졌습니다.', 'success');
        return true;
    } catch (error) {
        console.error('게임 불러오기 오류:', error);
        showToast('게임 불러오기 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 파일에서 게임 데이터를 불러오는 함수
function loadGameFromFile(file) {
    try {
        // 파일 확장자 확인
        if (!file.name.endsWith('.dat')) {
            showToast('올바른 저장 파일(.dat)을 선택해주세요.', 'error');
            return false;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                // Base64 데이터 추출
                const base64Data = event.target.result.split(',')[1];
                
                // Base64 데이터를 JSON으로 변환
                const binary = atob(base64Data);
                const jsonString = decodeURIComponent(
                    Array.from(binary, char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('')
                );
                
                // JSON 파싱
                const loadedData = JSON.parse(jsonString);
                
                // 고유 ID 생성
                const saveId = `save_import_${Date.now()}`;
                
                // 저장 메타데이터 생성
                const saveName = file.name.replace('.dat', '').replace('LuckyCasino_', '');
                const saveMetadata = {
                    id: saveId,
                    name: saveName,
                    saveDate: new Date().toISOString(),
                    money: loadedData.player.money,
                    currentGame: loadedData.currentGame,
                    stats: {
                        baccarat: {
                            totalGames: loadedData.player.stats.baccarat.totalGames
                        },
                        blackjack: {
                            totalGames: loadedData.player.stats.blackjack.totalGames
                        }
                    }
                };
                
                // 데이터 저장
                localStorage.setItem(`luckyCasino_saveData_${saveId}`, base64Data);
                
                // 저장 목록 업데이트
                updateSavedGamesList(saveMetadata);
                
                // 저장 데이터 불러오기
                loadGameData(saveId);
                
                // 저장 모달 업데이트
                updateSaveModal();
                
                // 로그 전송
                sendLog({
                    type: 'GAME_IMPORTED',
                    action: '게임 파일 불러오기',
                    details: `파일명: ${file.name}, 불러온 금액: ${loadedData.player.money}`
                });
                
                showToast('파일에서 게임이 성공적으로 불러와졌습니다.', 'success');
            } catch (error) {
                console.error('파일 파싱 오류:', error);
                showToast('저장 파일을 불러오는 중 오류가 발생했습니다.', 'error');
            }
        };
        
        reader.readAsDataURL(file);
        return true;
    } catch (error) {
        console.error('파일 불러오기 오류:', error);
        showToast('파일 불러오기 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

// 저장 모달 업데이트 함수
function updateSaveModal() {
    const saveContainer = document.getElementById('save-slots-container');
    const loadContainer = document.getElementById('load-slots-container');
    
    if (!saveContainer || !loadContainer) return;
    
    // 저장 목록 불러오기
    const savedGames = getSavedGames();
    
    // 컨테이너 초기화
    saveContainer.innerHTML = '';
    loadContainer.innerHTML = '';
    
    if (savedGames.length === 0) {
        // 저장 데이터가 없는 경우
        saveContainer.innerHTML = '<div class="empty-message">저장된 게임이 없습니다.</div>';
        loadContainer.innerHTML = '<div class="empty-message">저장된 게임이 없습니다.</div>';
        return;
    }
    
    // 저장 날짜 순으로 정렬 (최신순)
    savedGames.sort((a, b) => new Date(b.saveDate) - new Date(a.saveDate));
    
    // 각 저장 데이터를 리스트에 추가
    savedGames.forEach(save => {
        // 자동 저장은 표시하지 않음
        if (save.name === 'autosave') return;
        
        // 저장 모달용 슬롯
        const saveSlot = document.createElement('div');
        saveSlot.className = 'save-slot';
        saveSlot.dataset.id = save.id;
        
        saveSlot.innerHTML = `
            <div class="slot-name">${save.name}</div>
            <div class="slot-date">${formatDate(save.saveDate)}</div>
            <div class="slot-details">
                <div class="money">${formatCurrency(save.money)}</div>
            </div>
        `;
        
        saveSlot.addEventListener('click', () => {
            // 저장 슬롯 클릭 시 덮어쓰기
            if (confirm(`"${save.name}" 슬롯에 현재 게임을 저장하시겠습니까?`)) {
                GAME_DATA.currentSaveId = save.id;
                saveGameData(save.name);
            }
        });
        
        saveContainer.appendChild(saveSlot);
        
        // 불러오기 모달용 슬롯
        const loadSlot = document.createElement('div');
        loadSlot.className = 'save-slot';
        loadSlot.dataset.id = save.id;
        
        loadSlot.innerHTML = `
            <div class="slot-name">${save.name}</div>
            <div class="slot-date">${formatDate(save.saveDate)}</div>
            <div class="slot-details">
                <div class="money">${formatCurrency(save.money)}</div>
            </div>
            <div class="slot-actions">
                <button class="btn small delete-save" title="삭제"><i class="fas fa-trash"></i></button>
                <button class="btn small download-save" title="다운로드"><i class="fas fa-download"></i></button>
            </div>
        `;
        
        // 불러오기 버튼 클릭 이벤트
        loadSlot.addEventListener('click', (e) => {
            // 삭제 버튼 클릭 이벤트
            if (e.target.closest('.delete-save')) {
                e.stopPropagation();
                if (confirm(`"${save.name}" 저장 데이터를 삭제하시겠습니까?`)) {
                    deleteSavedGame(save.id);
                    updateSaveModal();
                }
                return;
            }
            
            // 다운로드 버튼 클릭 이벤트
            if (e.target.closest('.download-save')) {
                e.stopPropagation();
                downloadSaveFile(save.id, save.name);
                return;
            }
            
            // 슬롯 영역 클릭 시 불러오기
            if (confirm(`"${save.name}" 저장 데이터를 불러오시겠습니까?`)) {
                loadGameData(save.id);
                closeModal();
            }
        });
        
        loadContainer.appendChild(loadSlot);
    });
    
    // 파일 불러오기 버튼 추가
    const fileUploadContainer = document.createElement('div');
    fileUploadContainer.className = 'file-upload-container';
    fileUploadContainer.innerHTML = `
        <h3>파일에서 불러오기</h3>
        <div class="file-upload">
            <label for="file-upload-input" class="btn secondary">
                <i class="fas fa-file-upload"></i> 파일 선택
            </label>
            <input type="file" id="file-upload-input" accept=".dat" style="display: none;">
        </div>
    `;
    
    loadContainer.appendChild(fileUploadContainer);
    
    // 파일 업로드 이벤트 설정
    document.getElementById('file-upload-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadGameFromFile(file);
        }
    });
}

// 데이터가 변경될 때마다 호출되는 함수
function onDataChange() {
    // UI 업데이트
    updateUI();
    
    // 자동 저장이 활성화된 경우, 데이터 변경 시 자동 저장
    if (GAME_DATA.settings.autosave) {
        saveGameData('autosave');
    }
}

// 초기 저장 데이터 확인 및 불러오기
function initStorage() {
    // 자동 저장 데이터 확인
    const savedList = getSavedGames();
    const autosave = savedList.find(save => save.name === 'autosave');
    
    if (autosave) {
        // 자동 저장 데이터가 있으면 불러오기
        loadGameData(autosave.id);
    } else {
        // 자동 저장 데이터가 없으면 초기 저장
        saveGameData('autosave');
    }
}

// 스토리지 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 저장 모달 초기화
    updateSaveModal();
    
    // 저장/불러오기 버튼 이벤트 설정
    document.getElementById('save-btn').addEventListener('click', () => {
        openModal('save-modal');
        updateSaveModal();
    });
    
    document.getElementById('load-btn').addEventListener('click', () => {
        openModal('load-modal');
        updateSaveModal();
    });
    
    // 새 슬롯 저장 버튼 이벤트
    document.getElementById('save-new-slot').addEventListener('click', () => {
        const saveName = document.getElementById('save-name').value.trim();
        if (saveName) {
            saveGameData(saveName);
            closeModal();
        } else {
            showToast('저장 이름을 입력해주세요.', 'warning');
        }
    });
    
    // 초기 데이터 불러오기
    initStorage();
});
