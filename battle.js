async function battle() {
    st.inCombat = true;
    updateUI(); 
    
    const chData = DATA.STORY_DATA.CHAPTER_1;
    let enemy = { ...chData.enemies_day[0] };
    addLog(`<b>${enemy.name}が現れた！</b>`, "log-sys");

    while(enemy.hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 800));
        let dmg = st.atk;
        enemy.hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ`);

        if(enemy.hp <= 0) break;

        let e_dmg = enemy.atk;
        st.c_h -= e_dmg;
        addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
        updateUI(); 
    }

    if(st.c_h <= 0) {
        addLog("《敗北した……拠点に戻ります》", "log-sys");
        st.c_h = 50; st.dist = 0;
    } else {
        addLog(`《${enemy.name}を倒した！》`, "log-sys");
        st.tInv += 1; 
    }

    st.inCombat = false;
    updateUI(); 
}
