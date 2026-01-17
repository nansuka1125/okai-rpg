// 🚩ーー【宿屋・拠点システム】ここからーー
const innSystem = {
    // --- enterInn: 拠点入場 ---
    enterInn: function() {
        gameState.isAtInn = true;
        gameState.mode = "base"; 
        uiControl.addLog("―― 宿屋《琥珀亭》 ――", "marker");
        uiControl.addLog("宿屋の主人『カイン、今日も男前だな』");
        uiControl.updateUI();
    },

    // --- exitInn: 拠点退場 ---
    exitInn: function() {
        gameState.isAtInn = false;
        gameState.isInDungeon = false;
        gameState.currentDistance = 0;
        gameState.mode = "base";
        gameState.canStay = true;
        
        uiControl.addLog("―― 宿屋前 ――", "marker");
        uiControl.updateUI();
    },

    // --- talk: 会話進行システム ---
    talk: function() {
        if (gameState.mode !== "base") return;
        
        const talkList = TALK_DATA.innOwner;
        const index = Math.min(gameState.talkCount || 0, talkList.length - 1);
        const currentTalk = talkList[index];

        gameState.mode = "event"; // 会話演出開始
        uiControl.addLog(currentTalk.text);

        if (currentTalk.effect === "getHerb") {
            gameState.inventory.herb += 1;
            uiControl.addLog("（薬草を1つもらった！）");
        }

        if (gameState.talkCount < talkList.length - 1) {
            gameState.talkCount++;
        }

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 400);
    },

    // --- stay: 宿泊 ---
    stay: function() {
        if (gameState.mode !== "base") return;
        
        if (gameState.cainHP >= gameState.cainMaxHP) {
            uiControl.addLog("カイン「今はまだ休む必要はないな。」");
            return;
        }

        if (!gameState.canStay) {
            uiControl.addLog("宿屋の主人『悪いが、そう何度も部屋は貸せねえよ。少し外でも歩いてきたらどうだい？』");
            return;
        }

        gameState.mode = "event";
        gameState.cainHP = gameState.cainMaxHP;
        gameState.canStay = false; 
        uiControl.addLog("カインは一晩眠り、疲れが癒えた。（HPが全回復した）");

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 1000);
    },

    // --- deliver: 納品処理 ---
    deliver: function() {
        if (gameState.inventory.silverCoin < 3 || gameState.mode !== "base") return;
        
        gameState.mode = "event";
        gameState.inventory.silverCoin -= 3;
        gameState.flags.isDelivered = true;
        uiControl.addLog("銀貨を納品した。");
        uiControl.addLog("宿屋の主人『助かった！これで荷馬車の準備ができる。』");

        setTimeout(() => {
            gameState.mode = "base";
            uiControl.updateUI();
        }, 800);
    }
};
// 🏁ーー【宿屋・拠点システム】ここまでーー
