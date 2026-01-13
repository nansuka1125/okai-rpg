let st = { 
    stage: 1, lv: 1, exp: 0, atk: 10, def: 5,
    c_h: 120, c_mh: 120, c_m: 50, c_mm: 50, 
    gInv: 0, tInv: 0, 
    herb: 1, sw: 0, debug: 99, 
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
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 200);
};

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

const updateUI = () => {
    try {
        const hFill = document.getElementById('h-fill');
        const hBar = document.getElementById('h-bar');
        const hpValues = document.getElementById('hp-values');
        if(!hFill || !hBar || !hpValues) return;
        
        hpValues.innerText = `${Math.max(0, Math.floor(st.c_h))} / ${st.c_mh}`;

        const baseWidth = 1.6; 
        hBar.style.width = (st.c_mh * baseWidth) + "px";

        const hpPercent = (st.c_h / st.c_mh) * 100;
        hFill.style.width = Math.max(0, hpPercent) + "%";
        
        if (st.poison > 0) {
            hFill.style.backgroundColor = "#8e44ad"; 
        } else if (hpPercent <= 30) {
            hFill.style.backgroundColor = "#f39c12"; 
        } else {
            hFill.style.backgroundColor = "#e74c3c"; 
        }
        
        document.getElementById('c-lv').innerText = `Lv.${st.lv} CAIN ${st.poison > 0 ? "[毒]" : ""}`;
        const target = st.stage === 1 ? 3 : 5;
        const totalCoin = st.gInv + st.tInv; 
        document.getElementById('m-title').innerText = `目的：銀貨を${target}枚持ち帰れ`;
        document.getElementById('m-count').innerText = `倉庫の蓄え: ${st.gInv} / ${target}`;
        document.getElementById('dist-ui').innerText = `宿屋まで: ${st.max_dist - st.dist}km / 目的地まで: ${st.dist}km`;
        
        const idle = !st.inCombat && !st.inEvent;
        const atInn = (st.dist >= st.max_dist);
        const atGoal = (st.dist <= 0);
        document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
        document.getElementById('btn-boss').style.display = (idle && atGoal) ? "block" : "none";
        document.getElementById('btn-report').style.display = (idle && atInn && totalCoin >= target) ? "block" : "none";
        document.getElementById('btn-inn').style.display = (idle && atInn && totalCoin < target) ? "block" : "none";
        
    } catch(e) { console.error("UI Update Error:", e); }
};

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

async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const enemy = isBoss ? DATA.BOSSES[`stage${st.stage}`] : DATA.ENEMIES[Math.floor(Math.random()*DATA.ENEMIES.length)];
    let e_hp = enemy.hp * st.enemyMul;
    let freezeCount = 0;
    let lastHitter = 'kain';
    addLog(`${enemy.name}が現れた。`, "log-sys");

    if (Math.random() < 0.25 || isBoss) {
        addLog(`${enemy.name}の先制攻撃！`, "log-dmg");
        let e_dmg = Math.max(1, enemy.atk - st.def);
        st.c_h -= e_dmg; triggerFlash();
        addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
        updateUI();
        if(st.c_h <= 0) { // 先制で倒れた場合
            addLog("《カインは敗北した…》", "log-sys");
        }
    }

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));

        if(st.poison > 0) {
            st.c_h -= 7; addLog(`毒ダメージ：7`, "log-dmg");
            if(Math.random() < 0.1) { 
                addLog(`<span class='log-owen'>オーエン「${getQuote('HEAL_POISON')}」</span>`); 
                st.poison = 0; 
            }
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        }

        const enemyFirst = Math.random() < 0.5;

        if (enemyFirst && freezeCount <= 0) {
            let e_dmg = Math.max(1, enemy.atk - st.def);
            st.c_h -= e_dmg; triggerFlash();
            addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
            updateUI();
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        }

        if(st.owenAbsent <= 0 && freezeCount <= 0) {
            if(st.c_h / st.c_mh <= 0.4 && Math.random() < 0.15) {
                e_hp = 0; lastHitter = 'owen';
                addLog(`<span class='log-owen'>【オーエン】「${getQuote('INSTANT_KILL')}」</span>`);
                break;
            } else if(Math.random() < 0.15) {
                freezeCount = 2; 
                addLog(`<span class='log-owen'>オーエン「${getQuote('FREEZE')}」</span>`);
            }
        }

        const atkName = st.lv >= 5 ? "迅雷斬り" : "攻撃";
        let dmg = st.atk + Math.floor(Math.random()*5);
        if(Math.random() < 0.1) { dmg = Math.floor(dmg * 1.5); addLog(`【痛恨】カインの鋭い一撃！`, "log-critical"); }
        e_hp -= dmg; addLog(`カインの${atkName}：${dmg}ダメージ`, "log-atk");

        if(e_hp <= 0) { lastHitter = 'kain'; break; }

        if (!enemyFirst && freezeCount <= 0) {
            let e_dmg = Math.max(1, enemy.atk - st.def);
            st.c_h -= e_dmg; triggerFlash();
            addLog(`${enemy.name}の反撃：${e_dmg}ダメージ`, "log-dmg");
            updateUI();
            if(Math.random() < enemy.poison) { st.poison = 1; addLog("カインは毒を受けた！", "log-dmg"); }
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        } else if (freezeCount > 0) {
            addLog(`${enemy.name}は凍りついている`); 
            freezeCount--;
        }
        updateUI();
    }

    if(st.c_h <= 0) {
        st.owenPatience--; st.dist = st.max_dist; st.tInv = 0; st.c_h = 20; st.poison = 0;
        addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
    } else if(e_hp <= 0) {
        addLog(`《${enemy.name}を倒した！》`, "log-sys");
        await new Promise(r => setTimeout(r, 800));
        st.exp += enemy.exp;
        if(lastHitter === 'kain') {
            const count = enemy.type === "bonus" ? 2 : 1;
            if(Math.random() < enemy.coin) { st.tInv += count; addLog(`[古い銀貨]を${count}枚入手！`); }
        } else {
            addLog(`<span class='log-owen'>オーエン「${getQuote('KILL_STEAL')}」</span>`);
        }
        if(isBoss) st.dist = st.max_dist; 
        if(st.exp >= st.lv * 40) { 
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; 
            st.c_mh += 15; 
            st.c_h = st.c_mh; 
            addLog(`【レベルアップ】Lv.${st.lv} (最大HPが向上！)`, "log-sys");
        }
    }
    st.inCombat = false; updateUI();
}

window.act = function(type, arg) {
    if(type === 'move') {
        const move = Math.random() > 0.5 ? 2 : 1;
        if(arg === 'fwd') st.dist = Math.max(0, st.dist - move);
        else st.dist = Math.min(st.max_dist, st.dist + move);
        addLog(`${DATA.MOVE_LOGS[Math.floor(Math.random()*DATA.MOVE_LOGS.length)]}(${move}km移動)`);
        if(st.poison > 0) { st.c_h -= 5; if(st.c_h < 1) st.c_h = 1; }
        if(Math.random() < 0.45) battle(); else updateUI();
    } else if(type === 'inn') {
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
    } else if(type === 'boss') { battle(true); }
    else if(type === 'next_stage') {
        st.stage++; st.max_dist += 5; st.dist = st.max_dist; st.enemyMul += 0.2;
        st.inEvent = false; document.getElementById('btn-next').style.display = "none";
        addLog(`【第${st.stage}章】開始。`, "log-sys"); updateUI();
    }
};

window.onload = () => {
    updateUI();
    addLog("【古びた宿屋の入り口】", "log-sys");
    playScenario(DATA.SCENARIO.INTRO);
};
