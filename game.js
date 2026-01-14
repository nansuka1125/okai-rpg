// ==========================================
// 1. 状態管理（ステータス）
// ==========================================
let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, 
    herb: 1, sw: 0, debug: 99, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, 
    owenAbsent: 0, owenPatience: 3, poison: 0, fukutsuUsed: false
};

// ==========================================
// 2. 汎用ユーティリティ関数
// ==========================================

// 台詞取得
const getQuote = (key) => {
    const list = DATA.OWEN_QUOTES[key];
    return list[Math.floor(Math.random() * list.length)];
};

// ログ出力
const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    if(!log) return;
    const d = document.createElement('div');
    if(cls) d.className = cls;
    d.innerHTML = txt;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
};

// ダメージ演出
const triggerFlash = () => {
    const overlay = document.createElement('div');
    overlay.className = 'damage-flash';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 200);
};

// ==========================================
// 3. 進行・演出コントロール
// ==========================================

// シナリオ再生（会話イベント用）
const playScenario = async (scenarioArray) => {
    st.inEvent = true;
    updateUI();
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, msg.delay || 0));
        const speakerClass = msg.name === "オーエン" ? "class='log-owen'" : "";
        addLog(`<span ${speakerClass}>${msg.name}${msg.text}</span>`);
    }
    const isReport = (scenarioArray === DATA.SCENARIO.REPORT_STAGE_1);
    if (isReport) {
        document.getElementById('btn-next').style.display = "block";
    } else {
        st.inEvent = false;
        updateUI();
    }
};

// UI更新（HPバーの伸縮ロジック含む）
const updateUI = () => {
    try {
        const hFill = document.getElementById('h-fill');
        const hBar = document.getElementById('h-bar');
        const hpValues = document.getElementById('hp-values');
        if(!hFill || !hBar || !hpValues) return;
        
        // HP数値表示
        hpValues.innerText = `${Math.max(0, Math.floor(st.c_h))} / ${st.c_mh}`;

        // 最大HPに合わせてバー自体の長さを変える
        const baseWidth = 0.8; 
        hBar.style.width = (st.c_mh * baseWidth) + "px";

        // 現在HPの割合
        const hpPercent = (st.c_h / st.c_mh) * 100;
        hFill.style.width = Math.max(0, hpPercent) + "%";
        
        // 状態による色の変化
        if (st.poison > 0) {
            hFill.style.backgroundColor = "#8e44ad"; // 毒
        } else if (hpPercent <= 30) {
            hFill.style.backgroundColor = "#f39c12"; // 瀕死（オレンジ）
        } else {
            hFill.style.backgroundColor = "#e74c3c"; // 通常（赤）
        }
        
        // ステータス・テキストの更新
        document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN ${st.poison > 0 ? "[毒]" : ""}`;
        const target = st.stage === 1 ? 3 : 5;
        const totalCoin = st.gInv + st.tInv; 
        document.getElementById('m-title').innerText = `目的：銀貨を${target}枚持ち帰れ`;
        document.getElementById('m-count').innerText = `倉庫の蓄え: ${st.gInv} / ${target}`;
        document.getElementById('dist-ui').innerText = `宿屋まで: ${st.max_dist - st.dist}km / 目的地まで: ${st.dist}km`;
        
        // ボタンの表示制御
        const idle = !st.inCombat && !st.inEvent;
        const atInn = (st.dist >= st.max_dist);
        const atGoal = (st.dist <= 0);
        document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
        document.getElementById('btn-boss').style.display = (idle && atGoal) ? "block" : "none";
        document.getElementById('btn-report').style.display = (idle && atInn && totalCoin >= target) ? "block" : "none";
        document.getElementById('btn-inn').style.display = (idle && atInn && totalCoin < target) ? "block" : "none";
        
    } catch(e) { console.error("UI Update Error:", e); }
};

// ==========================================
// 4. インベントリ・アイテム
// ==========================================

window.toggleModal = (show) => {
    if(st.inCombat || st.inEvent) return;
    const m = document.getElementById('modal');
    if(show) {
        const list = document.getElementById('item-list');
        let html = "";
        if(st.herb > 0) html += `<div class="item-row"><span>薬草</span><span>${st.herb}個</span></div>`;
        if(st.sw > 0) html += `<div class="item-row"><span>甘味</span><span>${st.sw}個</span></div>`;
        if(st.debug > 0) html += `<div class="item-row"><span>《猛毒》</span><span>${st.debug}個</span></div>`;
        if(st.tInv > 0) html += `<div class="item-row"><span>銀貨(持)</span><span>${st.tInv}枚</span></div>`;
        list.innerHTML = html || "所持品なし";
        m.style.display = 'flex';
    } else { m.style.display = 'none'; }
};

// ==========================================
// 5. プレイヤーアクション
// ==========================================

window.act = function(type, arg) {
    if(type === 'move') {
        // 移動処理
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        addLog(`${DATA.MOVE_LOGS[Math.floor(Math.random()*DATA.MOVE_LOGS.length)]}(${move}km移動)`);
        
        // 毒の移動ダメージ
        if(st.poison > 0) { st.c_h -= 5; if(st.c_h < 1) st.c_h = 1; }
        
        // 戦闘チェック（battle関数は外部 battle.js に依存）
        if(Math.random() < 0.45) battle(); else updateUI();

    } else if(type === 'inn') {
        // 宿屋（銀貨不足時）
        if(st.owenPatience <= 0) {
             st.inEvent = true; document.body.style.background = "#000";
             addLog("【バッドエンド：任務放棄】", "log-dmg");
             addLog("いつのまにか宿屋は引き払われ……。");
             addLog(`<span class='log-owen'>オーエン「帰るよ騎士様。…まだおまえには早かったんだよ。」</span>`); return;
        }
        addLog("《宿屋に戻ってきてしまった…銀貨が足りない》", "log-sys");
        st.inEvent = true; updateUI();
        setTimeout(() => {
            const ev = DATA.INN_EVENTS[Math.floor(Math.random()*DATA.INN_EVENTS.length)];
            addLog("【宿屋・銀貨不足】", "log-sys"); addLog(ev.text);
            st.inEvent = false; updateUI();
        }, 800);

    } else if(type === 'report') {
        playScenario(DATA.SCENARIO.REPORT_STAGE_1);

    } else if(type.startsWith('use_')) {
        // アイテム使用
        if(type === 'use_db') {
            if(st.debug > 0) {
                st.debug--; st.c_h = 5;
                addLog("《猛毒》を使用した。カインは瀕死になった。", "log-dmg");
                toggleModal(false); updateUI();
            }
            return;
        }
        const isHerb = (type === 'use_hb');
        const itemKey = isHerb ? 'herb' : 'sweets';
        const item = DATA.ITEMS[itemKey];
        const prop = isHerb ? 'herb' : 'sw';
        if(st[prop] > 0) {
            st[prop]--; st.c_h = Math.min(st.c_mh, st.c_h + item.heal);
            if(item.curePoison) st.poison = 0;
            addLog(`${item.name}を使用。HPが${item.heal}回復！${item.curePoison ? "毒も消えた。" : ""}`);
            toggleModal(false); updateUI();
        }

    } else if(type === 'boss') { 
        battle(true); 

    } else if(type === 'next_stage') {
        st.stage++; st.max_dist += 5; st.dist = st.max_dist; st.enemyMul += 0.2;
        st.inEvent = false; document.getElementById('btn-next').style.display = "none";
        addLog(`【第${st.stage}章】開始。`, "log-sys"); updateUI();
    }
};

// ==========================================
// 6. 初期化
// ==========================================

window.onload = () => {
    updateUI();
    addLog("【古びた宿屋の入り口】", "log-sys");
    playScenario(DATA.SCENARIO.INTRO);
};
