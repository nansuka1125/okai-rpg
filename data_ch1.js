// 第1章専用のデータを追加
DATA.MOVE_LOGS = ["琥珀の木漏れ日の中を黙々と歩く。"];

DATA.OWEN_QUOTES = {
    INN_DEFEAT: ["……琥珀の中に閉じ込めてあげようか？"],
    HEAL_POISON: ["……汚いな。ほら。"],
    INSTANT_KILL: ["……固まれ"],
    KILL_STEAL: ["……掃除完了"]
};

DATA.STORY_DATA.CHAPTER_1 = {
    title: "第一章：街道と森",
    base_name: "宿屋",
    goal_name: "森の深部",
    goal_coins: 3,
    MSG: {
        NEED_COIN: "店主「悪いが部屋は埋まっているよ。銀貨3枚、よろしくな」",
        REPORT_THANKS: "店主「ありがとう！……そういえばさっき、森の方へ不気味な荷馬車が……」",
        HEAL_SWEETS: "甘味を食べた。オーエンの瞳にわずかな静謐が宿る。"
    },
    enemies_day: [
        { name: "琥珀ネズミ", hp: 15, atk: 8, exp: 10, coin: 1, poison: 0 },
        { name: "琥珀樹の幼体", hp: 40, atk: 10, exp: 25, coin: 1, poison: 0.25 }
    ],
    boss: { name: "琥珀の守護獣", hp: 200, atk: 25, exp: 500, coin: 0, poison: 0 },
    EVENTS: {
        2: [{ name: "カイン", text: "「荷馬車が立ち往生している……警護を引き受けよう」", delay: 800 }]
    }
};

DATA.SCENARIO.INTRO = [{ name: "店主", text: "「銀貨3枚、持ってきてくれ。……でないと今夜の寝床はないよ」", delay: 1000 }];
DATA.SCENARIO.CLEAR_CH1 = [{ name: "システム", text: "【第一章：街道と森 クリア】", delay: 1000 }];
