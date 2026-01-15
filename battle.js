async function battle() {
    st.inCombat = true; updateUI();
    let enemy = DATA.STORY_DATA.CHAPTER_1.enemies_day[0];
    addLog(`${enemy.name}が現れた！`);
    
    while(enemy.hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));
        enemy.hp -= st.atk;
        addLog(`カインの攻撃！`);
        if(enemy.hp <= 0) break;
        st.c_h -= enemy.atk;
        updateUI();
    }
    
    if(st.c_h > 0) addLog(`${enemy.name}を倒した。`);
    st.inCombat = false; updateUI();
}
