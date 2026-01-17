// --- 定数・設定管理 ---
const CONFIG = {
    MAX_DISTANCE: 10,
    MIN_DISTANCE: 0,
    ITEM_NAME: { silverCoin: "銀貨", herb: "薬草" },
    ITEM_DESC: { 
        silverCoin: "宿屋に納品するための銀貨。3枚必要だ。", 
        herb: "傷を癒やす野草。HPを全回復する。" 
    },
    // バトル設定
    BATTLE_RATE: 0.3,
    TEST_ENEMY: { name: "魔界ネズミ", hp: 20, maxHp: 20, atk: 5 }
};

// --- ロケーションデータ ---
const LOCATIONS = {
    0: { name: "宿屋前", hasTarget: true, desc: "冒険の拠点だ。" },
    1: { name: "琥珀の森", hasTarget: false, desc: "木々がざわめいている。" },
    7: { name: "森の深層", hasTarget: true, desc: "強力な魔物の気配がする。" }
};

// --- 状態管理 ---
let gameState = {
    currentDistance: 0,
    isExploring: false, // 0m地点で「森へ」を選んだか
    isAtInn: false,
    isBattling: false,
    cainLv: 1,
    cainHP: 100,
    cainMaxHP: 100,
    inventory: { silverCoin: 0, herb: 1 },
    flags: { isDelivered: false, gotTestCoin: false },
    currentEnemy: null
};
