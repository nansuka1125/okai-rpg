const DATA = {
    // オーエンのセリフ集
    OWEN_QUOTES: {
        BATTLE_END_ZAKO: ["雑魚すぎ"],
        BATTLE_END_BOSS: ["僕の獲物だ"],
        BATTLE_ASSIST: ["……目障りだ", "……消えろ"],
        INN_BAD: ["かっこ悪いよ", "騎士様サボりすぎじゃない？"],
        INN_EAT_SWEETS: ["これ、全部僕がもらうから", "あーあ、むしゃくしゃする。……これ、食べるね"],
        INN_NORMAL: ["……ふん", "……少しはマシな動きだったんじゃない？"],
        INN_DEFEAT: ["……ちっ", "次は置いていくからな"],
        GIVE_ITEM: ["……これいらない", "塵になる前に拾えたのは幸運だね"],
        KEEP_ITEM: ["何見てるの？ あげないよ"]
    },

    // アイテムデータ
    ITEMS: {
        herb: { name: "薬草", desc: "HPを30回復する" },
        sweets: { name: "甘味", desc: "オーエンの好物（MP回復予定）" },
        coin: { name: "古い銀貨", desc: "第1章の目的アイテム" },
        fragment: { name: "魔力の欠片", desc: "第2章の目的アイテム" }
    },

    // ランダムイベント
    RANDOM_EVENTS: [
        {
            text: "古い石碑を見つけた。カインは失われた剣技のヒントを得た。",
            effect: (st) => { st.exp += 15; return "経験値を獲得。"; }
        },
        {
            text: "オーエンが道端の花を無造作に踏みにじった。空気が凍りつく。",
            effect: (st) => { return "何も起きなかった。"; }
        },
        {
            text: "カインの足元に薬草が生えていた。運良く手に入れた。",
            effect: (st) => { st.herb += 1; return "薬草を入手！"; }
        },
        {
            text: "急な雨に見舞われた。体力を消耗したが、少し感覚が研ぎ澄まされた。",
            effect: (st) => { st.c_h = Math.max(10, st.c_h - 10); st.exp += 5; return "HP減少、微量の経験値獲得。"; }
        }
    ]
};
l