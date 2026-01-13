async function battle(isBoss = false) {
    st.inCombat = true; updateUI();
    const enemy = isBoss ? DATA.BOSSES[`stage${st.stage}`] : DATA.ENEMIES[Math.floor(Math.random()*DATA.ENEMIES.length)];
    let e_hp = enemy.hp * st.enemyMul;
    let freezeCount = 0;
    let lastHitter = 'kain';
    addLog(`${enemy.name}が現れた。`, "log-sys");

    if (Math.random() < 0.25 || isBoss) {
        addLog(`${enemy.name}の先制攻撃！`, "log-dmg");
        let e_dmg = Math.max(1, enemy.atk - st.def);
        st.c_h -= e_dmg; triggerFlash();
        addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
        updateUI();
        if(st.c_h <= 0) {
            addLog("《カインは敗北した…》", "log-sys");
        }
    }

    while(e_hp > 0 && st.c_h > 0) {
        await new Promise(r => setTimeout(r, 600));

        if(st.poison > 0) {
            st.c_h -= 7; addLog(`毒ダメージ：7`, "log-dmg");
            if(Math.random() < 0.1) { 
                addLog(`<span class='log-owen'>オーエン「${getQuote('HEAL_POISON')}」</span>`); 
                st.poison = 0; 
            }
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        }

        const enemyFirst = Math.random() < 0.5;

        if (enemyFirst && freezeCount <= 0) {
            let e_dmg = Math.max(1, enemy.atk - st.def);
            st.c_h -= e_dmg; triggerFlash();
            addLog(`${enemy.name}の攻撃：${e_dmg}ダメージ`, "log-dmg");
            updateUI();
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        }

        if(st.owenAbsent <= 0 && freezeCount <= 0) {
            if(st.c_h / st.c_mh <= 0.4 && Math.random() < 0.15) {
                e_hp = 0; lastHitter = 'owen';
                addLog(`<span class='log-owen'>【オーエン】「${getQuote('INSTANT_KILL')}」</span>`);
                break;
            } else if(Math.random() < 0.15) {
                freezeCount = 2; 
                addLog(`<span class='log-owen'>オーエン「${getQuote('FREEZE')}」</span>`);
            }
        }

        const atkName = st.lv >= 5 ? "迅雷斬り" : "攻撃";
        let dmg = st.atk + Math.floor(Math.random()*5);
        if(Math.random() < 0.1) { dmg = Math.floor(dmg * 1.5); addLog(`【痛恨】カインの鋭い一撃！`, "log-critical"); }
        e_hp -= dmg; addLog(`カインの${atkName}：${dmg}ダメージ`, "log-atk");

        if(e_hp <= 0) { lastHitter = 'kain'; break; }

        if (!enemyFirst && freezeCount <= 0) {
            let e_dmg = Math.max(1, enemy.atk - st.def);
            st.c_h -= e_dmg; triggerFlash();
            addLog(`${enemy.name}の反撃：${e_dmg}ダメージ`, "log-dmg");
            updateUI();
            if(Math.random() < enemy.poison) { st.poison = 1; addLog("カインは毒を受けた！", "log-dmg"); }
            if(st.c_h <= 0) {
                addLog("《カインは敗北した…》", "log-sys");
                break;
            }
        } else if (freezeCount > 0) {
            addLog(`${enemy.name}は凍りついている`); 
            freezeCount--;
        }
        updateUI();
    }

    // ★ここから修正：敗北時のランダム演出を追加
    if(st.c_h <= 0) {
        st.owenPatience--; 
        st.dist = st.max_dist; 
        st.tInv = 0; 
        st.c_h = 5; 
        st.poison = 0;

        const wakeUpMsgs = [
            "《薄れゆく意識のなか、カインは古びた宿屋の天井を見上げていた》",
            "《軋む身体に鞭打ち、カインは宿屋の片隅でどうにか意識を取り戻した》",
            "《死の淵から連れ戻されたカインは、微かな温もりの中で目を覚ました》"
        ];
        const randomMsg = wakeUpMsgs[Math.floor(Math.random() * wakeMsgs.length)];

        setTimeout(() => {
            addLog(randomMsg, "log-sys");
            updateUI();
            setTimeout(() => {
                addLog(`<span class='log-owen'>オーエン「${getQuote('INN_DEFEAT')}」</span>`);
            }, 1000);
        }, 800);

    } else if(e_hp <= 0) {
        addLog(`《${enemy.name}を倒した！》`, "log-sys");
        await new Promise(r => setTimeout(r, 800));
        st.exp += enemy.exp;
        if(lastHitter === 'kain') {
            const count = enemy.type === "bonus" ? 2 : 1;
            if(Math.random() < enemy.coin) { st.tInv += count; addLog(`[古い銀貨]を${count}枚入手！`); }
        } else {
            addLog(`<span class='log-owen'>オーエン「${getQuote('KILL_STEAL')}」</span>`);
        }
        if(isBoss) st.dist = st.max_dist; 
        if(st.exp >= st.lv * 40) { 
            st.lv++; st.exp = 0; st.atk += 2; st.def += 1; 
            st.c_mh += 15; 
            st.c_h = st.c_mh; 
            addLog(`【レベルアップ】Lv.${st.lv} (最大HPが向上！)`, "log-sys");
        }
    }
    st.inCombat = false; updateUI();
}
