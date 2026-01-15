window.battle = async function() {
    st.inCombat = true;
    updateUI(); 
    
    const chData = DATA.STORY_DATA.CHAPTER_1;
    // 昼か夜かの敵をランダムに選ぶ（今はシンプルに0番目か1番目）
    let enemy = { ...chData.enemies_day[Math.floor(Math.random() * chData.enemies_day.length)] };
    addLog(`<b>${enemy.name}が現れた！</b>`, "log-sys");

    // 戦闘ループ
    while(enemy.hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 800));
        let dmg = st.atk;
        enemy.hp -= dmg;
        addLog(`カインの攻撃：${dmg}ダメージ`);

        if(enemy.hp <= 0) break;

        await new Promise(r => setTimeout(r, 800));
        let e_dmg = enemy.atk;
        st.c_h -= e_dmg;
        addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
        updateUI(); 
    }

    // 決着後の処理
    if(st.c_h <= 0) {
        addLog("《敗北した……拠点に戻ります》", "log-sys");
        st.c_h = 50; 
        st.dist = 0;
    } else {
        addLog(`《${enemy.name}を倒した！》`, "log-sys");
        
        // --- ここからドロップ演出 ---
        await new Promise(r => setTimeout(r, 600));
        
        // 銀貨がまだ3枚未満なら、50%の確率でドロップ
        if (st.tInv < 3 && Math.random() < 0.5) {
            addLog("《何か落としていった……》", "log-sys");
            await new Promise(r => setTimeout(r, 800));
            st.tInv += 1;
            addLog("<b>【銀貨】</b>を手に入れた！", "log-sys");
        } 
        // 銀貨が落ちなかった時、または既に3枚ある時は薬草の抽選
        else if (Math.random() < 0.3) {
            addLog("《何か落としていった……》", "log-sys");
            await new Promise(r => setTimeout(r, 800));
            st.herb += 1;
            addLog("<b>【薬草】</b>を手に入れた！", "log-sys");
        }
        // --------------------------
    }

    st.inCombat = false;
    updateUI(); 
};
