/**
 * 개선된 게임 데이터 저장 및 불러오기 기능
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
        const dataToSave = JSON.parse(JSON.stringify(GAME_DATA));
        
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
                },
                roulette: {
                    totalGames: dataToSave.player.stats.roulette ? 
                        dataToSave.player.stats.roulette.totalGames : 0
                },
                slots: {
                    totalGames: dataToSave.player.stats.slots ? 
                        dataToSave.player.stats.slots.totalGames : 0
                },
                poker: {
                    totalGames: dataToSave.player.stats.poker ? 
                        dataToSave.player.stats.poker.totalGames : 0
                }
            },
            avatar: dataToSave.profile ? dataToSave.profile.avatar : '😎',
            theme: dataToSave.settings ? dataToSave.settings.theme : 'dark'
        };
        
        // 데이터를 JSON으로 변환
        const jsonData = JSON.stringify(dataToSave);
        
        // 로컬 스토리지에 저장
        localStorage.setItem(`luckyCasino_saveData_${saveId}`, jsonData);
        
        // 저장 목록 업데이트
        updateSavedGamesList(saveMetadata);
        
        // 저장 모달 업데이트
        updateSaveModal();
        
        // 효과음
        playSound('save');
        
        // 알림 표시
        if (saveName !== 'autosave') {
            showToast('게임이 성공적으로 저장되었습니다.', 'success');
        }
        
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
        const saveData = localStorage.getItem(`luckyCasino_saveData_${saveId}`);
        if (!saveData) {
            showToast('다운로드할 저장 데이터를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        // Blob 생성
        const blob = new Blob([saveData], { type: 'application/json' });
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `LuckyCasino_${saveName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        
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
        const saveData = localStorage.getItem(`luckyCasino_saveData_${saveId}`);
        if (!saveData) {
            showToast('불러올 저장 데이터를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        let loadedData;
        
        // LZ 압축 해제 시도
        try {
            const decompressedData = LZString.decompressFromUTF16(saveData);
            if (decompressedData) {
                loadedData = JSON.parse(decompressedData);
            } else {
                // 압축되지 않은A 데이터
                loadedData = JSON.parse(saveData);
            }
        } catch (decompressionError) {
            // 압축 해제 실패 시 일반 파싱
            console.warn('압축 해제 실패, 일반 파싱 진행:', decompressionError);
            loadedData = JSON.parse(saveData);
        }
        
        // 기존 설정 백업
        const currentSettings = deepCopy(GAME_DATA.settings);
        
        // 게임 데이터 업데이트 (설정 제외)
        GAME_DATA.player = loadedData.player;
        GAME_DATA.currentGame = loadedData.currentGame;
        GAME_DATA.lastSave = loadedData.lastSave;
        GAME_DATA.currentSaveId = saveId;
        
        // 신규 기능 데이터 불러오기
        if (loadedData.achievements) {
            GAME_DATA.achievements = loadedData.achievements;
        } else {
            // 이전 버전 저장 데이터는 업적 초기화
            GAME_DATA.achievements = {
                unlockedAchievements: {},
                winStreak: 0,
                hadLowBalance: false
            };
        }
        
        if (loadedData.shop) {
            GAME_DATA.shop = loadedData.shop;
        } else {
            // 이전 버전 저장 데이터는 상점 초기화
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
        }
        
        if (loadedData.profile) {
            GAME_DATA.profile = loadedData.profile;
        } else {
            // 이전 버전 저장 데이터는 프로필 초기화
            GAME_DATA.profile = {
                name: '플레이어',
                avatar: '😎'
            };
        }
        
        // 새로운 게임에 대한 통계 데이터 확인 및 초기화
        if (!GAME_DATA.player.stats.roulette) {
            GAME_DATA.player.stats.roulette = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            };
        }
        
        if (!GAME_DATA.player.stats.slots) {
            GAME_DATA.player.stats.slots = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                jackpots: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            };
        }
        
        if (!GAME_DATA.player.stats.poker) {
            GAME_DATA.player.stats.poker = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                moneyWon: 0,
                moneyLost: 0,
                maxWin: 0
            };
        }
        
        // 새로운 게임 히스토리 확인 및 초기화
        if (!GAME_DATA.player.history.roulette) {
            GAME_DATA.player.history.roulette = [];
        }
        
        if (!GAME_DATA.player.history.slots) {
            GAME_DATA.player.history.slots = [];
        }
        
        if (!GAME_DATA.player.history.poker) {
            GAME_DATA.player.history.poker = [];
        }
        
        // 테마 설정만 적용, 기타 설정은 유지
        if (loadedData.settings && loadedData.settings.theme) {
            GAME_DATA.settings.theme = loadedData.settings.theme;
            setTheme(loadedData.settings.theme);
        } else {
            // 기존 설정 복원
            GAME_DATA.settings = currentSettings;
        }
        
        // UI 업데이트
        updateUI();
        
        // 현재 게임 화면 전환
        switchGame(GAME_DATA.currentGame);
        
        // 상점에서 선택한 아이템 적용
        applyActiveItems();
        
        // 로그 전송
        sendLog({
            type: 'GAME_LOADED',
            action: '게임 불러오기',
            details: `저장 ID: ${saveId}, 불러온 금액: ${GAME_DATA.player.money}`
        });
        
        // 효과음
        playSound('load');
        
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
        // 확장자 확인
        if (!file.name.endsWith('.json')) {
            showToast('올바른 저장 파일(.json)을 선택해주세요.', 'error');
            return false;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const fileData = event.target.result;
                
                // 고유 ID 생성
                const saveId = `save_import_${Date.now()}`;
                
                // 저장 데이터 로컬 스토리지에 저장
                localStorage.setItem(`luckyCasino_saveData_${saveId}`, fileData);
                
                // 저장 메타데이터 생성
                let loadedData;
                
                try {
                    // LZ 압축 해제 시도
                    const decompressedData = LZString.decompressFromUTF16(fileData);
                    if (decompressedData) {
                        loadedData = JSON.parse(decompressedData);
                    } else {
                        // 압축되지 않은 데이터
                        loadedData = JSON.parse(fileData);
                    }
                } catch (decompressionError) {
                    // 압축 해제 실패 시 일반 파싱
                    loadedData = JSON.parse(fileData);
                }
                
                // 저장 이름 추출
                const saveName = file.name.replace('.json', '').replace('LuckyCasino_', '');
                
                // 저장 메타데이터 생성
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
                        },
                        roulette: {
                            totalGames: loadedData.player.stats.roulette ? 
                                loadedData.player.stats.roulette.totalGames : 0
                        },
                        slots: {
                            totalGames: loadedData.player.stats.slots ? 
                                loadedData.player.stats.slots.totalGames : 0
                        },
                        poker: {
                            totalGames: loadedData.player.stats.poker ? 
                                loadedData.player.stats.poker.totalGames : 0
                        }
                    },
                    avatar: loadedData.profile ? loadedData.profile.avatar : '😎',
                    theme: loadedData.settings ? loadedData.settings.theme : 'dark'
                };
                
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
        
        reader.readAsText(file);
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
        
        // 아바타 표시
        const avatarDisplay = save.avatar ? save.avatar : '😎';
        
        saveSlot.innerHTML = `
            <div class="slot-avatar">${avatarDisplay}</div>
            <div class="slot-info">
                <div class="slot-name">${save.name}</div>
                <div class="slot-date">${formatDate(save.saveDate)}</div>
                <div class="slot-details">
                    <div class="money">${formatCurrency(save.money)}</div>
                </div>
            </div>
        `;
        
        // 테마 클래스 추가
        if (save.theme) {
            saveSlot.classList.add(`theme-${save.theme}`);
        }
        
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
            <div class="slot-avatar">${avatarDisplay}</div>
            <div class="slot-info">
                <div class="slot-name">${save.name}</div>
                <div class="slot-date">${formatDate(save.saveDate)}</div>
                <div class="slot-details">
                    <div class="money">${formatCurrency(save.money)}</div>
                    <div class="game-stats">
                        <span title="바카라">🃏 ${save.stats.baccarat.totalGames || 0}</span>
                        <span title="블랙잭">♠️ ${save.stats.blackjack.totalGames || 0}</span>
                        ${save.stats.roulette ? `<span title="룰렛">🎡 ${save.stats.roulette.totalGames || 0}</span>` : ''}
                        ${save.stats.slots ? `<span title="슬롯머신">🎰 ${save.stats.slots.totalGames || 0}</span>` : ''}
                        ${save.stats.poker ? `<span title="포커">♦️ ${save.stats.poker.totalGames || 0}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="slot-actions">
                <button class="btn small delete-save" title="삭제">🗑️</button>
                <button class="btn small download-save" title="다운로드">💾</button>
            </div>
        `;
        
        // 테마 클래스 추가
        if (save.theme) {
            loadSlot.classList.add(`theme-${save.theme}`);
        }
        
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
                <span>📂 파일 선택</span>
            </label>
            <input type="file" id="file-upload-input" accept=".json" style="display: none;">
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

// LZ-String 라이브러리 (압축용)
var LZString = (function() {
    // 라이브러리 코드 축약 버전
    var f=String.fromCharCode;var keyStrUriSafe="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";var baseReverseDic={};function getBaseValue(alphabet,character){if(!baseReverseDic[alphabet]){baseReverseDic[alphabet]={};for(var i=0;i<alphabet.length;i++){baseReverseDic[alphabet][alphabet.charAt(i)]=i}}return baseReverseDic[alphabet][character]}var LZString={compressToBase64:function(input){if(input==null)return"";var res=LZString._compress(input,6,function(a){return keyStrUriSafe.charAt(a)});switch(res.length%4){default:case 0:return res;case 1:return res+"===";case 2:return res+"==";case 3:return res+"="}},decompressFromBase64:function(input){if(input==null)return"";if(input=="")return null;return LZString._decompress(input.length,32,function(index){return getBaseValue(keyStrUriSafe,input.charAt(index))})},compressToUTF16:function(input){if(input==null)return"";return LZString._compress(input,15,function(a){return f(a+32)})+"Â ";},decompressFromUTF16:function(compressed){if(compressed==null)return"";if(compressed=="")return null;return LZString._decompress(compressed.length,16384,function(index){return compressed.charCodeAt(index)-32})},_compress:function(uncompressed,bitsPerChar,getCharFromInt){if(uncompressed==null)return"";var i,value,context_dictionary={},context_dictionaryToCreate={},context_w="",context_enlargeIn=2,context_dictSize=3,context_data=[],context_data_val=0,context_data_position=0,ii;for(ii=0;ii<uncompressed.length;ii+=1){context_w+=uncompressed.charAt(ii);if(!Object.prototype.hasOwnProperty.call(context_dictionary,context_w)){context_dictionary[context_w]=context_dictSize++;context_dictionaryToCreate[context_w]=true}}if(context_w!==""){if(Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)){if(context_w.charCodeAt(0)<256){for(i=0;i<context_enlargeIn;i++){context_data_val=context_data_val<<1;if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}}for(i=0;i<8;i++){context_data_val=context_data_val<<1|(context_w.charCodeAt(0)&1<<i?1:0);if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}}}else{for(i=0;i<context_enlargeIn;i++){context_data_val=context_data_val<<1|1;if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}}for(i=0;i<16;i++){context_data_val=context_data_val<<1|(context_w.charCodeAt(0)&1<<i?1:0);if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}}}context_enlargeIn--;if(context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_dictSize);context_dictSize++}delete context_dictionaryToCreate[context_w]}else{for(i=0;i<context_enlargeIn;i++){context_data_val=context_data_val<<1|value&1;if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}value=value>>1}}context_enlargeIn--;if(context_enlargeIn==0){context_enlargeIn=Math.pow(2,context_dictSize);context_dictSize++}context_dictionary[context_w]=context_dictSize++;value=context_dictSize-1}}for(i=0;i<context_enlargeIn;i++){context_data_val=context_data_val<<1;if(context_data_position==bitsPerChar-1){context_data_position=0;context_data.push(getCharFromInt(context_data_val));context_data_val=0}else{context_data_position++}}while(true){context_data_val=context_data_val<<1;if(context_data_position==bitsPerChar-1){context_data.push(getCharFromInt(context_data_val));break}else context_data_position++}return context_data.join("")},
    _decompress:function(length,resetValue,getNextValue){var dictionary=[],next,enlargeIn=4,dictSize=4,numBits=3,entry="",result=[],i,w,bits,resb,maxpower,power,c,data={val:getNextValue(0),position:resetValue,index:1};for(i=0;i<3;i+=1){dictionary[i]=i}bits=0;maxpower=Math.pow(2,2);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}switch(next=bits){case 0:bits=0;maxpower=Math.pow(2,8);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}c=f(bits);break;case 1:bits=0;maxpower=Math.pow(2,16);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}c=f(bits);break;case 2:return""}dictionary[3]=c;w=c;result.push(c);while(true){if(data.index>length){return""}bits=0;maxpower=Math.pow(2,numBits);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}switch(c=bits){case 0:bits=0;maxpower=Math.pow(2,8);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}dictionary[dictSize++]=f(bits);c=dictSize-1;enlargeIn--;break;case 1:bits=0;maxpower=Math.pow(2,16);power=1;while(power!=maxpower){resb=data.val&data.position;data.position>>=1;if(data.position==0){data.position=resetValue;data.val=getNextValue(data.index++)}bits|=(resb>0?1:0)*power;power<<=1}dictionary[dictSize++]=f(bits);c=dictSize-1;enlargeIn--;break;case 2:return result.join("")}if(enlargeIn==0){enlargeIn=Math.pow(2,numBits);numBits++}if(dictionary[c]){entry=dictionary[c]}else{if(c===dictSize){entry=w+w.charAt(0)}else{return null}}result.push(entry);dictionary[dictSize++]=w+entry.charAt(0);enlargeIn--;w=entry;if(enlargeIn==0){enlargeIn=Math.pow(2,numBits);numBits++}}}};return LZString})();

// 데이터가 변경될 때마다 호출되는 함수
function onDataChange() {
    // UI 업데이트
    updateUI();
    
    // 자동 저장이 활성화된 경우, 데이터 변경 시 자동 저장
    if (GAME_DATA.settings.autosave) {
        saveGameData('autosave');
    }
    
    // 업적 체크
    checkAchievements();
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
