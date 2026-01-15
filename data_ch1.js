DATA.MOVE_LOGS = ["琥珀の木漏れ日の中を黙々と歩く。"];

DATA.STORY_DATA.CHAPTER_1 = {
    title: "第一章：街道と森",
    base_name: "宿屋",
    goal_name: "森の深部",
    goal_coins: 3,
    MSG: {
        NEED_COIN: "店主「銀貨3枚、よろしくな」",
        REPORT_THANKS: "店主「ありがとう！…そういえば森に不気味な荷馬車がいたよ」",
        GO_FOREST: "カイン「……森へ行こう」"
    },
    enemies_day: [
        { name: "琥珀ネズミ", hp: 15, atk: 8, exp: 10, coin: 0, poison: 0 },
        { name: "琥珀樹の幼体", hp: 40, atk: 10, exp: 25, coin: 0, poison: 0.25 }
    ],
    enemies_night: [
        { name: "樹脂まとい", hp: 70, atk: 15, exp: 40, coin: 0, poison: 0 }
    ],
    boss: { name: "琥珀の守護獣", hp: 200, atk: 25, exp: 500, coin: 0, poison: 0 }
};

DATA.SCENARIO.INTRO = [{ name: "店主", text: "「銀貨3枚、持ってきてくれ」", delay: 1000 }];

// 夜の会話イベント（progressの状態によって出し分けます）
DATA.SCENARIO.WAGON_TALK = [
    { name: "荷馬車", text: "「夜の警護をしてくれるなら乗せてあげよう」", delay: 800 }
];

DATA.SCENARIO.NIGHT_WALK = {
    4: [
        { name: "カイン", text: "「列車がある」", delay: 800 },
        { name: "オーエン", text: "「甘いものはある？」", delay: 800 }
    ],
    6: [
        { name: "カイン", text: "「次の街から乗ろう的なテスト会話」", delay: 800 },
        { name: "オーエン", text: "「じゃあそこまで荷馬車で行くの？」", delay: 800 }
    ],
    8: [
        { name: "カイン", text: "「途中からは…徒歩だ」", delay: 800 },
        { name: "オーエン", text: "「この馬最後に盗んで行こう」", delay: 800 }
    ],
    9: [
        { name: "ナレーション", text: "《2人は沈黙。夜の静かな森に異様な気配》", delay: 1000 },
        { name: "カイン", text: "（……剣に手をかける）", delay: 800 }
    ]
};
