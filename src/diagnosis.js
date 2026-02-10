/* ============================================
   Mentai Personality Diagnosis - Game Logic
   ============================================ */

(function () {
    'use strict';

    // --- SESSION ---
    const SESSION_ID = crypto.randomUUID();

    // --- GAS ENDPOINT ---
    // Google Apps Scriptのウェブアプリ公開URL
    const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxKYn28QVSv68PqsdCs85naARO-BXiR9VeiI5h1Caj4_5YmIOITjurH2HfRC3uQcu-qOg/exec';

    // --- QUESTION DATA ---
    // 4軸 × 3問 = 12問
    // 各問に 4つの選択肢: A寄り2つ + B寄り2つ
    const QUESTIONS = [
        // === 軸1: 勇気 ↔ 熟考 (brave) ===
        {
            id: 'brave1',
            axis: 'brave',
            axisLabel: '行動スタイル',
            text: '新しいことに取り組むとき、あなたはどうしますか？',
            options: [
                { label: 'とりあえずやってみる', side: 'A' },
                { label: '様子を見ながら、わりと早く動く', side: 'A' },
                { label: 'まず情報を集めてから動く', side: 'B' },
                { label: '十分に調べてから慎重に始める', side: 'B' }
            ]
        },
        {
            id: 'brave2',
            axis: 'brave',
            axisLabel: '行動スタイル',
            text: '計画を立てるとき、どのくらい細かく決めますか？',
            options: [
                { label: '大まかな方向だけ決めて動き出す', side: 'A' },
                { label: '重要な点だけ押さえて進める', side: 'A' },
                { label: 'ある程度の詳細まで決めておく', side: 'B' },
                { label: '細部までしっかり詰めてから動く', side: 'B' }
            ]
        },
        {
            id: 'brave3',
            axis: 'brave',
            axisLabel: '行動スタイル',
            text: '難しい課題に直面したとき、最初にどうしますか？',
            options: [
                { label: 'まず手を動かして試してみる', side: 'A' },
                { label: '試しながら方向性を定める', side: 'A' },
                { label: '原因を整理してから動く', side: 'B' },
                { label: '解決策をしっかり練ってから動く', side: 'B' }
            ]
        },

        // === 軸2: 共感 ↔ 独立 (empathy) ===
        {
            id: 'empathy1',
            axis: 'empathy',
            axisLabel: 'チームワーク',
            text: '困っている人を見かけたとき、あなたはどうしますか？',
            options: [
                { label: 'すぐに声をかけて助けたい', side: 'A' },
                { label: '必要そうなら自然に関わる', side: 'A' },
                { label: '距離感を見ながら接する', side: 'B' },
                { label: '基本的に見守る', side: 'B' }
            ]
        },
        {
            id: 'empathy2',
            axis: 'empathy',
            axisLabel: 'チームワーク',
            text: 'チームで動くとき、あなたのスタイルは？',
            options: [
                { label: '協調を大事にして全体を見る', side: 'A' },
                { label: '状況に応じてメンバーを支える', side: 'A' },
                { label: '自分の得意分野で貢献する', side: 'B' },
                { label: '自分のペースで成果を出す', side: 'B' }
            ]
        },
        {
            id: 'empathy3',
            axis: 'empathy',
            axisLabel: 'チームワーク',
            text: '意見がぶつかったとき、どう対応しますか？',
            options: [
                { label: '両方の立場を尊重して折り合う', side: 'A' },
                { label: 'まず相手の話をしっかり聞く', side: 'A' },
                { label: '論理的に自分の意見を伝える', side: 'B' },
                { label: '自分の意見を優先して進める', side: 'B' }
            ]
        },

        // === 軸3: 創造 ↔ 実装 (create) ===
        {
            id: 'create1',
            axis: 'create',
            axisLabel: '発想スタイル',
            text: '仕事で一番楽しい瞬間は？',
            options: [
                { label: '新しいアイデアを思いついた時', side: 'A' },
                { label: 'まだ誰もやっていないことを考える時', side: 'A' },
                { label: '計画通りに物事が進んだ時', side: 'B' },
                { label: '完成形が目に見えた時', side: 'B' }
            ]
        },
        {
            id: 'create2',
            axis: 'create',
            axisLabel: '発想スタイル',
            text: 'あなたの考え方の特徴は？',
            options: [
                { label: '直感やひらめきを大切にする', side: 'A' },
                { label: '感覚的にまず全体像をつかむ', side: 'A' },
                { label: 'データや根拠を重視する', side: 'B' },
                { label: '実績ある方法を着実に使う', side: 'B' }
            ]
        },
        {
            id: 'create3',
            axis: 'create',
            axisLabel: '発想スタイル',
            text: '問題解決のアプローチは？',
            options: [
                { label: '既存の枠にとらわれず新しい方法を探す', side: 'A' },
                { label: '複数のアイデアを組み合わせてみる', side: 'A' },
                { label: '過去の成功例を参考にする', side: 'B' },
                { label: '確実な方法で一つずつ解決する', side: 'B' }
            ]
        },

        // === 軸4: 変化 ↔ 安定 (stable) ===
        {
            id: 'stable1',
            axis: 'stable',
            axisLabel: '環境適応',
            text: '同じ場所で長く働き続けることについてどう思いますか？',
            options: [
                { label: '新しい刺激が欲しくなる', side: 'A' },
                { label: 'ある程度で環境を変えたくなる', side: 'A' },
                { label: '慣れた環境は居心地が良い', side: 'B' },
                { label: '安定した環境が一番落ち着く', side: 'B' }
            ]
        },
        {
            id: 'stable2',
            axis: 'stable',
            axisLabel: '環境適応',
            text: '新しい環境に行くとき、どう感じますか？',
            options: [
                { label: 'ワクワクして楽しみ', side: 'A' },
                { label: '新しい出会いに期待する', side: 'A' },
                { label: '少し不安だが対応できる', side: 'B' },
                { label: '緊張するが頑張りたい', side: 'B' }
            ]
        },
        {
            id: 'stable3',
            axis: 'stable',
            axisLabel: '環境適応',
            text: '働く上で最も重視するのは？',
            options: [
                { label: '刺激と成長の機会', side: 'A' },
                { label: 'チャレンジできる環境', side: 'A' },
                { label: '安定した働き方', side: 'B' },
                { label: '安心感と信頼できる仲間', side: 'B' }
            ]
        }
    ];

    // --- 16 TYPES DATA ---
    const TYPES = {
        // brave=A(勇気), empathy=A(共感), create=A(創造), stable=A(変化)
        'AAAA': {
            num: 1, id: 'archmage', name: 'アーキメイジ', nameEn: 'Archmage',
            icon: '🧙‍♂️',
            quote: '「未踏の地を切り拓き、仲間と共に新たな時代を創る」',
            desc: '行動力と創造力を兼ね備え、チームの先頭に立って未知の領域へ飛び込む冒険者。共感力で仲間をまとめ、変化を恐れず前に進むリーダータイプ。スタートアップ、企画、プロデューサーなどの職種で力を発揮します。',
            strengths: ['圧倒的な行動力と決断力', 'チームを巻き込む推進力', '変化を楽しみチャンスに変える力'],
            axes: { brave: '勇気', empathy: '共感', create: '創造', stable: '変化' },
            compatible: [{ name: 'ヒーラー', icon: '💚' }, { name: 'プランナー', icon: '📋' }, { name: 'ガーディアン', icon: '🛡️' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-1'
        },
        'AABA': {
            num: 2, id: 'shaman', name: 'シャーマン', nameEn: 'Shaman',
            icon: '🔮',
            quote: '「人の想いを紡ぎ、安定の中で新たな価値を生み出す」',
            desc: '行動的でありながら安定感を持ち、人の気持ちに寄り添いながら創造的な仕事をするタイプ。直感とコミュニケーション力で、チームに安心感と新しい風をもたらします。人事、カウンセラー、教育系の職種に適性があります。',
            strengths: ['人の心を読む直感力', '安定した環境で創造力を発揮', '信頼されるコミュニケーション力'],
            axes: { brave: '勇気', empathy: '共感', create: '創造', stable: '安定' },
            compatible: [{ name: 'ウォリアー', icon: '⚔️' }, { name: 'セージ', icon: '📖' }, { name: 'リフォーマー', icon: '🔧' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-2'
        },
        'ABAA': {
            num: 3, id: 'crafter', name: 'クラフター', nameEn: 'Crafter',
            icon: '⚒️',
            quote: '「仲間と共に、変化の中で確かなものを作り上げる」',
            desc: '行動力と実行力を武器に、チームワークを大切にしながら成果を形にするタイプ。変化に強く、新しい環境でも着実に結果を出します。エンジニア、施工管理、プロジェクトマネージャーに向いています。',
            strengths: ['実行力とスピード感', 'チームでの協調性', '変化に柔軟に適応する力'],
            axes: { brave: '勇気', empathy: '共感', create: '実装', stable: '変化' },
            compatible: [{ name: 'ストラテジスト', icon: '🎯' }, { name: 'アーティスト', icon: '🎨' }, { name: 'イノベーター', icon: '💡' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-3'
        },
        'ABBA': {
            num: 4, id: 'paladin', name: 'パラディン', nameEn: 'Paladin',
            icon: '🏅',
            quote: '「正道を歩み、信念と優しさでチームを守る」',
            desc: '行動力と共感力を持ちながら、実直で安定志向。チームの安全網として皆を支え、確実に物事を前に進めます。管理職、公務員、品質管理、カスタマーサクセスなどで力を発揮します。',
            strengths: ['揺るがない信頼性', '困っている人を放っておけない優しさ', '着実に成果を積み上げる力'],
            axes: { brave: '勇気', empathy: '共感', create: '実装', stable: '安定' },
            compatible: [{ name: 'メイジ', icon: '✨' }, { name: 'ストーリーテラー', icon: '📚' }, { name: 'リフォーマー', icon: '🔧' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-4'
        },
        'BAAA': {
            num: 5, id: 'mage', name: 'メイジ', nameEn: 'Mage',
            icon: '✨',
            quote: '「独自の発想と行動で、まだ見ぬ世界を創り出す」',
            desc: '独立心が強く、創造的な行動派。自分の直感を信じて新しいことに挑戦し、周囲を驚かせるイノベーションを生み出します。起業家、クリエイティブディレクター、研究開発に向いています。',
            strengths: ['独創的な発想力', '思い立ったら即行動する推進力', '変化の中で輝く適応力'],
            axes: { brave: '勇気', empathy: '独立', create: '創造', stable: '変化' },
            compatible: [{ name: 'パラディン', icon: '🏅' }, { name: 'モンク', icon: '🧘' }, { name: 'ヒーラー', icon: '💚' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-5'
        },
        'BABA': {
            num: 6, id: 'strategist', name: 'ストラテジスト', nameEn: 'Strategist',
            icon: '🎯',
            quote: '「先を見通し、独自の戦略で安定した成功を設計する」',
            desc: '行動力と独立心を持ちつつ、創造的な発想を安定した形に落とし込む戦略家。長期的なビジョンを持ち、独自のアプローチで確実に目標を達成します。コンサルタント、事業企画、マーケティング戦略に適性があります。',
            strengths: ['長期ビジョンの設計力', '独自の視点からの戦略立案', 'クリエイティブかつ現実的な判断力'],
            axes: { brave: '勇気', empathy: '独立', create: '創造', stable: '安定' },
            compatible: [{ name: 'クラフター', icon: '⚒️' }, { name: 'ヒーラー', icon: '💚' }, { name: 'アーティスト', icon: '🎨' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-6'
        },
        'BBAA': {
            num: 7, id: 'warrior', name: 'ウォリアー', nameEn: 'Warrior',
            icon: '⚔️',
            quote: '「自らの力で道を切り拓き、変化を味方につける」',
            desc: '独立して行動し、実行力で結果を出し続ける実践派。変化を恐れず、新しいフィールドで自分の実力を試したいタイプ。営業、フリーランス、スポーツ関連、現場リーダーで力を発揮します。',
            strengths: ['一人でも戦える行動力', '結果にコミットする実行力', '逆境に強いメンタル'],
            axes: { brave: '勇気', empathy: '独立', create: '実装', stable: '変化' },
            compatible: [{ name: 'シャーマン', icon: '🔮' }, { name: 'アーキメイジ', icon: '🧙‍♂️' }, { name: 'プランナー', icon: '📋' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-7'
        },
        'BBBA': {
            num: 8, id: 'guardian', name: 'ガーディアン', nameEn: 'Guardian',
            icon: '🛡️',
            quote: '「確かな実力で、揺るがない基盤を築く」',
            desc: '独立心と実行力、そして安定志向を併せ持つ守護者タイプ。自分の専門領域を深く掘り下げ、確実な成果で周囲からの信頼を勝ち取ります。経理、法務、セキュリティ、インフラエンジニアに適性があります。',
            strengths: ['専門性の高さと正確さ', '一人で完結できる実行力', 'ブレない安定感'],
            axes: { brave: '勇気', empathy: '独立', create: '実装', stable: '安定' },
            compatible: [{ name: 'アーキメイジ', icon: '🧙‍♂️' }, { name: 'ストーリーテラー', icon: '📚' }, { name: 'イノベーター', icon: '💡' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-8'
        },
        'AAAB': {
            num: 9, id: 'storyteller', name: 'ストーリーテラー', nameEn: 'Storyteller',
            icon: '📚',
            quote: '「深い洞察と共感で、物語を通じて人の心を動かす」',
            desc: '熟考型でありながら共感力と創造性が高く、変化を受け入れるタイプ。深い観察力と表現力で、人の心に響くストーリーを紡ぎ出します。ライター、UXデザイナー、広報、マーケティングに向いています。',
            strengths: ['人の心を動かす表現力', '深い洞察力と共感力', '変化をストーリーに変える力'],
            axes: { brave: '熟考', empathy: '共感', create: '創造', stable: '変化' },
            compatible: [{ name: 'ガーディアン', icon: '🛡️' }, { name: 'パラディン', icon: '🏅' }, { name: 'ウォリアー', icon: '⚔️' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-9'
        },
        'AABB': {
            num: 10, id: 'artist', name: 'アーティスト', nameEn: 'Artist',
            icon: '🎨',
            quote: '「じっくりと観察し、安定の中で美と調和を追求する」',
            desc: '熟考派で共感力が高く、創造力を安定した環境で発揮するタイプ。繊細な感性と丁寧なアプローチで、高品質なアウトプットを生み出します。デザイナー、編集者、研究者、品質管理に適性があります。',
            strengths: ['繊細な美的感覚', '丁寧で高品質な仕事', '人の気持ちに寄り添う共感力'],
            axes: { brave: '熟考', empathy: '共感', create: '創造', stable: '安定' },
            compatible: [{ name: 'クラフター', icon: '⚒️' }, { name: 'ストラテジスト', icon: '🎯' }, { name: 'メイジ', icon: '✨' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-10'
        },
        'ABAB': {
            num: 11, id: 'healer', name: 'ヒーラー', nameEn: 'Healer',
            icon: '💚',
            quote: '「穏やかな力で、変化の中にいる人々を支え癒す」',
            desc: '熟考型で共感力が高く、実践的なサポートで人を支えるタイプ。変化の中でも冷静に状況を見極め、必要な支援を的確に提供します。看護師、社会福祉士、HR、カスタマーサポートに向いています。',
            strengths: ['人を癒す穏やかさ', '冷静な状況判断力', '実践的なサポート力'],
            axes: { brave: '熟考', empathy: '共感', create: '実装', stable: '変化' },
            compatible: [{ name: 'アーキメイジ', icon: '🧙‍♂️' }, { name: 'メイジ', icon: '✨' }, { name: 'ストラテジスト', icon: '🎯' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-11'
        },
        'ABBB': {
            num: 12, id: 'monk', name: 'モンク', nameEn: 'Monk',
            icon: '🧘',
            quote: '「静かなる信念と思いやりで、安定の礎を築く」',
            desc: '熟考型で共感力を持ち、実直に安定した成果を出す職人タイプ。コツコツと積み上げる力と、人への思いやりでチームの土台を支えます。事務、経理、医療事務、図書館司書など、正確性と安定性が求められる職種に最適。',
            strengths: ['コツコツ積み上げる忍耐力', '正確で丁寧な作業', 'チームの安定を支える存在感'],
            axes: { brave: '熟考', empathy: '共感', create: '実装', stable: '安定' },
            compatible: [{ name: 'メイジ', icon: '✨' }, { name: 'ウォリアー', icon: '⚔️' }, { name: 'イノベーター', icon: '💡' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-12'
        },
        'BAAB': {
            num: 13, id: 'innovator', name: 'イノベーター', nameEn: 'Innovator',
            icon: '💡',
            quote: '「深い分析と独自の視点で、時代を変える発明を生む」',
            desc: '熟考型で独立心が強く、創造力と変化への適応力を持つタイプ。一人で深く考え、独自の視点から革新的なソリューションを生み出します。研究者、データサイエンティスト、プロダクトマネージャーに最適。',
            strengths: ['深い分析力と洞察力', '独自の視点からの革新', '変化を糧にする成長力'],
            axes: { brave: '熟考', empathy: '独立', create: '創造', stable: '変化' },
            compatible: [{ name: 'ガーディアン', icon: '🛡️' }, { name: 'モンク', icon: '🧘' }, { name: 'クラフター', icon: '⚒️' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-13'
        },
        'BABB': {
            num: 14, id: 'planner', name: 'プランナー', nameEn: 'Planner',
            icon: '📋',
            quote: '「緻密な計画と独創性で、安定した成功の道筋を描く」',
            desc: '熟考型で独立心があり、創造的な発想を安定した計画に落とし込むタイプ。綿密な分析と独自のアイデアで、着実に目標に向かいます。プロジェクトマネージャー、建築家、システムアーキテクトに適性があります。',
            strengths: ['緻密な計画立案力', '独創的かつ現実的な発想', '計画を確実に遂行する実行力'],
            axes: { brave: '熟考', empathy: '独立', create: '創造', stable: '安定' },
            compatible: [{ name: 'ウォリアー', icon: '⚔️' }, { name: 'アーキメイジ', icon: '🧙‍♂️' }, { name: 'ヒーラー', icon: '💚' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-14'
        },
        'BBAB': {
            num: 15, id: 'reformer', name: 'リフォーマー', nameEn: 'Reformer',
            icon: '🔧',
            quote: '「現場の問題を見抜き、実行力で改革を成し遂げる」',
            desc: '熟考型で独立心があり、実践的なアプローチで変化を推進するタイプ。問題点を冷静に分析し、独自の方法で改善を推し進めます。コンサルタント、業務改善、品質管理、テクニカルリーダーに向いています。',
            strengths: ['問題の本質を見抜く力', '独自の改善アプローチ', '変化を恐れない実行力'],
            axes: { brave: '熟考', empathy: '独立', create: '実装', stable: '変化' },
            compatible: [{ name: 'シャーマン', icon: '🔮' }, { name: 'パラディン', icon: '🏅' }, { name: 'アーティスト', icon: '🎨' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-15'
        },
        'BBBB': {
            num: 16, id: 'sage', name: 'セージ', nameEn: 'Sage',
            icon: '📖',
            quote: '「深い知識と揺るがぬ信念で、真実を追い求める」',
            desc: '熟考型で独立心が強く、実直に安定した環境で専門性を極めるタイプ。深い知識と分析力を武器に、確実で精度の高い成果を生み出します。研究者、アナリスト、エンジニア、専門職に最適です。',
            strengths: ['深い専門知識と分析力', '一人で完結する集中力', '揺るがない信頼性と正確性'],
            axes: { brave: '熟考', empathy: '独立', create: '実装', stable: '安定' },
            compatible: [{ name: 'シャーマン', icon: '🔮' }, { name: 'アーキメイジ', icon: '🧙‍♂️' }, { name: 'ストーリーテラー', icon: '📚' }],
            resultUrl: 'https://careerjob.mentailab.com/characters-16'
        }
    };

    // --- AXIS ICONS ---
    const AXIS_ICONS = {
        '勇気': '⚡', '熟考': '🔍',
        '共感': '💛', '独立': '🦅',
        '創造': '🌟', '実装': '🔨',
        '変化': '🌊', '安定': '🏔️'
    };

    // --- STATE ---
    let currentQuestionIndex = 0;
    let answers = [];

    // --- DOM ---
    const screens = {
        top: document.getElementById('screen-top'),
        question: document.getElementById('screen-question'),
        register: document.getElementById('screen-register')
    };

    const loading = document.getElementById('diag-loading');

    // --- SCREEN MANAGEMENT ---
    function showScreen(name) {
        // Exit animation for current screen
        const current = document.querySelector('.diag-screen.active');
        if (current) {
            current.classList.add('diag-screen-exit');
            setTimeout(() => {
                current.classList.remove('active', 'diag-screen-exit');
                screens[name].classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        } else {
            screens[name].classList.add('active');
        }
    }

    function showLoading(callback) {
        loading.classList.add('active');
        setTimeout(() => {
            loading.classList.remove('active');
            callback();
        }, 2000);
    }

    // --- START ---
    function startDiagnosis() {
        currentQuestionIndex = 0;
        answers = [];
        showScreen('question');
        renderQuestion();
    }

    // --- RENDER QUESTION ---
    function renderQuestion() {
        const q = QUESTIONS[currentQuestionIndex];
        const total = QUESTIONS.length;

        // Progress
        const pct = ((currentQuestionIndex) / total) * 100;
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-current').textContent = currentQuestionIndex + 1;
        document.getElementById('progress-total').textContent = total;
        document.getElementById('progress-axis').textContent = q.axisLabel;

        // Question
        document.getElementById('question-num').textContent = `Q${currentQuestionIndex + 1}`;
        document.getElementById('question-text').textContent = q.text;

        // Options - shuffle for less bias
        const optionsContainer = document.getElementById('question-options');
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);

        optionsContainer.innerHTML = '';
        const markers = ['A', 'B', 'C', 'D'];
        shuffled.forEach((opt, i) => {
            const div = document.createElement('div');
            div.className = 'diag-option';
            div.innerHTML = `
                <span class="opt-marker">${markers[i]}</span>
                <span class="opt-text">${opt.label}</span>
            `;
            div.addEventListener('click', () => selectOption(q, opt, div));
            optionsContainer.appendChild(div);
        });

        // Re-trigger animation
        const card = document.querySelector('.diag-question-card');
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = '';
    }

    // --- SELECT OPTION ---
    function selectOption(question, option, element) {
        // Mark selected
        document.querySelectorAll('.diag-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        // Store answer
        answers[currentQuestionIndex] = {
            question_id: question.id,
            axis: question.axis,
            selected: option.side,
            label: option.label
        };

        // Auto-advance after brief delay
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < QUESTIONS.length) {
                renderQuestion();
            } else {
                // All questions answered
                const resultType = calculateResult();
                showLoading(() => {
                    // GASにデータを送信してからLINE登録画面へ
                    sendToGAS(resultType).then(() => {
                        setupRegisterScreen(resultType);
                        showScreen('register');
                    });
                });
            }
        }, 400);
    }

    // --- CALCULATE RESULT ---
    function calculateResult() {
        // Count A vs B for each axis
        const axisCounts = { brave: { A: 0, B: 0 }, empathy: { A: 0, B: 0 }, create: { A: 0, B: 0 }, stable: { A: 0, B: 0 } };

        answers.forEach(a => {
            if (a && axisCounts[a.axis]) {
                axisCounts[a.axis][a.selected]++;
            }
        });

        // Determine dominant side for each axis (2+ out of 3 = dominant)
        const braveResult = axisCounts.brave.A >= 2 ? 'A' : 'B';   // A = 勇気
        const empathyResult = axisCounts.empathy.A >= 2 ? 'A' : 'B'; // A = 共感
        const createResult = axisCounts.create.A >= 2 ? 'A' : 'B';   // A = 創造
        const stableResult = axisCounts.stable.A >= 2 ? 'A' : 'B';   // A = 変化

        // Build key: brave-empathy-create-stable order
        // But TYPES keys are: empathy-brave-create-stable?
        // Let me re-check. Looking at TYPES keys:
        // 'AAAA' = archmage = 勇・共・創・変
        // So the key order is: empathy(共=A)-brave... wait
        // Actually let me look again. The key for archmage is 'AAAA' with
        // brave=勇気(A), empathy=共感(A), create=創造(A), stable=変化(A)
        // So key = braveResult + empathyResult + createResult + stableResult
        // But wait the TYPES keys I defined have a different mapping.
        // Let me trace: 
        // ガーディアン = 勇・独・実・安 = brave:A, empathy:B, create:B, stable:B
        // Key should be 'ABBB' but I have 'BBBA' for ガーディアン

        // I need to recheck my key generation logic relative to my TYPES definition.
        // In my TYPES, I defined the key based on reading order from the comments.
        // The key order IS: brave, empathy, create, stable
        // But I need to check the actual assignments in TYPES more carefully.

        // aーキメイジ = 勇(A)・共(A)・創(A)・変(A) = AAAA ✓
        // シャーマン = 勇(A)・共(A)・創(A)・安(B) = AABA ← wait, 安 is stable:B
        // So the key order should be brave, empathy, create, stable
        // A=勇気, AA=共感, AAA=創造, AAAB=安定(B for stable axis)

        // Hmm wait. Let me re-examine: in my TYPES definition for guardian:
        // 'BBBA': guardian, axes: brave: '勇気', empathy: '独立'...
        // But 勇気 for brave means A, not B. That's a bug in my TYPES definition.
        // Let me fix this understanding.

        // Actually I defined the TYPES keys differently. Let me trace through the TYPE data:
        // AAAA = archmage: brave=勇気, empathy=共感, create=創造, stable=変化
        //   => all A sides are dominant => key should represent ALL dominant-A => AAAA ✓
        // AABA = shaman: brave=勇気, empathy=共感, create=創造, stable=安定
        //   => stable is B side (安定) => key position 4 is B... but key is AABA
        //   Wait, that means position 3 is B and position 4 is A?
        //   key = pos1:A, pos2:A, pos3:B, pos4:A
        //   That would mean: brave=A(勇), empathy=A(共), create=B(実), stable=A(変)
        //   But shaman should be 勇・共・創・安...

        // I made an error in my TYPES key definitions. Let me just compute 
        // the type key properly and I already have the correct axes in each type definition.
        // So I should just search through TYPES to find the matching one.

        const typeKey = braveResult + empathyResult + createResult + stableResult;

        // Actually, let me just find the type by matching axes outcomes
        let resultType = null;
        const braveLabel = braveResult === 'A' ? '勇気' : '熟考';
        const empathyLabel = empathyResult === 'A' ? '共感' : '独立';
        const createLabel = createResult === 'A' ? '創造' : '実装';
        const stableLabel = stableResult === 'A' ? '変化' : '安定';

        for (const key in TYPES) {
            const t = TYPES[key];
            if (t.axes.brave === braveLabel &&
                t.axes.empathy === empathyLabel &&
                t.axes.create === createLabel &&
                t.axes.stable === stableLabel) {
                resultType = t;
                break;
            }
        }

        // Fallback
        if (!resultType) {
            resultType = TYPES['AAAA'];
        }

        return resultType;
    }

    // --- REGISTER SCREEN ---
    function setupRegisterScreen(resultType) {
        // LINE友だち追加URLにsession_idとresult_numberを含める
        const lineUrl = `https://lin.ee/JcFEbp0?session_id=${SESSION_ID}&result=${resultType.num}`;
        const lineBtn = document.getElementById('btn-line-register');
        if (lineBtn) {
            lineBtn.href = lineUrl;
        }

        // 結果タイプ名を登録画面に表示
        const resultHint = document.getElementById('register-result-hint');
        if (resultHint) {
            resultHint.textContent = `あなたのタイプ: TYPE ${String.fromCharCode(64 + resultType.num)}「${resultType.name}」`;
        }
    }

    // --- SEND DATA TO GAS ---
    async function sendToGAS(resultType) {
        const data = {
            session_id: SESSION_ID,
            answers: answers.map(a => ({
                question_id: a.question_id,
                axis: a.axis,
                selected: a.selected,
                label: a.label
            })),
            result_type: resultType.id,
            result_name: resultType.name,
            result_number: resultType.num,
            result_url: resultType.resultUrl,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(GAS_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log('[Mentai Diagnosis] Data sent to GAS:', data);
        } catch (error) {
            console.error('[Mentai Diagnosis] GAS send error:', error);
            // エラーでもフローは続行（LINE登録画面は表示する）
        }
    }

    // --- EVENT BINDINGS ---
    document.addEventListener('DOMContentLoaded', () => {
        // Start button
        const startBtn = document.getElementById('btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', startDiagnosis);
        }

        // Retry (もう一度診断する)
        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                currentQuestionIndex = 0;
                answers = [];
                showScreen('top');
            });
        }

        // Log session ID for debugging
        console.log('[Mentai Diagnosis] Session ID:', SESSION_ID);
    });

})();
