const DATA = {
    MOVE_LOGS: [],
    OWEN_QUOTES: {},
    ITEMS: {
        herb: { name: "薬草", heal: 30, curePoison: true },
        sweets: { name: "甘味", heal: 40, curePoison: false },
        boss_drop_a: { name: "ボスの落とし物A", heal: 0, curePoison: false }
    },
    STORY_DATA: {},
    SCENARIO: {}
};

let st = { 
    chapter: 1, 
    progress: 0, // 0:納品前, 1:情報聞き出し済, 2:護衛承諾, 3:クリア
    isNight: false,
    lv: 1, exp: 0, atk: 10, def: 5, c_h: 120, c_mh: 120, 
    gInv: 0, tInv: 0, // tInvが手持ちの銀貨
    herb: 1, sw: 1, boss_drop_a: 0,
    dist: 0, max_dist: 10, 
    inCombat: false, inEvent: false, 
    mood: 50, poison: 0 
};
