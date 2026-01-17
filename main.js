// 🚩ーー【UI表示・更新処理】ここからーー
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
        const loc = this.getLocData(gameState.currentDistance);
        
        // ステータス更新
        const statusInfo = document.getElementById('statusInfo');
        const hpFill = document.getElementById('hpFill');
        if (statusInfo) statusInfo.textContent = `カイン Lv.${gameState.cainLv} [ ${gameState.cainHP} / ${gameState.cainMaxHP} ]`;
        if (hpFill) hpFill.style.width = `${(gameState.cainHP / gameState.cainMaxHP) * 100}%`;

        // ロケーション・メーター制御
        const locBar = document.getElementById('locationBar');
        const progressContainer = document.getElementById('progressContainer');
        
        // ダンジョン内のみメーターを表示、拠点では非表示
        if (progressContainer) {
            progressContainer.style.display = (gameState.isInDungeon) ? 'block' : 'none';
        }

        if (locBar) {
            locBar.textContent = gameState.isInDungeon ? `―― ${loc.name} ――` : `―― 宿屋前 ――`;
        }
        
        const progressMarker = document.getElementById('progressMarker');
        const progressText = document.getElementById('progressText');
        if (progressMarker && progressText && gameState.isInDungeon) {
            const ratio = (gameState.currentDistance / CONFIG.MAX_DISTANCE) * 100;
            progressMarker.style.left = `${ratio}%`;
            progressText.textContent = `( ${gameState.currentDistance} / ${CONFIG.MAX_DISTANCE}m )`;
        }

        this.updateControlPanels(loc);
    },

    // --- updateControlPanels: ボタン有効・無効の制御 ---
    updateControlPanels: function(loc) {
        const exploreUI = document.getElementById('exploreUI');
        const innUI = document.getElementById('innUI');
        const allButtons = document.querySelectorAll('button');

        // 戦闘中の全ボタン無効化
        if (gameState.isBattling) {
            allButtons.forEach(btn => btn.disabled = true);
            return;
        }

        // 基本有効化
        allButtons.forEach(btn => btn.disabled = false);

        if (gameState.isAtInn) {
            // 宿屋UIの表示
            if (exploreUI) exploreUI.style.display = 'none';
            if (innUI) innUI.style.display = 'grid';
            const btnInnDeliver = document.getElementById('btnInnDeliver');
            const canDeliver = (gameState.inventory.silverCoin >= 3 && !gameState.flags.isDelivered);
            if (btnInnDeliver) btnInnDeliver.style.display = canDeliver ? 'flex' : 'none';
        } else {
            // 探索UIの表示
            if (exploreUI) exploreUI.style.display = 'grid';
            if (innUI) innUI.style.display = 'none';
            
            const btnEnterInn = document.getElementById('btnEnterInn');
            const btnMoveForward = document.getElementById('btnMoveForward');
            const btnMoveBack = document.getElementById('btnMoveBack');
            const btnTalk = document.getElementById('btnTalk');

            if (!gameState.isInDungeon) {
                // 拠点（ダンジョン外）の状態
                if (btnEnterInn) btnEnterInn.style.display = 'flex';
                if (btnMoveForward) {
                    btnMoveForward.textContent = "琥珀の森へ";
                    btnMoveForward.onclick = () => explorationSystem.enterDungeon();
                }
                if (btnMoveBack) btnMoveBack.disabled = true;
                if (btnTalk) btnTalk.disabled = false;
            } else {
                // ダンジョン内の状態
                if (btnEnterInn) btnEnterInn.style.display = 'none';
                if (btnMoveForward) {
                    btnMoveForward.textContent = "進む";
                    btnMoveForward.onclick = () => explorationSystem.move(1);
                    btnMoveForward.disabled = (gameState.currentDistance >= CONFIG.MAX_DISTANCE);
                }
                if (btnMoveBack) {
                    btnMoveBack.onclick = () => explorationSystem.move(-1);
                    btnMoveBack.disabled = false;
                }
                if (btnTalk) btnTalk.disabled = !loc.hasTarget;
            }
        }
    },

    // --- getLocData: 距離に応じたロケーション取得 ---
    getLocData: function(dist) {
        const keys = Object.keys(LOCATIONS).map(Number).sort((a, b) => b - a);
        const key = keys.find(k => dist >= k);
        return LOCATIONS[key];
    },

    // --- openModal: アイテム画面の展開 ---
    openModal: function() {
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

    // --- selectItem: アイテム詳細表示 ---
    selectItem: function(key, count) {
        const detail = document.getElementById('itemDetailArea');
        if (!detail) return;

        let html = `<strong>${CONFIG.ITEM_NAME[key]}</strong> (×${count})<br><span style="font-size:12px;color:#aaa;">${CONFIG.ITEM_DESC[key]}</span>`;
        if (key === 'herb') {
            html += `<br><button class="btn" style="height:35px;margin:10px auto 0;width:120px;" onclick="explorationSystem.executeHerb()">使う</button>`;
        }
        detail.innerHTML = html;
    },

    // --- closeModal: モーダルを閉じる ---
    closeModal: function() {
        const modal = document.getElementById('itemModal');
        if (modal) modal.style.display = 'none';
    }
};
// 🏁ーー【UI表示・更新処理】ここまでーー

// 🚩ーー【移動・探索システム】ここからーー
const explorationSystem = {
    // --- enterDungeon: 拠点からダンジョンへの進入 ---
    enterDungeon: function() {
        gameState.isInDungeon = true;
        gameState.currentDistance = 0;
        uiControl.addLog("―― 琥珀の森 ――", "marker");
        this.move(0);
    },

    // --- move: 距離移動のメイン処理 ---
    move: function(step) {
        if (gameState.isBattling || gameState.isAtInn) return;

        // ダンジョンの入口(0m)で戻るを押した場合は拠点へ
        if (gameState.isInDungeon && gameState.currentDistance === 0 && step === -1) {
            gameState.isInDungeon = false;
            uiControl.addLog("琥珀の森を抜け、宿屋前まで戻ってきた。");
            uiControl.updateUI();
            return;
        }

        const prevLoc = uiControl.getLocData(gameState.currentDistance).name;
        let nextDist = gameState.currentDistance + step;

        // 通行制限（フラグチェック）
        if (!gameState.flags.isDelivered && nextDist >= CONFIG.MAX_DISTANCE) {
            nextDist = CONFIG.MAX_DISTANCE;
            if (gameState.currentDistance === CONFIG.MAX_DISTANCE && step > 0) {
                uiControl.addLog("門番『通行証か納品が済むまでは通せん。』");
                return;
            }
        }

        // 移動範囲の境界チェック
        if (nextDist < CONFIG.MIN_DISTANCE || nextDist > CONFIG.MAX_DISTANCE) return;

        // 実際に移動が発生した場合、宿泊可能フラグをリセット
        if (step !== 0) {
            gameState.canStay = true;
        }

        gameState.currentDistance = nextDist;
        if (step !== 0) {
            uiControl.addLog(`${gameState.currentDistance}m地点へ移動した。`);
        }

        // エンカウント判定（currentDistanceが0より大きい時のみ発生）
        if (gameState.isInDungeon && gameState.currentDistance > 0 && Math.random() < CONFIG.BATTLE_RATE) {
            battleSystem.startBattle();
            return;
        }

        uiControl.updateUI();

        // 固定イベント判定（銀貨の取得）
        if (gameState.currentDistance === 3 && !gameState.flags.gotTestCoin) {
            gameState.flags.gotTestCoin = true;
            gameState.inventory.silverCoin += 3;
            uiControl.addLog("道端に銀貨が3枚落ちている！カインはそれを拾い上げた。");
        }

        // ロケーション変更に伴うログ出力
        const nextLoc = uiControl.getLocData(gameState.currentDistance);
        if (prevLoc !== nextLoc.name) {
            setTimeout(() => {
                uiControl.addLog(`―― ${nextLoc.name} ――`, "marker");
                uiControl.addLog(nextLoc.desc);
            }, 600);
        }
    },

    // --- talk: 状況に応じた会話・独白処理 ---
    talk: function() {
        if (!gameState.isInDungeon) {
            uiControl.addLog("（宿屋に入って主人と話そう）");
        } else {
            uiControl.addLog("（周囲を警戒している…）");
        }
    },

    // --- executeHerb: 薬草の使用実行 ---
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
// 🏁ーー【移動・探索システム】ここまでーー


// 🚩ーー【宿屋・拠点システム】ここからーー
const innSystem = {
    // --- enterInn: 拠点入場 ---
    enterInn: function() {
        gameState.isAtInn = true;
        uiControl.addLog("―― 宿屋《琥珀亭》 ――", "marker");
        uiControl.addLog("宿屋の主人『いらっしゃい、カイン。ゆっくりしていきな。』");
        uiControl.updateUI();
    },

    // --- exitInn: 拠点退場 ---
    exitInn: function() {
        gameState.isAtInn = false;
        
        // 宿屋を出た時は必ず「拠点（ダンジョン外）」の状態にする
        gameState.isInDungeon = false;
        gameState.currentDistance = 0;
        
        // 宿泊制限のリセット
        gameState.canStay = true;
        
        uiControl.addLog("―― 宿屋前 ――", "marker");
        uiControl.updateUI();
    },

    // --- talk: 会話進行システム ---
    talk: function() {
        const talkList = TALK_DATA.innOwner;
        const index = Math.min(gameState.talkCount || 0, talkList.length - 1);
        const currentTalk = talkList[index];

        uiControl.addLog(currentTalk.text);

        // 特殊効果の判定
        if (currentTalk.effect === "getHerb") {
            gameState.inventory.herb += 1;
            uiControl.addLog("（薬草を1つもらった！）");
        }

        // 会話カウントを進める
        if (gameState.talkCount < talkList.length - 1) {
            gameState.talkCount = (gameState.talkCount || 0) + 1;
        }
        uiControl.updateUI();
    },

    // --- stay: 宿泊（全回復） ---
    stay: function() {
        if (gameState.cainHP >= gameState.cainMaxHP) {
            uiControl.addLog("カイン「今はまだ休む必要はないな。」");
            return;
        }

        if (!gameState.canStay) {
            uiControl.addLog("宿屋の主人『悪いが、そう何度も部屋は貸せねえよ。少し外でも歩いてきたらどうだい？』");
            return;
        }

        gameState.cainHP = gameState.cainMaxHP;
        gameState.canStay = false; 
        uiControl.addLog("カインは一晩眠り、疲れが癒えた。（HPが全回復した）");
        uiControl.updateUI();
    },

    // --- deliver: 納品処理 ---
    deliver: function() {
        if (gameState.inventory.silverCoin < 3) return;
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");
        uiControl.addLog("宿屋の主人『助かった！これで荷馬車の準備ができる。』");
        uiControl.updateUI();
    }
};
// 🏁ーー【宿屋・拠点システム】ここまでーー



// 🚩ーー【バトルシステム】ここからーー
const battleSystem = {
    // --- startBattle: オートバトルの起動 ---
    startBattle: function() {
        gameState.isBattling = true;
        gameState.currentEnemy = { ...CONFIG.TEST_ENEMY };
        uiControl.addLog(`${gameState.currentEnemy.name}が現れた！`);
        uiControl.updateUI();

        // 1秒後に自動で戦闘開始
        setTimeout(() => this.runBattleLoop(), 1000);
    },

    // --- runBattleLoop: ターン制オート処理 ---
    runBattleLoop: function() {
        if (!gameState.isBattling || !gameState.currentEnemy) return;

        // 1. カインの攻撃
        const playerAtk = 10;
        gameState.currentEnemy.hp -= playerAtk;
        uiControl.addLog(`カインの攻撃！ ${gameState.currentEnemy.name}に${playerAtk}のダメージ！`);

        if (gameState.currentEnemy.hp <= 0) {
            uiControl.addLog(`${gameState.currentEnemy.name}を倒した！`);
            this.endBattle();
            return;
        }

        // 2. 敵の反撃（1秒後）
        setTimeout(() => {
            if (!gameState.isBattling) return;

            gameState.cainHP -= gameState.currentEnemy.atk;
            if (gameState.cainHP <= 0) gameState.cainHP = 1;
            
            uiControl.addLog(`${gameState.currentEnemy.name}の攻撃！ カインは${gameState.currentEnemy.atk}のダメージを受けた！`);
            uiControl.updateUI();

            // 3. 次のターンへ（1秒後）
            if (gameState.isBattling) {
                setTimeout(() => this.runBattleLoop(), 1000);
            }
        }, 1000);
    },

    // --- endBattle: 戦闘終了処理 ---
    endBattle: function() {
        gameState.isBattling = false;
        gameState.currentEnemy = null;
        uiControl.updateUI();
    }
};
// 🏁ーー【バトルシステム】ここまでーー


// 🚩ーー【初期化・その他】ここからーー
window.onload = () => {
    uiControl.addLog("探索を開始した。");
    uiControl.updateUI();
};
// 🏁ーー【初期化・その他】ここまでーー