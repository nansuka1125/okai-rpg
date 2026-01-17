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
        
        // ステータス・プログレス
        document.getElementById('statusInfo').textContent = `カイン Lv.${gameState.cainLv} [ ${gameState.cainHP} / ${gameState.cainMaxHP} ]`;
        document.getElementById('hpFill').style.width = `${(gameState.cainHP / gameState.cainMaxHP) * 100}%`;
        document.getElementById('locationBar').textContent = `―― ${loc.name} ――`;
        const ratio = (gameState.currentDistance / CONFIG.MAX_DISTANCE) * 100;
        document.getElementById('progressMarker').style.left = `${ratio}%`;
        document.getElementById('progressText').textContent = `( ${gameState.currentDistance} / ${CONFIG.MAX_DISTANCE}m )`;

        // エリア表示の切り替え
        const exploreUI = document.getElementById('exploreUI');
        const innUI = document.getElementById('innUI');
        const battleBtn = document.getElementById('btnStartBattle');
        const enterInnBtn = document.getElementById('btnEnterInn');

        // 1. バトル中
        if (gameState.isBattling) {
            exploreUI.style.display = 'none';
            innUI.style.display = 'none';
            battleBtn.style.display = 'flex';
            battleBtn.disabled = false;
        } 
        // 2. 宿屋の中
        else if (gameState.isAtInn) {
            exploreUI.style.display = 'none';
            innUI.style.display = 'grid';
            battleBtn.style.display = 'none';
            // 納品ボタンの表示制御
            const canDeliver = (gameState.inventory.silverCoin >= 3 && !gameState.flags.isDelivered);
            document.getElementById('btnInnDeliver').style.display = canDeliver ? 'flex' : 'none';
        } 
        // 3. 通常探索
        else {
            exploreUI.style.display = 'grid';
            innUI.style.display = 'none';
            battleBtn.style.display = 'none';
            
            // 宿屋に入るボタン（0m地点のみ）
            enterInnBtn.style.display = (gameState.currentDistance === 0) ? 'flex' : 'none';

            // 通常ボタンの有効/無効
            document.getElementById('btnMoveForward').disabled = (gameState.currentDistance >= CONFIG.MAX_DISTANCE);
            document.getElementById('btnMoveBack').disabled = (gameState.currentDistance <= CONFIG.MIN_DISTANCE);
            document.getElementById('btnTalk').disabled = !loc.hasTarget;
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
    move: function(step) {
        if (gameState.isBattling || gameState.isAtInn) return;

        const prevLoc = uiControl.getLocData(gameState.currentDistance).name;
        let nextDist = gameState.currentDistance + step;

        // 通行制限
        if (!gameState.flags.isDelivered && nextDist >= CONFIG.MAX_DISTANCE) {
            nextDist = CONFIG.MAX_DISTANCE;
            if (gameState.currentDistance === CONFIG.MAX_DISTANCE && step > 0) {
                uiControl.addLog("門番『通行証か納品が済むまでは通せん。』");
                return;
            }
        }

        if (nextDist < CONFIG.MIN_DISTANCE || nextDist > CONFIG.MAX_DISTANCE) return;

        gameState.currentDistance = nextDist;
        uiControl.addLog(`${gameState.currentDistance}m地点へ移動した。`);

        // エンカウント判定（0m地点では絶対に発生させない）
        if (gameState.currentDistance > 0 && Math.random() < CONFIG.BATTLE_RATE) {
            this.startBattle();
            return;
        }

        uiControl.updateUI();

        // 拾得イベント
        if (gameState.currentDistance === 3 && !gameState.flags.gotTestCoin) {
            gameState.flags.gotTestCoin = true;
            gameState.inventory.silverCoin += 3;
            uiControl.addLog("道端に銀貨が3枚落ちている！カインはそれを拾い上げた。");
        }

        const nextLoc = uiControl.getLocData(gameState.currentDistance);
        if (prevLoc !== nextLoc.name) {
            setTimeout(() => {
                uiControl.addLog(`―― ${nextLoc.name} ――`, "marker");
                uiControl.addLog(nextLoc.desc);
            }, 800);
        }
    },

    // --- 宿屋ロジック ---
    enterInn: function() {
        gameState.isAtInn = true;
        uiControl.addLog("―― 宿屋《琥珀亭》 ――", "marker");
        uiControl.addLog("宿屋の主人『いらっしゃい、カイン。ゆっくりしていきな。』");
        uiControl.updateUI();
    },

    exitInn: function() {
        gameState.isAtInn = false;
        uiControl.addLog("―― 宿屋前 (0m) ――", "marker");
        uiControl.updateUI();
    },

    innTalk: function() {
        uiControl.addLog("宿屋の主人『外の様子はどうだい？』");
    },

    innStay: function() {
        gameState.cainHP = gameState.cainMaxHP;
        uiControl.addLog("カインは一晩眠り、疲れが癒えた。（HPが全回復した）");
        uiControl.updateUI();
    },

    innDeliver: function() {
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");
        uiControl.addLog("宿屋の主人『助かった！これで荷馬車の準備ができる。』");
        uiControl.updateUI();
    },

    // --- バトルロジック ---
    startBattle: function() {
        gameState.isBattling = true;
        gameState.currentEnemy = { ...CONFIG.TEST_ENEMY };
        uiControl.addLog(`${gameState.currentEnemy.name}が現れた！`);
        uiControl.updateUI();
    },

    runBattleLoop: function() {
        const btn = document.getElementById('btnStartBattle');
        btn.disabled = true;
        const loop = () => {
            if (!gameState.isBattling) return;
            // カイン攻撃
            gameState.currentEnemy.hp -= 10;
            uiControl.addLog(`カインの攻撃！ ${gameState.currentEnemy.name}に10のダメージ！`);
            if (gameState.currentEnemy.hp <= 0) {
                uiControl.addLog(`${gameState.currentEnemy.name}を倒した！`);
                this.endBattle();
                return;
            }
            // 敵反撃
            setTimeout(() => {
                gameState.cainHP -= gameState.currentEnemy.atk;
                if (gameState.cainHP <= 0) gameState.cainHP = 1;
                uiControl.addLog(`${gameState.currentEnemy.name}の攻撃！ カインは${gameState.currentEnemy.atk}のダメージを受けた！`);
                uiControl.updateUI();
                if (gameState.isBattling) setTimeout(loop, 1000);
            }, 1000);
        };
        loop();
    },

    endBattle: function() {
        gameState.isBattling = false;
        gameState.currentEnemy = null;
        uiControl.updateUI();
    },

    talk: function() {
        if (gameState.currentDistance === 0) {
            uiControl.addLog("（宿屋に入って主人と話そう）");
        } else {
            uiControl.addLog("（周囲を警戒している…）");
        }
    },

    useItem: function() { uiControl.openModal(); },

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

window.onload = () => { uiControl.addLog("探索を開始した。"); uiControl.updateUI(); };
