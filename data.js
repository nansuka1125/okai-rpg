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
        { name: "琥珀に封じられた骸", hp: 50, atk: 15, exp: 60, poison: 0, coin: 0.05, type: "story" },
        { name: "銀貨を隠し持つ小鬼", hp: 30, atk: 5, exp: 100, poison: 0, coin: 1.0, type: "bonus" }
    ],
    // 移動時の情景描写
    MOVE_LOGS: [
        "琥珀の木漏れ日の中を黙々と歩く。",
        "背後からオーエンの冷たい視線を感じながら進む。",
        "時折、森の奥で何かが爆ぜるような音が響く。",
        "粘つく樹脂を踏みしめ、カインは先を急ぐ。",
        "オーエンは欠伸をしながら、退屈そうにトランクを叩いている。"
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
    }
};
