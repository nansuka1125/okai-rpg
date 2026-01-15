// 画面を更新する関数
const updateUI = () => {
    const chData = DATA.STORY_DATA.CHAPTER_1;
    if (!chData) return;

    // HPバーの更新
    const hpPercent = (st.c_h / st.c_mh) * 100;
    const hFill = document.getElementById('h-fill');
    if(hFill) hFill.style.width = Math.max(0, hpPercent) + "%";
    
    const hpText = document.getElementById('hp-values');
    if(hpText) hpText.innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;

    // 倉庫の蓄え表示
    const mCount = document.getElementById('m-count');
    if(mCount) mCount.innerText = `倉庫の蓄え: ${st.tInv} / ${chData.goal_coins}`;

    // 距離の更新
    const distUI = document.getElementById('dist-ui');
    if(distUI) {
        const base = chData.base_name || "拠点";
        const goal = chData.goal_name || "目的地";
        distUI.innerText = `${base}から: ${st.dist}km / ${goal}まで残り: ${st.max_dist - st.dist}km`;
    }

    // ボタンの表示制御
    const idle = !st.inCombat && !st.inEvent;
    const normalBtns = document.getElementById('normal-btns');
    if(normalBtns) normalBtns.style.display = idle ? "grid" : "none";

    const atBase = (st.dist === 0);
    const canReport = (st.tInv >= chData.goal_coins && st.progress === 0);
    
    const btnInn = document.getElementById('btn-inn');
    if(btnInn) {
        btnInn.style.display = (idle && atBase && !canReport) ? "block" : "none";
        btnInn.innerText = `${chData.base_name}に入る`;
    }

    const btnReport = document.getElementById('btn-report');
    if(btnReport) btnReport.style.display = (idle && atBase && canReport) ? "block" : "none";

    const atGoal = (st.dist === st.max_dist);
    const btnBoss = document.getElementById('btn-boss');
    if(btnBoss) btnBoss.style.display = (idle && atGoal && st.progress >= 2) ? "block" : "none";
};

// ログを表示する関数
const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    if(!log) return;
    const d = document.createElement('div');
    if(cls) d.className = cls;
    d.innerHTML = txt;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
};

// 会話イベントを再生する関数
const playScenario = async (scenarioArray) => {
    if (!scenarioArray) return;
    st.inEvent = true;
    updateUI();
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, msg.delay || 500));
        addLog(`<b>${msg.name}</b>：${msg.text}`);
    }
    st.inEvent = false;
    updateUI();
};

// ボタンを押した時の動作
window.act = async function(type, arg) {
    if (st.inCombat || st.inEvent) return;

    if(type === 'move') {
        if(arg === 'fwd') st.dist = Math.min(10, st.dist + 1);
        else st.dist = Math.max(0, st.dist - 1);
        
        addLog(`探索中... (${st.dist}km地点)`);
        
        // イベントチェック
        const event = DATA.STORY_DATA.CHAPTER_1.EVENTS[st.dist];
        if(event) {
            await playScenario(event);
        } else if(Math.random() < 0.3 && st.dist > 0 && st.dist < 10) {
            if(typeof window.battle === 'function') {
                await window.battle();
            }
        }
        updateUI();
    } else if(type === 'inn') {
        addLog(DATA.STORY_DATA.CHAPTER_1.MSG.NEED_COIN);
    } else if(type === 'report') {
        addLog(DATA.STORY_DATA.CHAPTER_1.MSG.REPORT_THANKS, "log-sys");
        st.tInv -= 3;
        st.progress = 1; // 進行状況を更新
        updateUI();
    }
};

// 持ち物画面の開閉
window.toggleModal = (show) => {
    const modal = document.getElementById('modal');
    if(modal) modal.style.display = show ? 'flex' : 'none';
};

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    updateUI();
    if(DATA.SCENARIO && DATA.SCENARIO.INTRO) {
        playScenario(DATA.SCENARIO.INTRO);
    }
});
