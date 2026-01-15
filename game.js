let st = { chapter: 1, progress: 0, lv: 1, exp: 0, atk: 10, def: 5, c_h: 120, c_mh: 120, gInv: 0, tInv: 0, herb: 1, sw: 1, dist: 0, max_dist: 10, inCombat: false, inEvent: false, mood: 50, _isBelowThreshold: false, poison: 0 };

function applyMood(delta, reason = "") {
    st.mood = Math.max(0, Math.min(100, st.mood + delta));
}

const getQuote = (key) => DATA.OWEN_QUOTES[key][0];

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    const d = document.createElement('div'); if(cls) d.className = cls;
    d.innerHTML = txt; log.appendChild(d); log.scrollTop = log.scrollHeight;
};

const updateUI = () => {
    const chData = DATA.STORY_DATA.CHAPTER_1;
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;
    document.getElementById('h-fill').style.width = (st.c_h / st.c_mh * 100) + "%";
    document.getElementById('dist-ui').innerText = `${chData.base_name}から: ${st.dist}km / ${chData.goal_name}まで残り: ${st.max_dist - st.dist}km`;
    
    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
    document.getElementById('btn-inn').style.display = (idle && st.dist === 0 && st.tInv < 3) ? "block" : "none";
    document.getElementById('btn-inn').innerText = `${chData.base_name}に入る`;
    document.getElementById('btn-report').style.display = (idle && st.dist === 0 && st.tInv >= 3) ? "block" : "none";
};

window.act = async function(type, arg) {
    if(type === 'move') {
        if(arg === 'fwd') st.dist = Math.min(10, st.dist + 1);
        else st.dist = Math.max(0, st.dist - 1);
        addLog(`探索中...(${st.dist}km)`);
        if(Math.random() < 0.3 && st.dist > 0 && st.dist < 10) battle();
        else updateUI();
    } else if(type === 'inn') {
        addLog(DATA.STORY_DATA.CHAPTER_1.MSG.NEED_COIN);
    }
};

const playScenario = async (scenarioArray) => {
    st.inEvent = true;
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, msg.delay));
        addLog(`${msg.name}：${msg.text}`);
    }
    st.inEvent = false; updateUI();
};

// 起動時にこれを実行
window.onload = () => {
    updateUI();
    playScenario(DATA.SCENARIO.INTRO);
};
