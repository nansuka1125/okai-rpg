async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const chData = DATA.STORY_DATA[`CHAPTER_${st.chapter}`];
    let enemy = isBoss ? chData.boss : (st.progress >= 2 ? chData.enemies_night : chData.enemies_day)[Math.floor(Math.random()*2)];

    addLog(`${enemy.name}が現れた。`, "log-sys");
    
    // 【オーエンの気分予兆】
    if (st.mood >= 70) addLog("《オーエンは満足げにカインを眺めている》", "log-sys");
    if (st.mood <= 30) addLog("《周囲の空気が刺すように冷え、オーエンの影が苛立たしげに揺れている》", "log-sys");

    while(enemy.hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));

        // 稀にオーエンが即死させる（決め台詞発生！）
        if(st.c_h / st.c_mh <= 0.4 && Math.random() < 0.2) {
            enemy.hp = 0;
            addLog(`<span class='log-owen'>【オーエン】「${getQuote('INSTANT_KILL')}」</span>`);
            break;
        }

        let dmg = st.atk + Math.floor(Math.random()*5);
        enemy.hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ`, "log-atk");

        if(enemy.hp <= 0) break;

        let e_dmg = Math.max(1, enemy.atk - st.def);
        st.c_h -= e_dmg;
        triggerFlash();
        addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
        updateUI();
    }

    if(st.c_h <= 0) {
        st.c_h = 10; st.dist = st.max_dist;
        applyMood(-10, "敗北");
        addLog("《カインは意識を失った…》", "log-sys");
    } else {
        addLog(`《${enemy.name}を消し去った》`, "log-sys");
        // オーエンがトドメを刺した演出
        if(Math.random() < 0.3) addLog(`<span class='log-owen'>オーエン「${getQuote('KILL_STEAL')}」</span>`);
        
        if (isBoss) {
            st.progress = 3;
            await playScenario(DATA.SCENARIO.CLEAR_CH1);
        }
    }
    st.inCombat = false; updateUI();
}
