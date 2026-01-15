let st = { chapter: 1, progress: 0, lv: 1, exp: 0, atk: 10, def: 5, c_h: 120, c_mh: 120, gInv: 0, tInv: 0, herb: 1, sw: 1, dist: 0, max_dist: 10, inCombat: false, inEvent: false, mood: 50, poison: 0 };

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    if(!log) return;
    const d = document.createElement('div'); if(cls) d.className = cls;
    d.innerHTML = txt; log.appendChild(d); log.scrollTop = log.scrollHeight;
};

const updateUI = () => {
    const chData = DATA.STORY_DATA.CHAPTER_1;
    if (!chData) return;

    const hpPercent = (st.c_h / st.c_mh) * 100;
    document.getElementById('h-fill').style.width = Math.max(0, hpPercent) + "%";
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;

    const base = chData.base_name || "拠点";
    const goal = chData.goal_name || "目的地";
    document.getElementById('dist-ui').innerText = `${base}から: ${st.dist}km / ${goal}まで残り: ${st.max_dist - st.dist}km`;

    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";

    const atBase = (st.dist === 0);
    const canReport = (st.tInv >= 3 && st.progress === 0);
    const btnInn = document.getElementById('btn-inn');
    const btnReport = document.getElementById('btn-report');

    btnInn.style.display = (idle && atBase && !canReport) ? "block" : "none";
    btnInn.innerText = `${base}に入る`;
    btnReport.style.display = (idle && atBase && canReport) ? "block" : "none";

    const atGoal = (st.dist === st.max_dist);
    document.getElementById('btn-boss').style.display = (idle && atGoal && st.progress >= 2) ? "block" : "none";
};

window.act = async function(type, arg) {
    if (st.inCombat || st.inEvent) return;

    if(type === 'move') {
        if(arg === 'fwd') st.dist = Math.min(10, st.dist + 1);
        else st.dist = Math.max(0, st.dist - 1);
        addLog(`探索中... (${st.dist}km地点)`);
        if(Math.random() < 0.3 && st.dist > 0 && st.dist < 10) battle();
        else updateUI();
    } else if(type === 'inn') {
        addLog(DATA.STORY_DATA.CHAPTER_1.MSG.NEED_COIN);
    }
};

const playScenario = async (scenarioArray) => {
    st.inEvent = true; updateUI();
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, msg.delay || 500));
        addLog(`${msg.name}：${msg.text}`);
    }
    st.inEvent = false; updateUI();
};

window.onload = () => {
    if(typeof DATA !== 'undefined' && DATA.STORY_DATA.CHAPTER_1) {
        updateUI();
        playScenario(DATA.SCENARIO.INTRO);
    } else {
        setTimeout(window.onload, 100);
    }
};
