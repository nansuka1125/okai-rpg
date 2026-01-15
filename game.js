/* game.js の updateUI 関数をこの内容に書き換え */
const updateUI = () => {
    // 1章のデータを安全に取得
    const chData = DATA.STORY_DATA.CHAPTER_1;
    if(!chData) return;

    // HPバーの更新
    const hpPercent = (st.c_h / st.c_mh) * 100;
    document.getElementById('hp-values').innerText = `${Math.floor(st.c_h)} / ${st.c_mh}`;
    document.getElementById('h-fill').style.width = Math.max(0, hpPercent) + "%";
    
    // 距離の表示（undefined対策）
    const base = chData.base_name || "拠点";
    const goal = chData.goal_name || "目的地";
    document.getElementById('dist-ui').innerText = `${base}から: ${st.dist}km / ${goal}まで残り: ${st.max_dist - st.dist}km`;

    // ボタンの表示制御
    const idle = !st.inCombat && !st.inEvent;
    
    // 移動ボタンエリア
    document.getElementById('normal-btns').style.display = idle ? "grid" : "none";

    // 拠点（0km）でのボタン
    const atBase = (st.dist === 0);
    const canReport = (st.tInv >= 3 && st.progress === 0);
    
    const btnInn = document.getElementById('btn-inn');
    const btnReport = document.getElementById('btn-report');
    
    btnInn.style.display = (idle && atBase && !canReport) ? "block" : "none";
    btnInn.innerText = `${base}に入る`;
    
    btnReport.style.display = (idle && atBase && canReport) ? "block" : "none";

    // 目的地（10km）でのボタン
    const atGoal = (st.dist === st.max_dist);
    document.getElementById('btn-boss').style.display = (idle && atGoal && st.progress >= 2) ? "block" : "none";
};
