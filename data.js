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
        KEEP_ITEM: ["何見てるの？ あげないよ"]
    },

    // 宿屋の銀貨不足時イベント
    INN_SHORTAGE_EVENTS: [
        {
            text: "店主「頼むから早く銀貨を持ってきてくれ……店が潰れてしまう……」<br><span class='log-owen'>オーエン「僕が肩代わりしてあげてもいいけど……条件があるよ？（ニヤリ）」</span>"
        },
        {
            text: "店主「……すまんが部屋は用意できん。馬小屋なら空いているが」<br>カイン「大丈夫だ、馬は好きだ。……暖かいしな」<br><span class='log-owen'>オーエン「……（絶句）」</span>"
        },
        {
            text: "宿屋の娘「あの……カイン様、私の部屋でよければお泊まりになりますか？」<br>カイン「えっ？」<br><span style='color:#ff7675; font-size:11px;'>※泊まるとオーエンの不興を買うかもしれない……</span>"
        }
    ],

    ITEMS: {
        herb: { name: "薬草", desc: "HPを30回復" },
        sweets: { name: "甘味", desc: "HPを40回復（オーエンの好物）" },
        coin: { name: "古い銀貨", desc: "第1章の目的アイテム" },
        fragment: { name: "魔力の欠片", desc: "第2章の目的アイテム" }
    },

    STAGE1_EVENTS: [
        { id: "gaze", dist_range: [6, 10], weight: 10, text: "オーエンの視線を感じる。……監視されているようだ。", effect: (st) => "（効果なし）" },
        { id: "leave", dist_range: [6, 10], weight: 3, text: "オーエンがいなくなった。……勝手な奴だ。まあいい、すぐ戻るだろう。", effect: (st) => { st.owenAbsent = 3; return "3ターンの間、オーエンが戦闘に介入しなくなる。"; } },
        { id: "fall", dist_range: [6, 10], weight: 8, text: "カインが蹴つまずいた。膝を擦りむいたようだ。", effect: (st) => { st.c_h = Math.max(1, st.c_h - 2); return "HPが2減少した。"; } },
        { id: "sing", dist_range: [0, 5], weight: 10, text: "カインは歌を歌った。結構響いたが、オーエンに冷ややかな目で見られた。", effect: (st) => "（効果なし）" },
        { id: "chest", dist_range: [0, 5], weight: 5, text: "古びた宝箱を見つけた！", effect: (st) => {
            const roll = Math.random();
            if (roll < 0.3) { st.tInv++; return "【成功】銀貨を獲得！"; }
            else if (roll < 0.6) { st.forceBattle = true; return "【ミミック】即座に戦闘開始！"; }
            else { return "【略奪】中身は空。<span class='log-owen'>オーエンが指先で銀貨を弄んでいる……。</span>"; }
        }},
        { id: "herbs", dist_range: [0, 5], weight: 5, text: "薬草の群生地を見つけた！", effect: (st) => {
            if (Math.random() < 0.5) { st.herb += 3; return "薬草を3つ入手！"; }
            else { st.herb += 1; return "オーエンが群生地を燃やした！薬草を1つしか回収できなかった……"; }
        }},
        { id: "smile", dist_range: [0, 5], weight: 10, text: "オーエンはにやにやしている。……何か不吉なことでも考えているのか？", effect: (st) => "（効果なし）" }
    ]
};
