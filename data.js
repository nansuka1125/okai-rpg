const DATA = {
    OWEN_QUOTES: {
        BATTLE_END_ZAKO: ["雑魚すぎ"],
        BATTLE_END_BOSS: ["僕の獲物だ"],
        BATTLE_ASSIST: ["……目障りだ", "……消えろ"],
        INN_BAD: ["かっこ悪いよ", "騎士様サボりすぎじゃない？"],
        INN_EAT_SWEETS: ["これ、全部僕がもらうから", "あーあ、むしゃくしゃする。……これ、食べるね"],
        INN_NORMAL: ["……ふん", "……少しはマシな動きだったんじゃない？"],
        INN_DEFEAT: ["……ちっ", "次は置いていくからな"],
        GIVE_ITEM: ["……これいらない", "塵になる前に拾えたのは幸運だね"],
        KEEP_ITEM: ["何見てるの？ あげないよ"],
        FREEZE: ["「……凍れよ」"]
    },
    ENEMIES: [
        { name: "琥珀ネズミ", hp: 15, atk: 8, exp: 10, poison: 0, coin: 0.7, type: "normal" },
        { name: "樹脂まとい", hp: 70, atk: 12, exp: 35, poison: 0, coin: 0.1, type: "hard" },
        { name: "森迷いの影", hp: 20, atk: 5, exp: 150, poison: 0, coin: 0.3, type: "rare" },
        { name: "琥珀樹の幼体", hp: 40, atk: 10, exp: 25, poison: 0.25, coin: 0.1, type: "poison" },
        { name: "琥珀に封じられた骸", hp: 50, atk: 15, exp: 60, poison: 0, coin: 0.05, type: "story" }
    ],
    INN_SHORTAGE_EVENTS: [
        { text: "店主「頼むから早く銀貨を持ってきてくれ……店が潰れてしまう……」<br><span class='log-owen'>オーエン「僕が肩代わりしてあげてもいいけど……条件があるよ？（ニヤリ）」</span>" },
        { text: "店主「……すまんが部屋は用意できん。馬小屋なら空いているが」<br>カイン「大丈夫だ、馬は好きだ。……暖かいしな」<br><span class='log-owen'>オーエン「……（絶句）」</span>" },
        { text: "宿屋の娘「あの……カイン様、私の部屋でよければお泊まりになりますか？」<br>カイン「えっ？」<br><span style='color:#ff7675; font-size:11px;'>※泊まるとオーエンの不興を買うかもしれない……</span>" }
    ],
    ITEMS: {
        herb: { name: "薬草", desc: "HP30回復・毒解除" },
        sweets: { name: "甘味", desc: "HP40回復・毒解除" },
        coin: { name: "古い銀貨" }
    },
    STAGE1_EVENTS: [
        { id: "gaze", dist_range: [6, 10], weight: 10, text: "オーエンの視線を感じる。……監視されているようだ。", effect: (s) => "（効果なし）" },
        { id: "leave", dist_range: [6, 10], weight: 3, text: "オーエンがいなくなった。……勝手な奴だ。", effect: (s) => { s.owenAbsent = 3; return "3ターンの間、オーエンが戦闘に介入しない。"; } }
    ]
};
