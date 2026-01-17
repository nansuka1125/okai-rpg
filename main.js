// --- UI操作モジュール ---
const uiControl = {
    addLog: function(text, type = "") {
        const container = document.getElementById('logContainer');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        if (type === "marker") entry.classList.add('log-marker');
        entry.textContent = text;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    },

    updateUI: function() {
        const loc = this.getLocData(gameState.currentDistance);
        
        // ステータス更新
        document.getElementById('statusInfo').textContent = `カイン Lv.${gameState.cainLv} [ ${gameState.cainHP} / ${gameState.cainMaxHP} ]`;
        document.getElementById('hpFill').style.width = `${(gameState.cainHP / gameState.cainMaxHP) * 100}%`;
        document.getElementById('locationBar').textContent = `―― ${loc.name} ――`;

        // 距離メーターの表示/非表示 (0mまたは宿屋内は非表示)
        const progressContainer = document.getElementById('progressContainer');
        if (gameState.currentDistance > 0 && gameState.isExploring) {
            progressContainer.style.display = 'block';
            const ratio = (gameState.currentDistance / CONFIG.MAX_DISTANCE) * 100;
            document.getElementById('progressMarker').style.left = `${ratio}%`;
            document.getElementById('progressText').textContent = `( ${gameState.currentDistance} / ${CONFIG.MAX_DISTANCE}m )`;
        } else {
            progressContainer.style.display = 'none';
        }

        // UI表示切り替え
        const exploreUI = document.getElementById('exploreUI');
        const innUI = document.getElementById('innUI');
        const enterInnBtn = document.getElementById('btnEnterInn');
        const startExploreBtn = document.getElementById('btnStartExplore');

        // 全ボタン要素の取得（一括 disabled 用）
        const allButtons = document.querySelectorAll('footer button');

        if (gameState.isBattling) {
            // 戦闘中：全ボタンを無効化
            allButtons.forEach(btn => btn.disabled = true);
        } else if (gameState.isAtInn) {
            // 宿屋内
            allButtons.forEach(btn => btn.disabled = false);
            exploreUI.style.display = 'none';
            innUI.style.display = 'grid';
            const canDeliver = (gameState.inventory.silverCoin >= 3 && !gameState.flags.isDelivered);
            document.getElementById('btnInnDeliver').style.display = canDeliver ? 'flex' : 'none';
        } else {
            // 通常（0m or 探索中）
            allButtons.forEach(btn => btn.disabled = false);
            exploreUI.style.display = 'grid';
            innUI.style.display = 'none';

            if (gameState.currentDistance === 0) {
                // 0m地点の特殊制限
                enterInnBtn.style.display = 'flex';
                startExploreBtn.style.display = 'flex';
                document.getElementById('btnMoveForward').disabled = true;
                document.getElementById('btnMoveBack').disabled = true;
                document.getElementById('btnTalk').disabled = true;
                document.getElementById('btnItem').disabled = true;
            } else {
                // 探索中
                enterInnBtn.style.display = 'none';
                startExploreBtn.style.display = 'none';
                document.getElementById('btnMoveForward').disabled = (gameState.currentDistance >= CONFIG.MAX_DISTANCE);
                document.getElementById('btnMoveBack').disabled = (gameState.currentDistance <= CONFIG.MIN_DISTANCE);
                document.getElementById('btnTalk').disabled = !loc.hasTarget;
            }
        }
    },

    getLocData: function(dist) {
        const keys = Object.keys(LOCATIONS).map(Number).sort((a, b) => b - a);
        return LOCATIONS[keys.find(k => dist >= k)];
    },

    openModal: function() {
        const modal = document.getElementById('itemModal');
        const list = document.getElementById('itemList');
        list.innerHTML = '';
        const items = Object.entries(gameState.inventory).filter(([k,v]) => v > 0);
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
        let html = `<strong>${CONFIG.ITEM_NAME[key]}</strong> (×${count})<br><span style="font-size:12px;color:#aaa;">${CONFIG.ITEM_DESC[key]}</span>`;
        if (key === 'herb') {
            html += `<br><button class="btn" style="height:35px;margin:10px auto 0;width:120px;" onclick="gameAction.executeHerb()">使う</button>`;
        }
        detail.innerHTML = html;
    },

    closeModal: function() { document.getElementById('itemModal').style.display = 'none'; }
};

// --- ゲーム論理モジュール ---
const gameAction = {
    startExplore: function() {
        gameState.isExploring = true;
        gameState.currentDistance = 1; // 1m目からスタート
        uiControl.addLog("―― 琥珀の森 ――", "marker");
        uiControl.updateUI();
    },

    move: function(step) {
        if (gameState.isBattling || gameState.isAtInn) return;

        let nextDist = gameState.currentDistance + step;

        // 0mに戻る時の処理
        if (nextDist <= 0) {
            gameState.currentDistance = 0;
            gameState.isExploring = false;
            uiControl.addLog("宿屋の前に戻ってきた。");
            uiControl.updateUI();
            return;
        }

        // 通行制限（納品前は10m地点へ進めない）
        if (!gameState.flags.isDelivered && nextDist >= CONFIG.MAX_DISTANCE) {
            nextDist = CONFIG.MAX_DISTANCE;
            if (gameState.currentDistance === CONFIG.MAX_DISTANCE && step > 0) {
                uiControl.addLog("門番に止められた。");
                return;
            }
        }

        gameState.currentDistance = nextDist;
        uiControl.addLog(`${gameState.currentDistance}m地点。`);

        // エンカウント判定（0m地点以外）
        if (gameState.currentDistance > 0 && Math.random() < CONFIG.BATTLE_RATE) {
            this.startBattle();
        } else {
            uiControl.updateUI();
        }

        // 銀貨拾得
        if (gameState.currentDistance === 3 && !gameState.flags.gotTestCoin) {
            gameState.flags.gotTestCoin = true;
            gameState.inventory.silverCoin += 3;
            uiControl.addLog("銀貨を3枚拾った！");
        }
    },

    // --- 宿屋ロジック ---
    enterInn: function() {
        gameState.isAtInn = true;
        uiControl.updateUI();
    },

    exitInn: function() {
        gameState.isAtInn = false;
        uiControl.updateUI();
    },

    innStay: function() {
        gameState.cainHP = gameState.cainMaxHP;
        uiControl.addLog("体力が全回復した。");
        uiControl.updateUI();
    },

    innDeliver: function() {
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");
        uiControl.updateUI();
    },

    // --- 完全オートバトルロジック ---
    startBattle: function() {
        gameState.isBattling = true;
        gameState.currentEnemy = { ...CONFIG.TEST_ENEMY };
        uiControl.addLog(`${gameState.currentEnemy.name}が現れた！`);
        uiControl.updateUI();

        const battleLoop = () => {
            if (!gameState.isBattling) return;

            // プレイヤー攻撃
            gameState.currentEnemy.hp -= 10;
            uiControl.addLog(`カインの攻撃！ ${gameState.currentEnemy.name}に10ダメージ。`);

            if (gameState.currentEnemy.hp <= 0) {
                uiControl.addLog(`${gameState.currentEnemy.name}を倒した！`);
                gameState.isBattling = false;
                gameState.currentEnemy = null;
                uiControl.updateUI();
                return;
            }

            // 敵の攻撃
            setTimeout(() => {
                gameState.cainHP -= gameState.currentEnemy.atk;
                if (gameState.cainHP <= 0) gameState.cainHP = 1;
                uiControl.addLog(`${gameState.currentEnemy.name}の攻撃！ カインは${gameState.currentEnemy.atk}ダメージ。`);
                uiControl.updateUI();

                if (gameState.isBattling) {
                    setTimeout(battleLoop, 1000);
                }
            }, 1000);
        };

        setTimeout(battleLoop, 1000);
    },

    useItem: function() { uiControl.openModal(); },
    executeHerb: function() {
        if (gameState.inventory.herb > 0) {
            gameState.inventory.herb--;
            gameState.cainHP = gameState.cainMaxHP;
            uiControl.updateUI();
            uiControl.closeModal();
            uiControl.addLog("薬草で回復した。");
        }
    }
};

window.onload = () => { uiControl.updateUI(); };
