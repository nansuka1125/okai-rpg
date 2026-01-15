// 【第1章専用】琥珀の森のデータ
// 1章らしい「樹脂」「琥珀」「森」をテーマにした台詞をセットします

DATA.MOVE_LOGS = [
    "琥珀の木漏れ日の中を黙々と歩く。",
    "背後からオーエンの冷たい視線を感じながら進む。",
    "粘つく樹脂を踏みしめ、カインは先を急ぐ。"
];

// --- 1章専用のオーエン台詞（ここで上書き！） ---
DATA.OWEN_QUOTES = {
    INN_DEFEAT: ["……琥珀の中に閉じ込めてあげようか？", "……森の肥やしになるつもり？"],
    HEAL_POISON: ["……樹脂がこびりついてる。汚いな。ほら。"],
    INSTANT_KILL: ["……固まれ", "……そのままでいろ"], // 1章らしい倒し方
    FREEZE: ["……凍れよ"],
    KILL_STEAL: ["……掃除完了", "……邪魔なノイズだ"] // 敵を倒した時
};

DATA.STORY_DATA.CHAPTER_1 = {
    title: "第一章：街道と森",
    goal_coins: 3,
    MSG: {
        NEED_COIN: "店主「悪いが部屋は埋まっているよ。銀貨3枚、よろしくな」",
        REPORT_THANKS: "店主「ありがとう！……そういえばさっき、森の方へ不気味な荷馬車が……」",
        HEAL_SWEETS: "甘味を食べた。オーエンの瞳にわずかな静謐が宿る。"
    },
    enemies_day: [
        { name: "琥珀ネズミ", hp: 15, atk: 8, exp: 10, coin: 0.7, poison: 0, type: "normal" },
        { name: "琥珀樹の幼体", hp: 40, atk: 10, exp: 25, coin: 0.1, poison: 0.25, type: "normal" }
    ],
    enemies_night: [
        { name: "樹脂まとい", hp: 70, atk: 15, exp: 40, coin: 0.2, poison: 0, type: "normal" },
        { name: "森迷いの影", hp: 30, atk: 10, exp: 150, coin: 0.5, poison: 0, type: "rare" }
    ],
    boss: { name: "琥珀の守護獣", hp: 200, atk: 25, exp: 500, coin: 0, poison: 0 },
    
    EVENTS: {
        2: [{ name: "カイン", text: "「荷馬車が立ち往生している……警護を引き受けよう」", delay: 800 }],
        4: [{ name: "オーエン", text: "「ねえ、まだ歩くの？ 影が伸びてきて不気味なんだけど」", delay: 1000 }],
        8: [{ name: "オーエン", text: "「……ふーん。何か『嫌なもの』が近づいてきてるね」", delay: 1200 }]
    }
};

DATA.SCENARIO.INTRO = [
    { name: "店主", text: "「銀貨3枚、持ってきてくれ。……でないと今夜の寝床はないよ」", delay: 1200 }
];

DATA.SCENARIO.CLEAR_CH1 = [
    { name: "カイン", text: "「……荷馬車は守り切った。これで一安心だな」", delay: 1000 },
    { name: "システム", text: "【第一章：街道と森 クリア】", delay: 1500 }
];
