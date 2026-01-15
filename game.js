let st = { 
    chapter: 1, progress: 0, lv: 1, exp: 0, atk: 10, def: 5, 
    c_h: 120, c_mh: 120, gInv: 0, tInv: 0, herb: 1, sw: 1, 
    dist: 0, max_dist: 10, // 0から出発、10が目的地
    inCombat: false, inEvent: false, mood: 50, _isBelowThreshold: false, poison: 0
};

function applyMood(delta, reason = "") {
    st.mood = Math.max(0, Math.min(100, st.mood + delta));
    console.log(`[Mood] ${delta > 0 ? '+' : ''}${delta} | ${reason} | Current: ${st.mood}`);
}

const getQuote = (key) => DATA.OWEN_QUOTES[key][Math.floor(Math.random() * DATA.OWEN_QUOTES[key].length)];

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    const d = document.createElement('div'); if(cls) d.className = cls;
    d.innerHTML = txt; log.appendChild(d); log.scrollTop = log.scrollHeight;
};

const updateUI = () => {
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    const hpPercent = (st.c_h / st.c_mh) * 100;
    
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;
    document.getElementById('h-fill').style.width = hpPercent + "%";
    
    if (hpPercent <= 30 && !st._isBelowThreshold) { applyMood(-15, "焦燥"); st._isBelowThreshold = true; }
    else if (hpPercent > 30) st._isBelowThreshold = false;

    // 距離の表示
    document.getElementById('dist-ui').innerText = `${chData.base_name}から: ${st.dist}km / ${chData.goal_name}まで残り: ${st.max_dist - st.dist}km`;

    const idle = !st.inCombat && !st.inEvent;
    const atBase = (st.dist === 0);
    const atGoal = (st.dist === st.max_dist);

    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";
    
    // 宿屋/納品ボタンの制御
    const canReport = (st.tInv >= chData.goal_coins && st.progress === 0);
    const btnReport = document.getElementById('btn-report');
    const btnInn = document.getElementById('btn-inn');
    
    btnReport.style.display = (idle && atBase && canReport) ? "block" : "none";
    btnInn.style.display = (idle && atBase && !canReport) ? "block" : "none";
    btnInn.innerText = `${chData.base_name}に入る`;

    // ボスボタン
    document.getElementById('btn-boss').style.display = (idle && atGoal && st.progress >= 2) ? "block" : "none";
};

window.act = async function(type, arg) {
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    if(type === 'move') {
        if(arg === 'fwd') st.dist = Math.min(st.max_dist, st.dist + 1);
        else st.dist = Math.max(0, st.dist - 1);
        
        addLog(`${DATA.MOVE_LOGS[0]}(1km移動)`);
        await checkEvent();
        
        if(Math.random() < 0.4 && !st.inEvent && st.dist > 0 && st.dist < st.max_dist) {
            battle();
        } else {
            updateUI();
        }
    } else if(type === 'report') {
        st.tInv -= chData.goal_coins; st.gInv += chData.goal_coins; st.progress = 1;
        applyMood(5, "報告完了"); addLog(chData.MSG.REPORT_THANKS, "log-sys"); updateUI();
    } else if(type === 'inn') {
        addLog(chData.MSG.NEED_COIN);
    }
};

async function checkEvent() {
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    if (st.progress >= 1 && chData.EVENTS[st.dist]) {
        if (st.dist === 2 && st.progress === 1) st.progress = 2; // 荷馬車イベント
        await playScenario(chData.EVENTS[st.dist]);
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

window.onload = () => { updateUI(); playScenario(DATA.SCENARIO.INTRO); };
