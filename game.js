let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, herb: 0, sw: 3, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, defeatLast: false,
    // 追加の状態管理
    owenAbsent: 0,    // オーエン離脱カウント
    encountUp: false, // 次回戦闘率UP
    forceBattle: false // 強制戦闘フラグ
};

// ... getQuote, addLog, updateUI, toggleModal は維持 ...

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const progress = (st.max_dist - st.dist) / st.max_dist;
    const pRatio = isBoss ? 1.0 : 1.0 + (progress * 0.25);
    
    let e_hp = (isBoss ? 200 : 30 + (st.lv * 10)) * st.enemyMul * pRatio;
    let lastHitter = 'kain';
    addLog(isBoss ? "【強大な気配】" : `魔物が現れた。`, "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        let neglect = false;
        const o_roll = Math.random();
        
        // 【修正点】オーエンが離脱中の場合は介入させない
        if(st.owenAbsent <= 0 && o_roll < 0.1) {
            lastHitter = 'owen'; e_hp = 0;
            addLog(`<span class='log-owen'>【オーエンがトランクを開けた】「${getQuote('BATTLE_ASSIST')}」</span>`);
            break;
        } else if(st.owenAbsent <= 0 && o_roll < 0.25) {
            addLog("<span class='log-owen'>【オーエンは腕を組んで見ている】</span>", "log-owen");
            neglect = true;
        } else if(st.owenAbsent > 0) {
            // 離脱中のみ表示するログ（任意）
            // addLog("（オーエンの姿は見えない……）", "log-sys");
        }

        let dmg = st.atk + Math.floor(Math.random()*5);
        e_hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ。`, "log-atk");
        if(e_hp <= 0) { lastHitter = 'kain'; break; }

        let e_dmg = Math.max(1, (isBoss ? 25 : 12 * pRatio) * st.enemyMul - st.def);
        if(neglect) e_dmg = Math.floor(e_dmg * 1.5);
        st.c_h -= e_dmg;
        addLog(`魔物の反撃：${Math.floor(e_dmg)}のダメージ！`, "log-dmg");
        updateUI();
    }
    // ... 以降の撃破処理・レベルアップは維持 ...
    
    // 戦闘終了時に状態リセット
    st.inCombat = false; 
    st.forceBattle = false;
    if(isBoss && st.c_h > 0) st.dist = st.max_dist; 
    updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        // 離脱カウントを減らす
        if(st.owenAbsent > 0) st.owenAbsent--;

        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        
        addLog(arg === 'fwd' ? `${move}km進んだ。` : `${move}km戻った。`);

        // 確率計算
        const baseEncount = st.encountUp ? 0.7 : 0.45;
        st.encountUp = false; // 消費

        const roll = Math.random();
        if(roll < baseEncount) {
            battle();
        } else if(st.stage === 1 && roll < baseEncount + 0.15) { // イベント率15%
            // ステージ1専用イベント抽選
            const possibleEvents = DATA.STAGE1_EVENTS.filter(e => st.dist >= e.dist_range[0] && st.dist <= e.dist_range[1]);
            if(possibleEvents.length > 0) {
                // weightに基づいた抽選
                const totalWeight = possibleEvents.reduce((sum, e) => sum + e.weight, 0);
                let random = Math.random() * totalWeight;
                let ev = possibleEvents[0];
                for (let e of possibleEvents) {
                    if (random < e.weight) { ev = e; break; }
                    random -= e.weight;
                }
                
                addLog(`【イベント】${ev.text}`, "log-sys");
                addLog(ev.effect(st));
                
                // 強制戦闘チェック（ミミックなど）
                if(st.forceBattle) battle();
                else updateUI();
            } else {
                updateUI();
            }
        } else {
            updateUI();
        }
    } 
    // ... use_hb, use_sw, shop, inn, report, next_stage は維持 ...
};
