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

// 🚩ーー【会話データ】ーー
const TALK_DATA = {
    innOwner: [
        { text: "店主「あれだ、森で適当に探してくるとかさ」", effect: null },
        { text: "娘「カインさん、あの…っ！これどうぞ」", effect: "getHerb" },
        { text: "娘「琥珀の森は最近、魔物が増えています。どうかお気をつけて」", effect: null },
        { text: "店主「早く銀貨を持ってきてくれ」", effect: null }
    ]
};

// --- ロケーションデータ ---
const LOCATIONS = {
    0: { name: "琥珀の森 入口", hasTarget: false, desc: "ここから先が琥珀の森だ。" },
    1: { name: "琥珀の森", hasTarget: false, desc: "鳥の鳴き声が聞こえる…" },
    7: { name: "森の深層", hasTarget: true, desc: "空気が湿ってきた…" }
};

// 🚩ーー【状態管理】ーー
let gameState = {
    currentDistance: 0,
    isInDungeon: false, // 拠点(false)とダンジョン(true)の切り替えフラグ
    cainLv: 1,
    cainHP: 100,
    cainMaxHP: 100,
    inventory: { silverCoin: 0, herb: 0 },
    flags: { isDelivered: false, gotTestCoin: false },
    // 状態フラグ
    isBattling: false,
    isAtInn: false, 
    currentEnemy: null,
    talkCount: 0,
    canStay: true // 宿泊可能フラグ
};
