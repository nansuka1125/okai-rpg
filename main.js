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

        // 納品ボタンの制御（バトル中は隠す）
        const specialArea = document.getElementById('specialActionContainer');
        const showDeliver = (gameState.currentDistance === 0 && gameState.inventory.silverCoin >= 3 && !gameState.flags.isDelivered && !gameState.isBattling);
        specialArea.style.display = showDeliver ? 'block' : 'none';

        // フッターボタンの表示切り替え
        const exploreBtns = [
            document.getElementById('btnMoveForward'),
            document.getElementById('btnMoveBack'),
            document.getElementById('btnTalk'),
            document.getElementById('btnItem')
        ];
        const battleBtn = document.getElementById('btnStartBattle');

        if (gameState.isBattling) {
            exploreBtns.forEach(b => b.style.display = 'none');
            battleBtn.style.display = 'flex';
            battleBtn.disabled = false;
        } else {
            exploreBtns.forEach(b => b.style.display = 'flex');
            battleBtn.style.display = 'none';
            // 通常時の有効/無効
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
        if (gameState.isBattling) return;

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

        gameState.currentDistance = nextDist;
        uiControl.addLog(`${gameState.currentDistance}m地点へ移動した。`);

        // エンカウント判定（0m地点以外）
        if (gameState.currentDistance > 0 && Math.random() < CONFIG.BATTLE_RATE) {
            this.startBattle();
            return;
        }

        uiControl.updateUI();

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

            // 1. カインの攻撃
            const playerAtk = 10;
            gameState.currentEnemy.hp -= playerAtk;
            uiControl.addLog(`カインの攻撃！ ${gameState.currentEnemy.name}に${playerAtk}のダメージ！`);

            if (gameState.currentEnemy.hp <= 0) {
                uiControl.addLog(`${gameState.currentEnemy.name}を倒した！`);
                uiControl.addLog("勝利した！");
                this.endBattle();
                return;
            }

            // 2. 敵の反撃
            setTimeout(() => {
                const enemyAtk = gameState.currentEnemy.atk;
                gameState.cainHP -= enemyAtk;
                if (gameState.cainHP <= 0) gameState.cainHP = 1; // 死亡処理は後ほど
                
                uiControl.addLog(`${gameState.currentEnemy.name}の攻撃！ カインは${enemyAtk}のダメージを受けた！`);
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
        if (gameState.isBattling) return;
        const dist = gameState.currentDistance;
        if (dist === 0) {
            uiControl.addLog(gameState.flags.isDelivered ? "宿屋の主人『気をつけてな！』" : "宿屋の主人『銀貨を3枚、頼んだぞ。』");
        } else if (dist >= 7) {
            uiControl.addLog("（周囲を警戒している…）");
        }
    },

    deliver: function() {
        const btn = document.getElementById('btnDeliver');
        btn.disabled = true;
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");
        uiControl.addLog("宿屋の主人『助かった！これで荷馬車の準備ができる。』");
        uiControl.updateUI();
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
