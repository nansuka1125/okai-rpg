let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, herb: 3, sw: 3, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, 
    owenAbsent: 0, owenPatience: 3, poison: 0, fukutsuUsed: false
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
    const mFill = document.getElementById('m-fill');
    if(!hFill || !mFill) return;
    
    // 毒状態ならHPバーの色を変える
    hFill.style.backgroundColor = st.poison > 0 ? "#8e44ad" : "#e74c3c";
    hFill.style.width = Math.max(0, (st.c_h / st.c_mh * 100)) + "%";
    mFill.style.width = Math.max(0, (st.c_m / st.c_mm * 100)) + "%";
    
    document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN ${st.poison > 0 ? "[毒]" : ""}`;
    
    const target = st.stage === 1 ? 3 : 5;
    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
    document.getElementById('btn-boss').style.display = (idle && st.dist <= 0) ? "block" : "none";
    document.getElementById('btn-report').style.display = (idle && st.dist >= st.max_dist && st.gInv >= target) ? "block" : "none";
    document.getElementById('btn-inn').style.display = (idle && st.dist >= st.max_dist && st.gInv < target) ? "block" : "none";
};

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const enemyData = isBoss ? {name:"琥珀の守護獣", hp:200, atk:25, poison:0, coin:0, exp:500} : DATA.ENEMIES[Math.floor(Math.random()*DATA.ENEMIES.length)];
    let e_hp = enemyData.hp * st.enemyMul;
    let freezeCount = 0;
    let turn = 0;

    addLog(`${enemyData.name}が現れた。`, "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        turn++;

        // 逃走判定（森迷いの影）
        if(enemyData.type === "rare" && turn === 2) {
            addLog(`${enemyData.name}は霧の中に消えていった……`);
            break;
        }

        // 毒ダメージ
        if(st.poison > 0) {
            const pDmg = 7; st.c_h -= pDmg;
            addLog(`毒のダメージ！ -${pDmg}`, "log-dmg");
            if(Math.random() < 0.1) {
                addLog(`<span class='log-owen'>オーエン「……このくらい自分でなんとかできないの？」</span>`);
                st.poison = 0;
            }
        }

        // オーエンの行動
        if(st.owenAbsent <= 0 && freezeCount <= 0) {
            const roll = Math.random();
            if(st.c_h / st.c_mh <= 0.4 && roll < 0.1) {
                e_hp = 0; addLog(`<span class='log-owen'>【オーエンがトランクを開けた】「消えろ」</span>`);
                break;
            } else if(roll < 0.15) {
                freezeCount = 2;
                addLog(`<span class='log-owen'>オーエン${DATA.OWEN_QUOTES.FREEZE[0]}</span>`);
            }
        }

        // カインの攻撃
        let hits = (st.lv >= 3 && Math.random() < 0.2) ? 2 : 1;
        for(let i=0; i<hits; i++) {
            let dmg = st.atk + Math.floor(Math.random()*5);
            if(Math.random() < 0.1) { dmg = Math.floor(dmg * 1.5); addLog("【痛恨】鋭い一撃！", "log-atk"); }
            e_hp -= dmg;
            addLog(`${enemyData.name}に${dmg}ダメージ。`, "log-atk");
            if(e_hp <= 0) break;
        }
        if(e_hp <= 0) break;

        // 敵の攻撃
        if(freezeCount > 0) {
            addLog(`${enemyData.name}は凍りついている。`);
            freezeCount--;
        } else {
            let e_dmg = Math.max(1, enemyData.atk - st.def);
            st.c_h -= e_dmg;
            addLog(`${enemyData.name}の攻撃：${Math.floor(e_dmg)}のダメージ！`, "log-dmg");
            if(Math.random() < enemyData.poison) { st.poison = 1; addLog("カインは毒を受けた！", "log-dmg"); }
            if(st.c_h <= 0 && st.lv >= 5 && !st.fukutsuUsed && Math.random() < 0.3) {
                st.c_h = 1; st.fukutsuUsed = true; addLog("【不屈】踏みとどまった！", "log-atk");
            }
        }
        updateUI();
    }

    if(st.c_h <= 0) {
        st.owenPatience--; addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
        st.dist = st.max_dist; st.tInv = 0; st.c_h = 20; st.poison = 0;
    } else if(e_hp <= 0) {
        st.exp += enemyData.exp;
        if(Math.random() < enemyData.coin) { st.tInv++; addLog("[古い銀貨]を入手！"); }
        if(enemyData.type === "poison" && Math.random() < 0.4) { st.herb++; addLog("[薬草]を拾った。"); }
        if(st.exp >= st.lv * 40) { st.lv++; st.exp = 0; st.atk += 2; st.def += 1; st.c_h = st.c_mh; addLog(`LvUP: ${st.lv}`, "log-sys"); }
    }
    st.inCombat = false; st.fukutsuUsed = false; updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        if(st.owenAbsent > 0) st.owenAbsent--;
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        
        addLog(`${move}km移動。`);
        
        // 移動中の毒ダメージ
        if(st.poison > 0) {
            st.c_h -= 5;
            addLog("毒が回っている……HP-5", "log-dmg");
            if(st.c_h <= 0) { st.c_h = 1; addLog("カインは意識が朦朧としている……"); }
        }

        if(Math.random() < 0.45) battle(); else updateUI();
    } else if(type === 'inn') {
        if(st.owenPatience <= 0) {
            st.inEvent = true; updateUI();
            document.body.style.background = "#000";
            addLog("【バッドエンド：任務放棄】", "log-dmg");
            addLog(`<span class='log-owen'>オーエン「帰るよ騎士様。……まだおまえには早かったんだよ。」</span>`);
            return;
        }
        addLog("【宿屋】休息した。毒も消えたようだ。");
        st.gInv += st.tInv; st.tInv = 0; st.c_h = st.c_mh; st.poison = 0; updateUI();
    } else if(type === 'use_hb' || type === 'use_sw') {
        const amount = type === 'use_hb' ? 30 : 40;
        const item = type === 'use_hb' ? 'herb' : 'sw';
        if(st[item] > 0) {
            st[item]--; st.c_h = Math.min(st.c_mh, st.c_h + amount);
            st.poison = 0; addLog(`${DATA.ITEMS[item].name}で回復！毒も消えた。`);
            toggleModal(false); updateUI();
        }
    } else if(type === 'report') {
        st.inEvent = true; updateUI();
        addLog("店主「おっ、ちゃんと持ってきたか」");
        setTimeout(() => { document.getElementById('btn-next').style.display = "block"; }, 1000);
    }
};

window.onload = () => { updateUI(); addLog("店主「銀貨3枚、持ってきてくれ。」"); };
