// --- 定数・設定管理 ---
const CONFIG = {
    MAX_DISTANCE: 10,
    MIN_DISTANCE: 0,
    ITEM_NAME: { silverCoin: "銀貨", herb: "薬草" },
    ITEM_DESC: { 
        silverCoin: "宿屋に納品するための銀貨。3枚必要だ。", 
        herb: "傷を癒やす野草。HPを全回復する。" 
    },
    // 追加: バトル設定
    BATTLE_RATE: 0.3,
    TEST_ENEMY: { name: "魔界ネズミ", hp: 20, maxHp: 20, atk: 5 }
};

// --- ロケーションデータ ---
const LOCATIONS = {
    0: { name: "宿屋前", hasTarget: true, desc: "出発の準備は整った。" },
    1: { name: "琥珀の森", hasTarget: false, desc: "鳥の鳴き声が聞こえる…" },
    7: { name: "森の深層", hasTarget: true, desc: "空気が湿ってきた…" }
};

// --- 状態管理 ---
let gameState = {
    currentDistance: 0,
    cainLv: 1,
    cainHP: 100,
    cainMaxHP: 100,
    inventory: { silverCoin: 0, herb: 1 },
    flags: { isDelivered: false, gotTestCoin: false },
    // 追加: バトル状態
    isBattling: false,
    currentEnemy: null
};
