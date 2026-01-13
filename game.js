let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, herb: 0, sw: 3, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, defeatLast: false,
    owenAbsent: 0, encountUp: false, forceBattle: false 
};

const getQuote = (key) => {
    const list = DATA.OWEN_QUOTES[key];
    return list[Math.floor(Math.random() * list.length)];
};

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    if(!log) return;
    const d = document.createElement('div');
    if(cls) d.className = cls;
    d.innerHTML = txt;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
};

const updateUI = () => {
    const hFill = document.getElementById('h-fill');
    if(!hFill) return;
    hFill.style.width = Math.max(0, (st.c_h / st.c_mh * 100)) + "%";
    document.getElementById('m-fill').style.width = Math.max(0, (st.c_m / st.c_mm * 100)) + "%";
    document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN`;
    
    const target = st.stage === 1 ? 3 : 5;
    const itemName = st.stage === 1 ? DATA.ITEMS.coin.name : DATA.ITEMS.fragment.name;
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

// バトルロジック（ドロップ率の厳守）
async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    let e_hp = (isBoss ? 200 : 30 + (st.lv * 10)) * st.enemyMul;
    let lastHitter = 'kain';
    addLog(isBoss ? "【強大な気配】" : `魔物が現れた。`, "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        let neglect = false;
        if(st.owenAbsent <= 0 && Math.random() < 0.1) {
            lastHitter = 'owen'; e_hp = 0;
            addLog(`<span class='log-owen'>【オーエンがトランクを開けた】「${getQuote('BATTLE_ASSIST')}」</span>`);
            break;
        } else if(st.owenAbsent <= 0 && Math.random() < 0.25) {
            addLog("<span class='log-owen'>【オーエンは腕を組んで見ている】</span>", "log-owen");
            neglect = true;
        }
        let dmg = st.atk + Math.floor(Math.random()*5);
        e_hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ。`, "log-atk");
        if(e_hp <= 0) { lastHitter = 'kain'; break; }
        let e_dmg = Math.max(1, (isBoss ? 25 : 12) - st.def);
        if(neglect) e_dmg = Math.floor(e_dmg * 1.5);
        st.c_h -= e_dmg;
        addLog(`魔物の反撃：${Math.floor(e_dmg)}のダメージ！`, "log-dmg");
        updateUI();
    }

    if(st.c_h <= 0) {
        addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
        st.dist = st.max_dist; st.tInv = 0; st.c_h = 20; st.defeatLast = true;
    } else {
        if(lastHitter === 'kain') {
            st.kainKills++; st.exp += 25;
            addLog("カインが魔物を仕留めた。");
            if(Math.random() < 0.5) { st.tInv++; addLog("[古い銀貨]を入手！"); } // 50%ドロップ
        } else {
            st.owenKills++;
            addLog("<b>【オーエンが倒してしまった】</b>", "log-sys");
            addLog(`<span class='log-owen'>オーエン「${getQuote(isBoss ? 'BATTLE_END_BOSS':'BATTLE_END_ZAKO')}」</span>`);
            if(Math.random() < 0.3) {
                if(Math.random() < 0.5) addLog(`<span class='log-owen'>オーエン「${getQuote('KEEP_ITEM')}」</span>`);
                else { addLog(`<span class='log-owen'>オーエン「${getQuote('GIVE_ITEM')}」</span>`); st.tInv++; }
            }
        }
        if(st.exp >= st.lv * 35) {
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; st.c_h = st.c_mh;
            addLog(`【レベルアップ】Lv.${st.lv}`, "log-sys");
        }
    }
    st.inCombat = false; st.forceBattle = false;
    if(isBoss && st.c_h > 0) st.dist = st.max_dist; 
    updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        if(st.owenAbsent > 0) st.owenAbsent--;
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        addLog(arg === 'fwd' ? `${move}km進んだ。` : `${move}km戻った。`);

        const roll = Math.random();
        if(roll < 0.45) { battle(); } 
        else if(roll < 0.60) { // 15%イベント
            const possibleEvents = DATA.STAGE1_EVENTS.filter(e => st.dist >= e.dist_range[0] && st.dist <= e.dist_range[1]);
            if(possibleEvents.length > 0) {
                const ev = possibleEvents[Math.floor(Math.random()*possibleEvents.length)];
                addLog(`【イベント】${ev.text}`, "log-sys");
                addLog(ev.effect(st));
                if(st.forceBattle) battle(); else updateUI();
            } else updateUI();
        } else updateUI();
    } else if(type === 'inn') {
        const target = st.stage === 1 ? 3 : 5;
        if(st.gInv < target) {
            const ev = DATA.INN_SHORTAGE_EVENTS[Math.floor(Math.random()*DATA.INN_SHORTAGE_EVENTS.length)];
            addLog("【宿屋・銀貨不足】", "log-sys");
            addLog(ev.text);
        } else {
            addLog("【宿屋】一晩休息した。");
        }
        st.gInv += st.tInv; st.tInv = 0; st.c_h = st.c_mh; updateUI();
    } else if(type === 'report') {
        st.inEvent = true; st.gInv -= (st.stage === 1 ? 3 : 5); updateUI();
        addLog("店主「おっ、ちゃんと持ってきたか。感心だね」", "log-sys");
        setTimeout(() => { addLog("【その夜】", "log-sys"); }, 1000);
        setTimeout(() => { addLog("カイン「……なんとか終わったか」"); }, 1800);
        setTimeout(() => { addLog(`<span class='log-owen'>オーエン「こんな序盤で何やってるの？弱すぎじゃない？」</span>`); }, 2800);
        setTimeout(() => { addLog("カイン「それはおまえが……いや、いい」"); }, 3800);
        setTimeout(() => { addLog(`<span class='log-owen'>オーエン「次は街にしようよ。ケーキ屋があるところがいい」</span>`); }, 4800);
        setTimeout(() => { addLog("カイン「……もし、ケーキ屋がなかったら？」"); }, 5800);
        setTimeout(() => { 
            addLog(`<span class='log-owen'>オーエン「……決まってるだろ？」</span>`);
            document.getElementById('btn-next').style.display = "block";
        }, 6800);
    } else if(type === 'use_sw') {
        if(st.sw > 0) { st.sw--; st.c_h = Math.min(st.c_mh, st.c_h + 40); updateUI(); } // 甘味HP+40
    }
    // ...その他のボタン処理は以前と同じ
};

window.onload = () => {
    updateUI();
    st.inEvent = true;
    addLog("【宿屋の入り口】", "log-sys");
    setTimeout(() => { addLog("店主「おまえたち、そろそろ宿代を払ってくれないかね。」"); }, 800);
    setTimeout(() => { addLog("店主「銀貨3枚、持ってきてくれ。……でないと今夜の寝床はないよ」"); }, 2000);
    setTimeout(() => { addLog("カイン「……わかった。すぐに行く」"); }, 3200);
    setTimeout(() => { addLog(`<span class='log-owen'>オーエン「えー、僕も？ 働き者の騎士様が一人でやればいいのに」</span>`); }, 4400);
    setTimeout(() => { addLog("カイン「……行くぞ」", "log-atk"); st.inEvent = false; updateUI(); }, 5600);
};
