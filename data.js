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

    ITEMS: {
        herb: { name: "薬草", desc: "HPを30回復" },
        sweets: { name: "甘味", desc: "HPを40回復（オーエンの好物）" },
        coin: { name: "古い銀貨", desc: "第1章の目的アイテム" },
        fragment: { name: "魔力の欠片", desc: "第2章の目的アイテム" }
    },

    // ステージ1専用・距離連動イベント
    STAGE1_EVENTS: [
        // 前半（10-6km）
        { id: "gaze", dist_range: [6, 10], weight: 10, text: "オーエンの視線を感じる。……監視されているようだ。", effect: (st) => "（効果なし）" },
        { id: "collect", dist_range: [6, 10], weight: 5, text: "落ちていた魔物の死骸から素材を回収した。", effect: (st) => { st.tInv++; return "戦利品を1つ入手。"; } },
        { id: "leave", dist_range: [6, 10], weight: 3, text: "オーエンがいなくなった。……勝手な奴だ。まあいい、すぐ戻るだろう。", effect: (st) => { st.owenAbsent = 3; return "3ターンの間、オーエンが戦闘に介入しなくなる。"; } },
        { id: "fall", dist_range: [6, 10], weight: 8, text: "カインが蹴つまずいた。膝を擦りむいたようだ。", effect: (st) => { st.c_h = Math.max(1, st.c_h - 2); return "HPが2減少した。"; } },
        { id: "wet", dist_range: [6, 10], weight: 5, text: "カインのマントが濡れて重くなった。体力が奪われる……", effect: (st) => { st.c_mh -= 5; st.c_h = Math.min(st.c_h, st.c_mh); return "最大HPが5減少した。"; } },
        { id: "smell", dist_range: [6, 10], weight: 5, text: "どこからかいい匂いがする。宿の夕飯を思い出し、少しだけ気力が湧いた。", effect: (st) => { st.c_m = Math.min(st.c_mm, st.c_m + 5); return "MPが5回復した。"; } },

        // 後半（5-0km）
        { id: "sing", dist_range: [0, 5], weight: 10, text: "カインは歌を歌った。結構響いたが、オーエンに冷ややかな目で見られた。", effect: (st) => "（効果なし）" },
        { id: "corpse", dist_range: [0, 5], weight: 8, text: "新鮮な死骸が落ちている。……先客がいるのかもしれない。", effect: (st) => { st.encountUp = true; return "次の移動時、戦闘確率が上昇。"; } },
        { id: "chest", dist_range: [0, 5], weight: 5, text: "古びた宝箱を見つけた！", effect: (st) => {
            const roll = Math.random();
            if (roll < 0.3) { st.tInv++; return "【成功】銀貨を獲得！"; }
            else if (roll < 0.6) { st.forceBattle = true; return "【ミミック】即座に戦闘開始！"; }
            else { return "【略奪】中身は空。オーエン『……中身？ さあ、なんのことかな』。彼は何かを隠した。"; }
        }},
        { id: "herbs", dist_range: [0, 5], weight: 5, text: "薬草の群生地を見つけた！", effect: (st) => {
            if (Math.random() < 0.5) { st.herb += 3; return "薬草を3つ入手！"; }
            else { st.herb += 1; return "オーエンが群生地を燃やした！薬草を1つしか回収できなかった……"; }
        }},
        { id: "avert", dist_range: [0, 5], weight: 10, text: "強烈な視線を感じて振り返ると、オーエンにパッと目を逸らされた。", effect: (st) => "（効果なし）" },
        { id: "bad_air", dist_range: [0, 5], weight: 8, text: "嫌な気配を感じる。空気が重く、肌がひりつく。", effect: (st) => { st.def -= 1; return "カインの防御力が1減少した。"; } },
        { id: "smile", dist_range: [0, 5], weight: 10, text: "オーエンはにやにやしている。……何か不吉なことでも考えているのか？", effect: (st) => "（効果なし）" }
    ]
};
