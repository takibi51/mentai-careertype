/**
 * Match App - AI Stub (Enhanced Senior Consultant Mode)
 * 
 * ===== SYSTEM PROMPT: PERSONA & PRINCIPLES =====
 * 
 * Persona: 業界歴10年以上のシニア人材コンサルタント
 * - 親身ながらも客観的で、戦略的な視点を持つ
 * - 単なるデータ要約ではなく「ブリッジング（架け橋）」を言語化
 * - 企業がなぜ会うべきか、候補者がなぜこの求人に惹かれるかを明確化
 * 
 * Output Rule:
 * - 原則200字以上
 * - 構造化（改行・箇条書き）を用いて読みやすく
 * 
 * Response Structure (C.E.R.):
 * - Connect（接続）: 候補者の経験が求人の課題を解決する相関
 * - Evidence（根拠）: 職務要約から抽出した具体的実績
 * - Reframe（懸念払拭）: ネガティブをポジティブに再定義
 * 
 * Tone & Manner:
 * - 禁止: 「検索した結果、見つかりませんでした」「〜だと思います（無責任な推測）」
 * - 推奨: 「市場の需給バランスを鑑みると〜」「〇〇という経験を△△と読み替えることで〜」
 */

/**
 * Delay execution to simulate AI thinking
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// HELPER: トーン&マナー管理
// ============================================
const ToneManager = {
    // 禁止ワードを推奨表現に変換
    reframe(text) {
        const replacements = [
            ['見つかりませんでした', '現時点では条件に完全一致する候補はありませんが、視点を変えると以下の可能性が見えてきます'],
            ['思います', '考えられます'],
            ['多分', '市場動向を踏まえると'],
            ['わかりません', 'より詳細な情報があれば精度の高い分析が可能です']
        ];
        let result = text;
        for (const [from, to] of replacements) {
            result = result.replace(new RegExp(from, 'g'), to);
        }
        return result;
    },

    // シニアコンサルタント風の言い回し
    consultantPhrases: {
        opening: [
            'エージェントとして率直に申し上げますと',
            '市場の需給バランスを鑑みると',
            '私の経験則から申し上げると'
        ],
        bridge: [
            'という経験を、貴社の課題と読み替えると',
            'という実績は、まさに今回の募集背景に直結します',
            'の視点で見ると、相互にメリットが見えてきます'
        ],
        evidence: [
            '具体的なエビデンスとして',
            '過去の実績を紐解くと',
            '職務経歴から抽出すると'
        ],
        reframe: [
            'むしろポジティブに捉えると',
            'この点を「成長への意欲」と読み替えれば',
            '逆説的ですが、これは強みに転換できます'
        ]
    },

    getPhrase(category) {
        const phrases = this.consultantPhrases[category] || [];
        return phrases[Math.floor(Math.random() * phrases.length)] || '';
    }
};

// ============================================
// 1. 候補者検索・スカウト文生成
// ============================================
export async function generateScoutMessage(candidate) {
    await delay(800 + Math.random() * 500);

    const name = candidate.name || '候補者様';
    const job = candidate.jobType || 'ご専門の分野';
    const skills = candidate.hardSkills?.slice(0, 3).join('・') || '豊富なスキル';
    const experience = candidate.experience || '5年以上';
    const negatives = candidate.negativeChecks || [];
    const hasNegative = negatives.length > 0;

    // C.E.R. 構造でスカウト文を生成
    let reframeSection = '';
    if (hasNegative && negatives[0]?.includes('離職') || negatives[0]?.includes('転職')) {
        reframeSection = `
■ 改めてお伝えしたいこと
ご経歴を拝見し、直近のご転職について触れさせてください。${ToneManager.getPhrase('reframe')}、**「自らのキャリアに真摯に向き合い、より良い環境を求められた」**という前向きな姿勢の表れと受け止めております。今回ご紹介する求人は、そうした挑戦意欲を歓迎する企業文化を持っています。`;
    }

    return `【${name}様へのスカウトメッセージ】

${name}様

${ToneManager.getPhrase('opening')}、${name}様のご経験は現在の人材市場において非常に高い価値を持っています。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ ご経歴への着目ポイント（Connect）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${job}領域での${experience}のご経験、特に**${skills}**のスキルセットは、現在私がお手伝いしている複数の企業が「まさにこういう方を探していた」と声を揃える人材像です。

${ToneManager.getPhrase('evidence')}、${candidate.resume?.summary ? candidate.resume.summary.substring(0, 100) : '貴殿の職務経験は、単なる業務遂行に留まらず、組織への具体的な成果貢献が読み取れます'}。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 市場価値の客観評価（Evidence）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

・市場決まりやすさスコア：**${candidate.marketScore || 75}%**（上位30%圏内）
・想定オファー年収帯：${candidate.preferences?.salary || '〜800万円'}（現市場相場と整合）
・複数企業からの好条件オファー獲得確度：**高**
${reframeSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ ご提案したい求人の特徴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

現在、年収${candidate.preferences?.salary || '〜800万円'}、${candidate.preferences?.remote ? '**フルリモート対応可能**' : '通勤圏内'}という条件で、${name}様の志向性に合致する求人を複数確保しております。いずれも**「経験者を本気で採りたい」**という企業様です。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 次のステップ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

まずは15〜20分程度のオンライン面談で、ご希望やキャリアの方向性をお伺いできればと存じます。私はエージェントとして、${name}様の「次のキャリアの最適解」を一緒に見つけるパートナーでありたいと考えております。

ご都合の良い日時を2〜3候補いただけますと幸いです。

何卒よろしくお願いいたします。`;
}

// ============================================
// 2. 懸念点と確認質問の生成
// ============================================
export async function generateConcernsAndQuestions(candidate) {
    await delay(700 + Math.random() * 400);

    const negatives = candidate.negativeChecks || [];
    const name = candidate.name || '候補者';

    // 懸念点の深掘り分析
    const concernAnalysis = [];
    if (negatives[0]?.includes('短期') || negatives[0]?.includes('離職')) {
        concernAnalysis.push({
            concern: '直近の短期離職',
            analysis: '表面的には「定着性への懸念」と映りますが、**深層にある本当の理由**を確認する必要があります。組織フェーズのミスマッチ（既存維持 vs 新規開拓）や、上司との相性、あるいは自身のキャリア軸の再定義による戦略的判断の可能性もあります。',
            reframe: 'むしろ「ミスマッチを避けて次に進む決断力」として評価できるケースも多いです。',
            question: '「前職での離職理由について、ご自身が最も重視していた軸は何でしたか？そして、今回はその軸がどう満たされることを期待されていますか？」'
        });
    } else {
        concernAnalysis.push({
            concern: '転職動機の深さ',
            analysis: '現職に明確な不満がない場合、選考途中での辞退リスクがあります。**「なぜ今なのか」**の納得解を得ることが重要です。',
            reframe: '逆に言えば、明確な動機があれば決定までスムーズに進みやすい候補者です。',
            question: '「今回転職活動を始められたきっかけは何ですか？現職では満たせない、具体的な目標や環境の変化があればお聞かせください。」'
        });
    }

    concernAnalysis.push({
        concern: '希望条件の柔軟性',
        analysis: `現在の希望（年収${candidate.preferences?.salary || '応相談'}、${candidate.preferences?.remote ? 'リモート希望' : '出社可'}）が固定的な場合、マッチする求人が限定される可能性があります。`,
        reframe: '条件交渉の余地を確認することで、提案幅が広がります。',
        question: '「ご希望条件について、優先順位をつけるとすればどのような順番になりますか？また、どの条件なら相談の余地がありますか？」'
    });

    return `【${name}様の懸念点分析と確認質問】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ エージェントとしての所見
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ToneManager.getPhrase('opening')}、${name}様は総合的に見てマッチング確度の高い候補者です。ただし、企業への推薦前に以下の点を確認・整理することで、**選考通過率と決定率を最大化**できると考えます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 懸念点の深掘り分析（C.E.R.構造）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${concernAnalysis.map((c, i) => `
【懸念${i + 1}】${c.concern}

📊 **分析（Evidence）**
${c.analysis}

🔄 **再定義（Reframe）**
${c.reframe}

💬 **確認質問**
${c.question}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 追加確認質問（深掘り用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. 「5年後のキャリアイメージを教えてください。どのようなスキルや役職を獲得していたいですか？」
   → **キャリアビジョンの一貫性**を確認

4. 「チームで仕事をする際、どのようなポジション（リーダー/サポーター/独立型）を取ることが多いですか？」
   → **組織適合度**の推測材料

5. 「今回ご紹介する求人で、特に確認したい点や気になる点はありますか？」
   → **隠れた懸念や条件**の把握

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 企業への伝え方の準備
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

上記の確認を経て、${name}様の**「転職軸」と「キャリアビジョン」**を明確に言語化できれば、企業への推薦文において「この方でなければならない理由」を説得力をもって伝えられます。

これらの質問を通じて、より精度の高いマッチングを実現しましょう。`;
}

// ============================================
// 3. 決まりやすい理由の生成（Hireability）
// ============================================
export async function generateHireabilityReason(candidate) {
    await delay(600 + Math.random() * 400);

    const marketScore = candidate.marketScore || 75;
    const skills = candidate.hardSkills?.join('、') || 'マルチスキル';
    const name = candidate.name || '候補者';
    const jobType = candidate.jobType || '専門領域';

    // 市場分析に基づく決定シナリオ
    const marketAnalysis = marketScore >= 80
        ? '**プレミアム人材**として複数企業から引く手あまたの状態です。早期アプローチと条件提示のスピードが鍵となります。'
        : marketScore >= 70
            ? '**優良人材**として、複数の選択肢から最適な環境を選べる立場にあります。企業の魅力訴求が重要です。'
            : '適切なマッチングと丁寧なフォローにより、高い決定率が期待できます。';

    return `【${name}様の決まりやすさ分析】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 市場価値サマリ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

市場決まりやすさスコア：**${marketScore}%** ${marketScore >= 70 ? '⭐' : ''}
（${marketScore >= 80 ? '上位20%の希少人材' : marketScore >= 70 ? '上位40%の優良人材' : '条件次第で高マッチ可能'}）

${ToneManager.getPhrase('opening')}、${name}様は${marketAnalysis}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 決まりやすい理由（3つの視点）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【1. 市場需給の観点】
・${jobType}人材の需要は現在**高水準**で推移しており、供給が追いついていません
・${skills}のスキルセットは、IT・コンサル・事業会社いずれからも求められる汎用性があります
・市場の需給バランスを鑑みると、**複数オファーの獲得確率は高い**と判断できます

【2. 条件マッチングの観点】
・希望年収帯（${candidate.preferences?.salary || '市場相場'}）が市場相場と整合しており、条件面でのミスマッチが起きにくい
・${candidate.preferences?.remote ? 'リモートワーク対応可能という柔軟性' : '出社可能エリアの広さ'}は、候補求人の選択肢を大幅に広げます
・入社時期の柔軟性があれば、企業側の採用タイミングに合わせやすい

【3. ソフトスキル・人物像の観点】
・「${candidate.softSkills?.[0] || '協調性'}」「${candidate.softSkills?.[1] || '論理性'}」は、面接官が好印象を持ちやすい要素です
・書類・面談での客観的な説明力が高いと推測される経歴構成
・**「一緒に働きたい」**と思わせる人間的魅力がプラスに作用する見込み

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ リスク要因と対策
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidate.negativeChecks?.[0]
            ? `⚠️ 「${candidate.negativeChecks[0]}」について
${ToneManager.getPhrase('reframe')}、これは企業への事前説明で十分にカバー可能です。${candidate.negativeChecks[0].includes('離職') ? '「より良い環境を主体的に選ぶ判断力」として推薦文に組み込みます。' : '面談時のフォローで解消を図ります。'}`
            : '✅ 特筆すべきリスク要因は見当たりません。'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 推奨アクションシナリオ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**【フェーズ1】初動（〜1週間）**
・厳選した2〜3社への同時応募で市場反応を確認
・書類選考結果を待つ間に、想定質問への回答準備をサポート

**【フェーズ2】選考進行（1〜2週間）**
・1次面接後、企業評価と候補者所感をすり合わせ
・必要に応じて希望条件の微調整を提案

**【フェーズ3】決定（3〜4週間）**
・内定獲得後、条件交渉で上積みを狙う
・複数内定の場合は比較軸を整理し最適解を導く

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 決定までの予測期間
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 **2〜4週間**（市況と本人スピード感による）

${marketScore >= 75 ? '💡 **ポイント**: 他エージェント経由での並行活動が想定されます。初動のスピードと情報提供の質で差別化を図りましょう。' : ''}`;
}

// ============================================
// 4. 提案用レジュメ生成（推薦文）
// ============================================
export async function generateProposalResume(candidate, job) {
    await delay(900 + Math.random() * 600);

    const name = candidate.name || '候補者';
    const jobTitle = job?.title || '本ポジション';
    const negatives = candidate.negativeChecks || [];
    const hasNegativeShortTenure = negatives.some(n => n?.includes('離職') || n?.includes('短期'));

    // ブリッジング：候補者の経験と求人の課題を接続
    const bridgingStatement = `
本候補者の最大の武器は、**単なる業務遂行者ではなく「課題解決型」のスタンス**にあります。${candidate.resume?.summary ? candidate.resume.summary.substring(0, 80) + 'という経験は、' : ''}${job?.description ? '貴社の「' + (job.title || '本ポジション') + '」が抱える課題に対し、即座に価値を発揮できると確信しています。' : '御社の組織課題に対し、具体的な成果で貢献できる人材です。'}`;

    // 懸念の払拭（Reframe）
    let reframeSection = '';
    if (hasNegativeShortTenure) {
        reframeSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 懸念点の再定義（Reframe）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

直近の10ヶ月での退職について、率直にご説明させてください。

これは**本人の志向と組織フェーズのミスマッチ**（既存維持 vs 新規開拓/安定運用 vs 変革推進）によるものであり、スキルや人間性の問題ではありませんでした。

${ToneManager.getPhrase('reframe')}、今回は**「自ら市場を切り拓きたい」「変革を推進したい」という強い覚悟**を持って選考に臨んでいます。貴社の募集背景（${job?.description?.substring(0, 30) || '成長フェーズでの増員'}）は、まさに${name}様が最もパフォーマンスを発揮できる環境であると考えます。`;
    }

    return `【推薦状】${name} → ${jobTitle}

══════════════════════════════════════════════════════
■ 推薦理由サマリ（マッチ度：${candidate.matchScore || 85}%）
══════════════════════════════════════════════════════

${ToneManager.getPhrase('opening')}、${name}様を**強く推薦**いたします。
${bridgingStatement}

══════════════════════════════════════════════════════
■ なぜ今、貴社にこの方なのか（Connect）
══════════════════════════════════════════════════════

【貴社の課題】
${job?.description ? '「' + job.description.substring(0, 60) + '...」という背景から、' : '即戦力人材の確保と組織力強化が急務と推察します。'}

【候補者の強み】
${candidate.matchReasons?.slice(0, 3).map((r, i) => `${i + 1}. **${r}**`).join('\n') ||
        `1. **${candidate.jobType || '専門領域'}での実践経験**：理論だけでなく現場で成果を出してきた再現性
2. **${candidate.hardSkills?.[0] || '専門スキル'}の深い知見**：導入から運用まで一気通貫で対応可能
3. **変化への適応力**：新しい環境でも早期にキャッチアップし成果を出す姿勢`}

【ブリッジング】
${name}様の「${candidate.hardSkills?.[0] || '専門'}」経験を御社の文脈で読み替えると、**${job?.title || '本ポジション'}において即座に機能する即戦力**として期待できます。
${reframeSection}

══════════════════════════════════════════════════════
■ 具体的なエビデンス（Evidence）
══════════════════════════════════════════════════════

${candidate.resume?.summary ||
        `${candidate.jobType || '専門領域'}において${candidate.experience || '5年以上'}の経験を持ち、
${candidate.hardSkills?.join('、') || '複数の専門スキル'}を武器に、組織の成果向上に貢献してきました。

特筆すべきは、**数値で語れる成果**を持っていることです：
・担当領域での改善施策により、効率化/売上向上を実現
・チームメンバーとの協働プロジェクトを複数完遂
・新しいツール/プロセスの導入を主導した経験あり`}

══════════════════════════════════════════════════════
■ 本ポジションとの適合度
══════════════════════════════════════════════════════

| 評価軸 | 評価 | コメント |
|:--|:--:|:--|
| ハードスキル | ★★★★☆ | ${candidate.hardSkills?.[0] || '専門スキル'}が強み、${job?.requiredSkills?.[0] || '必須要件'}をクリア |
| ソフトスキル | ★★★★★ | ${candidate.softSkills?.slice(0, 2).join('・') || '協調性・論理性'}が高評価ポイント |
| カルチャーフィット | ★★★★☆ | ${candidate.preferences?.remote ? 'リモート適性あり' : '出社文化にも適応可能'} |
| 条件マッチ | ★★★★☆ | 希望年収${candidate.preferences?.salary || '応相談'}、交渉余地あり |

══════════════════════════════════════════════════════
■ 次のアクション推奨
══════════════════════════════════════════════════════

📅 **書類選考通過後、1週間以内に1次面接を設定**することを推奨します。

💡 他社選考も並行して進行中の可能性が高く、**スピード感を持った対応**が内定獲得の鍵となります。ご検討のほど、よろしくお願いいたします。`;
}

// ============================================
// 5. 面談シート解析レポート
// ============================================
export async function generateInterviewAnalysis(transcript, candidate) {
    await delay(1200 + Math.random() * 800);

    const name = candidate?.name || '候補者';
    const wordCount = transcript.length;

    // テキストからタグを抽出（最低5つ）
    const extractedTags = [];
    const tagPatterns = [
        { pattern: /リーダー|マネジ|管理|統括/i, tag: '#マネジメント経験' },
        { pattern: /営業|セールス|商談|受注/i, tag: '#営業力' },
        { pattern: /企画|プランニング|戦略/i, tag: '#企画力' },
        { pattern: /開発|エンジニア|プログラ/i, tag: '#開発経験' },
        { pattern: /コミュニケーション|対話|折衝/i, tag: '#対人スキル' },
        { pattern: /分析|データ|数値/i, tag: '#分析力' },
        { pattern: /挑戦|チャレンジ|新規/i, tag: '#挑戦志向' },
        { pattern: /成長|学習|スキルアップ/i, tag: '#成長意欲' },
        { pattern: /チーム|協力|連携/i, tag: '#チームワーク' },
        { pattern: /改善|効率|最適化/i, tag: '#改善推進力' }
    ];

    for (const { pattern, tag } of tagPatterns) {
        if (pattern.test(transcript)) {
            extractedTags.push(tag);
        }
    }
    // 最低5つを確保
    const defaultTags = ['#即戦力', '#ポテンシャル', '#安定志向', '#柔軟性', '#論理的思考'];
    while (extractedTags.length < 5) {
        const remainingTags = defaultTags.filter(t => !extractedTags.includes(t));
        if (remainingTags.length > 0) {
            extractedTags.push(remainingTags[Math.floor(Math.random() * remainingTags.length)]);
        } else {
            break;
        }
    }

    const fullReport = `【面談解析レポート】${name}様

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ エージェント所見
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ToneManager.getPhrase('opening')}、${name}様は**企業が「会ってみたい」と思える要素**を十分に備えた候補者です。面談内容を分析した結果、以下のポイントが浮かび上がりました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ マッチングタグ（抽出キーワード）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${extractedTags.join('  ')}

これらのタグは、求人とのマッチング精度を高めるキーワードとして活用できます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 決定シナリオ予測
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【この候補者が響く口説き文句】
・「あなたの${candidate?.hardSkills?.[0] || '専門性'}を存分に発揮できる環境です」
・「裁量を持って新しいことに挑戦できるポジションです」
・「成長フェーズの企業で、将来の幹部候補として期待しています」

【提示すべきキャリアパス】
・**短期（1年）**: 即戦力として成果を出し、チーム内での信頼を獲得
・**中期（3年）**: マネジメントまたはスペシャリストとしてのキャリア選択
・**長期（5年）**: 組織を牽引するリーダーポジション、または専門領域の第一人者

このシナリオを面接時に伝えることで、**決定率が20〜30%向上**すると見込まれます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 深掘り質問案（次回面談用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下は、まだ見えていないリスク点を確認するための質問です：

1. 「これまでのキャリアで最も困難だった局面と、それをどう乗り越えましたか？」
   → **ストレス耐性・問題解決力**の確認

2. 「チームで意見が対立した際、どのように解決に導きましたか？」
   → **コンフリクトマネジメント能力**の確認

3. 「5年後、どのようなスキルや立場を獲得していたいですか？」
   → **キャリアビジョンの一貫性**の確認

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ マッチング精度向上のための追加情報
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の情報があれば、より精度の高いマッチングが可能です：
・希望年収の幅（下限〜上限）
・リモートワークの許容度（週何日まで出社可能か）
・入社可能時期の最短・最長
・他社選考状況

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 推奨アクション
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 本レポートを踏まえ、マッチ度の高い求人を右のAIパートナーに相談
2. 「カルチャーフィット順」「緊急度順」などで優先順位を調整
3. 選定した求人の推薦文を作成し、1週間以内に書類提出を目指す`;

    return {
        summary: fullReport,
        tags: extractedTags,
        fullReport: fullReport,
        extractedData: {
            hardSkillsUpdate: [],
            softSkillsUpdate: ['コミュニケーション力', '論理的思考', '主体性'],
            negativeChecksUpdate: [],
            preferencesUpdate: {}
        }
    };
}

// ============================================
// 6. 進捗停滞分析と代替提案（Proposals Tab）
// ============================================
export async function generateProgressAnalysis(proposal, candidate) {
    await delay(800 + Math.random() * 500);

    const status = proposal?.status || '提案済み';
    const name = candidate?.name || proposal?.candidateName || '候補者';
    const jobTitle = proposal?.jobTitle || '求人';

    return `【進捗分析レポート】${name}様 → ${jobTitle}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 現在のステータス
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **${status}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 停滞原因の3軸分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【1. 市場環境要因】
・同ポジションの競争率が高く、選考に時間がかかっている可能性
・採用予算の見直しや組織変更が発生している可能性
・季節的な採用スローダウン（年末年始、決算期等）

【2. 候補者の意向要因】
・他社選考との並行により、優先順位が下がっている可能性
・現職からの引き止めや条件改善の提示を受けている可能性
・家族の意向や生活環境の変化による迷い

【3. 企業の選考スピード要因】
・面接官のスケジュール調整に時間がかかっている
・社内稟議や意思決定プロセスの複雑さ
・ポジション要件の再検討が発生している

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 推進アドバイス（具体的アクション）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **今すぐできること**
1. ${name}様への連絡：他社選考状況と現在の優先順位を再確認
2. 企業人事への確認：選考状況と次回ステップの見込み日程
3. 関係構築：業界ニュースや事例記事を送付し、接点を維持

📋 **1週間以内に実施**
1. 双方の温度感を再評価し、プッシュすべきか静観すべきか判断
2. 必要に応じて条件面での譲歩余地を確認
3. 決定を後押しする追加情報（社員インタビュー等）の提供

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 代替シナリオ（ピボット戦略）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

もし本件が見送りになった/なりそうな場合、${name}様のスキルセットを別の角度から活かせる求人があります。

💡 **ピボット提案の視点**
・「${candidate?.jobType || '専門領域'}」を「カスタマーサクセス」や「コンサルティング」として読み替えると、意外なマッチが見つかることがあります
・業界を変えてスキルを活かす「越境転職」も選択肢として提示

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**この条件でリストを絞り込みますか？** または **代替求人を詳しく表示しますか？**`;
}

// ============================================
// 7. 代替求人提案（ピボット提案）
// ============================================
export async function generateAlternativeProposal(candidate, rejectedJob, reason) {
    await delay(800 + Math.random() * 500);

    const name = candidate?.name || '候補者';
    const skillSet = candidate?.hardSkills?.slice(0, 3).join('、') || '分析力・課題解決力';

    return `【代替求人提案】${name}様

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 今回の見送り理由の分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

お見送りの理由は、**スキル不足ではなく「社風のミスマッチ」**でした。これは必ずしもネガティブではありません。合わない環境に無理に入るよりも、${name}様が本来の力を発揮できる場所を見つけることが重要です。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ ピボット戦略：スキルの読み替え
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${name}様の持つ**「${skillSet}」**を別の角度から評価してくれる求人があります。

💡 **視点の転換**
厳密には職種が異なりますが、**「課題解決力」「顧客の成功に伴走する」**という軸であれば、${name}様も高い関心を示すはずです。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 代替提案求人
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【候補1】BtoB SaaS企業 / カスタマーサクセス責任者
・マッチ度：85%（課題解決力の重みを適用）
・年収：600〜800万円
・ポイント：${name}様の分析スキルが顧客の成功指標改善に直結

【候補2】コンサルティングファーム / シニアコンサルタント
・マッチ度：78%
・年収：700〜900万円
・ポイント：様々な業界に横断的に関われる環境

【候補3】事業会社 / 経営企画・事業推進
・マッチ度：82%
・年収：550〜750万円
・ポイント：社内での裁量が大きく、変革を推進できる

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 次のステップ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**この条件でリストを再表示しましょうか？**

気になる求人があれば、詳細情報と推薦文の作成をサポートします。`;
}

// ============================================
// 8. 求人改善提案
// ============================================
export async function generateJobImprovements(job) {
    await delay(800 + Math.random() * 500);

    const title = job?.title || '求人';
    const hasStar = job?.hasStar;

    return `【${title}の改善提案】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 現状分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${hasStar ? '⭐ **注目求人**として既に高い訴求力があります。さらなる差別化ポイントをご提案します。' : '現状の内容でも応募は見込めますが、**以下の改善で応募数20〜30%増加**が期待できます。'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 改善ポイント（優先度順）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【1. 年収表記の透明化】（効果：応募率+15%）
📝 **Before**: 「400万〜600万円」
📝 **After**: 「400万〜600万円（経験・能力により決定。前職年収を考慮します）」

💡 **ポイント**: 年収レンジが広い場合、候補者は「自分はどこに位置するのか」に不安を感じます。判断基準を明示することで、「自分にも可能性がある」と感じてもらえます。

【2. リモートワーク方針の具体化】（効果：応募率+20%）
📝 **Before**: 「リモート可」
📝 **After**: 「週2日リモート可（入社3ヶ月後からフルリモートも相談可）」

💡 **ポイント**: 「可」だけでは実態が見えません。具体的な日数と将来の可能性を示すことで、応募者の期待値を適切に設定できます。

【3. 募集背景のストーリー化】（効果：興味喚起+25%）
📝 **Before**: 「事業拡大に伴う増員」
📝 **After**: 「昨年から売上2倍成長。プロダクトの進化に追いつくため、フロントエンドのプロを求めています」

💡 **ポイント**: 「増員」は事務的。成長ストーリーを伝えることで、「このフェーズに参加したい」という意欲を引き出します。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 追記推奨項目
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 選考フロー（面接回数・期間の目安）
✅ チーム構成（何名規模・年齢層・雰囲気）
✅ 入社者の声「なぜうちを選んだか」
✅ 1日のスケジュール例

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 表現の改善例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Before | After |
|:--|:--|
| 「営業経験者歓迎」 | 「法人営業2年以上歓迎。異業種出身者も活躍中！」 |
| 「コミュニケーション力がある方」 | 「顧客の課題を引き出し、解決策を提案できる方」 |
| 「成長意欲のある方」 | 「半年後にはチームリーダーを目指したい方」 |

これらの改善により、**質の高い応募が増加**し、選考効率の向上も期待できます。`;
}

// ============================================
// 9. 自然言語クエリのパース
// ============================================
export async function parseNaturalQuery(query) {
    await delay(300 + Math.random() * 200);

    const result = {
        keywords: [],
        jobType: null,
        skills: [],
        preferences: {},
        personality: [],
        excludeNegative: false
    };

    const lowerQuery = query.toLowerCase();

    // Job types
    const jobTypes = ['営業', 'マーケティング', 'エンジニア', '経理', '人事', '総務', '企画', 'PM', 'PdM', 'デザイナー'];
    for (const jt of jobTypes) {
        if (query.includes(jt)) {
            result.jobType = jt;
            result.keywords.push(jt);
        }
    }

    // Skills
    const skills = ['Excel', 'SQL', 'Python', 'JavaScript', 'React', 'Vue', 'MA', '採用', '財務', '会計', 'AWS', 'GCP'];
    for (const skill of skills) {
        if (lowerQuery.includes(skill.toLowerCase())) {
            result.skills.push(skill);
            result.keywords.push(skill);
        }
    }

    // Personality / Soft skills
    const personalities = ['コミュニケーション', 'リーダーシップ', '論理的', '協調性', '主体性', 'メンタル', 'ベンチャー'];
    for (const p of personalities) {
        if (query.includes(p)) {
            result.personality.push(p);
            result.keywords.push(p);
        }
    }

    // Preferences
    if (query.includes('リモート') || query.includes('在宅')) {
        result.preferences.remote = true;
        result.keywords.push('リモート');
    }

    if (query.includes('決まりやすい') || query.includes('市場価値')) {
        result.preferences.highMarketScore = true;
        result.keywords.push('高市場スコア');
    }

    if (query.includes('ネガティブが少ない') || query.includes('リスクが少')) {
        result.excludeNegative = true;
        result.keywords.push('低リスク');
    }

    return result;
}

// ============================================
// 10. 汎用チャットレスポンス
// ============================================
export async function generateChatResponse(message, context = {}) {
    await delay(600 + Math.random() * 400);

    const lowerMessage = message.toLowerCase();

    // Check for specific intents
    if (lowerMessage.includes('スカウト') || lowerMessage.includes('メッセージ')) {
        if (context.candidate) {
            return await generateScoutMessage(context.candidate);
        }
        return `${ToneManager.getPhrase('opening')}、スカウトメッセージの作成には候補者の選択が必要です。

候補者一覧から対象者を選択していただければ、その方の経歴・強み・市場価値を踏まえた**「受け取った側が返信したくなる」**スカウト文を生成いたします。

💡 **良いスカウト文のポイント**
・候補者固有の経験への言及（「あなただから」の演出）
・具体的な数字を含む市場価値の提示
・次のアクションへの明確な誘導`;
    }

    if (lowerMessage.includes('懸念') || lowerMessage.includes('確認質問') || lowerMessage.includes('リスク')) {
        if (context.candidate) {
            return await generateConcernsAndQuestions(context.candidate);
        }
        return '懸念点の分析と確認質問の整理には、対象候補者の選択が必要です。選択後に再度ご依頼ください。';
    }

    if (lowerMessage.includes('決まりやすい') || lowerMessage.includes('なぜ決まる') || lowerMessage.includes('市場価値')) {
        if (context.candidate) {
            return await generateHireabilityReason(context.candidate);
        }
        return '決まりやすさ分析には候補者の選択が必要です。選択後、市場スコア・経歴・条件マッチングの観点から詳細な分析をお出しします。';
    }

    if (lowerMessage.includes('改善') && lowerMessage.includes('求人')) {
        if (context.job) {
            return await generateJobImprovements(context.job);
        }
        return '求人改善の提案には、対象求人の選択が必要です。';
    }

    // Default response with consultant persona
    return `ご質問ありがとうございます。

${ToneManager.getPhrase('opening')}、以下のサポートが可能です：

**📝 候補者サポート**
・スカウトメッセージ作成（候補者選択後）
・懸念点分析と確認質問の整理
・決まりやすさ分析と決定シナリオ
・企業向け推薦文の生成

**📋 求人サポート**
・求人票の改善提案
・応募が増える表現への修正

**💡 活用のコツ**
候補者や求人を選択した状態でご質問いただくと、その方/その求人に特化した**戦略的なアドバイス**が可能です。

例えば「この候補者のスカウト文を作って」「懸念点を整理して」とお伝えください。

何かお手伝いできることはありますか？`;
}

// ============================================
// エクスポート：generateConcerns, generateHireability（互換性維持）
// ============================================
export const generateConcerns = generateConcernsAndQuestions;
export const generateHireability = generateHireabilityReason;
