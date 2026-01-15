// 全ファイル共通のデータの箱
const DATA = {
    MOVE_LOGS: [],
    OWEN_QUOTES: {},
    ITEMS: {
        herb: { name: "薬草", heal: 30, curePoison: true },
        sweets: { name: "甘味", heal: 40, curePoison: false }
    },
    STORY_DATA: {},
    SCENARIO: {}
};

// ゲームの状態（全章共通）
let st = { 
    chapter: 1, progress: 0, lv: 1, exp: 0, 
    atk: 10, def: 5, c_h: 120, c_mh: 120, 
    gInv: 0, tInv: 0, herb: 1, sw: 1, 
    dist: 0, max_dist: 10, 
    inCombat: false, inEvent: false, 
    mood: 50, poison: 0 
};
