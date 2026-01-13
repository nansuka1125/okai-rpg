let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, herb: 3, sw: 3, 
    dist: 10, max_dist: 10, kainKills: 0, owenKills: 0, 
    inCombat: false, inEvent: false, enemyMul: 1.0, 
    owenAbsent: 0, owenPatience: 3, poison: 0, fukutsuUsed: false
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

const triggerFlash = () => {
    const overlay = document.createElement('div');
    overlay.className = 'damage-flash';
    overlay.style.position = 'fixed'; overlay.style.top = 0; overlay.style.left = 0;
    overlay.style.width = '100%'; overlay.style.height = '100%'; overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 200);
};

const updateUI = () => {
    try {
        const hFill = document.getElementById('h-fill');
        const mFill = document.getElementById('m-fill');
        if(!hFill || !mFill) return;
        hFill.style.backgroundColor = st.poison > 0 ? "#8e44ad" : "#e74c3c";
        hFill.style.width = Math.max(0, (st.c_h / st.c_mh * 100)) + "%";
        mFill.style.width = Math.max(0, (st.c_m / st.c_mm * 100)) + "%";
        document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN ${st.poison > 0 ? "[毒]" : ""}`;
        const target = st.stage === 1 ? 3 : 5;
        document.getElementById('m-title').innerText = `目的：銀貨を${target}枚持ち帰れ`;
        document.getElementById('m-count').innerText = `倉庫の蓄え: ${st.gInv} / ${target}`;
        document.getElementById('dist-ui').innerText = `宿屋まで: ${st.max_dist - st.dist}km / 目的地まで: ${st.dist}km`;
        const idle = !st.inCombat && !st.inEvent;
        document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
        document.getElementById('btn-boss').style.display = (idle && st.dist <= 0) ? "block" : "none";
        document.getElementById('btn-report').style.display = (idle && st.dist >= st.max_dist && st.gInv >= target) ? "block" : "none";
        document.getElementById('btn-inn').style.display = (idle && st.dist >= st.max_dist && st.gInv < target) ? "block" : "none";
    } catch(e) { console.error("UI Update Error:", e); }
};

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const enemy = isBoss ? {name:"琥珀の守護獣", hp:200, atk:25, poison:0, coin:0, exp:500, type:"boss"} : DATA.ENEMIES[Math.floor(Math.random()*DATA.ENEMIES.length)];
    let e_hp = enemy.hp * st.enemyMul;
    let freezeCount = 0; let turn = 0; let lastHitter = 'kain';
    addLog(`${enemy.name}が現れた。`, "log-sys");

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        turn++;
        if(enemy.type === "rare" && turn === 3) { addLog(`${enemy.name}は霧散した！`); break; }

        if(st.poison > 0) {
            st.c_h -= 7; addLog(`毒ダメージ：7`, "log-dmg");
            if(Math.random() < 0.1) { addLog("<span class='log-owen'>オーエン「……このくらい自分でなんとかできないの？」</span>"); st.poison = 0; }
        }

        if(st.owenAbsent <= 0 && freezeCount <= 0) {
            if(st.c_h / st.c_mh <= 0.4 && Math.random() < 0.1) {
                e_hp = 0; lastHitter = 'owen';
                addLog(`<span class='log-owen'>【オーエン】「消えろ」</span>`);
                addLog(`《トランクから放たれた影が${enemy.name}を飲み込んだ。》`, "log-sys");
                break;
            } else if(Math.random() < 0.15) {
                freezeCount = 2; addLog(`<span class='log-owen'>オーエン「……凍れよ」</span>`);
                addLog(`《戦場が凍りついた。カインは一気に間合いを詰める！》`, "log-sys");
            }
        }

        const atkName = st.lv >= 5 ? "迅雷斬り" : "攻撃";
        let hits = (st.lv >= 3 && Math.random() < 0.2) ? 2 : 1;
        for(let i=0; i<hits; i++) {
            let dmg = st.atk + Math.floor(Math.random()*5);
            let crit = Math.random() < 0.1;
            if(crit) { dmg = Math.floor(dmg * 1.5); addLog(`【痛恨】カインの鋭い一撃！`, "log-critical"); }
            e_hp -= dmg; addLog(`カインの${atkName}：${dmg}ダメージ`, "log-atk");
            if(e_hp <= 0) { lastHitter = 'kain'; break; }
        }
        if(e_hp <= 0) break;

        if(freezeCount > 0) { 
            addLog(`${enemy.name}は凍りついている`); freezeCount--;
            if(freezeCount === 0) addLog(`《${enemy.name}の凍結が解除された》`, "log-sys");
        } else {
            let e_dmg = Math.max(1, enemy.atk - st.def);
            if(enemy.type === "bonus" && Math.random() < 0.4) { addLog(`${enemy.name}は素早く身をかわした！`); }
            else {
                st.c_h -= e_dmg; triggerFlash();
                addLog(`${enemy.name}の反撃：${e_dmg}ダメージ`, "log-dmg");
                if(Math.random() < enemy.poison) { st.poison = 1; addLog("カインは毒を受けた！", "log-dmg"); }
                if(st.c_h <= 0 && st.lv >= 5 && !st.fukutsuUsed && Math.random() < 0.3) {
                    st.c_h = 1; st.fukutsuUsed = true; addLog("【不屈】カインは踏みとどまった！", "log-atk");
                }
            }
        }
        updateUI();
    }

    if(st.c_h <= 0) {
        st.owenPatience--; st.dist = st.max_dist; st.tInv = 0; st.c_h = 20; st.poison = 0;
        addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
    } else if(e_hp <= 0) {
        addLog(`《${enemy.name}を倒した！》`, "log-sys");
        addLog("魔物の死骸を調べている……", "log-sys");
        await new Promise(r => setTimeout(r, 1000));
        
        st.exp += enemy.exp;
        if(lastHitter === 'kain') {
            const count = enemy.type === "bonus" ? 2 : 1;
            if(Math.random() < enemy.coin) { st.tInv += count; addLog(`[古い銀貨]を${count}枚入手！`); }
        } else { addLog("<b>【オーエンが倒してしまった】</b>", "log-sys"); }

        if(st.exp >= st.lv * 40) { 
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; 
            st.c_h = st.c_mh; st.c_m = st.c_mm;
            addLog(`【レベルアップ】Lv.${st.lv}`, "log-sys");
            addLog("【全快】カインの体に力が漲った！", "log-recovery");
        }
    }
    st.inCombat = false; st.fukutsuUsed = false; updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        if(st.owenAbsent > 0) st.owenAbsent--;
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        
        const scene = DATA.MOVE_LOGS[Math.floor(Math.random()*DATA.MOVE_LOGS.length)];
        addLog(`${scene}(${move}km移動)`);
        
        if(st.poison > 0) { st.c_h -= 5; addLog("毒が回っている……HP-5", "log-dmg"); if(st.c_h < 1) st.c_h = 1; }
        if(Math.random() < 0.45) battle(); else updateUI();
    } else if(type === 'inn' || type === 'report') {
        // ... (前回の報告/宿屋ロジックを維持) ...
        if(type === 'inn') {
            if(st.owenPatience <= 0) {
                st.inEvent = true; document.body.style.background = "#000";
                addLog("【バッドエンド：任務放棄】", "log-dmg");
                addLog("いつのまにか宿屋は引き払われ……。");
                addLog(`<span class='log-owen'>オーエン「帰るよ騎士様。…まだおまえには早かったんだよ。」</span>`); return;
            }
            st.gInv += st.tInv; st.tInv = 0; st.c_h = st.c_mh; st.poison = 0; addLog("【宿屋】休息した。"); updateUI();
        } else {
            st.inEvent = true; updateUI();
            addLog("店主「おっ、ちゃんと持ってきたか」", "log-sys");
            setTimeout(() => addLog("【その夜】", "log-sys"), 1500);
            setTimeout(() => { addLog(`<span class='log-owen'>オーエン「次は街にしようよ……」</span>`); document.getElementById('btn-next').style.display = "block"; }, 3000);
        }
    } else if(type.startsWith('use_')) {
        const item = type === 'use_hb' ? 'herb' : 'sw';
        if(st[item] > 0) { st[item]--; st.c_h = Math.min(st.c_mh, st.c_h + 30); st.poison = 0; addLog(`回復！`); toggleModal(false); updateUI(); }
    } else if(type === 'boss') battle(true);
};

window.onload = () => {
    updateUI(); st.inEvent = true; addLog("【宿屋の入り口】", "log-sys");
    setTimeout(() => { addLog("店主「銀貨3枚、持ってきてくれ。」"); st.inEvent = false; updateUI(); }, 1000);
};
