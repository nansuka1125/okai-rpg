const updateUI = () => {
    const chData = DATA.STORY_DATA.CHAPTER_1;
    document.getElementById('m-title').innerText = st.isNight ? "目的：荷馬車を護衛せよ" : "目的：銀貨を3枚納品せよ";
    document.getElementById('m-count').innerText = `銀貨所持: ${st.tInv} / ${chData.goal_coins}`;
    
    const hpPercent = (st.c_h / st.c_mh) * 100;
    document.getElementById('h-fill').style.width = Math.max(0, hpPercent) + "%";
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;

    const base = st.isNight ? "【夜の森】" : "琥珀の森";
    document.getElementById('dist-ui').innerText = `${base}: ${st.dist}km地点`;

    const idle = !st.inCombat && !st.inEvent;
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";

    // ボタン制御
    const atBase = (st.dist === 0);
    const btnInn = document.getElementById('btn-inn');
    const btnReport = document.getElementById('btn-report');
    const btnBoss = document.getElementById('btn-boss');

    // 納品ボタン：銀貨3枚以上＆未納品時
    btnReport.style.display = (idle && atBase && st.tInv >= 3 && st.progress === 0) ? "block" : "none";
    // 宿屋ボタン：納品前
    btnInn.style.display = (idle && atBase && st.progress === 0 && st.tInv < 3) ? "block" : "none";
    
    // ボスボタン：10km地点＆護衛中
    btnBoss.style.display = (idle && st.dist === 10 && st.progress === 2) ? "block" : "none";
};

const addLog = (txt, cls="") => {
    const log = document.getElementById('log');
    const d = document.createElement('div');
    if(cls) d.className = cls;
    d.innerHTML = txt;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
};

const playScenario = async (scenarioArray) => {
    st.inEvent = true; updateUI();
    for (const msg of scenarioArray) {
        await new Promise(r => setTimeout(r, 700));
        addLog(`<b>${msg.name}</b>：${msg.text}`);
    }
    st.inEvent = false; updateUI();
};

window.act = async function(type, arg) {
    if (st.inCombat || st.inEvent) return;

    if(type === 'move') {
        let oldDist = st.dist;
        if(arg === 'fwd') st.dist = Math.min(10, st.dist + 1);
        else st.dist = Math.max(0, st.dist - 1);
        
        addLog(`探索中... (${st.dist}km地点)`);

        // 夜の護衛イベント（progress 2の時のみ）
        if(st.isNight && st.progress === 2 && st.dist > oldDist) {
            const ev = DATA.SCENARIO.NIGHT_WALK[st.dist];
            if(ev) await playScenario(ev);
            if(st.dist === 10) await playScenario([{name:"カイン", text:"来たか…！"}, {name:"荷馬車", text:"助けてくれお前たち"}, {name:"オーエン", text:"ボス戦だね"}]);
        }
        
        // 2km地点の荷馬車（夜限定）
        if(st.isNight && st.dist === 2 && st.progress === 1) {
            addLog("<button onclick='wagonEvent()' class='special-btn'>荷馬車に話しかける</button>");
        }

        if(Math.random() < 0.2 && st.dist > 0 && st.dist < 10) await window.battle();
        updateUI();
    } else if(type === 'report') {
        await playScenario([{name:"店主", text:DATA.STORY_DATA.CHAPTER_1.MSG.REPORT_THANKS}]);
        await playScenario([{name:"カイン", text:DATA.STORY_DATA.CHAPTER_1.MSG.GO_FOREST}]);
        st.tInv -= 3; st.progress = 1; st.isNight = true; 
        updateUI();
    } else if(type === 'inn') {
        addLog("店主「ふざけるな、銀貨を持ってこい」");
    } else if(type === 'boss') {
        await window.battle(true);
        if(st.progress === 3) await playScenario([{name:"システム", text:"【第一章：街道と森 クリア】"}, {name:"カイン", text:"「次の街にいくぞ」"}, {name:"オーエン", text:"「北までとおい」"}]);
    }
};

window.wagonEvent = async () => {
    await playScenario(DATA.SCENARIO.WAGON_TALK);
    addLog("警護を引き受けますか？");
    addLog("<button onclick='confirmWagon(true)'>わかった</button> <button onclick='confirmWagon(false)'>断る</button>");
};

window.confirmWagon = async (yes) => {
    if(yes) {
        await playScenario([{name:"カイン", text:"わかった"}, {name:"ナレーション", text:"オーエンとカインは荷馬車に乗った"}]);
        st.progress = 2;
    } else {
        addLog("カイン「いや、断る」");
    }
    updateUI();
};

window.toggleModal = (show) => {
    const modal = document.getElementById('modal');
    if(show) {
        const list = document.getElementById('item-list');
        list.innerHTML = "";
        // 所持しているアイテムだけを表示
        if(st.herb > 0) list.innerHTML += `<div>薬草 x${st.herb}</div>`;
        if(st.sw > 0) list.innerHTML += `<div>甘味 x${st.sw}</div>`;
        if(st.boss_drop_a > 0) list.innerHTML += `<div>ボスの落とし物A x${st.boss_drop_a}</div>`;
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
};
