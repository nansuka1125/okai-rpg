// ... 初期化stは維持 ...

// 【修正点2】距離による敵の強化補正を計算する関数
const getPowerRatio = () => {
    // 奥に行くほど(distが0に近いほど) 1.0 〜 1.25倍に強化
    const progress = (st.max_dist - st.dist) / st.max_dist;
    return 1.0 + (progress * 0.25);
};

// ... updateUI, toggleModal 等は維持しつつ甘味ボタン制御を追加 ...
window.toggleModal = (show) => {
    if(st.inEvent) return;
    const m = document.getElementById('modal');
    if(show) {
        const list = document.getElementById('item-list');
        const itemName = st.stage === 1 ? DATA.ITEMS.coin.name : DATA.ITEMS.fragment.name;
        let html = "";
        if(st.herb > 0) html += `<div class="item-row"><span>${DATA.ITEMS.herb.name}</span><span>${st.herb} 個</span></div>`;
        if(st.sw > 0) html += `<div class="item-row"><span>${DATA.ITEMS.sweets.name}</span><span>${st.sw} 個</span></div>`;
        if(st.tInv > 0) html += `<div class="item-row"><span>${itemName}(手荷物)</span><span>${st.tInv} 枚</span></div>`;
        if(st.gInv > 0) html += `<div class="item-row"><span>${itemName}(倉庫)</span><span>${st.gInv} 枚</span></div>`;
        list.innerHTML = html || `<div style="text-align:center; padding:20px; color:#666;">所持アイテムはありません</div>`;
        
        document.getElementById('use-herb').style.display = st.herb > 0 ? "block" : "none";
        document.getElementById('use-sw').style.display = st.sw > 0 ? "block" : "none"; // 甘味ボタン表示
        document.getElementById('shop-atk').style.display = (st.dist >= st.max_dist && st.gInv >= 3) ? "block" : "none";
        m.style.display = 'flex';
    } else { m.style.display = 'none'; }
};

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    
    // 【修正点2】深部ほど敵を強化
    const pRatio = isBoss ? 1.0 : getPowerRatio(); 
    let e_hp = (isBoss ? 200 : 30 + (st.lv * 10)) * st.enemyMul * pRatio;
    let lastHitter = 'kain';
    
    addLog(isBoss ? "【深部の影が出現】" : `魔物が現れた。(脅威度: ${pRatio.toFixed(1)})`, "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        let neglect = false;
        const o_roll = Math.random();
        
        if(o_roll < 0.1) {
            lastHitter = 'owen'; e_hp = 0;
            addLog(`<span class='log-owen'>【助力を得る】「${getQuote('BATTLE_ASSIST')}」</span>`);
            break;
        } else if(o_roll < 0.25) {
            addLog("<span class='log-owen'>【冷淡な観測】</span>", "log-owen");
            neglect = true;
        }

        let dmg = st.atk + Math.floor(Math.random()*5);
        e_hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ。`, "log-atk");
        if(e_hp <= 0) { lastHitter = 'kain'; break; }

        // 【修正点2】攻撃力にも補正。ただしボスは既に強いので通常敵のみ。
        let e_dmg = Math.max(1, (isBoss ? 25 : 12 * pRatio) * st.enemyMul - st.def);
        if(neglect) e_dmg = Math.floor(e_dmg * 1.5);
        st.c_h -= e_dmg;
        addLog(`魔物の反撃：${Math.floor(e_dmg)}のダメージ！`, "log-dmg");
    }

    if(st.c_h <= 0) {
        addLog("【敗走】カインの意識が途絶える。", "log-dmg");
        addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
        st.dist = st.max_dist; st.tInv = 0; st.c_h = 20; st.defeatLast = true;
    } else {
        st.defeatLast = false;
        if(lastHitter === 'kain') {
            st.kainKills++; st.exp += 25;
            addLog("カインが魔物を仕留めた。");
            if(Math.random() < 0.5) { st.tInv++; addLog("[戦利品]を入手。"); }
        } else {
            st.owenKills++;
            // 【修正点1】演出の統一化
            const qKey = isBoss ? 'BATTLE_END_BOSS' : 'BATTLE_END_ZAKO';
            addLog("<b>「【オーエンが倒してしまった】」</b>", "log-sys");
            addLog(`<span class='log-owen'>オーエン「${getQuote(qKey)}」</span>`);
            
            if(Math.random() < 0.2) {
                if(Math.random() < 0.5) {
                    addLog(`<span class='log-owen'>オーエン「${getQuote('KEEP_ITEM')}」</span>`);
                } else {
                    addLog(`<span class='log-owen'>オーエン「${getQuote('GIVE_ITEM')}」</span>`);
                    st.tInv++;
                }
            }
        }
        // レベルアップ処理等は維持
        if(st.exp >= st.lv * 35) {
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; st.c_h = st.c_mh;
            addLog(`【レベルアップ】Lv.${st.lv}`, "log-sys");
        }
    }
    st.inCombat = false; if(isBoss && st.c_h > 0) st.dist = st.max_dist; updateUI();
}

// act関数内の移動ロジック
window.act = function(type, arg) {
    if(type === 'move') {
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        
        addLog(arg === 'fwd' ? `${move}km進んだ。` : `${move}km戻った。`);

        // 【修正点3】発生確率の調整
        const roll = Math.random();
        if(roll < 0.45) { // 戦闘 45%
            battle();
        } else if(roll < 0.55) { // イベント 10% (0.45〜0.55)
            const ev = DATA.RANDOM_EVENTS[Math.floor(Math.random() * DATA.RANDOM_EVENTS.length)];
            addLog(`【イベント】${ev.text}`, "log-sys");
            const res = ev.effect(st);
            addLog(res);
            updateUI();
        } else { // 何もなし 45%
            updateUI();
        }
    } else if(type === 'use_hb') {
        if(st.herb > 0) { st.herb--; st.c_h = Math.min(st.c_mh, st.c_h + 30); toggleModal(false); updateUI(); }
    } else if(type === 'use_sw') { // 【修正点3】甘味使用
        if(st.sw > 0) { st.sw--; st.c_h = Math.min(st.c_mh, st.c_h + 40); toggleModal(false); updateUI(); }
    }
    // ... 他のactロジック（inn, shop, report, next）は前回から維持 ...
};
