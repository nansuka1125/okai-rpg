// 🚩ーー【UI表示・更新処理】ーー
const uiControl = {
    // --- addLog: ログの出力 ---
    addLog: function(text, type = "") {
        const container = document.getElementById('logContainer');
        if (!container) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        if (type === "marker") entry.classList.add('log-marker');
        entry.textContent = text;

        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    },

    // --- updateUI: 画面の全要素を最新状態に更新 ---
    updateUI: function() {
        if (!gameState) return; // 安全ガード

        const loc = this.getLocData(gameState.currentDistance);
        
        // ステータス更新
        const statusInfo = document.getElementById('statusInfo');
        const hpFill = document.getElementById('hpFill');
        if (statusInfo) statusInfo.textContent = `カイン Lv.${gameState.cainLv} [ ${gameState.cainHP} / ${gameState.cainMaxHP} ]`;
        if (hpFill) hpFill.style.width = `${(gameState.cainHP / gameState.cainMaxHP) * 100}%`;

        // ロケーション・メーター制御
        const locBar = document.getElementById('locationBar');
        const progressContainer = document.getElementById('progressContainer');
        
        // ダンジョン内かつ0mより進んでいる場合のみメーターを表示
        if (progressContainer) {
            const shouldShowMeter = gameState.isInDungeon && gameState.currentDistance > 0;
            progressContainer.style.display = shouldShowMeter ? 'block' : 'none';
        }

        if (locBar) {
            locBar.textContent = gameState.isInDungeon ? `―― ${loc.name} ――` : `―― 宿屋前 ――`;
        }
        
        const progressMarker = document.getElementById('progressMarker');
        const progressText = document.getElementById('progressText');
        if (progressMarker && progressText) {
            const ratio = (gameState.currentDistance / CONFIG.MAX_DISTANCE) * 100;
            progressMarker.style.left = `${ratio}%`;
            progressText.textContent = `( ${gameState.currentDistance} / ${CONFIG.MAX_DISTANCE}m )`;
        }

        this.updateControlPanels(loc);
    },

    // --- updateControlPanels: gameState.modeに基づくボタン制御 ---
    updateControlPanels: function(loc) {
        const exploreUI = document.getElementById('exploreUI');
        const innUI = document.getElementById('innUI');
        const allButtons = document.querySelectorAll('button');

        // イベント演出中・戦闘中は全てのボタンを無効化
        if (gameState.mode !== "base") {
            allButtons.forEach(btn => btn.disabled = true);
            return;
        }

        // 基本有効化
        allButtons.forEach(btn => btn.disabled = false);

        if (gameState.isAtInn) {
            if (exploreUI) exploreUI.style.display = 'none';
            if (innUI) innUI.style.display = 'grid';
            const btnInnDeliver = document.getElementById('btnInnDeliver');
            const canDeliver = (gameState.inventory.silverCoin >= 3 && !gameState.flags.isDelivered);
            if (btnInnDeliver) btnInnDeliver.style.display = canDeliver ? 'flex' : 'none';
        } else {
            if (exploreUI) exploreUI.style.display = 'grid';
            if (innUI) innUI.style.display = 'none';
            
            const btnEnterInn = document.getElementById('btnEnterInn');
            const btnMoveForward = document.getElementById('btnMoveForward');
            const btnMoveBack = document.getElementById('btnMoveBack');
            const btnTalk = document.getElementById('btnTalk');

            if (!gameState.isInDungeon) {
                // 拠点（宿屋前）の状態
                if (btnEnterInn) btnEnterInn.style.display = 'flex';
                if (btnMoveForward) {
                    btnMoveForward.textContent = "琥珀の森へ";
                    btnMoveForward.onclick = () => explorationSystem.enterDungeon();
                }
                if (btnMoveBack) btnMoveBack.disabled = true;
            } else {
                // ダンジョン内の状態
                if (btnEnterInn) btnEnterInn.style.display = 'none';
                if (btnMoveForward) {
                    btnMoveForward.textContent = "進む";
                    btnMoveForward.onclick = () => explorationSystem.move(1);
                    btnMoveForward.disabled = (gameState.currentDistance >= CONFIG.MAX_DISTANCE);
                }
                if (btnMoveBack) {
                    btnMoveBack.disabled = false;
                    btnMoveBack.onclick = () => explorationSystem.move(-1);
                }
                if (btnTalk) btnTalk.disabled = !loc.hasTarget;
            }
        }
    },

    getLocData: function(dist) {
        const keys = Object.keys(LOCATIONS).map(Number).sort((a, b) => b - a);
        const key = keys.find(k => dist >= k);
        return LOCATIONS[key] || LOCATIONS[0];
    },

    openModal: function() {
        if (gameState.mode !== "base") return;
        const modal = document.getElementById('itemModal');
        const list = document.getElementById('itemList');
        if (!modal || !list) return;

        list.innerHTML = '';
        const items = Object.entries(gameState.inventory).filter(([k, v]) => v > 0);
        if (items.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding:20px;">所持品なし</div>';
        } else {
            items.forEach(([key, count]) => {
                const div = document.createElement('div');
                div.className = 'item-row';
                div.textContent = `${CONFIG.ITEM_NAME[key]} (×${count})`;
                div.onclick = () => this.selectItem(key, count);
                list.appendChild(div);
            });
        }
        modal.style.display = 'flex';
    },

    selectItem: function(key, count) {
        const detail = document.getElementById('itemDetailArea');
        if (!detail) return;
        let html = `<strong>${CONFIG.ITEM_NAME[key]}</strong> (×${count})<br><span style="font-size:12px;color:#aaa;">${CONFIG.ITEM_DESC[key]}</span>`;
        if (key === 'herb') {
            html += `<br><button class="btn" style="height:35px;margin:10px auto 0;width:120px;" onclick="explorationSystem.executeHerb()">使う</button>`;
        }
        detail.innerHTML = html;
    },

    closeModal: function() {
        const modal = document.getElementById('itemModal');
        if (modal) modal.style.display = 'none';
    }
};


// 🚩ーー【移動・探索システム】ーー
const explorationSystem = {
    // --- checkEvents: イベントマネージャー ---
    checkEvents: function() {
        for (const ev of EVENT_DATA) {
            if (ev.condition(gameState) && !gameState.completedEvents.includes(ev.id)) {
                gameState.mode = "event"; 
                ev.action(gameState);
                gameState.completedEvents.push(ev.id);
                
                setTimeout(() => {
                    gameState.mode = "base";
                    uiControl.updateUI();
                }, 500);
                return true;
            }
        }
        return false;
    },

    enterDungeon: function() {
        gameState.isInDungeon = true;
        gameState.currentDistance = 0;
        gameState.mode = "base";
        uiControl.addLog("―― 琥珀の森 ――", "marker");
        this.move(0);
    },

    move: function(step) {
        if (gameState.mode !== "base" || gameState.isAtInn) return;

        // 0m地点からの脱出
        if (gameState.isInDungeon && gameState.currentDistance === 0 && step === -1) {
            gameState.isInDungeon = false;
            uiControl.addLog("琥珀の森を抜け、宿屋前まで戻ってきた。");
            uiControl.updateUI();
            return;
        }

        const prevLoc = uiControl.getLocData(gameState.currentDistance).name;
        let nextDist = gameState.currentDistance + step;

        if (!gameState.flags.isDelivered && nextDist >= CONFIG.MAX_DISTANCE) {
            nextDist = CONFIG.MAX_DISTANCE;
            if (gameState.currentDistance === CONFIG.MAX_DISTANCE && step > 0) {
                uiControl.addLog("門番『通行証か納品が済むまでは通せん。』");
                return;
            }
        }

        if (nextDist < CONFIG.MIN_DISTANCE || nextDist > CONFIG.MAX_DISTANCE) return;

        if (step !== 0) {
            gameState.canStay = true;
            gameState.currentDistance = nextDist;
            uiControl.addLog(`${gameState.currentDistance}m地点へ移動した。`);
        }

        // イベント判定
        if (this.checkEvents()) return;

        // エンカウント判定（0mより先）
        if (gameState.isInDungeon && gameState.currentDistance > 0 && Math.random() < CONFIG.BATTLE_RATE) {
            battleSystem.startBattle();
            return;
        }

        uiControl.updateUI();

        const nextLoc = uiControl.getLocData(gameState.currentDistance);
        if (prevLoc !== nextLoc.name) {
            setTimeout(() => {
                uiControl.addLog(`―― ${nextLoc.name} ――`, "marker");
                uiControl.addLog(nextLoc.desc);
            }, 600);
        }
    },

    talk: function() {
        if (!gameState.isInDungeon) {
            uiControl.addLog("（宿屋に入って主人と話そう）");
        } else {
            uiControl.addLog("（周囲を警戒している…）");
        }
    },

    executeHerb: function() {
        if (gameState.inventory.herb > 0) {
            gameState.inventory.herb--;
            gameState.cainHP = gameState.cainMaxHP;
            uiControl.updateUI();
            uiControl.closeModal();
            uiControl.addLog("薬草を使い、HPが全回復した。");
        }
    }
};


// 🚩ーー【宿屋・拠点システム】ーー
const innSystem = {
    enterInn: function() {
        gameState.isAtInn = true;
        gameState.mode = "base"; 
        uiControl.addLog("―― 宿屋《琥珀亭》 ――", "marker");
        uiControl.addLog("宿屋の主人『いらっしゃい、カイン。ゆっくりしていきな。』");
        uiControl.updateUI();
    },

    exitInn: function() {
        gameState.isAtInn = false;
        gameState.isInDungeon = false;
        gameState.currentDistance = 0;
        gameState.mode = "base";
        gameState.canStay = true;
        uiControl.addLog("―― 宿屋前 ――", "marker");
        uiControl.updateUI();
    },

    talk: function() {
        if (gameState.mode !== "base") return;
        const talkList = TALK_DATA.innOwner;
        const index = Math.min(gameState.talkCount || 0, talkList.length - 1);
        const currentTalk = talkList[index];

        gameState.mode = "event"; 
        uiControl.addLog(currentTalk.text);

        if (currentTalk.effect === "getHerb") {
            gameState.inventory.herb += 1;
            uiControl.addLog("（薬草を1つももらた！）");
        }

        if (gameState.talkCount < talkList.length - 1) {
            gameState.talkCount++;
        }

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 400);
    },

    stay: function() {
        if (gameState.mode !== "base") return;
        if (gameState.cainHP >= gameState.cainMaxHP) {
            uiControl.addLog("カイン「今はまだ休む必要はないな。」");
            return;
        }
        if (!gameState.canStay) {
            uiControl.addLog("宿屋の主人『悪いが、そう何度も部屋は貸せねえよ。』");
            return;
        }

        gameState.mode = "event";
        gameState.cainHP = gameState.cainMaxHP;
        gameState.canStay = false; 
        uiControl.addLog("カインは一晩眠り、疲れが癒えた。");

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 1000);
    },

    deliver: function() {
        if (gameState.inventory.silverCoin < 3 || gameState.mode !== "base") return;
        gameState.mode = "event";
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 800);
    }
};


// 🚩ーー【バトルシステム】ーー
const battleSystem = {
    startBattle: function() {
        gameState.mode = "battle";
        gameState.isBattling = true;
        gameState.currentEnemy = { ...CONFIG.TEST_ENEMY };
        uiControl.addLog(`${gameState.currentEnemy.name}が現れた！`);
        uiControl.updateUI();
        setTimeout(() => this.runBattleLoop(), 800);
    },

    runBattleLoop: function() {
        if (!gameState.isBattling || !gameState.currentEnemy) return;

        const playerAtk = 10;
        gameState.currentEnemy.hp -= playerAtk;
        uiControl.addLog(`カインの攻撃！ ${gameState.currentEnemy.name}に${playerAtk}のダメージ！`);

        if (gameState.currentEnemy.hp <= 0) {
            uiControl.addLog(`${gameState.currentEnemy.name}を倒した！`);
            this.endBattle();
            return;
        }

        setTimeout(() => {
            if (!gameState.isBattling) return;
            gameState.cainHP -= gameState.currentEnemy.atk;
            if (gameState.cainHP <= 0) gameState.cainHP = 1;
            uiControl.addLog(`${gameState.currentEnemy.name}の攻撃！ カインは${gameState.currentEnemy.atk}のダメージ！`);
            uiControl.updateUI();
            if (gameState.isBattling) setTimeout(() => this.runBattleLoop(), 800);
        }, 800);
    },

    endBattle: function() {
        gameState.mode = "base";
        gameState.isBattling = false;
        gameState.currentEnemy = null;
        uiControl.updateUI();
    }
};

// 🚩ーー【初期化：完全版】ーー
window.onload = () => {
    gameState.mode = "base";
    gameState.isInDungeon = false;
    gameState.currentDistance = 0;
    
    uiControl.addLog("探索を開始した。");
    uiControl.updateUI();
};
