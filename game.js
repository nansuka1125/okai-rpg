let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, herb: 0, sw: 3, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, defeatLast: false
};

const getQuote = (key) => {
    const list = DATA.OWEN_QUOTES[key];
    return list[Math.floor(Math.random() * list.length)];
};

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    const d = document.createElement('div');
    if(cls) d.className = cls;
    d.innerHTML = txt;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
};

const updateUI = () => {
    document.getElementById('h-fill').style.width = (st.c_h / st.c_mh * 100) + "%";
    document.getElementById('m-fill').style.width = (st.c_m / st.c_mm * 100) + "%";
    document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN`;
    
    const target = st.stage === 1 ? 3 : 5;
    const itemName = st.stage === 1 ? "古い銀貨" : "魔力の欠片";
    document.getElementById('m-title').innerText = `目的：${itemName}を${target}枚持ち帰れ`;
    document.getElementById('m-count').innerText = `倉庫の蓄え: ${st.gInv} / ${target}`;
    document.getElementById('dist-ui').innerText = `宿屋まで: ${st.max_dist - st.dist}km / 目的地まで: ${st.dist}km`;
    
    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
    document.getElementById('btn-boss').style.display = (idle && st.dist <= 0) ? "block" : "none";
    
    const isAtInn = st.dist >= st.max_dist;
    const canReport = st.gInv >= target;
    document.getElementById('btn-report').style.display = (idle && isAtInn && canReport) ? "block" : "none";
    document.getElementById('btn-inn').style.display = (idle && isAtInn && !canReport) ? "block" : "none";
};

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
        document.getElementById('shop-atk').style.display = (st.dist >= st.max_dist && st.gInv >= 3) ? "block" : "none";
        m.style.display = 'flex';
    } else { m.style.display = 'none'; }
};

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    let e_hp = (isBoss ? 200 : 30 + (st.lv * 10)) * st.enemyMul;
    let lastHitter = 'kain';
    addLog(isBoss ? "【ボス出現】" : "魔物が行く手を阻んだ。", "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        let neglect = false;
        const o_roll = Math.random();
        
        if(o_roll < 0.1) {
            lastHitter = 'owen'; e_hp = 0;
            addLog(`<span class='log-owen'>【オーエン】「${getQuote('BATTLE_ASSIST')}」</span>`);
            break;
        } else if(o_roll < 0.25) {
            addLog("<span class='log-owen'>【冷淡な観測】</span>", "log-owen");
            neglect = true;
        }

        let dmg = st.atk + Math.floor(Math.random()*5);
        e_hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ。`, "log-atk");

        if(e_hp <= 0) { lastHitter = 'kain'; break; }

        let e_dmg = Math.max(1, (isBoss ? 25 : 12) * st.enemyMul - st.def);
        if(neglect) e_dmg = Math.floor(e_dmg * 1.5);
        st.c_h -= e_dmg;
        addLog(`魔物の反撃：${e_dmg}のダメージ！`, "log-dmg");
    }

    if(st.c_h <= 0) {
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
            const qKey = isBoss ? 'BATTLE_END_BOSS' : 'BATTLE_END_ZAKO';
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
        if(st.exp >= st.lv * 35) {
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; st.c_h = st.c_mh;
            addLog(`【レベルアップ】Lv.${st.lv}`, "log-sys");
        }
    }
    st.inCombat = false; if(isBoss && st.c_h > 0) st.dist = st.max_dist; updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        
        addLog(arg === 'fwd' ? `${move}km進んだ。` : `${move}km戻った。`);

        const roll = Math.random();
        if(roll < 0.4) {
            battle();
        } else if(roll < 0.6) {
            const ev = DATA.RANDOM_EVENTS[Math.floor(Math.random() * DATA.RANDOM_EVENTS.length)];
            addLog(`【イベント】${ev.text}`, "log-sys");
            const res = ev.effect(st);
            addLog(res);
            updateUI();
        } else {
            updateUI();
        }
    } else if(type === 'boss') { battle(true); }
    else if(type === 'inn') {
        addLog("【宿屋】一晩休息した。");
        if(st.defeatLast) {
            addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
            st.defeatLast = false;
        } else if(st.owenKills > st.kainKills * 2 && st.owenKills > 0) {
            addLog(`<span class='log-owen'>オーエン「${getQuote('INN_BAD')}」</span>`);
            if(st.sw > 0) {
                addLog(`<span class='log-owen'>オーエン「${getQuote('INN_EAT_SWEETS')}」</span>`);
                st.sw = 0;
            }
        } else {
            addLog(`<span class='log-owen'>オーエン「${getQuote('INN_NORMAL')}」</span>`);
        }
        st.gInv += st.tInv; st.tInv = 0; st.c_h = st.c_mh; 
        st.kainKills = 0; st.owenKills = 0; updateUI();
    } else if(type === 'use_hb') {
        if(st.herb > 0) { st.herb--; st.c_h = Math.min(st.c_mh, st.c_h + 30); toggleModal(false); updateUI(); }
    } else if(type === 'shop_atk') {
        if(st.gInv >= 3) { st.gInv -= 3; st.atk += 2; toggleModal(false); updateUI(); }
    } else if(type === 'report') {
        st.inEvent = true; st.gInv -= (st.stage === 1 ? 3 : 5); updateUI();
        addLog("【任務完了】", "log-sys");
        setTimeout(() => {
            addLog("カイン「……なんとか終わったか」");
            document.getElementById('btn-next').style.display = "block";
        }, 800);
    } else if(type === 'next_stage') {
        st.stage++; st.max_dist += 5; st.dist = st.max_dist; st.enemyMul += 0.2;
        st.inEvent = false; document.getElementById('btn-next').style.display = "none";
        addLog(`【第${st.stage}章】開始。`, "log-sys"); updateUI();
    }
};

window.onload = updateUI;
