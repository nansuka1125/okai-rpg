let st = { chapter: 1, progress: 0, lv: 1, exp: 0, atk: 10, def: 5, c_h: 120, c_mh: 120, gInv: 0, tInv: 0, herb: 1, sw: 0, dist: 10, max_dist: 10, inCombat: false, inEvent: false, mood: 50, _isBelowThreshold: false };

function applyMood(delta, reason = "") {
    st.mood = Math.max(0, Math.min(100, st.mood + delta));
    console.log(`[Mood] ${delta > 0 ? '+' : ''}${delta} | ${reason}`);
}

const getQuote = (key) => {
    const list = DATA.OWEN_QUOTES[key];
    return list[Math.floor(Math.random() * list.length)];
};

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    if(!log) return;
    const d = document.createElement('div'); if(cls) d.className = cls;
    d.innerHTML = txt; log.appendChild(d); log.scrollTop = log.scrollHeight;
};

const triggerFlash = () => {
    const overlay = document.createElement('div'); overlay.className = 'damage-flash';
    document.body.appendChild(overlay); setTimeout(() => overlay.remove(), 200);
};

async function checkEvent() {
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    const currentKm = st.max_dist - st.dist;
    if (st.progress >= 1 && chData.EVENTS[currentKm]) {
        if (currentKm === 2 && st.progress === 1) st.progress = 2;
        await playScenario(chData.EVENTS[currentKm]);
    }
}

const playScenario = async (scenarioArray) => {
    st.inEvent = true; updateUI();
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, msg.delay || 0));
        addLog(`<span ${msg.name === "オーエン" ? "class='log-owen'" : ""}>${msg.name}：${msg.text}</span>`);
    }
    st.inEvent = false; updateUI();
};

const updateUI = () => {
    const hpPercent = (st.c_h / st.c_mh) * 100;
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;
    document.getElementById('h-fill').style.width = hpPercent + "%";
    
    if (hpPercent <= 30 && !st._isBelowThreshold) { applyMood(-15, "焦燥"); st._isBelowThreshold = true; }
    else if (hpPercent > 30) st._isBelowThreshold = false;

    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    document.getElementById('m-title').innerText = `目的：銀貨を${chData.goal_coins}枚納品せよ`;
    document.getElementById('dist-ui').innerText = `宿屋まで: ${st.max_dist - st.dist}km / 目的地まで: ${st.dist}km`;
    
    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
    document.getElementById('btn-report').style.display = (idle && st.dist >= st.max_dist && st.progress === 0 && st.tInv >= chData.goal_coins) ? "block" : "none";
    document.getElementById('btn-boss').style.display = (idle && st.dist <= 0 && st.progress >= 2) ? "block" : "none";
};

window.act = async function(type, arg) {
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    if(type === 'move') {
        st.dist = (arg === 'fwd') ? Math.max(0, st.dist - 1) : Math.min(st.max_dist, st.dist + 1);
        addLog(`${DATA.MOVE_LOGS[0]}(1km移動)`);
        await checkEvent();
        if(Math.random() < 0.4 && !st.inEvent && st.dist > 0 && st.dist < st.max_dist) battle();
        else updateUI();
    } else if(type === 'report') {
        st.tInv -= chData.goal_coins; st.gInv += chData.goal_coins; st.progress = 1;
        applyMood(5, "報告完了"); addLog(chData.MSG.REPORT_THANKS, "log-sys"); updateUI();
    } else if(type.startsWith('use_')) {
        // アイテム使用処理（以前のロジックと同様）
    }
};

window.onload = () => { updateUI(); playScenario(DATA.SCENARIO.INTRO); };
