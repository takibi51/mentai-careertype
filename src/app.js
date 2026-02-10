/**
 * Match App - Combined Application (No ES Modules)
 * This file contains all application logic inline to work with file:// protocol
 */

// ==========================================
// Utility Functions
// ==========================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ==========================================
// Storage Manager
// ==========================================
const STORAGE_KEYS = {
    CANDIDATES: 'match_candidates',
    JOBS: 'match_jobs',
    PROPOSALS: 'match_proposals',
    SCHEMA_VERSION: 'match_schema_version'
};

const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
    },
    getCandidates() { return this.get(STORAGE_KEYS.CANDIDATES) || []; },
    saveCandidates(c) { this.set(STORAGE_KEYS.CANDIDATES, c); },
    getCandidate(key) { return this.getCandidates().find(c => c.candidateKey === key); },
    getJobs() { return this.get(STORAGE_KEYS.JOBS) || []; },
    saveJobs(j) { this.set(STORAGE_KEYS.JOBS, j); },
    getJob(key) { return this.getJobs().find(j => j.jobKey === key); },
    getProposals() { return this.get(STORAGE_KEYS.PROPOSALS) || []; },
    saveProposals(p) { this.set(STORAGE_KEYS.PROPOSALS, p); },
    addProposal(p) { const all = this.getProposals(); all.push(p); this.saveProposals(all); },
    updateProposal(key, updates) {
        const all = this.getProposals();
        const idx = all.findIndex(p => p.proposalKey === key);
        if (idx !== -1) {
            const old = all[idx].status;
            all[idx] = { ...all[idx], ...updates, lastUpdatedAt: new Date().toISOString() };
            if (updates.status && updates.status !== old) {
                all[idx].history = all[idx].history || [];
                all[idx].history.push({ at: new Date().toISOString(), fromStatus: old, toStatus: updates.status });
            }
            this.saveProposals(all);
        }
    },
    getAdminSettings() {
        return this.get('match_admin_settings') || {
            weights: { hardSkillMatch: 40, softSkillMatch: 30, preferenceMatch: 20, negativeDeduction: 30, marketBonus: 10 },
            thresholds: { marketStarThreshold: 70 }
        };
    },
    saveAdminSettings(s) { this.set('match_admin_settings', s); },
    exportAllData() {
        return { candidates: this.getCandidates(), jobs: this.getJobs(), proposals: this.getProposals() };
    },
    resetAllData() {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    }
};

// ==========================================
// Match Calculator
// ==========================================
function getMatchLabel(score) {
    if (score >= 85) return 'かなり相性が良い';
    if (score >= 70) return '相性が良い';
    if (score >= 55) return '可能性あり';
    return '要検討';
}

function getMatchLabelClass(label) {
    switch (label) {
        case 'かなり相性が良い': return 'match-label-excellent';
        case '相性が良い': return 'match-label-good';
        case '可能性あり': return 'match-label-possible';
        default: return 'match-label-review';
    }
}

function checkMarketStar(candidate) {
    const settings = storage.getAdminSettings();
    return candidate.marketScore >= settings.thresholds.marketStarThreshold;
}

// ==========================================
// AI Stub Functions
// ==========================================
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateScoutMessage(candidate) {
    await delay(800);
    const name = candidate.name || '候補者様';
    return `【${name}様へのスカウトメッセージ案】

${name}様のプロフィールを拝見し、ぜひお話を伺いたくご連絡いたしました。

■ ご経歴への注目ポイント
${candidate.jobType || '専門領域'}での実績、特に${(candidate.hardSkills || []).slice(0, 2).join('・') || 'ご経験'}は、弊社がご紹介している複数の求人において非常にマッチ度が高いと考えております。市場決まりやすさスコアが${candidate.marketScore || 75}%と高く、複数企業から好条件でのオファーが期待できます。

■ ご提案内容
現在、年収${candidate.preferences?.salary || '〜800万円'}、${candidate.preferences?.remote ? 'リモート勤務可能' : '通勤圏内'}という条件で、${candidate.matchLabel || '相性が良い'}求人を複数確保しております。

■ 次のステップ
まずは15分程度のオンライン面談で、ご希望やキャリアの方向性をお伺いできればと存じます。ご都合の良い日時を2〜3候補いただけますと幸いです。

何卒よろしくお願いいたします。`;
}

async function generateConcerns(candidate) {
    await delay(700);
    return `【${candidate.name || '候補者'}様の懸念点と確認質問】

■ 懸念点（根拠付き）

1. ${(candidate.negativeChecks || [])[0] || '転職回数'}について
   → ご経歴を拝見すると、この点が見られます。長期就業への意向を確認する必要があります。

2. コミュニケーションスタイルの確認
   → 面談時の印象と実務でのスタイルに差がないか確認が必要です。

3. 希望条件の柔軟性
   → 条件が固定的な場合、マッチする求人が限定される可能性があります。

■ 確認質問（5つ）

1. 「これまでの転職理由について、改めてお聞かせいただけますか？」
2. 「チームで仕事をする際、どのような役割を担うことが多いですか？」
3. 「希望年収・勤務条件について、優先順位をつけるとしたら？」
4. 「5年後のキャリアイメージを教えてください」
5. 「弊社から紹介した求人で、特に気になる点はありますか？」`;
}

async function generateHireability(candidate) {
    await delay(600);
    return `【${candidate.name || '候補者'}様の決まりやすさ分析】

■ 市場評価サマリ
市場決まりやすさスコア：${candidate.marketScore || 75}%
（${(candidate.marketScore || 75) >= 70 ? '⭐ 高評価' : '標準的な評価'}）

■ 決まりやすい理由

【市場要因】
・${candidate.jobType || '専門領域'}の人材需要は現在高い状態が続いています
・${(candidate.hardSkills || []).join('、') || 'マルチスキル'}は複数業界で求められます
・希望年収帯が市場相場と合致しており、条件面でのミスマッチが起きにくいです

【候補者の強み】
・ソフトスキル面で「${(candidate.softSkills || [])[0] || '協調性'}」が評価されやすい
・${candidate.preferences?.remote ? 'リモート対応可能な柔軟性' : '出社可能エリアの広さ'}がプラス材料

■ 推奨シナリオ
1. まず2〜3社への同時応募で市場反応を確認
2. 1次面接後に希望条件の微調整を提案
3. 内定獲得後、条件交渉で上積みを狙う

平均的な決定期間：2〜4週間と予測`;
}

async function generateChatResponse(message) {
    await delay(500);
    return `ご質問ありがとうございます。

現在、以下のサポートが可能です：

📝 **候補者に関するサポート**
・スカウトメッセージの作成
・懸念点と確認質問の整理
・決まりやすい理由の分析

📋 **求人に関するサポート**
・求人票の改善提案
・応募が増える表現への修正

💡 **使い方のヒント**
候補者や求人を選択した状態で質問いただくと、より具体的なアドバイスが可能です。

何かお手伝いできることはありますか？`;
}

// 企業向け提案文生成
async function generateProposalText(candidate) {
    await delay(700);
    return `【${candidate.name || '候補者'}様のご推薦】

■ 推薦理由
${candidate.jobType || '専門領域'}において${candidate.experience || '複数年'}の経験を持つ即戦力候補者です。特に${(candidate.hardSkills || []).slice(0, 2).join('・') || '専門スキル'}に強みを持っており、貴社の求める人物像に合致すると考えております。

■ 強み・特筆事項
・${(candidate.matchReasons || ['業界経験が豊富'])[0]}
・${(candidate.softSkills || ['協調性'])[0]}を活かしたコミュニケーション
・${candidate.preferences?.remote ? 'リモートワークにも柔軟に対応可能' : '出社可能エリアが広い'}

■ 現職・転職理由
${candidate.resume?.summary || '詳細な経歴については面談時にご説明いたします。'}

■ 希望条件との整合性
・年収：${candidate.preferences?.salary || '相談可能'}（市場相場と合致）
・勤務地：${candidate.preferences?.location || '首都圏'}
・その他：${candidate.preferences?.remote ? 'リモート勤務希望あり' : '出社可能'}

■ 懸念点・補足
${(candidate.negativeChecks || []).length > 0 ? candidate.negativeChecks.join('・') : '特に大きな懸念点はございません。'}

ぜひ一度、カジュアル面談の機会をいただければ幸いです。`;
}

// 決定シナリオ生成
async function generateDecisionScenario(candidate) {
    await delay(600);
    const marketScore = candidate.marketScore || 75;
    return `【${candidate.name || '候補者'}様の決定シナリオ】

■ 市場評価
決まりやすさ：${marketScore}%（${marketScore >= 70 ? '高い' : '標準的'}）

■ 推奨アクション

【1週目】
・本日中に2〜3社へ書類提出
・${candidate.jobType || '専門領域'}の求人を優先的に提案
・年収レンジ${candidate.preferences?.salary || '相談可'}を軸に選定

【2週目】
・1次面接の実施（想定通過率：70%）
・面接後の温度感ヒアリング
・希望条件の微調整検討

【3〜4週目】
・2次面接〜最終面接
・内定条件の交渉サポート
・入社意向の最終確認

■ 決定を早めるポイント
・${(candidate.softSkills || ['協調性'])[0]}を面接でアピールすることで企業の印象UP
・${candidate.preferences?.remote ? 'リモート対応可能な点' : '柔軟な出社対応'}が差別化要因に
・競合候補者との差別化として${(candidate.hardSkills || ['専門スキル'])[0]}を強調

■ リスク要因
${(candidate.negativeChecks || []).length > 0 ? candidate.negativeChecks.join('、') + 'への対策が必要' : '特段のリスクなし。複数社並行で進めることを推奨。'}

予想決定期間：2〜4週間`;
}

// ==========================================
// Job AI Stub Functions
// ==========================================

// 求人でマッチしそうな人の特徴
async function generateJobMatchAdvice(job) {
    await delay(500);
    const title = job?.title || '求人';
    const skills = job?.requiredSkills || [];
    return `【${title}】にマッチしそうな人の特徴

✅ **必須条件**
${skills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

✅ **適性が高い人物像**
・自走力があり、裁量を持って業務を進められる方
・変化を楽しめる柔軟性を持つ方
・${job?.companyInfo?.culture ? 'カルチャー：' + job.companyInfo.culture.slice(0, 30) + '...' : 'チームでの協調性を重視できる方'}

✅ **刺さりやすいキーワード**
・「成長環境」「裁量」「スピード感」
・「事業インパクト」「経験の幅」
${job?.conditions?.remote ? '・「リモートワーク」「柔軟な働き方」' : ''}

💡 **スカウト時のポイント**
上記キーワードを職務経歴書に持つ方を優先的にアプローチすると効率的です。`;
}

// 求人を決まりやすくするためのポイント
async function generateJobSuccessAdvice(job) {
    await delay(500);
    const title = job?.title || '求人';
    return `【${title}】を決まりやすくするためのポイント

🎯 **内定率を上げる3つの施策**

**1. 候補者への訴求ポイントを明確化**
・年収だけでなく「成長環境」「裁量」など非金銭的価値を言語化
・実際の社員キャリアパス事例を紹介できると◎
${job?.attractionPoints ? `・魅力ポイント：${job.attractionPoints.join('、')}` : ''}

**2. 選考スピードの改善**
・書類選考〜1次面接は3営業日以内が理想
・最終面接〜内定は1週間以内を目指す
・「他社選考中」の候補者には即レスポンスを

**3. 条件の柔軟性を事前確認**
・年収レンジの上限付近での交渉可否
・入社日の調整余地
・${job?.conditions?.remote ? 'リモート頻度の調整' : '勤務地の柔軟性'}

📊 **この求人の決まりやすさ予測**
${job?.hasStar ? '⭐ 高い（市場ニーズと条件が合致）' : '📈 標準的（競合求人との差別化がカギ）'}

${job?.hasStar ? '' : '💡 条件面の改善（年収+50万、リモート可など）で決まりやすさが大幅UP'}`;
}

// 求人票のブラッシュアップポイント
async function generateJobBrushupAdvice(jobDescription) {
    await delay(500);
    return `✨ **求人票ブラッシュアップのポイント**

**1. 「誰が」「何を」「どう」を明確に**
・ターゲット像（経験年数、スキルレベル）を具体化
・任せたいミッションを3つ程度に絞って記載
・入社後3ヶ月/1年後のイメージを描けるように

**2. 魅力の「言語化」**
・「成長できる環境」→具体的なキャリアパス事例に
・「裁量がある」→どんな意思決定を任せるのかを例示
・「チームの雰囲気が良い」→どんな人が活躍しているかで表現

**3. 条件面の透明性**
・年収レンジは幅を持たせつつ、どこが中央値かを明示
・リモート可否/頻度、残業時間の実態を正直に
・選考フローと期間を明記

**4. 差別化ポイントを冒頭に**
・競合他社にない魅力を最初の3行で伝える
・具体的な数字（成長率、調達額、顧客数など）があると◎

${jobDescription ? `\n📝 **入力された求人内容の改善案**\n・タイトルに「年収」「リモート」などのキーワードを追加すると応募率UP` : ''}`;
}

// 打ち合わせメモから求人情報を構成
async function processJobMeetingMemo(memo) {
    await delay(800);
    return {
        title: 'AIが抽出した求人タイトル（確認してください）',
        description: `【ポジションの概要】
打ち合わせメモから抽出した情報を構造化しています。

【募集背景】
事業拡大に伴う増員募集

【業務内容】
・メモに記載された業務内容をここに反映
・具体的なタスクやミッション

【必須条件】
・メモから抽出したスキル要件
・経験年数など

【歓迎条件】
・あれば嬉しいスキルや経験

【このポジションの魅力】
・メモから読み取れる魅力ポイント`,
        salary: '応相談',
        aiMessage: `📝 打ち合わせメモから以下の情報を抽出しました：

・**ポジション**: メモの内容を確認して修正してください
・**必須スキル**: メモから読み取れる要件を反映
・**魅力ポイント**: 企業の強みを言語化

内容を確認・修正の上、保存してください。`
    };
}

// ポップアップ用コンテキスト認識AIレスポンス
async function generateModalAiResponse(message, candidate) {
    await delay(600);

    if (!candidate) {
        return '候補者が選択されていません。候補者を選択してから質問してください。';
    }

    const lowerMessage = message.toLowerCase();
    const currentSalary = candidate.currentAnnualIncome || 500;
    const preferredSalary = candidate.preferences?.salary || '相談可';
    const jobType = candidate.jobType || '専門職';
    const name = candidate.name || '候補者';

    // 年収・給与に関する質問
    if (lowerMessage.includes('年収') || lowerMessage.includes('給与') || lowerMessage.includes('提示') || lowerMessage.includes('いくら')) {
        // 候補者の志向性を分析
        const isGrowthOriented = candidate.softSkills?.some(s =>
            s.includes('成長') || s.includes('チャレンジ') || s.includes('挑戦')
        );
        const isStabilityOriented = candidate.softSkills?.some(s =>
            s.includes('安定') || s.includes('ワークライフ') || s.includes('バランス')
        );
        const isCareerOriented = candidate.personalityMemo?.includes('キャリア') ||
            candidate.personalityMemo?.includes('裁量');

        let recommendation;
        let reasoning;

        if (isGrowthOriented || isCareerOriented) {
            recommendation = `現年収 ${currentSalary}万円 + 50〜100万円（${currentSalary + 50}〜${currentSalary + 100}万円）`;
            reasoning = `${name}さんは成長志向・キャリア志向が強いタイプです。年収アップを提示することで、「この転職でステップアップできる」という実感を与えられます。`;
        } else if (isStabilityOriented) {
            recommendation = `現年収維持〜微増（${currentSalary}〜${currentSalary + 30}万円）`;
            reasoning = `${name}さんはワークライフバランスや安定性を重視するタイプです。年収よりも働き方や環境を訴求するほうが効果的。無理に年収を上げるより、リモートや残業の少なさをアピールしましょう。`;
        } else {
            recommendation = `現年収 + 30〜50万円（${currentSalary + 30}〜${currentSalary + 50}万円）`;
            reasoning = `${name}さんの希望条件「${preferredSalary}」と市場相場を踏まえると、現年収から小幅アップが交渉しやすいラインです。`;
        }

        return `💰 **${name}さんへの年収提示アドバイス**

📊 **推奨提示額**: ${recommendation}

💡 **理由**:
${reasoning}

🎯 **交渉のポイント**:
・初回提示はレンジの下限から伝え、交渉の余地を残す
・年収以外の条件（リモート、フレックス、SO等）も組み合わせて提案
・「御社の期待に応えられれば昇給の可能性も」と将来性を示唆

⚠️ **注意点**:
・現年収${currentSalary}万円を下回る提示は避けてください（離脱リスク高）
・競合他社の選考状況も確認しておくと良いです`;
    }

    // 交渉・クロージングに関する質問
    if (lowerMessage.includes('交渉') || lowerMessage.includes('クロージング') || lowerMessage.includes('内定') || lowerMessage.includes('承諾')) {
        return `🤝 **${name}さんとの交渉・クロージング戦略**

**この候補者の決め手になりそうなポイント**:
${candidate.softSkills?.slice(0, 2).map(s => `・${s}を活かせる環境`).join('\n') || '・キャリアアップの機会'}

**アプローチ方法**:
1. **スピード感を持つ**: 市場スコア${candidate.marketScore || 75}%は競合も狙っている可能性大
2. **条件面より「やりがい」を語る**: ${candidate.personalityMemo?.slice(0, 30) || '成長志向'}の傾向あり
3. **不安を先回りして解消**: 転職への懸念があれば面談で丁寧にフォロー

**NGアクション**:
・決断を急かしすぎる（信頼を損なう）
・年収だけで釣ろうとする（ミスマッチの原因に）`;
    }

    // 志望動機・モチベーションに関する質問
    if (lowerMessage.includes('志望') || lowerMessage.includes('動機') || lowerMessage.includes('なぜ') || lowerMessage.includes('理由')) {
        return `🎯 **${name}さんの転職動機分析**

**推測される転職理由**:
${candidate.resume?.summary ? `プロフィールから読み取れる志向: ${candidate.resume.summary.slice(0, 100)}...` : '・キャリアアップ\n・新しい挑戦\n・環境改善'}

**面談で確認すべき質問**:
1. 「今の職場で一番不満に感じていることは？」
2. 「次の職場で絶対に実現したいことは？」
3. 「5年後、どんな自分になっていたい？」

**響きやすいアピールポイント**:
${candidate.softSkills?.map(s => `・${s}を活かせる環境がある`).join('\n') || '・成長できる環境\n・裁量を持てるポジション'}`;
    }

    // 面談・面接に関する質問
    if (lowerMessage.includes('面談') || lowerMessage.includes('面接') || lowerMessage.includes('質問')) {
        return `📋 **${name}さんの面談で確認すべきポイント**

**必須確認事項**:
1. 転職の本気度と時期感
2. 他社選考状況（競合の有無）
3. 年収以外の優先条件

**深掘り質問（5つ）**:
1. 「${jobType}の経験の中で、最もやりがいを感じたプロジェクトは？」
2. 「チームで働く際、どんな役割を担うことが多い？」
3. 「理想の上司像・チーム像を教えてください」
4. 「今回の転職で妥協できない条件は？」
5. 「弊社からの提案で気になる点は？」

**ネガティブチェック項目**:
${candidate.negativeChecks?.map(n => `・${n}`).join('\n') || '・転職回数の背景\n・短期離職リスク'}`;
    }

    // スキル・経験に関する質問
    if (lowerMessage.includes('スキル') || lowerMessage.includes('経験') || lowerMessage.includes('強み')) {
        return `💪 **${name}さんのスキル・強み分析**

**ハードスキル**:
${candidate.hardSkills?.map(s => `・${s}`).join('\n') || '・専門スキル（詳細未登録）'}

**ソフトスキル**:
${candidate.softSkills?.map(s => `・${s}`).join('\n') || '・コミュニケーション力（評価中）'}

**市場評価**: 決まりやすさスコア ${candidate.marketScore || 75}%
${(candidate.marketScore || 75) >= 70 ? '⭐ 複数企業からオファーが期待できる人材です' : '標準的な評価。適切な求人マッチで内定獲得可能'}

**アピールポイントの言語化**:
「${jobType}領域で${candidate.experience || '5年'}の経験を持ち、特に${candidate.hardSkills?.[0] || '専門スキル'}に強みがあります」`;
    }

    // デフォルト（自由な質問への対応）
    return `ご質問ありがとうございます。

📋 **${name}さん（${jobType}）についてお答えします**

現在の情報:
・マッチ度: ${candidate.matchScore || 80}%
・市場スコア: ${candidate.marketScore || 75}%
・現年収: ${currentSalary}万円
・希望条件: ${preferredSalary}

より具体的にお答えするには、以下のような質問をお試しください:
・「年収はいくらで提示すべき？」
・「この人の強みは？」
・「面談で何を確認すべき？」
・「クロージングのポイントは？」`;
}

// ==========================================
// Dummy Data
// ==========================================
const dummyCandidates = [
    {
        candidateKey: generateUUID(), name: '山田 花子', jobType: '採用・人事', experience: '6年',
        hardSkills: ['採用', 'PM', 'UI/UX設計'], softSkills: ['論理性', '主体性', 'コミュニケーション力'],
        negativeChecks: [], marketScore: 82, matchScore: 88, matchLabel: 'かなり相性が良い',
        matchReasons: ['採用領域での豊富な実務経験', 'PM・プロダクト企画のスキル', 'スタートアップでの成長意欲'],
        preferences: { salary: '500万〜700万円', remote: true, location: '東京都' },
        resume: { summary: '大手人材サービス企業での新卒採用・採用支援営業を経て、新卒領域PMOを担当。コミュニケーション能力が高く、周囲を巻き込みながら推進する力がある。年間100名規模の採用実績あり。' },
        currentAnnualIncome: 550, saved: false,
        personalityMemo: 'コミュニケーション能力が高く、論理的に物事を整理し、設計から実行まで一気通貫で進められるタイプ。周囲を巻き込みながら推進する力があり、組織横断のプロジェクトにも適性が高い。ベンチャーマインドあり。',
        marketReasons: ['採用・人事領域の経験者は高い需要があり、特に採用広報や制度設計までかかわれる人材は希少', 'PM経験があるため、採用以外のキャリアパスも開ける', '給与レンジが市場相場と合致しており、複数社から内定が出る可能性が高い'],
        createdAt: '2024-03-18T10:00:00Z'
    },
    {
        candidateKey: generateUUID(), name: '佐藤 太郎', jobType: '財務・経理', experience: '22年',
        hardSkills: ['財務', '経理', '監査対応', '銀行交渉'], softSkills: ['正確性', '柔軟性', 'メンタルが強い'],
        negativeChecks: ['年齢層が高め'], marketScore: 68, matchScore: 75, matchLabel: '相性が良い',
        matchReasons: ['財務経理の幅広い実務経験', 'マネジメント経験が豊富', '複数業界での経験'],
        preferences: { salary: '600万〜800万円', remote: false, location: '東京都' },
        resume: { summary: '会計事務所・事業会社等で約20年以上、財務経理に従事。決算業務から銀行折衝、監査対応まで幅広く経験。部下10名のマネジメント経験があり、チーム統括力がある。メンタルが強く、困難な状況でも冷静に対応できる。' },
        currentAnnualIncome: 750, saved: true,
        personalityMemo: 'メンタルが強く、経験豊富で安定感があり、積み重ねてきた知見を確実に活かせるタイプ。変化の早いスタートアップよりも、体制が整った中堅以上の企業でのフィットが高い。年齢面で懸念を持つ企業もあるため、提案先は選定が必要。',
        marketReasons: ['経理・財務の経験者は常に安定した需要がある', 'マネジメント経験がプラス評価されるケースが多い', '年齢を考慮しても、即戦力として評価される可能性は十分あり'],
        createdAt: '2024-03-10T09:00:00Z'
    },
    {
        candidateKey: generateUUID(), name: '鈴木 一郎', jobType: '営業', experience: '8年',
        hardSkills: ['法人営業', 'MA', 'CRM'], softSkills: ['はきはき', '協調性', '粘り強さ'],
        negativeChecks: ['転職回数が多い'], marketScore: 71, matchScore: 72, matchLabel: '相性が良い',
        matchReasons: ['法人営業の豊富な経験', 'MAツールの活用経験', 'チームでの協調性'],
        preferences: { salary: '450万〜600万円', remote: true, location: '首都圏' },
        resume: { summary: 'IT系企業を中心に法人営業を8年経験。SaaSプロダクトの新規開拓から既存顧客のアップセルまで幅広く担当。Salesforceの導入・運用経験もあり。数字へのコミットメントが強い。' },
        currentAnnualIncome: 520, saved: false,
        personalityMemo: '明るく元気があり、初対面でも信頼感を得やすいタイプ。目標達成への執念が強く、粘り強く取り組める。一方で転職回数が気になる点。長期就業への意向を確認することが重要。コミュニケーション能力高い。',
        marketReasons: ['営業職は常に高い需要があり、特にSaaS経験者は市場価値が高い', 'MAツールの活用経験があるため、即戦力として評価されやすい', '転職回数はマイナス要因だが、実績でカバーできる範囲'],
        createdAt: '2024-03-15T11:00:00Z'
    },
    {
        candidateKey: generateUUID(), name: '田中 美咲', jobType: 'マーケティング', experience: '5年',
        hardSkills: ['デジタルマーケ', 'SNS運用', 'Tableau'], softSkills: ['創造性', 'スピード感'],
        negativeChecks: [], marketScore: 78, matchScore: 81, matchLabel: 'かなり相性が良い',
        matchReasons: ['デジタルマーケティングの実績', 'データドリブンなアプローチ', '成長意欲が高い'],
        preferences: { salary: '400万〜550万円', remote: true, location: '東京都' },
        resume: { summary: 'EC企業でデジタルマーケティングを5年経験。SNS運用からWeb広告、データ分析まで一貫して担当。Tableauでのダッシュボード構築が得意。施策のPDCAを高速で回した経験あり。' },
        currentAnnualIncome: 480, saved: true,
        personalityMemo: 'アイデアが豊富で、新しい施策を積極的に提案できるタイプ。スピード感があり、試行錯誤を恐れない。一方で、深い分析よりもスピードを優先する傾向があるため、組織によってはフィットしない可能性も。ベンチャーマインドがとても強い。',
        marketReasons: ['デジタルマーケ領域の経験者は高い需要がある', 'データ分析スキルがあるため、幅広いポジションで評価される', '年齢が若く、成長ポテンシャルを評価されやすい'],
        createdAt: '2024-03-19T14:00:00Z'
    },
    {
        candidateKey: generateUUID(), name: '高橋 健太', jobType: 'エンジニア', experience: '7年',
        hardSkills: ['JavaScript', 'TypeScript', 'React', 'AWS'], softSkills: ['論理性', '自走力', 'メンタルが強い'],
        negativeChecks: ['コミュニケーション面で改善余地'], marketScore: 85, matchScore: 79, matchLabel: '相性が良い',
        matchReasons: ['フロントエンド技術に強み', 'クラウド経験もあり幅広く対応可能', '自走して開発を進められる'],
        preferences: { salary: '600万〜900万円', remote: true, location: 'フルリモート可' },
        resume: { summary: 'Web系企業でフロントエンド開発を中心に7年の経験。React/TypeScriptを用いた大規模SPA開発に従事。メンタルが強く、困難なプロジェクトでも粘り強くやり抜く姿勢がある。' },
        currentAnnualIncome: 700, saved: false,
        personalityMemo: 'メンタルが強く、技術への探求心が強く、自分で調べて解決できる自走型。一方で、チームでのコミュニケーションよりも個人で黙々と進めるタイプのため、チームワーク重視の環境ではフィット確認が必要。',
        marketReasons: ['フロントエンドエンジニアは市場で非常に高い需要がある', 'React/TypeScriptの経験があるため、複数社からオファーが期待できる', '年収帯も市場相場と合致しており、マッチングしやすい'],
        createdAt: '2024-03-20T08:00:00Z'
    }
];

// Add more candidates - Should条件キーワードを分散配置
const softSkillPool = ['コミュニケーション力', 'メンタルが強い', 'ベンチャーマインド', '協調性', '論理性', '主体性', 'リーダーシップ', '粘り強さ', '柔軟性', '創造性'];
const shouldKeywords = ['コミュニケーション力', 'メンタルが強い', 'ベンチャーマインド'];
['伊藤 さくら', '渡辺 誠', '中村 陽子', '小林 大輔', '加藤 あゆみ', '吉田 翔', '山本 愛', '中島 拓也', '松本 理恵', '井上 雄太', '木村 千夏', '林 健一', '斉藤 梨花', '清水 俊介', '森 美穂'].forEach((name, i) => {
    const jobTypes = ['経理', 'PM', 'カスタマーサクセス', '総務', 'デザイナー', '営業', '人事', 'マーケティング', 'エンジニア', '企画', '経理', 'PdM', '広報', 'エンジニア', '管理職'];
    const score = 50 + Math.floor(Math.random() * 40);
    const salaryBase = 400 + Math.floor(Math.random() * 400);
    // Should条件キーワードを3人に1つずつ割り当て（i%3でローテーション）
    const primarySkill = shouldKeywords[i % 3];
    const secondarySkill = softSkillPool[(i + 4) % softSkillPool.length];
    dummyCandidates.push({
        candidateKey: generateUUID(), name, jobType: jobTypes[i], experience: `${3 + i % 10}年`,
        hardSkills: ['スキル1', 'スキル2'],
        softSkills: [primarySkill, secondarySkill],
        negativeChecks: i % 3 === 0 ? ['要確認事項あり'] : [],
        marketScore: 60 + Math.floor(Math.random() * 30),
        matchScore: score, matchLabel: getMatchLabel(score),
        matchReasons: [`${jobTypes[i]}領域での経験`, 'スキルがマッチ', '成長意欲あり'],
        preferences: { salary: `${salaryBase}万〜${salaryBase + 150}万円`, remote: i % 2 === 0, location: '首都圏' },
        resume: { summary: `${jobTypes[i]}領域で${3 + i % 10}年の経験。実務を通じて値値の様々なスキルを習得。チームでの協調性が強み。` },
        currentAnnualIncome: salaryBase,
        saved: i % 4 === 0,
        personalityMemo: `${primarySkill}を強みとするタイプ。${jobTypes[i]}領域での経験を活かし、成果を出せる環境を求めている。`,
        marketReasons: [`${jobTypes[i]}領域の需要は安定`, 'スキルセットが市場にマッチ', '給与レンジも現実的'],
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
    });
});

const dummyJobs = [
    {
        jobKey: generateUUID(), title: '経理（メンバー）｜20代歓迎｜経理×財務×経営', company: 'A社（成長IT企業）',
        description: '経理業務全般をお任せします。将来的には財務・経営企画へのキャリアパスもあります。',
        highlights: ['裁量が大きく成長できる', 'フルフレックス制度', '育成重視'],
        conditions: { salary: '350万〜500万円', remote: true, location: '東京都内' },
        requiredSkills: ['経理実務2〜3年', '簿記3級以上'], hasStar: true,
        starReason: 'リモートワーク対応、フルフレックス制度で柔軟', savedCandidateKeys: [],
        companyInfo: {
            founded: '2018年',
            employees: '85名',
            business: 'クラウド会計ソフトの開発・販売',
            culture: 'フラットな組織で若手にも責任あるポジションを任せる風土。失敗を恐れずチャレンジできる環境。',
            industry: 'IT・SaaS'
        },
        attractionPoints: ['経理だけでなく財務・経営企画へのキャリアパスあり', '20代で管理職になった実績あり', '働き方の柔軟性が高い'],
        requirements: ['日商簿記3級以上', '経理実務経験2年以上', 'Excel中級以上'],
        proposedCount: 3, savedCount: 5
    },
    {
        jobKey: generateUUID(), title: '事務長（多店舗マネジメント経験者向け）', company: 'B社（医療・ヘルスケア）',
        description: 'サービス業で培ったマネジメント力を医療現場で活かすポジションです。',
        highlights: ['サービス業経験が活かせる', '医療業界未経験OK', 'キャリアパスあり'],
        conditions: { salary: '400万〜600万円', remote: false, location: '首都圏（千葉県内）' },
        requiredSkills: ['10名以上のマネジメント経験'], hasStar: false,
        starReason: 'シフト制のため柔軟性に欠ける', savedCandidateKeys: [],
        companyInfo: {
            founded: '2005年',
            employees: '320名',
            business: '訪問看護ステーション・デイサービス運営',
            culture: '患者様第一の精神を大切にしながら、スタッフの働きやすさも重視。チームワークを大切にする社風。',
            industry: '医療・ヘルスケア'
        },
        attractionPoints: ['異業種からの転職実績多数', '研修制度が充実', '将来的にエリアマネージャーへのステップアップ可能'],
        requirements: ['10名以上のマネジメント経験', 'サービス業での店舗運営経験', '普通自動車免許'],
        proposedCount: 1, savedCount: 2
    },
    {
        jobKey: generateUUID(), title: 'フロントエンドエンジニア｜React/TypeScript', company: 'C社（SaaSスタートアップ）',
        description: '自社SaaSプロダクトのフロントエンド開発を担当。モダンな技術スタックで開発できます。',
        highlights: ['フルリモート可', '技術選定に関われる', 'モダンな技術スタック'],
        conditions: { salary: '600万〜900万円', remote: true, location: 'フルリモート' },
        requiredSkills: ['React経験3年以上', 'TypeScript実務'], hasStar: true,
        starReason: '年収が市場水準より高く、フルリモート対応', savedCandidateKeys: [],
        companyInfo: {
            founded: '2020年',
            employees: '45名',
            business: 'HR TechのSaaSプロダクト開発・提供',
            culture: 'エンジニア主導の文化。技術的負債を許さず、常に最新技術を追求。リモートファーストでグローバルなチーム構成。',
            industry: 'IT・SaaS'
        },
        attractionPoints: ['最新技術スタックでの開発', 'ストックオプション付与', 'シリーズB調達済みで安定基盤'],
        requirements: ['React経験3年以上', 'TypeScript実務経験', 'Git/GitHub経験', 'アジャイル開発経験'],
        proposedCount: 5, savedCount: 8
    },
    {
        jobKey: generateUUID(), title: 'カスタマーサクセス（リーダー候補）', company: 'D社（BtoB SaaS）',
        description: 'エンタープライズ顧客のオンボーディング、チャーン防止施策の企画・実行を担当。',
        highlights: ['リーダー候補としての採用', '成長中のSaaS企業', 'プロダクトへの影響力'],
        conditions: { salary: '500万〜700万円', remote: true, location: '東京都（週2出社）' },
        requiredSkills: ['CS経験2年以上', 'BtoB SaaS経験'], hasStar: true,
        starReason: 'リモート対応、SO付与', savedCandidateKeys: [],
        companyInfo: {
            founded: '2017年',
            employees: '120名',
            business: '営業支援SaaSプロダクトの開発・提供',
            culture: 'カスタマー起点のプロダクト開発を重視。顧客の声を直接プロダクトに反映できる環境。',
            industry: 'IT・SaaS'
        },
        attractionPoints: ['1年以内にチームリーダーへ昇格可能', '顧客のビジネス成果に直接貢献できる', 'プロダクト開発チームとの距離が近い'],
        requirements: ['カスタマーサクセス経験2年以上', 'BtoB SaaS企業での勤務経験', '顧客折衝経験'],
        proposedCount: 2, savedCount: 4
    },
    {
        jobKey: generateUUID(), title: '採用担当（新卒・中途）｜人事制度にも関われる', company: 'E社（メガベンチャー）',
        description: '新卒・中途採用の企画・運営から、将来的には人事制度設計にも参画可能。',
        highlights: ['採用から制度設計まで', '経営陣との距離が近い', '裁量が大きい'],
        conditions: { salary: '450万〜650万円', remote: true, location: '東京都' },
        requiredSkills: ['採用実務経験2年以上'], hasStar: false,
        starReason: '年収レンジが市場並み', savedCandidateKeys: [],
        companyInfo: {
            founded: '2012年',
            employees: '450名',
            business: 'EC・決済プラットフォームの運営',
            culture: 'スピード感を重視しつつも、社員の成長を第一に考える文化。挑戦を推奨し失敗を許容する風土。',
            industry: 'IT・EC'
        },
        attractionPoints: ['採用だけでなく人事制度設計にも関わるチャンス', '経営陣と直接コミュニケーションできる環境', '急成長企業でのキャリア構築'],
        requirements: ['採用実務経験2年以上', '新卒採用または中途採用の企画経験', 'コミュニケーション能力'],
        proposedCount: 4, savedCount: 6
    }
];

const dummyProposals = [
    {
        proposalKey: generateUUID(), candidateKey: 'cand-yamada-hanako', jobKey: 'job-001',
        candidateName: '山田 花子', jobTitle: '採用担当', status: '提案済み',
        memo: '書類選考通過。来週中に1次面接を設定予定。', lastUpdatedAt: '2026-01-11T10:00:00Z',
        nextActionAt: '2026-01-15T10:00:00Z', nextAction: '1次面接日程調整', history: []
    },
    {
        proposalKey: generateUUID(), candidateKey: 'cand-suzuki-ichiro', jobKey: 'job-002',
        candidateName: '鈴木 一郎', jobTitle: 'カスタマーサクセス', status: '一次面接',
        memo: '1次面接完了。好感触。2次面接に進む見込み。', lastUpdatedAt: '2024-03-20T16:00:00Z',
        nextActionAt: '2024-03-21T10:00:00Z', nextAction: '2次面接調整', history: []
    },
    {
        proposalKey: generateUUID(), candidateKey: 'cand-takahashi-kenta', jobKey: 'job-003',
        candidateName: '高橋 健太', jobTitle: 'フロントエンドエンジニア', status: '一次面接',
        memo: '技術面は申し分なし。カルチャーフィット確認が重要。', lastUpdatedAt: '2024-03-20T09:00:00Z',
        nextActionAt: '2024-03-22T14:00:00Z', nextAction: '1次面接', history: []
    },
    {
        proposalKey: generateUUID(), candidateKey: 'cand-ito-sakura', jobKey: 'job-001',
        candidateName: '伊藤 さくら', jobTitle: '経理', status: '決定',
        memo: '内定承諾！4月入社予定。', lastUpdatedAt: '2024-03-16T17:00:00Z', nextActionAt: null, nextAction: '', history: []
    },
    {
        proposalKey: generateUUID(), candidateKey: 'cand-tanaka-misaki', jobKey: 'job-001',
        candidateName: '田中 美咲', jobTitle: '採用担当', status: '提案済み',
        memo: 'マーケ経験を採用広報に活かせる可能性。', lastUpdatedAt: '2024-03-17T10:00:00Z',
        nextActionAt: '2024-03-24T10:00:00Z', nextAction: '返信確認', history: []
    }
];

// ==========================================
// Data Initialization
// ==========================================
function initializeData() {
    // データバージョンを確認して不一致なら強制リフレッシュ
    const DATA_VERSION = 'v5';
    const storedVersion = localStorage.getItem('matchAppDataVersion');

    if (storedVersion !== DATA_VERSION || storage.getCandidates().length === 0) {
        console.log('Refreshing demo data (version:', DATA_VERSION, ')...');
        storage.saveCandidates(dummyCandidates);
        storage.saveJobs(dummyJobs);
        storage.saveProposals(dummyProposals);
        localStorage.setItem('matchAppDataVersion', DATA_VERSION);
        console.log('Demo data refreshed!');
    } else {
        console.log('Data already up to date (version:', DATA_VERSION, ')');
    }
}

// ==========================================
// App State
// ==========================================
const state = {
    currentTab: 'candidate-search',
    selectedCandidate: null,
    selectedJob: null,
    selectedCandidates: new Set(),
    filters: { jobType: '', remote: false, saved: false, sort: 'matchScore', experience: '' },
    shouldConditions: [], // Should条件（AIパネルからの絞り込み）
    searchHistory: [], // 検索履歴（最大5件）
    savedViews: [] // 保存された検索条件
};

// ==========================================
// Main Application
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    initializeUI();
    renderCurrentTab();
});

function initializeUI() {
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    initSettingsEventListeners();

    // Modals
    document.getElementById('modalBackdrop').addEventListener('click', closeAllModals);
    document.getElementById('closeCandidateModal').addEventListener('click', () => closeModal('candidateModal'));
    document.getElementById('closeJobModal').addEventListener('click', () => closeModal('jobModal'));
    document.getElementById('closeAddJobModal').addEventListener('click', () => closeModal('addJobModal'));

    // Search
    const searchInput = document.getElementById('candidateSearchInput');
    searchInput.addEventListener('input', debounce(() => renderCandidates(), 300));

    // Example chips
    document.querySelectorAll('#candidateExampleChips .example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            searchInput.value = chip.dataset.query;
            renderCandidates();
        });
    });

    // Filters
    document.getElementById('filterJobType').addEventListener('change', (e) => {
        state.filters.jobType = e.target.value;
        renderCandidates();
    });

    document.getElementById('filterRemote').addEventListener('click', (e) => {
        state.filters.remote = !state.filters.remote;
        e.target.classList.toggle('active', state.filters.remote);
        renderCandidates();
    });

    // 保存済みフィルタ
    document.getElementById('filterSaved')?.addEventListener('click', (e) => {
        state.filters.saved = !state.filters.saved;
        e.target.classList.toggle('active', state.filters.saved);
        renderCandidates();
    });

    // 経験年数フィルタ
    document.getElementById('filterExperience')?.addEventListener('change', (e) => {
        state.filters.experience = e.target.value;
        renderCandidates();
    });

    document.getElementById('sortCandidates').addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        renderCandidates();
    });

    // 検索条件保存
    document.getElementById('saveSearchBtn')?.addEventListener('click', saveSearchCondition);

    // Job select
    document.getElementById('jobSelect').addEventListener('change', selectJob);
    document.getElementById('addJobBtn').addEventListener('click', () => openModal('addJobModal'));
    document.getElementById('saveNewJob').addEventListener('click', saveNewJob);

    // 求人タブのソート
    document.getElementById('sortJobCandidates')?.addEventListener('change', renderJobCandidates);

    // 求人詳細ボタン
    document.getElementById('viewJobDetailBtn')?.addEventListener('click', () => {
        if (state.selectedJob) showJobDetailModal(state.selectedJob.jobKey);
    });

    // 求人詳細ポップアップのAIボタン
    document.querySelectorAll('.job-modal-ai-btn').forEach(btn => {
        btn.addEventListener('click', () => handleJobModalAI(btn.dataset.action));
    });
    document.getElementById('jobModalAiSendBtn')?.addEventListener('click', () => {
        const input = document.getElementById('jobModalAiInput');
        if (input.value.trim()) {
            handleJobModalAI(input.value.trim());
            input.value = '';
        }
    });
    document.getElementById('searchJobCandidatesBtn')?.addEventListener('click', () => {
        closeModal('jobModal');
        if (state.currentTab !== 'job-search') switchTab('job-search');
        renderJobCandidates();
    });

    // 求人追加ポップアップのAIボタン
    document.querySelectorAll('.add-job-ai-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAddJobAI(btn.dataset.action));
    });
    document.getElementById('addJobAiSendBtn')?.addEventListener('click', () => {
        const input = document.getElementById('addJobAiInput');
        if (input.value.trim()) {
            handleAddJobAI(input.value.trim());
            input.value = '';
        }
    });
    document.getElementById('processJobMemoBtn')?.addEventListener('click', handleProcessJobMemo);

    // Chat
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    });

    // Quick actions
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
    });

    // Proposal filter
    document.getElementById('filterProposalStatus').addEventListener('change', () => {
        proposalsState.filteredKeys = null;  // AIフィルタをリセット
        renderProposals();
    });

    // Export
    document.getElementById('exportCandidatesBtn').addEventListener('click', () => downloadJSON(storage.getCandidates(), 'candidates.json'));

    // 一括保存
    document.getElementById('bulkSaveBtn')?.addEventListener('click', bulkSaveCandidates);

    // 条件クリア
    document.getElementById('clearConditionsBtn')?.addEventListener('click', clearAllConditions);

    addWelcomeMessage();
}

function switchTab(tabId) {
    state.currentTab = tabId;
    state.selectedCandidate = null;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // タブに応じてクイックアクションを更新
    updateQuickActionsForTab(tabId);
    renderCurrentTab();
}

// タブに応じたクイックアクション表示
function updateQuickActionsForTab(tabId) {
    const quickActions = document.getElementById('quickActions');
    if (!quickActions) return;
    // SettingsManagerからAIプリセットを取得（Settings Drawerで編集可能）
    const presets = typeof SettingsManager !== 'undefined' ? SettingsManager.getAiPresetsForTab(tabId) : null;

    if (tabId === 'job-search') {
        // SettingsManagerからプリセットを取得（カスタム設定 or デフォルト）
        const jobPresets = presets && presets.length > 0 ? presets :
            (typeof SettingsManager !== 'undefined' ? SettingsManager.getDefaultSettings().aiPresets.jobSearch : [
                '💬 コミュニケーション能力が高い人だけ表示',
                '💪 メンタルが強い人だけ表示',
                '🚀 ベンチャーマインドが強い人だけ表示'
            ]);
        quickActions.innerHTML = jobPresets.map((p, i) =>
            `<button class="quick-action-btn" data-action="job-preset-${i}">${p}</button>`
        ).join('');
    } else if (tabId === 'interview') {
        if (presets && presets.length > 0) {
            quickActions.innerHTML = presets.map((p, i) =>
                `<button class="quick-action-btn" data-action="interview-preset-${i}">${p}</button>`
            ).join('');
        } else {
            quickActions.innerHTML = `
                <button class="quick-action-btn" data-action="interview-culture-fit">
                    🎯 カルチャーフィットしそうな求人順に並べて
                </button>
                <button class="quick-action-btn" data-action="interview-potential">
                    💡 必須が当てはまらなくても可能性が高そうな求人は？
                </button>
                <button class="quick-action-btn" data-action="interview-urgent">
                    🔥 緊急度の高い求人を抽出して
                </button>
            `;
        }
    } else if (tabId === 'proposals') {
        if (presets && presets.length > 0) {
            quickActions.innerHTML = presets.map((p, i) =>
                `<button class="quick-action-btn" data-action="proposals-preset-${i}">${p}</button>`
            ).join('');
        } else {
            quickActions.innerHTML = `
                <button class="quick-action-btn" data-action="proposals-urgent">
                    🚨 急ぎ確認必要な進捗を教えて
                </button>
                <button class="quick-action-btn" data-action="proposals-stale">
                    ⏸️ 動いていない進捗を教えて
                </button>
            `;
        }
    } else {
        // 候補者検索タブ用プリセット（デフォルト）
        if (presets && presets.length > 0) {
            quickActions.innerHTML = presets.map((p, i) =>
                `<button class="quick-action-btn" data-action="should-preset-${i}">${p}</button>`
            ).join('');
        } else {
            quickActions.innerHTML = `
                <button class="quick-action-btn" data-action="should-communication">
                    💬 コミュニケーション能力が高い人だけ表示
                </button>
                <button class="quick-action-btn" data-action="should-mental">
                    💪 メンタルが強い人だけ表示
                </button>
                <button class="quick-action-btn" data-action="should-venture">
                    🚀 ベンチャーマインドが強い人だけ表示
                </button>
            `;
        }
    }

    // 新しいボタンにイベントを付け直す
    quickActions.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
    });

    // Should条件ラベルをproposalsタブとinterviewタブで非表示にする
    const shouldLabel = document.querySelector('.should-condition-label');
    if (shouldLabel) {
        shouldLabel.style.display = (tabId === 'proposals' || tabId === 'interview') ? 'none' : 'flex';
    }

    // タブごとにヘルプテキストを更新
    const helperText = document.getElementById('aiHelperText');
    if (helperText) {
        if (tabId === 'proposals') {
            helperText.textContent = '進捗をサポートします。上のボタンまたは自由入力で相談してください。';
        } else if (tabId === 'interview') {
            helperText.textContent = '面談シートを分析し、求人提案をサポートします。';
        } else if (tabId === 'job-search') {
            helperText.textContent = '求人にマッチする候補者を検索できます。';
        } else {
            helperText.textContent = '上のボタンまたは自由入力で候補者を検索できます。何でも聞いてください。';
        }
    }

    // チャットメッセージエリアをクリア（タブ切替時）
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
}

function renderCurrentTab() {
    switch (state.currentTab) {
        case 'candidate-search': renderCandidates(); break;
        case 'job-search': renderJobSelect(); break;
        case 'interview': initInterviewTab(); break;
        case 'proposals': renderProposals(); break;
    }
}

// ==========================================
// Candidate Rendering
// ==========================================
function renderCandidates() {
    let candidates = storage.getCandidates();
    const query = document.getElementById('candidateSearchInput').value.toLowerCase();

    // Must条件（メイン検索窓）
    if (query) {
        candidates = candidates.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.jobType.toLowerCase().includes(query) ||
            (c.hardSkills || []).some(s => s.toLowerCase().includes(query)) ||
            (c.softSkills || []).some(s => s.toLowerCase().includes(query)) ||
            (c.resume?.summary || '').toLowerCase().includes(query)
        );
    }

    // 職種フィルタ
    if (state.filters.jobType) {
        candidates = candidates.filter(c => c.jobType.includes(state.filters.jobType));
    }

    // リモートフィルタ
    if (state.filters.remote) {
        candidates = candidates.filter(c => c.preferences?.remote);
    }

    // 保存済みフィルタ
    if (state.filters.saved) {
        candidates = candidates.filter(c => c.saved === true);
    }

    // 経験年数フィルタ
    if (state.filters.experience) {
        candidates = candidates.filter(c => {
            const years = parseInt(c.experience) || 0;
            switch (state.filters.experience) {
                case '1-3': return years >= 1 && years <= 3;
                case '4-6': return years >= 4 && years <= 6;
                case '7-10': return years >= 7 && years <= 10;
                case '10+': return years > 10;
                default: return true;
            }
        });
    }

    // Should条件（AIパネルからの絞り込み）- 拡張キーワード対応
    if (state.shouldConditions.length > 0) {
        candidates = candidates.filter(c => {
            return state.shouldConditions.some(cond => {
                // 拡張キーワードを取得
                const expandedKeywords = typeof expandKeywords === 'function' ? expandKeywords(cond) : [cond];
                const searchableText = [
                    ...(c.softSkills || []),
                    ...(c.hardSkills || []),
                    c.personalityMemo || '',
                    c.resume?.summary || '',
                    c.jobType || ''
                ].join(' ').toLowerCase();

                // いずれかのキーワードにマッチすればOK
                return expandedKeywords.some(kw => searchableText.includes(kw.toLowerCase()));
            });
        });
    }

    // ソート
    candidates.sort((a, b) => {
        switch (state.filters.sort) {
            case 'matchScore': return b.matchScore - a.matchScore;
            case 'marketScore': return b.marketScore - a.marketScore;
            case 'salaryDesc': return (b.currentAnnualIncome || 0) - (a.currentAnnualIncome || 0);
            case 'salaryAsc': return (a.currentAnnualIncome || 0) - (b.currentAnnualIncome || 0);
            case 'createdAt': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            default: return b.matchScore - a.matchScore;
        }
    });

    const container = document.getElementById('candidateResults');
    const shouldLabel = state.shouldConditions.length > 0 ? ` (絞込: ${state.shouldConditions.join(', ')})` : '';
    document.getElementById('candidateResultCount').innerHTML = `<strong>${candidates.length}</strong> 件の候補者${shouldLabel}`;

    if (candidates.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3 class="empty-state-title">候補者が見つかりません</h3><p class="empty-state-desc">検索条件を変更してください</p></div>`;
        return;
    }

    container.innerHTML = candidates.map(c => {
        const hasStar = checkMarketStar(c);
        const isSaved = c.saved === true;
        return `
      <div class="candidate-card" data-key="${c.candidateKey}">
        <div class="candidate-checkbox">
          <div class="checkbox ${state.selectedCandidates.has(c.candidateKey) ? 'checked' : ''}" data-key="${c.candidateKey}"></div>
        </div>
        <div class="candidate-info">
          <div class="candidate-header">
            <span class="candidate-name">${escapeHtml(c.name)}</span>
            <span class="match-label ${getMatchLabelClass(c.matchLabel)}">${c.matchLabel}</span>
            ${hasStar ? '<span class="badge badge-star">⭐</span>' : ''}
            <button class="bookmark-btn ${isSaved ? 'active' : ''}" data-key="${c.candidateKey}" title="保存">
              <span class="bookmark-icon">${isSaved ? '🔖' : '☆'}</span>
            </button>
          </div>
          <div class="candidate-job">${escapeHtml(c.jobType)} ・ ${c.experience}${c.currentAnnualIncome ? ` ・ 現年収 ${c.currentAnnualIncome}万円` : ''}</div>
          <div class="candidate-tags">
            ${(c.hardSkills || []).slice(0, 3).map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')}
            ${(c.softSkills || []).slice(0, 2).map(s => `<span class="chip chip-primary">${escapeHtml(s)}</span>`).join('')}
          </div>
          <div class="candidate-meta">
            <span>${c.preferences?.remote ? '🏠 リモート希望' : '🏢 出社可'}</span>
            <span>💰 ${c.preferences?.salary || '相談可'}</span>
          </div>
          <div class="candidate-reasons">
            ${(c.matchReasons || []).slice(0, 2).map(r => `• ${escapeHtml(r)}`).join('<br>')}
          </div>
        </div>
        <div class="candidate-scores">
          <div class="score-display">
            <div class="score-value">${c.matchScore}%</div>
            <div class="score-label">マッチ度</div>
          </div>
        </div>
      </div>`;
    }).join('');

    // カードクリックイベント
    container.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.bookmark-btn') || e.target.closest('.checkbox')) return;
            openCandidateDetail(card.dataset.key);
        });
    });

    // ブックマーククリックイベント
    container.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCandidateSaved(btn.dataset.key);
        });
    });

    // チェックボックスクリックイベント
    container.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCandidateSelection(cb.dataset.key);
        });
    });
}

// 保存状態切り替え
function toggleCandidateSaved(key) {
    const candidates = storage.getCandidates();
    const idx = candidates.findIndex(c => c.candidateKey === key);
    if (idx !== -1) {
        candidates[idx].saved = !candidates[idx].saved;
        storage.saveCandidates(candidates);
        renderCandidates();
        // モーダルが開いている場合はボタンも更新
        if (state.selectedCandidate?.candidateKey === key) {
            state.selectedCandidate = candidates[idx];
            updateModalBookmarkBtn();
        }
    }
}

// 選択状態切り替え
function toggleCandidateSelection(key) {
    if (state.selectedCandidates.has(key)) {
        state.selectedCandidates.delete(key);
    } else {
        state.selectedCandidates.add(key);
    }
    renderCandidates();
    updateBulkButtons();
}

function updateBulkButtons() {
    const count = state.selectedCandidates.size;
    document.getElementById('bulkSaveBtn').disabled = count === 0;
    document.getElementById('bulkProposeBtn').disabled = count === 0;
    // ボタンテキストに選択数を表示
    if (count > 0) {
        document.getElementById('bulkSaveBtn').textContent = `💾 一括保存 (${count})`;
        document.getElementById('bulkProposeBtn').textContent = `📤 一括提案 (${count})`;
    } else {
        document.getElementById('bulkSaveBtn').textContent = '💾 一括保存';
        document.getElementById('bulkProposeBtn').textContent = '📤 一抬提案';
    }
}

// 一括保存機能
function bulkSaveCandidates() {
    if (state.selectedCandidates.size === 0) return;

    const candidates = storage.getCandidates();
    let savedCount = 0;

    candidates.forEach(c => {
        if (state.selectedCandidates.has(c.candidateKey) && !c.saved) {
            c.saved = true;
            savedCount++;
        }
    });

    storage.saveCandidates(candidates);
    state.selectedCandidates.clear();
    renderCandidates();
    updateBulkButtons();

    addChatMessage('ai', `${savedCount}件の候補者を保存しました。`);
}

function updateModalBookmarkBtn() {
    const btn = document.getElementById('modalBookmarkBtn');
    if (btn && state.selectedCandidate) {
        const isSaved = state.selectedCandidate.saved === true;
        btn.classList.toggle('active', isSaved);
        btn.querySelector('.bookmark-icon').textContent = isSaved ? '🔖' : '☆';
    }
}

function openCandidateDetail(key) {
    const candidate = storage.getCandidate(key);
    if (!candidate) return;

    state.selectedCandidate = candidate;
    const hasStar = checkMarketStar(candidate);
    const isSaved = candidate.saved === true;

    document.getElementById('candidateModalTitle').textContent = candidate.name;

    // モーダル内ブックマークボタン更新
    const bookmarkBtn = document.getElementById('modalBookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('active', isSaved);
        bookmarkBtn.querySelector('.bookmark-icon').textContent = isSaved ? '🔖' : '🗘️';
        bookmarkBtn.onclick = () => toggleCandidateSaved(candidate.candidateKey);
    }

    document.getElementById('candidateModalBody').innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 280px; gap: var(--space-6);">
      <!-- 左：候補者情報 -->
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        <!-- スコアセクション -->
        <div style="display: flex; gap: var(--space-4); align-items: center;">
          <div class="badge-score">${candidate.matchScore}%</div>
          <div>
            <span class="match-label ${getMatchLabelClass(candidate.matchLabel)}">${candidate.matchLabel}</span>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted);">マッチ度</p>
          </div>
          ${candidate.currentAnnualIncome ? `<div style="margin-left: auto; text-align: right;">
            <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--text-primary);">${candidate.currentAnnualIncome}万円</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">現年収</div>
          </div>` : ''}
        </div>
        
        <!-- マッチ理由 -->
        <div>
          <h4 style="margin-bottom: var(--space-2);">📋 マッチ理由</h4>
          <ul style="color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${(candidate.matchReasons || []).map(r => `<li>• ${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
        
        <!-- スキル -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div>
            <h4 style="margin-bottom: var(--space-2);">🔧 ハードスキル</h4>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
              ${(candidate.hardSkills || []).map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
          <div>
            <h4 style="margin-bottom: var(--space-2);">💡 ソフトスキル</h4>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
              ${(candidate.softSkills || []).map(s => `<span class="chip chip-primary">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <!-- 市場決まりやすさ -->
        <div>
          <h4 style="margin-bottom: var(--space-2);">
            ⭐ 市場決まりやすさ: ${candidate.marketScore}%
            ${hasStar ? '<span class="badge badge-star">注目</span>' : ''}
          </h4>
          <ul style="color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${(candidate.marketReasons || ['市場で一定の需要がある領域です', 'スキルセットが評価されやすい', '給与レンジが現実的']).map(r => `<li>• ${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
        
        ${(candidate.negativeChecks || []).length > 0 ? `
        <div>
          <h4 style="margin-bottom: var(--space-2); color: var(--color-accent-red);">⚠️ ネガティブチェック</h4>
          <ul style="color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${candidate.negativeChecks.map(n => `<li>• ${escapeHtml(n)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- 希望条件 -->
        <div>
          <h4 style="margin-bottom: var(--space-2);">🎯 希望条件</h4>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
            💰 ${candidate.preferences?.salary || '相談可'} ・
            ${candidate.preferences?.remote ? '🏠 リモート希望' : '🏢 出社可'} ・
            📍 ${candidate.preferences?.location || '首都圏'}
          </p>
        </div>
        
        <!-- 職務要約 -->
        <div>
          <h4 style="margin-bottom: var(--space-2);">📝 職務要約</h4>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">
            ${escapeHtml(candidate.resume?.summary || '未設定')}
          </p>
        </div>
        
        <!-- 人物タイプメモ -->
        <div>
          <h4 style="margin-bottom: var(--space-2);">🧠 人物タイプメモ</h4>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed); background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-md);">
            ${escapeHtml(candidate.personalityMemo || 'この候補者の人物タイプに関するメモは登録されていません。面談後にAIパートナーに質問することで、人物タイプの分析が可能です。')}
          </p>
        </div>
      </div>
      
      <!-- 右：ミニAIパートナー -->
      <div style="background: var(--bg-surface); border-radius: var(--radius-xl); padding: var(--space-4); display: flex; flex-direction: column; height: fit-content;">
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
          <span style="font-size: 1.25rem;">🤖</span>
          <span style="font-weight: var(--font-weight-semibold);">AIパートナー</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3);">
          <button class="quick-action-btn modal-ai-btn" data-action="scout" style="font-size: var(--font-size-xs); padding: var(--space-2);">
            ✉️ スカウト文を提案
          </button>
          <button class="quick-action-btn modal-ai-btn" data-action="proposal" style="font-size: var(--font-size-xs); padding: var(--space-2);">
            📋 企業向け提案文を生成
          </button>
          <button class="quick-action-btn modal-ai-btn" data-action="scenario" style="font-size: var(--font-size-xs); padding: var(--space-2);">
            🎯 決定シナリオを考えて
          </button>
        </div>
        <div style="margin-bottom: var(--space-3);">
          <div style="display: flex; gap: var(--space-2);">
            <input type="text" id="modalAiInput" class="input" placeholder="自由に質問..." style="font-size: var(--font-size-xs); padding: var(--space-2); flex: 1;">
            <button id="modalAiSendBtn" class="btn btn-primary btn-sm" style="padding: var(--space-2);">➤</button>
          </div>
        </div>
        <div id="modalAiResponse" style="font-size: var(--font-size-xs); color: var(--text-secondary); max-height: 200px; overflow-y: auto;">
          <p style="text-align: center; color: var(--text-muted);">↑ ボタンをクリックまたは質問を入力</p>
        </div>
      </div>
    </div>`;

    // モーダル内AIボタンイベント
    document.querySelectorAll('.modal-ai-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const responseDiv = document.getElementById('modalAiResponse');
            responseDiv.innerHTML = '<p style="text-align: center;">⏳ 生成中...</p>';

            let response;
            switch (btn.dataset.action) {
                case 'scout':
                    response = await generateScoutMessage(candidate);
                    break;
                case 'proposal':
                    response = await generateProposalText(candidate);
                    break;
                case 'scenario':
                    response = await generateDecisionScenario(candidate);
                    break;
            }
            responseDiv.innerHTML = `<p style="white-space: pre-wrap; line-height: var(--line-height-relaxed);">${escapeHtml(response).replace(/\\n/g, '<br>')}</p>`;
        });
    });

    // モーダル内AIフリー入力イベント
    document.getElementById('modalAiSendBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('modalAiInput');
        const message = input.value.trim();
        if (!message) return;

        const responseDiv = document.getElementById('modalAiResponse');
        responseDiv.innerHTML = '<p style="text-align: center;">⏳ 生成中...</p>';
        input.value = '';

        const response = await generateModalAiResponse(message, candidate);
        responseDiv.innerHTML = `<p style="white-space: pre-wrap; line-height: var(--line-height-relaxed);">${escapeHtml(response).replace(/\\n/g, '<br>')}</p>`;
    });

    document.getElementById('modalAiInput')?.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('modalAiSendBtn')?.click();
        }
    });

    openModal('candidateModal');
}

// ==========================================
// Job Search Tab
// ==========================================
function renderJobSelect() {
    const jobs = storage.getJobs();
    const select = document.getElementById('jobSelect');
    select.innerHTML = '<option value="">求人を選択してください</option>' +
        jobs.map(j => `<option value="${j.jobKey}">${escapeHtml(j.title)} - ${escapeHtml(j.company)}</option>`).join('');
}

function selectJob() {
    const jobKey = document.getElementById('jobSelect').value;
    if (!jobKey) {
        document.getElementById('selectedJobInfo').style.display = 'none';
        state.selectedJob = null;
        return;
    }

    const job = storage.getJob(jobKey);
    state.selectedJob = job;

    document.getElementById('selectedJobInfo').style.display = 'block';
    document.getElementById('selectedJobTitle').textContent = job.title;
    document.getElementById('selectedJobCompany').textContent = job.company;
    document.getElementById('selectedJobConditions').textContent =
        `💰 ${job.conditions?.salary || '-'} ・ ${job.conditions?.remote ? '🏠 リモート可' : '🏢 出社'} ・ 📍 ${job.conditions?.location || '-'}`;

    document.getElementById('selectedJobStar').style.display = job.hasStar ? 'inline-flex' : 'none';
    renderJobCandidates();
}

function renderJobCandidates() {
    if (!state.selectedJob) return;

    let allCandidates = storage.getCandidates();
    const job = state.selectedJob;

    // 求人タイトルから職種キーワードを抽出
    const jobTitleKeywords = extractJobKeywords(job.title || '');

    // Must条件: 求人のスキル要件 + 職種キーワードでフィルタ（緩やかにマッチ）
    let candidates = allCandidates.filter(c => {
        const candidateText = [
            ...(c.hardSkills || []),
            ...(c.softSkills || []),
            c.jobType || '',
            c.personalityMemo || '',
            c.resume?.summary || ''
        ].join(' ').toLowerCase();

        // 1. 職種キーワードでマッチ（求人タイトルに含まれる職種）
        const jobTypeMatch = jobTitleKeywords.some(kw => candidateText.includes(kw));

        // 2. スキル要件でマッチ
        const skillMatch = (job.requiredSkills || []).some(skill => {
            const cleanSkill = skill.toLowerCase().replace(/[0-9年以上経験実務級程度]/g, '').trim();
            return cleanSkill.length > 1 && candidateText.includes(cleanSkill);
        });

        return jobTypeMatch || skillMatch;
    });

    // Should条件（AIパートナーからの絞り込み）- 拡張キーワード対応
    if (state.shouldConditions.length > 0) {
        candidates = candidates.filter(c => {
            return state.shouldConditions.some(cond => {
                const expandedKeywords = typeof expandKeywords === 'function' ? expandKeywords(cond) : [cond];
                const searchableText = [
                    ...(c.softSkills || []),
                    ...(c.hardSkills || []),
                    c.personalityMemo || '',
                    c.resume?.summary || '',
                    c.jobType || ''
                ].join(' ').toLowerCase();

                return expandedKeywords.some(kw => searchableText.includes(kw.toLowerCase()));
            });
        });
    }

    // 経験年数フィルタ
    if (state.filters.experience) {
        candidates = candidates.filter(c => {
            const years = parseInt(c.experience) || 0;
            switch (state.filters.experience) {
                case '1-3': return years >= 1 && years <= 3;
                case '4-6': return years >= 4 && years <= 6;
                case '7-10': return years >= 7 && years <= 10;
                case '10+': return years > 10;
                default: return true;
            }
        });
    }

    // デモ用フォールバック: 全フィルタ適用後に候補者が3名未満の場合、マッチスコア上位の候補者を追加
    if (candidates.length < 3) {
        const existingKeys = new Set(candidates.map(c => c.candidateKey));
        const additionalCandidates = allCandidates
            .filter(c => !existingKeys.has(c.candidateKey))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3 - candidates.length);
        candidates = [...candidates, ...additionalCandidates];
    }

    // ソート
    const sortValue = document.getElementById('sortJobCandidates')?.value || 'matchScore';
    candidates.sort((a, b) => {
        switch (sortValue) {
            case 'matchScore': return b.matchScore - a.matchScore;
            case 'marketScore': return b.marketScore - a.marketScore;
            case 'salaryDesc': return (b.currentAnnualIncome || 0) - (a.currentAnnualIncome || 0);
            case 'salaryAsc': return (a.currentAnnualIncome || 0) - (b.currentAnnualIncome || 0);
            case 'createdAt': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            default: return b.matchScore - a.matchScore;
        }
    });

    const container = document.getElementById('jobCandidateResults');
    const shouldLabel = state.shouldConditions.length > 0 ? ` (絞込: ${state.shouldConditions.join(', ')})` : '';
    document.getElementById('jobCandidateCount').innerHTML = `<strong>${candidates.length}</strong> 件の候補者${shouldLabel}`;

    if (candidates.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3 class="empty-state-title">候補者が見つかりません</h3><p class="empty-state-desc">条件を緩めて検索してみてください</p></div>`;
        return;
    }

    container.innerHTML = candidates.slice(0, 15).map(c => `
    <div class="candidate-card" data-key="${c.candidateKey}">
      <div class="candidate-info">
        <div class="candidate-header">
          <span class="candidate-name">${escapeHtml(c.name)}</span>
          <span class="match-label ${getMatchLabelClass(c.matchLabel)}">${c.matchLabel}</span>
        </div>
        <div class="candidate-job">${escapeHtml(c.jobType)} ・ ${c.experience}${c.currentAnnualIncome ? ` ・ ${c.currentAnnualIncome}万円` : ''}</div>
      </div>
      <div class="candidate-scores">
        <div class="score-value">${c.matchScore}%</div>
      </div>
    </div>
  `).join('');

    container.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', () => openCandidateDetail(card.dataset.key));
    });
}

function saveNewJob() {
    const title = document.getElementById('newJobTitle').value;
    const company = document.getElementById('newJobCompany').value;
    if (!title || !company) { alert('タイトルと会社名は必須です'); return; }

    const newJob = {
        jobKey: generateUUID(), title, company,
        description: document.getElementById('newJobDescription').value,
        conditions: { salary: document.getElementById('newJobSalary').value, remote: document.getElementById('newJobRemote').value === 'true' },
        hasStar: document.getElementById('newJobRemote').value === 'true',
        savedCandidateKeys: []
    };

    const jobs = storage.getJobs();
    jobs.push(newJob);
    storage.saveJobs(jobs);
    closeModal('addJobModal');
    renderJobSelect();
}

// 求人詳細ポップアップ表示
function showJobDetailModal(jobKey) {
    const job = storage.getJob(jobKey);
    if (!job) return;

    state.selectedJob = job;

    document.getElementById('jobModalTitle').textContent = job.title;

    const companyInfo = job.companyInfo || {};
    const body = document.getElementById('jobModalBody');
    body.innerHTML = `
        <div>
            <h4 style="margin-bottom: var(--space-2);">🏢 ${escapeHtml(job.company)}</h4>
            <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                ${escapeHtml(job.description || '詳細なし')}
            </p>
        </div>
        
        <div>
            <h4 style="margin-bottom: var(--space-2);">✨ 魅力ポイント</h4>
            <ul style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                ${(job.attractionPoints || job.highlights || []).map(p => `<li>• ${escapeHtml(p)}</li>`).join('')}
            </ul>
        </div>
        
        <div>
            <h4 style="margin-bottom: var(--space-2);">📋 募集条件</h4>
            <ul style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                ${(job.requirements || job.requiredSkills || []).map(r => `<li>• ${escapeHtml(r)}</li>`).join('')}
            </ul>
            <p style="font-size: var(--font-size-sm); margin-top: var(--space-2);">
                💰 ${job.conditions?.salary || '-'} ・ ${job.conditions?.remote ? '🏠 リモート可' : '🏢 出社'} ・ 📍 ${job.conditions?.location || '-'}
            </p>
        </div>
        
        <div style="background: var(--bg-elevated); padding: var(--space-3); border-radius: var(--radius-lg);">
            <h4 style="margin-bottom: var(--space-2);">🏛️ 会社情報</h4>
            <div style="font-size: var(--font-size-sm); color: var(--text-secondary); display: grid; grid-template-columns: auto 1fr; gap: var(--space-1) var(--space-3);">
                <span>設立</span><span>${companyInfo.founded || '-'}</span>
                <span>従業員数</span><span>${companyInfo.employees || '-'}</span>
                <span>事業内容</span><span>${companyInfo.business || '-'}</span>
                <span>業界</span><span>${companyInfo.industry || '-'}</span>
            </div>
            ${companyInfo.culture ? `<p style="margin-top: var(--space-2); font-size: var(--font-size-xs); color: var(--text-muted);">💬 ${companyInfo.culture}</p>` : ''}
        </div>
    `;

    // 紐づく候補者サマリを更新
    const candidateSummary = document.getElementById('jobModalCandidateSummary');
    candidateSummary.innerHTML = `
        <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-2);">
            <span>💾 保存済: ${job.savedCount || 0}名</span>
            <span>📤 提案済: ${job.proposedCount || 0}名</span>
        </div>
        <p style="color: var(--text-muted);">候補者名をクリックして詳細を確認できます</p>
    `;

    // AIレスポンスエリアをクリア
    document.getElementById('jobModalAiResponse').innerHTML = '';

    openModal('jobModal');
}

// 求人詳細ポップアップのAIボタンハンドラ
async function handleJobModalAI(action) {
    if (!state.selectedJob) return;

    const responseEl = document.getElementById('jobModalAiResponse');
    responseEl.innerHTML = '<p style="color: var(--text-muted);">🤖 考え中...</p>';

    let response;
    switch (action) {
        case 'job-match':
            response = await generateJobMatchAdvice(state.selectedJob);
            break;
        case 'job-success':
            response = await generateJobSuccessAdvice(state.selectedJob);
            break;
        default:
            response = await generateChatResponse(action);
    }

    responseEl.innerHTML = `<div style="white-space: pre-wrap;">${escapeHtml(response)}</div>`;
}

// 求人追加ポップアップのAIボタンハンドラ
async function handleAddJobAI(action) {
    const responseEl = document.getElementById('addJobAiResponse');
    responseEl.innerHTML = '<p style="color: var(--text-muted);">🤖 考え中...</p>';

    const description = document.getElementById('newJobDescription').value;

    let response;
    switch (action) {
        case 'brushup':
            response = await generateJobBrushupAdvice(description);
            break;
        case 'success-tips':
            response = await generateJobSuccessAdvice({ title: document.getElementById('newJobTitle').value || '求人' });
            break;
        default:
            response = await generateChatResponse(action);
    }

    responseEl.innerHTML = `<div style="white-space: pre-wrap;">${escapeHtml(response)}</div>`;
}

// 打ち合わせメモからAIで求人情報を構成
async function handleProcessJobMemo() {
    const memo = document.getElementById('newJobMeetingMemo').value;
    if (!memo.trim()) {
        alert('打ち合わせメモを入力してください');
        return;
    }

    const responseEl = document.getElementById('addJobAiResponse');
    responseEl.innerHTML = '<p style="color: var(--text-muted);">🤖 メモを解析中...</p>';

    const result = await processJobMeetingMemo(memo);

    // フォームに反映
    if (result.title) document.getElementById('newJobTitle').value = result.title;
    if (result.description) document.getElementById('newJobDescription').value = result.description;
    if (result.salary) document.getElementById('newJobSalary').value = result.salary;

    responseEl.innerHTML = `<div style="white-space: pre-wrap;">${escapeHtml(result.aiMessage)}</div>`;
}

// ==========================================
// Proposals Tab
// ==========================================
function renderProposals(filterKeys = null) {
    const proposals = storage.getProposals();
    const candidates = storage.getCandidates();
    const jobs = storage.getJobs();
    const statusFilter = document.getElementById('filterProposalStatus').value;
    let filtered = statusFilter ? proposals.filter(p => p.status === statusFilter) : proposals;

    // AIによるフィルタリング（特定のproposalKeyのみ表示）
    if (filterKeys && filterKeys.length > 0) {
        filtered = filtered.filter(p => filterKeys.includes(p.proposalKey));
    }

    const tbody = document.getElementById('proposalsTableBody');
    const statuses = ['提案済み', 'カジュアル面談', '一次面接', '二次面接', '三次面接', '内定', '内定承諾', '決定'];

    // 候補者名・求人名からキーを検索するヘルパー関数（常に名前から検索してUUIDを取得）
    const findCandidateKey = (p) => {
        // 名前から正しいcandidateKeyを検索（ダミーキーを無視）
        const candidate = candidates.find(c => c.name === p.candidateName);
        return candidate?.candidateKey || '';
    };
    const findJobKey = (p) => {
        // 名前から正しいjobKeyを検索（ダミーキーを無視）
        const job = jobs.find(j => j.title === p.jobTitle || j.title.includes(p.jobTitle?.slice(0, 10)));
        return job?.jobKey || '';
    };

    tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <span class="proposal-candidate-link" data-candidate-key="${findCandidateKey(p)}" style="cursor: pointer; color: var(--color-accent-purple); text-decoration: underline;">
          ${escapeHtml(p.candidateName)}
        </span>
      </td>
      <td>
        <span class="proposal-job-link" data-job-key="${findJobKey(p)}" style="cursor: pointer; color: var(--color-accent-teal); text-decoration: underline;">
          ${escapeHtml((p.jobTitle || '').substring(0, 25))}${(p.jobTitle || '').length > 25 ? '...' : ''}
        </span>
      </td>
      <td>
        <select class="filter-select proposal-status-select" data-proposal="${p.proposalKey}" style="width: 120px;">
          ${statuses.map(s =>
        `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`
    ).join('')}
        </select>
      </td>
      <td><input type="text" class="inline-edit proposal-memo-input" value="${escapeHtml(p.memo || '')}" data-proposal="${p.proposalKey}" placeholder="メモ..."></td>
      <td style="font-size: var(--font-size-sm);">${formatDate(p.lastUpdatedAt)}</td>
      <td style="font-size: var(--font-size-sm);">${p.nextActionAt ? formatDate(p.nextActionAt) : '-'}<br><span style="color: var(--text-muted);">${escapeHtml(p.nextAction || '')}</span></td>
    </tr >
    `).join('');

    // 候補者名クリック → 共通ポップアップ
    tbody.querySelectorAll('.proposal-candidate-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const candidateKey = e.currentTarget.dataset.candidateKey;
            if (candidateKey) {
                openCandidateDetail(candidateKey);
            }
        });
    });

    // 求人名クリック → 求人詳細ポップアップ
    tbody.querySelectorAll('.proposal-job-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const jobKey = e.currentTarget.dataset.jobKey;
            if (jobKey) {
                showJobDetailModal(jobKey);
            }
        });
    });

    // ステータス変更 → 即時保存
    tbody.querySelectorAll('.proposal-status-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            storage.updateProposal(e.target.dataset.proposal, {
                status: e.target.value,
                lastUpdatedAt: new Date().toISOString()
            });
        });
    });

    // メモ変更 → 即時保存
    tbody.querySelectorAll('.proposal-memo-input').forEach(input => {
        input.addEventListener('blur', (e) => {
            storage.updateProposal(e.target.dataset.proposal, {
                memo: e.target.value,
                lastUpdatedAt: new Date().toISOString()
            });
        });
    });
}

// ==========================================
// Chat & AI
// ==========================================
function addWelcomeMessage() {
    addChatMessage('ai', 'こんにちは！Matchへようこそ。候補者の検索やスカウト文の作成など、お手伝いします。候補者を選択すると、より具体的なアドバイスが可能です。');
}

function addChatMessage(role, content) {
    const container = document.getElementById('chatMessages');
    const avatar = role === 'ai' ? '🤖' : '👤';
    container.innerHTML += `
    <div class="chat-message ${role}">
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-bubble">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
    </div>`;
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage('user', message);
    input.value = '';

    // AI対話処理
    await processAIConversation(message);
}

// AIアシスタント対話処理（自然会話型 - ChatGPT/Gemini風）
async function processAIConversation(message) {
    const candidates = storage.getCandidates();
    const jobs = storage.getJobs();
    const lowerMessage = message.toLowerCase();

    // 「クリア」リクエストは全タブ共通で最優先処理
    if (isClearRequest(lowerMessage)) {
        clearAllConditions();
        return;
    }

    // 面談タブの場合は専用のAI処理
    if (state.currentTab === 'interview') {
        const response = await handleInterviewAiChat(message);
        addChatMessage('ai', response);
        return;
    }

    // 提案済みタブの場合は専用のAI処理
    if (state.currentTab === 'proposals') {
        const response = await handleProposalsAiChat(message);
        addChatMessage('ai', response);
        return;
    }

    // 求人タブの場合は専用処理
    if (state.currentTab === 'job-search') {
        const response = await handleJobSearchAiChat(message, candidates);
        addChatMessage('ai', response);
        return;
    }

    // 候補者検索タブ：自然な会話型レスポンス
    const response = await handleCandidateSearchAiChat(message, candidates);
    addChatMessage('ai', response);
}

// ====================================================================
// 候補者検索タブ専用AI（ChatGPT/Gemini風 自然会話）
// ====================================================================
async function handleCandidateSearchAiChat(message, candidates) {
    const lowerMessage = message.toLowerCase();

    // 1. 挨拶・一般的な質問への自然な対応
    if (isGreeting(lowerMessage)) {
        return `こんにちは！候補者検索のパートナーとしてお手伝いします。

エージェントとして率直に申し上げますと、良い人材を見つけるには「求める人物像」を具体的に伝えていただくのがコツです。

💡 **例えばこんな聞き方ができます**
・「コミュニケーション力が高い人を探して」
・「営業経験5年以上でリーダーシップがある人」
・「メンタルが強くてベンチャー向きの人」

何でもお気軽にどうぞ！`;
    }

    if (isHelpRequest(lowerMessage)) {
        return `私は候補者検索のAIパートナーです。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ できること
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 **候補者の検索・絞り込み**
・スキル、経験、人物像で検索
・条件に合う人がいなければ代替案を提示

💬 **相談・質問への回答**
・「この業界の人材市場はどう？」
・「営業とマーケ、どちらの経験者が採用しやすい？」
・「年収500万で採用できる人材は？」

📊 **分析・アドバイス**
・候補者の市場価値分析
・スカウト文の作成
・推薦文の生成

何でも聞いてくださいね！`;
    }

    // 2. 一般的な相談・質問への対応（検索以外）
    if (isGeneralQuestion(lowerMessage)) {
        return handleGeneralQuestion(message, candidates);
    }

    // 3. 候補者検索処理
    const expandedKeywords = expandKeywords(message);
    const searchResults = searchCandidatesWithFuzzy(candidates, expandedKeywords, message);

    // 3-1. 十分な結果がある場合（3名以上）
    if (searchResults.exactMatches.length >= 3) {
        state.shouldConditions = [message];
        renderCandidates();

        const topCandidates = searchResults.exactMatches.slice(0, 5);
        const candidateList = topCandidates.map((c, i) => {
            const matchReason = getMatchReasonForCandidate(c, message);
            return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ${matchReason}`;
        }).join('\n\n');

        return `「${message}」で検索しました！

🎯 **${searchResults.exactMatches.length}名**の候補者が見つかりました。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ マッチする候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

左の一覧で詳細をご確認ください。

💡 さらに絞り込みたい場合は「リモート希望」「年収600万以上」などの条件を追加してください。`;
    }

    // 3-2. 少数の結果がある場合（1-2名）
    if (searchResults.exactMatches.length > 0) {
        state.shouldConditions = [message];
        renderCandidates();

        const candidateList = searchResults.exactMatches.map((c, i) => {
            const matchReason = getMatchReasonForCandidate(c, message);
            return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ${matchReason}`;
        }).join('\n\n');

        // 条件緩和の提案を生成
        const relaxedCondition = getRelaxedConditionSuggestion(message, candidates, searchResults.exactMatches.length);

        return `「${message}」に該当する方は **${searchResults.exactMatches.length}名** いらっしゃいます。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 該当する候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

${relaxedCondition}

左の一覧で詳細をご確認ください。`;
    }

    // 3-3. 完全一致はないがfuzzyマッチがある場合
    if (searchResults.relatedMatches.length > 0) {
        const relatedList = searchResults.relatedMatches.slice(0, 3).map((c, i) => {
            return `**${i + 1}. ${c.name}**（${c.matchReason}）`;
        }).join('\n');

        // 条件緩和の提案
        const relaxedCondition = getRelaxedConditionSuggestion(message, candidates, 0);

        state.shouldConditions = searchResults.relatedKeyword ? [searchResults.relatedKeyword] : [];
        renderCandidates();

        return `「${message}」に完全一致する方は見つかりませんでしたが、**近い特徴を持つ方**がいらっしゃいます。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 近い候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${relatedList}

${relaxedCondition}

💡 こちらの方々はいかがでしょうか？詳細を見たい場合は左の一覧からクリックしてください。`;
    }

    // 3-4. 結果がない場合 - 条件緩和を積極的に提案
    const relaxedCondition = getRelaxedConditionSuggestion(message, candidates, 0);
    const popularSkills = getPopularSkills(candidates);

    return `「${message}」に該当する候補者は現時点では見つかりませんでした。

${relaxedCondition}

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ こんな条件ではいかがでしょうか？
━━━━━━━━━━━━━━━━━━━━━━━━━━

${popularSkills.map(s => `・${s}`).join('\n')}

上のプリセットボタンからも条件を選択できます。`;
}

// 条件緩和の提案を生成
function getRelaxedConditionSuggestion(originalQuery, candidates, currentCount) {
    // クエリから条件を分析
    const conditions = [];

    // 経験年数の条件があるか
    const yearMatch = originalQuery.match(/(\d+)年/);
    if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        if (years >= 5) {
            conditions.push({
                relaxed: `経験${years - 2}年以上`,
                count: countCandidatesWithCondition(candidates, `経験${years - 2}年`)
            });
        }
    }

    // スキル条件の緩和
    const skillKeywords = ['コミュニケーション', 'リーダー', 'マネジメント', 'メンタル', 'ベンチャー', '営業', 'エンジニア', 'マーケ'];
    const foundSkills = skillKeywords.filter(s => originalQuery.includes(s));

    if (foundSkills.length > 1) {
        // 複数条件がある場合、1つに絞ると見つかるか
        foundSkills.forEach(skill => {
            const count = countCandidatesWithCondition(candidates, skill);
            if (count > currentCount) {
                conditions.push({
                    relaxed: `「${skill}」のみで検索`,
                    count: count
                });
            }
        });
    }

    // 類似スキルへの拡張
    const skillExpansions = {
        'コミュニケーション': '対人スキル',
        'リーダー': 'マネジメント経験',
        'メンタル': 'ストレス耐性',
        'ベンチャー': 'チャレンジ精神',
        'エンジニア': '開発経験'
    };

    foundSkills.forEach(skill => {
        if (skillExpansions[skill]) {
            const count = countCandidatesWithCondition(candidates, skillExpansions[skill]);
            if (count > 0) {
                conditions.push({
                    relaxed: `「${skillExpansions[skill]}」に広げる`,
                    count: count
                });
            }
        }
    });

    // 提案文を生成
    if (conditions.length > 0) {
        const bestSuggestion = conditions.sort((a, b) => b.count - a.count)[0];
        if (bestSuggestion.count >= 3) {
            return `━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 条件を広げると...
━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ${bestSuggestion.relaxed}と、**${bestSuggestion.count}名**いらっしゃいます。

マッチする理由：同様のスキルセットや経験を持ち、ポテンシャルの高い方々です。`;
        }
    }

    // デフォルトの提案
    const allCount = candidates.length;
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 現在の登録状況
━━━━━━━━━━━━━━━━━━━━━━━━━━

現在、**${allCount}名**の候補者が登録されています。

条件を変えて検索してみてください。`;
}

// 候補者数をカウント
function countCandidatesWithCondition(candidates, condition) {
    return candidates.filter(c => {
        const searchableText = [
            ...(c.softSkills || []),
            ...(c.hardSkills || []),
            c.personalityMemo || '',
            c.resume?.summary || '',
            c.jobType || ''
        ].join(' ').toLowerCase();
        return searchableText.includes(condition.toLowerCase());
    }).length;
}

// 候補者のマッチ理由を生成
function getMatchReasonForCandidate(candidate, query) {
    const reasons = [];
    const lowerQuery = query.toLowerCase();

    // スキルマッチ
    (candidate.softSkills || []).forEach(skill => {
        if (lowerQuery.includes(skill.toLowerCase().substring(0, 3))) {
            reasons.push(`✅ ${skill}`);
        }
    });

    (candidate.hardSkills || []).forEach(skill => {
        if (lowerQuery.includes(skill.toLowerCase().substring(0, 3))) {
            reasons.push(`✅ ${skill}`);
        }
    });

    // 職種マッチ
    if (candidate.jobType && lowerQuery.includes(candidate.jobType.toLowerCase().substring(0, 2))) {
        reasons.push(`✅ ${candidate.jobType}経験`);
    }

    // 市場スコア
    if (candidate.marketScore && candidate.marketScore >= 70) {
        reasons.push(`📊 市場価値${candidate.marketScore}%`);
    }

    if (reasons.length === 0) {
        reasons.push(`✅ 条件にマッチ`);
    }

    return reasons.slice(0, 3).join(' / ');
}

// 一般的な質問かどうか判定
function isGeneralQuestion(msg) {
    const generalPatterns = [
        '市場', '相場', '年収', '給与', '採用しやすい', '採用難易度',
        'どう思う', 'どう考える', 'アドバイス', '教えて', 'について',
        '傾向', 'トレンド', '比較', 'おすすめ', '違い'
    ];
    return generalPatterns.some(p => msg.includes(p)) && !msg.includes('検索') && !msg.includes('探して');
}

// 一般的な質問への回答
function handleGeneralQuestion(message, candidates) {
    const lowerMessage = message.toLowerCase();

    // 年収・給与に関する質問
    if (lowerMessage.includes('年収') || lowerMessage.includes('給与')) {
        const avgSalary = candidates.reduce((sum, c) => sum + (c.currentAnnualIncome || 500), 0) / candidates.length;
        return `年収についてのご質問ですね。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 現在の登録候補者の年収分布
━━━━━━━━━━━━━━━━━━━━━━━━━━

・平均年収：約${Math.round(avgSalary)}万円
・登録者数：${candidates.length}名

市場の需給バランスを鑑みると、年収600万円以上の優秀層は複数オファーを獲得しやすい傾向にあります。

💡 具体的な年収帯で検索したい場合は「年収500万以上」などとお伝えください。`;
    }

    // 採用難易度に関する質問
    if (lowerMessage.includes('採用') && (lowerMessage.includes('しやすい') || lowerMessage.includes('難しい') || lowerMessage.includes('難易度'))) {
        return `採用難易度についてですね。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ エージェントの経験則から
━━━━━━━━━━━━━━━━━━━━━━━━━━

**採用しやすい職種**
・営業経験者（特に法人営業）
・バックオフィス（経理・人事・総務）

**採用が難しい職種**
・エンジニア（特にシニア層）
・PdM / PM
・データサイエンティスト

💡 具体的な職種で検索してみますか？`;
    }

    // 市場・トレンドに関する質問
    if (lowerMessage.includes('市場') || lowerMessage.includes('トレンド') || lowerMessage.includes('傾向')) {
        return `人材市場についてのご質問ですね。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 現在の市場トレンド
━━━━━━━━━━━━━━━━━━━━━━━━━━

**需要が高い人材**
・DX推進経験者
・カスタマーサクセス経験者
・リモートワーク対応可能な人材

**候補者の希望傾向**
・リモートワーク：希望者増加中
・ワークライフバランス：重視傾向
・成長環境：スタートアップ人気

💡 具体的に探したい人材像があればお聞かせください！`;
    }

    // デフォルト
    return `ご質問ありがとうございます。

エージェントとして率直に申し上げますと、そのご質問について詳しくお答えするには、もう少し具体的な情報が必要です。

💡 例えば：
・「営業経験者の採用難易度は？」
・「エンジニアの年収相場は？」
・「リモート希望の候補者を探して」

何でもお気軽にどうぞ！`;
}

// 挨拶判定
function isGreeting(msg) {
    return ['こんにちは', 'hello', 'hi', 'はじめまして', 'よろしく', 'おはよう', 'こんばんは'].some(g => msg.includes(g));
}

// ヘルプリクエスト判定
function isHelpRequest(msg) {
    return ['help', 'ヘルプ', '使い方', '何ができる', 'できること', '教えて'].some(h => msg.includes(h));
}

// クリアリクエスト判定
function isClearRequest(msg) {
    return ['クリア', 'リセット', '条件解除', '全解除', 'clear', 'reset'].some(c => msg.includes(c));
}

// ====================================================================
// 求人検索タブ専用AI（ChatGPT/Gemini風 自然会話）
// ====================================================================
async function handleJobSearchAiChat(message, candidates) {
    const lowerMessage = message.toLowerCase();
    const jobs = storage.getJobs();

    // 挨拶・ヘルプ
    if (isGreeting(lowerMessage)) {
        return `こんにちは！求人票から候補者を探すお手伝いをします。

エージェントとして率直に申し上げますと、求人の条件に合う人材を見つけるには、**求人のポジション名や必要なスキル**をお伝えいただくのがコツです。

💡 **例えばこんな聞き方ができます**
・「フロントエンドエンジニアに合う人を探して」
・「営業経験者で決まりやすい人は？」
・「この求人に合う候補者を3人見せて」

何でもお気軽にどうぞ！`;
    }

    if (isHelpRequest(lowerMessage)) {
        return `私は求人検索のAIパートナーです。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ できること
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 **求人に合う候補者の検索**
・職種、スキル、経験で候補者を検索
・条件に合う人がいなければ代替案を提示

💬 **相談・質問への回答**
・「この職種の採用は難しい？」
・「どんな条件で候補者を絞れる？」

📊 **マッチング分析**
・候補者と求人の相性分析
・推薦文の生成

何でも聞いてくださいね！`;
    }

    // 一般的な質問
    if (isGeneralQuestion(lowerMessage)) {
        return handleGeneralQuestion(message, candidates);
    }

    // 求人選択の要求
    if (lowerMessage.includes('この求人') || lowerMessage.includes('選択した求人')) {
        if (state.selectedJob) {
            const job = state.selectedJob;
            const matchedCandidates = findCandidatesForJob(job, candidates);

            if (matchedCandidates.length >= 3) {
                const candidateList = matchedCandidates.slice(0, 5).map((c, i) => {
                    return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ✅ マッチ度: ${c.matchScore}% / ${c.matchReason}`;
                }).join('\n\n');

                return `「${job.title}」に合う候補者を探しました！

🎯 **${matchedCandidates.length}名**の候補者が見つかりました。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ マッチする候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

左の一覧で詳細をご確認ください。`;
            } else if (matchedCandidates.length > 0) {
                const candidateList = matchedCandidates.map((c, i) => {
                    return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ✅ マッチ度: ${c.matchScore}% / ${c.matchReason}`;
                }).join('\n\n');

                // 条件緩和提案
                const relaxedCount = candidates.filter(c => c.marketScore && c.marketScore >= 60).length;

                return `「${job.title}」に該当する方は **${matchedCandidates.length}名** いらっしゃいます。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 該当する候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 条件を広げると...
━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 市場価値60%以上に条件を広げると、**${relaxedCount}名**いらっしゃいます。

マッチする理由：ポテンシャルが高く、成長環境で活躍できる方々です。`;
            }
        }
        return `現在選択されている求人がありません。

左のドロップダウンから求人を選択するか、「営業経験者を探して」のように直接お聞きください。`;
    }

    // キーワード検索
    const expandedKeywords = expandKeywords(message);
    const matchedCandidates = searchCandidatesForJobTab(candidates, expandedKeywords, message);

    if (matchedCandidates.length >= 3) {
        state.shouldConditions = [message];
        renderJobCandidates();

        const candidateList = matchedCandidates.slice(0, 5).map((c, i) => {
            const matchReason = getMatchReasonForCandidate(c, message);
            return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ${matchReason}`;
        }).join('\n\n');

        return `「${message}」で検索しました！

🎯 **${matchedCandidates.length}名**の候補者が見つかりました。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ マッチする候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

左の一覧で詳細をご確認ください。`;
    }

    if (matchedCandidates.length > 0) {
        state.shouldConditions = [message];
        renderJobCandidates();

        const candidateList = matchedCandidates.map((c, i) => {
            const matchReason = getMatchReasonForCandidate(c, message);
            return `**${i + 1}. ${c.name}**（${c.jobType || '専門職'}）
   ${matchReason}`;
        }).join('\n\n');

        // 条件緩和提案
        const relaxedCondition = getRelaxedConditionSuggestion(message, candidates, matchedCandidates.length);

        return `「${message}」に該当する方は **${matchedCandidates.length}名** いらっしゃいます。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 該当する候補者
━━━━━━━━━━━━━━━━━━━━━━━━━━

${candidateList}

${relaxedCondition}`;
    }

    // 結果がない場合
    const relaxedCondition = getRelaxedConditionSuggestion(message, candidates, 0);

    return `「${message}」に該当する候補者は現時点では見つかりませんでした。

${relaxedCondition}

💡 別の条件で検索してみてください。
・「コミュニケーション力が高い」
・「マネジメント経験あり」
・「リモート希望」`;
}

// 求人に合う候補者を検索
function findCandidatesForJob(job, candidates) {
    const jobKeywords = extractJobKeywords(job.title);
    const requiredSkills = job.requiredSkills || [];

    return candidates.map(c => {
        let score = 50;
        const reasons = [];

        // 職種マッチ
        const candidateJob = (c.jobType || '').toLowerCase();
        if (jobKeywords.some(k => candidateJob.includes(k))) {
            score += 20;
            reasons.push('職種経験あり');
        }

        // スキルマッチ
        const candidateSkills = [...(c.hardSkills || []), ...(c.softSkills || [])].map(s => s.toLowerCase());
        requiredSkills.forEach(skill => {
            if (candidateSkills.some(cs => cs.includes(skill.toLowerCase()))) {
                score += 10;
                reasons.push(`${skill}スキル`);
            }
        });

        // 市場スコア
        if (c.marketScore && c.marketScore >= 70) {
            score += 10;
        }

        return {
            ...c,
            matchScore: Math.min(score, 95),
            matchReason: reasons.slice(0, 2).join('、') || '条件にマッチ'
        };
    }).filter(c => c.matchScore >= 60)
        .sort((a, b) => b.matchScore - a.matchScore);
}

// 求人タブ用の候補者検索
function searchCandidatesForJobTab(candidates, keywords, originalMessage) {
    return candidates.filter(c => {
        const searchableText = [
            ...(c.softSkills || []),
            ...(c.hardSkills || []),
            c.personalityMemo || '',
            c.resume?.summary || '',
            c.jobType || ''
        ].join(' ').toLowerCase();

        return keywords.some(kw => searchableText.includes(kw.toLowerCase()));
    });
}

// 条件をすべてクリア
function clearAllConditions() {
    state.shouldConditions = [];
    state.filters.experience = ''; // 経験年数フィルタもクリア

    // 面談タブの場合はメインカラムの内容もクリア
    if (state.currentTab === 'interview') {
        interviewState.linkedCandidate = null;
        interviewState.analysisResult = null;
        interviewState.suggestedJobs = [];
        interviewState.currentSuggestedJob = null;

        document.getElementById('interviewCandidateSearch').style.display = 'block';
        document.getElementById('interviewCandidateSearch').value = '';
        document.getElementById('linkedCandidate').style.display = 'none';
        document.getElementById('interviewAnalysisCard').style.display = 'none';
        document.getElementById('interviewAnalysisContent').innerHTML = '';
        document.getElementById('interviewTags').innerHTML = '';
        document.getElementById('interviewText').value = '';
        document.getElementById('interviewSuggestedJobCard').style.display = 'none';

        addChatMessage('ai', '面談シートの内容をすべてクリアしました！\\n\\n新しい候補者を検索して紐付けてください。');
        return;
    }

    // 現在のタブに応じてレンダリング
    if (state.currentTab === 'job-search') {
        renderJobCandidates();
    } else if (state.currentTab === 'proposals') {
        proposalsState.filteredKeys = null;
        const statusFilter = document.getElementById('filterProposalStatus');
        if (statusFilter) statusFilter.value = '';
        renderProposals();
        addChatMessage('ai', 'フィルタをクリアしました！\n\n全ての進捗が表示されています。');
        return;
    } else {
        renderCandidates();
    }
    addChatMessage('ai', '検索条件をすべてクリアしました！\n\n全候補者が表示されています。新しい条件で検索してみてください。');
}

// 求人タイトルから職種キーワードを抽出
function extractJobKeywords(title) {
    const jobTypes = ['経理', '財務', '経営', '人事', '採用', '営業', 'エンジニア', 'マーケティング',
        'カスタマーサクセス', 'CS', 'PM', 'PdM', 'デザイナー', '企画', '事務',
        'マネジメント', 'フロントエンド', 'バックエンド', 'React', 'TypeScript',
        '新卒', '中途', 'メンバー', 'リーダー', '総務', '広報', 'SaaS', 'BtoB'];

    const lowerTitle = title.toLowerCase();
    return jobTypes
        .filter(type => lowerTitle.includes(type.toLowerCase()))
        .map(type => type.toLowerCase());
}

// キーワード拡張（類義語マッピング）
function expandKeywords(message) {
    const synonymMap = {
        'コミュニケーション': ['コミュニケーション力', 'コミュニケーション能力', 'コミュ力', '対人スキル', '会話力'],
        'リーダー': ['リーダーシップ', 'マネジメント', '統率力', '主体性'],
        'メンタル': ['メンタルが強い', '精神力', 'ストレス耐性', '粘り強さ', '忍耐力'],
        'ベンチャー': ['ベンチャーマインド', '起業家精神', 'チャレンジ精神', '挑戦心'],
        '営業': ['法人営業', 'セールス', '営業力', '提案力'],
        'エンジニア': ['開発', 'プログラミング', 'SE', 'システム'],
        '経理': ['財務', '会計', '経理・財務'],
        '人事': ['採用', 'HR', '人事・採用'],
        'マーケ': ['マーケティング', 'デジタルマーケ', '広告運用'],
        'PM': ['プロジェクトマネージャー', 'PdM', 'プロダクトマネージャー'],
    };

    const keywords = [message];
    Object.entries(synonymMap).forEach(([key, synonyms]) => {
        if (message.includes(key)) {
            keywords.push(...synonyms);
        }
        synonyms.forEach(syn => {
            if (message.includes(syn)) {
                keywords.push(key, ...synonyms);
            }
        });
    });
    return [...new Set(keywords)];
}

// fuzzy検索
function searchCandidatesWithFuzzy(candidates, keywords, originalMessage) {
    const exactMatches = [];
    const relatedMatches = [];
    let relatedKeyword = null;

    candidates.forEach(c => {
        const searchableText = [
            ...(c.softSkills || []),
            ...(c.hardSkills || []),
            c.personalityMemo || '',
            c.resume?.summary || '',
            c.jobType || ''
        ].join(' ').toLowerCase();

        // 完全一致（いずれかのキーワードに一致）
        const matchedKeyword = keywords.find(kw => searchableText.includes(kw.toLowerCase()));
        if (matchedKeyword) {
            exactMatches.push(c);
            if (!relatedKeyword) relatedKeyword = matchedKeyword;
        } else {
            // fuzzy検索（部分一致）
            const partialMatch = findPartialMatch(searchableText, originalMessage);
            if (partialMatch) {
                relatedMatches.push({ ...c, matchReason: partialMatch });
            }
        }
    });

    return { exactMatches, relatedMatches, relatedKeyword };
}

// 部分一致検索
function findPartialMatch(text, query) {
    const queryWords = query.split(/[\s、,]+/).filter(w => w.length > 1);
    for (const word of queryWords) {
        if (text.includes(word.toLowerCase())) {
            return `「${word}」に関連`;
        }
    }

    // スキルカテゴリでのマッチ
    const skillCategories = {
        '論理': '論理性',
        '主体': '主体性',
        '協調': '協調性',
        '柔軟': '柔軟性',
        '創造': '創造性',
        'リモート': 'リモート希望',
    };

    for (const [key, label] of Object.entries(skillCategories)) {
        if (query.includes(key) && text.includes(key)) {
            return `「${label}」あり`;
        }
    }

    return null;
}

// 提案を生成
function getSuggestions(relatedMatches, originalQuery) {
    if (relatedMatches.length === 0) return '';

    const suggestions = relatedMatches.slice(0, 3).map(c => {
        return `• ${c.name} さん（${c.matchReason}）`;
    });
    return suggestions.join('\n');
}

// 代替提案
function getAlternativeSuggestion(query) {
    const alternatives = [
        'コミュニケーション力が高い人',
        'リーダーシップがある人',
        'PM経験者',
        '営業経験5年以上',
        'メンタルが強い人'
    ];
    return alternatives.find(a => !query.includes(a.slice(0, 3))) || alternatives[0];
}

// 人気のスキル
function getPopularSkills(candidates) {
    const skillCount = {};
    candidates.forEach(c => {
        [...(c.softSkills || []), ...(c.hardSkills || [])].forEach(skill => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
    });

    return Object.entries(skillCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => `${skill}（${count} 名）`);
}

async function handleQuickAction(action) {
    // カスタムプリセット（Settings Drawerで設定）への対応
    const presetMatch = action.match(/^(should|job|interview|proposals)-preset-(\d+)$/);
    if (presetMatch) {
        const [, tabType, indexStr] = presetMatch;
        const index = parseInt(indexStr);
        const tabKey = tabType === 'should' ? 'candidateSearch' :
            tabType === 'job' ? 'jobSearch' :
                tabType === 'interview' ? 'interview' : 'proposals';
        const presets = typeof SettingsManager !== 'undefined' ? SettingsManager.getAiPresetsForTab(tabKey) : [];

        if (presets && presets[index]) {
            const presetText = presets[index];
            addChatMessage('user', presetText);

            // 各タブに応じた処理
            if (tabType === 'interview') {
                const response = await handleInterviewAiChat(presetText);
                addChatMessage('ai', response);
            } else if (tabType === 'proposals') {
                const response = await handleProposalsAiChat(presetText);
                addChatMessage('ai', response);
            } else if (tabType === 'job') {
                // 求人タブでは検索条件として処理
                if (state.selectedJob) {
                    state.shouldConditions = [presetText];
                    renderJobCandidates();
                    addChatMessage('ai', `「${presetText}」の条件で【${state.selectedJob.title}】にマッチする候補者を検索しました。\n\n左の一覧をご確認ください。さらに条件を追加したい場合はお声がけください！`);
                } else {
                    addChatMessage('ai', '先に求人を選択してください。求人を選択すると、その条件に合った候補者を検索できます。');
                }
            } else {
                // 候補者検索タブ - 自然な会話形式で検索
                await processAIConversation(presetText);
            }
            return;
        }
    }

    // Should条件チップの処理
    if (action.startsWith('should-')) {
        const conditionMap = {
            'should-communication': 'コミュニケーション力',
            'should-mental': 'メンタルが強い',
            'should-venture': 'ベンチャーマインド'
        };
        const condition = conditionMap[action];
        if (condition) {
            // 既に含まれている場合は削除、なければ追加
            const idx = state.shouldConditions.indexOf(condition);
            if (idx >= 0) {
                state.shouldConditions.splice(idx, 1);
                addChatMessage('ai', `「${condition}」の絞り込みを解除しました。`);
            } else {
                state.shouldConditions.push(condition);
                addChatMessage('ai', `「${condition}」で候補者を絞り込みました。\n\n現在のShould条件：${state.shouldConditions.join('、')} `);
            }
            renderCandidates();
            return;
        }
    }

    // 求人タブ用クイックアクション
    if (action.startsWith('job-')) {
        if (!state.selectedJob) {
            addChatMessage('ai', '先に求人を選択してください。求人を選択すると、その条件に合った候補者を検索できます。');
            return;
        }

        const job = state.selectedJob;
        let message = '';
        let shouldCondition = '';

        switch (action) {
            case 'job-wide-search':
                message = `【${job.title}】の関連スキルで広く検索しました。\n\n求人の必須スキル「${(job.requiredSkills || []).join('、')}」に加え、類似スキルを持つ候補者も表示しています。\n\n💡 ポテンシャル採用も視野に入れる場合は、経験年数フィルタを緩めることをおすすめします。`;
                shouldCondition = job.requiredSkills?.[0] || job.title;
                break;
            case 'job-culture-match':
                message = `【${job.title}】のカルチャーにマッチしそうな候補者を検索しました。\n\n企業カルチャー：${job.companyInfo?.culture || '情報なし'} \n\n以下の特性を持つ候補者を優先表示しています：\n・コミュニケーション力が高い\n・変化への適応力がある\n・チームワークを重視`;
                shouldCondition = 'コミュニケーション';
                break;
            case 'job-experience-3plus':
                message = `【${job.title}】で経験3年以上の候補者のみに絞り込みました。\n\n即戦力として活躍が期待できる候補者を優先表示しています。`;
                state.filters.experience = '4-6'; // 4-6年で代用（3年以上の近似）
                break;
        }

        if (shouldCondition) {
            state.shouldConditions = [shouldCondition];
        }

        addChatMessage('ai', message);

        if (state.currentTab === 'job-search') {
            renderJobCandidates();
        } else {
            renderCandidates();
        }
        return;
    }

    // 面談タブ用クイックアクション
    if (action.startsWith('interview-')) {
        handleInterviewQuickAction(action);
        return;
    }

    // 提案済みタブ用クイックアクション
    if (action.startsWith('proposals-')) {
        handleProposalsQuickAction(action);
        return;
    }

    if (!state.selectedCandidate && ['scout', 'concerns', 'hireability'].includes(action)) {
        addChatMessage('ai', '候補者を選択してから、このアクションをお試しください。');
        return;
    }

    const labels = { scout: 'スカウト文を提案して', concerns: '懸念点と確認質問を出して', hireability: '決まりやすい理由を整理して' };
    addChatMessage('user', labels[action] || action);

    let response;
    switch (action) {
        case 'scout': response = await generateScoutMessage(state.selectedCandidate); break;
        case 'concerns': response = await generateConcerns(state.selectedCandidate); break;
        case 'hireability': response = await generateHireability(state.selectedCandidate); break;
        default: response = await generateChatResponse(labels[action]);
    }
    addChatMessage('ai', response);
}

// 検索条件保存機能
function saveSearchCondition() {
    const name = prompt('検索条件に名前を付けてください:', `検索条件 ${state.savedViews.length + 1} `);
    if (!name) return;

    const condition = {
        id: generateUUID(),
        name,
        query: document.getElementById('candidateSearchInput').value,
        filters: { ...state.filters },
        shouldConditions: [...state.shouldConditions],
        createdAt: new Date().toISOString()
    };

    state.savedViews.push(condition);
    addChatMessage('ai', `検索条件「${name}」を保存しました。\n\nMust条件：${condition.query || '（なし）'} \nShould条件：${condition.shouldConditions.join('、') || '（なし）'} `);
    renderSearchHistory();
}

// 検索履歴の表示
function renderSearchHistory() {
    const container = document.getElementById('searchHistoryRow');
    if (!container) return;

    if (state.savedViews.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <span style="font-size: var(--font-size-xs); color: var(--text-muted); margin-right: var(--space-2);">保存済み:</span>
        ${state.savedViews.slice(-5).map(v => `
            <button class="example-chip saved-view-chip" data-id="${v.id}" style="font-size: var(--font-size-xs);">
                ${escapeHtml(v.name)}
            </button>
        `).join('')
        }
    `;

    container.querySelectorAll('.saved-view-chip').forEach(btn => {
        btn.addEventListener('click', () => restoreSearchCondition(btn.dataset.id));
    });
}

// 検索条件の復元
function restoreSearchCondition(id) {
    const condition = state.savedViews.find(v => v.id === id);
    if (!condition) return;

    document.getElementById('candidateSearchInput').value = condition.query || '';
    state.filters = { ...condition.filters };
    state.shouldConditions = [...(condition.shouldConditions || [])];

    // フィルタUIを更新
    document.getElementById('filterJobType').value = state.filters.jobType || '';
    document.getElementById('filterRemote').classList.toggle('active', state.filters.remote);
    document.getElementById('filterSaved').classList.toggle('active', state.filters.saved);
    document.getElementById('sortCandidates').value = state.filters.sort || 'matchScore';

    renderCandidates();
    addChatMessage('ai', `検索条件「${condition.name}」を復元しました。`);
}

// ==========================================
// Settings
// ==========================================
// ==========================================
// Admin Settings Drawer
// ==========================================
let isAdminAuthenticated = false;
let settingsDraft = {};
let currentSettingsSection = 'scoring';
let currentSettingsScope = 'personal';

function openSettings() {
    const drawer = document.getElementById('settingsDrawer');
    const overlay = document.getElementById('settingsDrawerOverlay');
    const loginScreen = document.getElementById('settingsLogin');
    const panel = document.getElementById('settingsPanel');

    // Reset to login state
    isAdminAuthenticated = false;
    loginScreen.style.display = 'flex';
    panel.style.display = 'none';
    document.getElementById('adminId').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('loginError').style.display = 'none';

    // Show drawer
    drawer.classList.add('active');
    overlay.classList.add('active');

    // Focus on ID input
    setTimeout(() => document.getElementById('adminId').focus(), 100);
}

function closeSettings() {
    const drawer = document.getElementById('settingsDrawer');
    const overlay = document.getElementById('settingsDrawerOverlay');

    drawer.classList.remove('active');
    overlay.classList.remove('active');
    isAdminAuthenticated = false;
    settingsDraft = {};
}

function authenticateAdmin() {
    const id = document.getElementById('adminId').value.toLowerCase();
    const pass = document.getElementById('adminPass').value.toLowerCase();

    if (id === 'demo' && pass === 'demo') {
        isAdminAuthenticated = true;
        document.getElementById('settingsLogin').style.display = 'none';
        document.getElementById('settingsPanel').style.display = 'flex';
        loadSettingsToForm();
        populatePreviewCandidates();
        return true;
    } else {
        document.getElementById('loginError').style.display = 'block';
        return false;
    }
}

function loadSettingsToForm() {
    const settings = currentSettingsScope === 'org'
        ? SettingsManager.getOrgSettings() || SettingsManager.getDefaultSettings()
        : SettingsManager.getPersonalSettings() || SettingsManager.getDefaultSettings();

    settingsDraft = JSON.parse(JSON.stringify(settings));

    // Load weights
    document.getElementById('weightJob').value = settings.weights?.job ?? 35;
    document.getElementById('weightSkill').value = settings.weights?.skill ?? 35;
    document.getElementById('weightSoft').value = settings.weights?.soft ?? 20;
    document.getElementById('weightConditions').value = settings.weights?.conditions ?? 10;
    updateWeightTotal();
    // Load market fit settings (5軸二値評価)
    const marketFitPositivesEl = document.getElementById('marketFitPositives');
    const marketFitBlockNegativeEl = document.getElementById('marketFitBlockNegative');
    if (marketFitPositivesEl) {
        marketFitPositivesEl.value = settings.marketFitRule?.requiredPositives ?? 3;
    }
    if (marketFitBlockNegativeEl) {
        marketFitBlockNegativeEl.checked = settings.marketFitRule?.blockOnMajorNegative !== false;
    }

    // Load 5-axis settings
    load5AxisSettings(settings);

    // Load label thresholds
    document.getElementById('labelRecommended').value = settings.labelThreshold?.recommended ?? 85;
    document.getElementById('labelGood').value = settings.labelThreshold?.good ?? 70;

    // Load reasons pool
    document.getElementById('reasonsPool').value = (settings.reasonsPool || []).join('\n');
    document.getElementById('reasonsBannedWords').value = (settings.bannedWords || []).join(', ');

    // Load AI presets for first tab
    loadAiPresetsForTab('candidateSearch');

    // Update scope badge
    document.getElementById('settingsScopeBadge').textContent = currentSettingsScope === 'org' ? 'Org（組織）' : 'Personal';
}

function loadAiPresetsForTab(tabKey) {
    const settings = settingsDraft.aiPresets || SettingsManager.getDefaultSettings().aiPresets;
    const presets = settings[tabKey] || [];
    document.getElementById('aiPresetTexts').value = presets.join('\n');
}

function saveAiPresetsFromForm() {
    const tabKey = document.getElementById('aiPresetTab').value;
    const texts = document.getElementById('aiPresetTexts').value.split('\n').filter(t => t.trim());
    if (!settingsDraft.aiPresets) settingsDraft.aiPresets = {};
    settingsDraft.aiPresets[tabKey] = texts;
}

function updateWeightTotal() {
    const job = parseInt(document.getElementById('weightJob').value) || 0;
    const skill = parseInt(document.getElementById('weightSkill').value) || 0;
    const soft = parseInt(document.getElementById('weightSoft').value) || 0;
    const conditions = parseInt(document.getElementById('weightConditions').value) || 0;
    const total = job + skill + soft + conditions;

    document.getElementById('weightTotal').textContent = total;
    const errorEl = document.getElementById('weightError');
    const applyBtn = document.getElementById('applySettingsBtn');

    if (total !== 100) {
        errorEl.style.display = 'inline';
        applyBtn.disabled = true;
        applyBtn.style.opacity = '0.5';
    } else {
        errorEl.style.display = 'none';
        applyBtn.disabled = false;
        applyBtn.style.opacity = '1';
    }
}

function populatePreviewCandidates() {
    const select = document.getElementById('previewCandidateSelect');
    const candidates = storage.getCandidates();
    select.innerHTML = '<option value="">候補者を選択してプレビュー...</option>';
    candidates.slice(0, 10).forEach(c => {
        select.innerHTML += `<option value="${c.candidateKey}">${c.name}</option>`;
    });
}

function showScorePreview() {
    const candidateKey = document.getElementById('previewCandidateSelect').value;
    if (!candidateKey) {
        document.getElementById('scorePreview').innerHTML = '<p style="color: var(--text-muted);">候補者を選択してください</p>';
        return;
    }

    const candidate = storage.getCandidate(candidateKey);
    if (!candidate) return;

    // Build temporary settings from form
    const tempSettings = {
        weights: {
            job: parseInt(document.getElementById('weightJob').value) || 35,
            skill: parseInt(document.getElementById('weightSkill').value) || 35,
            soft: parseInt(document.getElementById('weightSoft').value) || 20,
            conditions: parseInt(document.getElementById('weightConditions').value) || 10
        },
        labelThreshold: {
            recommended: parseInt(document.getElementById('labelRecommended').value) || 85,
            good: parseInt(document.getElementById('labelGood').value) || 70
        },
        marketFitRule: {
            mode: 'binary',
            requiredPositives: parseInt(document.getElementById('marketFitPositives')?.value) || 3,
            blockOnMajorNegative: document.getElementById('marketFitBlockNegative')?.checked !== false
        }
    };

    const scoreResult = SettingsManager.computeMatchScore(candidate, null, tempSettings);
    const label = SettingsManager.computeLabel(scoreResult.total, tempSettings);
    const marketFit = SettingsManager.evaluateMarketFit(candidate, tempSettings);

    document.getElementById('scorePreview').innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-3);">
            <span style="font-size: var(--font-size-2xl); font-weight: bold;">${scoreResult.total}</span>
            <span class="match-label match-label-${label === '推奨' ? 'excellent' : label === '良好' ? 'good' : 'review'}">${label}</span>
            ${marketFit.hasStar ? '<span style="color: var(--color-star-gold);">⭐ Market Fit</span>' : '<span style="color: var(--text-muted);">- Market Fit なし</span>'}
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-2);">
            職種: ${scoreResult.breakdown.job}% | スキル: ${scoreResult.breakdown.skill}% | ソフト: ${scoreResult.breakdown.soft}% | 条件: ${scoreResult.breakdown.conditions}%
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
            ポジティブ軸: ${marketFit.positiveCount}/5 ${marketFit.hasMajorNegative ? '(重大ネガティブあり)' : ''}
        </div>
        ${marketFit.reason ? `<div style="font-size: var(--font-size-xs); color: var(--color-accent-teal); margin-top: var(--space-2);">💡 ${marketFit.reason}</div>` : ''}
    `;
}

function applySettings() {
    // Collect form values into settingsDraft
    settingsDraft.weights = {
        job: parseInt(document.getElementById('weightJob').value) || 35,
        skill: parseInt(document.getElementById('weightSkill').value) || 35,
        soft: parseInt(document.getElementById('weightSoft').value) || 20,
        conditions: parseInt(document.getElementById('weightConditions').value) || 10
    };

    settingsDraft.marketFitRule = {
        mode: 'binary',
        requiredPositives: parseInt(document.getElementById('marketFitPositives')?.value) || 3,
        blockOnMajorNegative: document.getElementById('marketFitBlockNegative')?.checked !== false,
        axes: save5AxisSettings()
    };

    settingsDraft.labelThreshold = {
        recommended: parseInt(document.getElementById('labelRecommended').value) || 85,
        good: parseInt(document.getElementById('labelGood').value) || 70
    };

    settingsDraft.reasonsPool = document.getElementById('reasonsPool').value.split('\n').filter(r => r.trim());
    settingsDraft.bannedWords = document.getElementById('reasonsBannedWords').value.split(',').map(w => w.trim()).filter(w => w);

    // Save AI presets
    saveAiPresetsFromForm();

    // Org confirmation dialog
    if (currentSettingsScope === 'org') {
        if (!confirm('本当に組織設定として適用しますか？\nこの設定は全ユーザーに影響します。')) {
            return;
        }
        SettingsManager.saveOrgSettings(settingsDraft);
    } else {
        SettingsManager.savePersonalSettings(settingsDraft);
    }

    // Show toast
    showToast(`✅ Settingsを適用しました（${currentSettingsScope === 'org' ? 'Org' : 'Personal'}）`);

    // Refresh current view
    renderCurrentTab();

    // Close drawer
    closeSettings();
}

function showToast(message, isError = false) {
    let toast = document.getElementById('settingsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'settingsToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle('toast-error', isError);
    toast.classList.toggle('toast-success', !isError);
    toast.classList.add('active');

    setTimeout(() => toast.classList.remove('active'), 3000);
}

// =====================================================
// Org Login Modal Functions
// =====================================================

function showOrgLoginModal() {
    const modal = document.getElementById('orgLoginModal');
    const idInput = document.getElementById('orgLoginId');
    const passInput = document.getElementById('orgLoginPass');
    const errorEl = document.getElementById('orgLoginError');

    if (modal) {
        modal.classList.add('active');
        if (idInput) idInput.value = '';
        if (passInput) passInput.value = '';
        if (errorEl) errorEl.style.display = 'none';
        idInput?.focus();
    }
}

function hideOrgLoginModal() {
    const modal = document.getElementById('orgLoginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleOrgLogin() {
    const id = document.getElementById('orgLoginId')?.value;
    const pass = document.getElementById('orgLoginPass')?.value;
    const errorEl = document.getElementById('orgLoginError');

    // orgdemo/orgdemo で認証
    if (id === 'orgdemo' && pass === 'orgdemo') {
        hideOrgLoginModal();
        currentSettingsScope = 'org';
        document.getElementById('settingsScopeSelect').value = 'org';
        document.getElementById('settingsScopeBadge').textContent = 'Org（組織）';
        loadSettingsToForm();
        showToast('✅ 組織設定への認証が完了しました');
    } else {
        if (errorEl) {
            errorEl.style.display = 'block';
        }
    }
}

// =====================================================
// 5-Axis Settings Save/Load Functions
// =====================================================

function load5AxisSettings(settings) {
    const axes = settings.marketFitRule?.axes || SettingsManager.getDefaultSettings().marketFitRule.axes;
    const axisLabels = ['axis1Label', 'axis2Label', 'axis3Label', 'axis4Label', 'axis5Label'];
    const axisDescs = ['axis1Desc', 'axis2Desc', 'axis3Desc', 'axis4Desc', 'axis5Desc'];

    axes.forEach((axis, i) => {
        const labelEl = document.getElementById(axisLabels[i]);
        const descEl = document.getElementById(axisDescs[i]);
        if (labelEl) labelEl.value = axis.label || '';
        if (descEl) descEl.value = axis.desc || '';
    });
}

function save5AxisSettings() {
    const axisLabels = ['axis1Label', 'axis2Label', 'axis3Label', 'axis4Label', 'axis5Label'];
    const axisDescs = ['axis1Desc', 'axis2Desc', 'axis3Desc', 'axis4Desc', 'axis5Desc'];
    const axisIds = ['demandFit', 'friction', 'decisionReadiness', 'marketRangeFit', 'risk'];
    const emojis = ['📈', '🔄', '⚡', '📊', '🛡️'];

    return axisLabels.map((labelId, i) => ({
        id: axisIds[i],
        label: emojis[i] + ' ' + (document.getElementById(labelId)?.value || ''),
        desc: document.getElementById(axisDescs[i])?.value || ''
    }));
}


function switchSettingsSection(section) {
    currentSettingsSection = section;

    // Update menu
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Update content
    document.querySelectorAll('.settings-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `section-${section}`);
    });
}

function initSettingsEventListeners() {
    // Login button
    document.getElementById('adminLoginBtn')?.addEventListener('click', authenticateAdmin);

    // Enter key on password
    document.getElementById('adminPass')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') authenticateAdmin();
    });

    // Close buttons
    document.getElementById('closeSettingsDrawer')?.addEventListener('click', closeSettings);
    document.getElementById('settingsDrawerOverlay')?.addEventListener('click', closeSettings);
    document.getElementById('cancelSettingsBtn')?.addEventListener('click', closeSettings);

    // Apply button
    document.getElementById('applySettingsBtn')?.addEventListener('click', applySettings);

    // Menu items
    document.querySelectorAll('.settings-menu-item').forEach(item => {
        item.addEventListener('click', () => switchSettingsSection(item.dataset.section));
    });

    // Scope select - Org選択時は再認証が必要
    document.getElementById('settingsScopeSelect')?.addEventListener('change', (e) => {
        if (e.target.value === 'org') {
            // Org選択時は再認証モーダルを表示
            e.target.value = currentSettingsScope; // 一旦戻す
            showOrgLoginModal();
        } else {
            currentSettingsScope = e.target.value;
            loadSettingsToForm();
        }
    });

    // Org login modal events
    document.getElementById('orgLoginSubmitBtn')?.addEventListener('click', handleOrgLogin);
    document.getElementById('orgLoginCancelBtn')?.addEventListener('click', hideOrgLoginModal);
    document.getElementById('orgLoginPass')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleOrgLogin();
    });

    // Weight inputs
    ['weightJob', 'weightSkill', 'weightSoft', 'weightConditions'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateWeightTotal);
    });

    // Preview candidate select
    document.getElementById('previewCandidateSelect')?.addEventListener('change', showScorePreview);

    // AI Preset tab change
    document.getElementById('aiPresetTab')?.addEventListener('change', (e) => {
        saveAiPresetsFromForm(); // Save current before switching
        loadAiPresetsForTab(e.target.value);
    });

    // Data management buttons
    document.getElementById('resetPersonalBtn')?.addEventListener('click', () => {
        if (confirm('Personal設定を初期化しますか？')) {
            SettingsManager.resetPersonalSettings();
            showToast('✅ Personal設定を初期化しました');
            loadSettingsToForm();
        }
    });

    document.getElementById('resetOrgBtn')?.addEventListener('click', () => {
        if (confirm('本当に組織設定を初期化しますか？\nこの操作は全ユーザーに影響します。')) {
            SettingsManager.resetOrgSettings();
            showToast('✅ Org設定を初期化しました');
            loadSettingsToForm();
        }
    });

    document.getElementById('exportSettingsBtn')?.addEventListener('click', () => {
        const data = SettingsManager.exportSettings();
        downloadJSON(data, 'match_settings_backup.json');
        showToast('✅ 設定をエクスポートしました');
    });

    document.getElementById('importSettingsFile')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const result = SettingsManager.importSettings(evt.target.result);
            const statusEl = document.getElementById('importStatus');
            if (result.success) {
                statusEl.className = 'import-status success';
                statusEl.textContent = '✅ インポート成功！設定を読み込みました。';
                loadSettingsToForm();
            } else {
                statusEl.className = 'import-status error';
                statusEl.textContent = `❌ ${result.error}`;
            }
        };
        reader.readAsText(file);
    });
}

// ==========================================
// Modal Helpers
// ==========================================
function openModal(id) {
    document.getElementById('modalBackdrop').classList.add('active');
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById('modalBackdrop').classList.remove('active');
    document.getElementById(id).classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById('modalBackdrop').classList.remove('active');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// ==========================================
// Interview Sheet Tab - Full Implementation
// ==========================================

// 面談タブの状態
const interviewState = {
    linkedCandidate: null,
    analysisResult: null,
    suggestedJobs: [],
    currentSuggestedJob: null,
    isEditing: false
};

// 面談タブ初期化
function initInterviewTab() {
    const searchInput = document.getElementById('interviewCandidateSearch');
    if (!searchInput) return;

    // 横断検索のイベント
    searchInput.removeEventListener('input', searchInterviewCandidatesDebounced);
    searchInput.addEventListener('input', searchInterviewCandidatesDebounced);

    // AI解析ボタン
    document.getElementById('runInterviewAnalysisBtn')?.addEventListener('click', runInterviewAnalysis);

    // チップボタン
    document.querySelectorAll('#tab-interview .example-chip').forEach(chip => {
        chip.addEventListener('click', () => runInterviewAnalysis(chip.dataset.action));
    });

    // 編集/PDF/保存ボタン
    document.getElementById('editInterviewReportBtn')?.addEventListener('click', toggleReportEdit);
    document.getElementById('downloadInterviewPdfBtn')?.addEventListener('click', downloadInterviewPdf);
    document.getElementById('saveInterviewBtn')?.addEventListener('click', saveInterviewReport);

    // 提案求人カードの閉じるボタン
    document.getElementById('closeSuggestedJobCard')?.addEventListener('click', () => {
        document.getElementById('interviewSuggestedJobCard').style.display = 'none';
    });
    document.getElementById('viewSuggestedJobDetailBtn')?.addEventListener('click', () => {
        if (interviewState.currentSuggestedJob) {
            showJobDetailModal(interviewState.currentSuggestedJob.jobKey);
        }
    });
    document.getElementById('proposeSuggestedJobBtn')?.addEventListener('click', proposeSuggestedJob);

    // 紐付けリセット
    document.getElementById('unlinkCandidate')?.addEventListener('click', unlinkInterviewCandidate);

    // 候補者が既に紐付けられていれば求人提案を更新
    if (interviewState.linkedCandidate) {
        updateInterviewJobSuggestions();
    }
}

// 横断検索（デバウンス付き）
const searchInterviewCandidatesDebounced = debounce(searchInterviewCandidates, 300);

function searchInterviewCandidates() {
    const query = document.getElementById('interviewCandidateSearch').value.toLowerCase().trim();
    const container = document.getElementById('interviewCandidateResults');

    if (!query) {
        container.innerHTML = '';
        return;
    }

    const candidates = storage.getCandidates();
    const matched = candidates.filter(c => {
        const searchText = [
            c.name,
            c.jobType,
            ...(c.hardSkills || []),
            ...(c.softSkills || []),
            c.resume?.summary || '',
            c.resume?.companies?.join(' ') || '',
            c.personalityMemo || ''
        ].join(' ').toLowerCase();

        return searchText.includes(query);
    }).slice(0, 8);

    if (matched.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: var(--font-size-sm);">該当する候補者が見つかりません</p>';
        return;
    }

    container.innerHTML = matched.map(c => `
        <div class="interview-candidate-item" data-key="${c.candidateKey}"
            style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2); cursor: pointer; border-radius: var(--radius-md); transition: background 0.2s;"
            onmouseover="this.style.background='var(--bg-surface-elevated)'" onmouseout="this.style.background='transparent'">
            <span class="chip chip-primary">${escapeHtml(c.name)}</span>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${escapeHtml(c.jobType)} ・ ${c.experience}</span>
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${(c.hardSkills || []).slice(0, 2).join(', ')}</span>
        </div>
    `).join('');

    container.querySelectorAll('.interview-candidate-item').forEach(item => {
        item.addEventListener('click', () => linkInterviewCandidate(item.dataset.key));
    });
}

// 候補者を紐付け
function linkInterviewCandidate(candidateKey) {
    const candidate = storage.getCandidate(candidateKey);
    if (!candidate) return;

    interviewState.linkedCandidate = candidate;

    document.getElementById('interviewCandidateSearch').style.display = 'none';
    document.getElementById('interviewCandidateResults').innerHTML = '';
    document.getElementById('linkedCandidate').style.display = 'block';

    const nameEl = document.getElementById('linkedCandidateName');
    nameEl.textContent = candidate.name;
    nameEl.onclick = () => openCandidateDetail(candidateKey); // 共通ポップアップに遷移

    document.getElementById('linkedCandidateInfo').textContent =
        `${candidate.jobType} ・ ${candidate.experience} ・ マッチ度 ${candidate.matchScore}% `;

    // 求人提案を更新
    updateInterviewJobSuggestions();

    addChatMessage('ai', `${candidate.name} さんを紐付けました。\n\n面談内容を入力してAI解析を実行するか、右のプリセットボタンから求人提案をお試しください。`);
}

// 紐付け解除
function unlinkInterviewCandidate() {
    interviewState.linkedCandidate = null;
    interviewState.suggestedJobs = [];
    document.getElementById('interviewCandidateSearch').style.display = 'block';
    document.getElementById('interviewCandidateSearch').value = '';
    document.getElementById('linkedCandidate').style.display = 'none';
    document.getElementById('interviewJobListCard').style.display = 'none';
    document.getElementById('interviewSuggestedJobCard').style.display = 'none';
    addChatMessage('ai', '候補者の紐付けを解除しました。');
}

// AI解析を実行
async function runInterviewAnalysis(action) {
    const text = document.getElementById('interviewText').value.trim();
    const candidate = interviewState.linkedCandidate;

    if (!text) {
        addChatMessage('ai', '面談内容を入力してから解析を実行してください。文字起こしや面談メモを貼り付けると、AIが詳細なレポートを生成します。');
        return;
    }

    if (!candidate) {
        addChatMessage('ai', '先に候補者を紐付けてください。検索ボックスから候補者を選択できます。');
        return;
    }

    // ローディング表示
    document.getElementById('interviewAnalysisCard').style.display = 'block';
    document.getElementById('interviewAnalysisContent').innerHTML = '<p style="text-align: center; padding: var(--space-6);">⏳ AI解析中...</p>';
    document.getElementById('interviewTags').innerHTML = '';

    addChatMessage('user', action ? getInterviewActionLabel(action) : '面談内容をAI解析して');

    await delay(1200);

    // 高密度な解析レポート生成
    const result = generateDetailedInterviewReport(text, candidate, action);
    interviewState.analysisResult = result;

    // タグ表示
    document.getElementById('interviewTags').innerHTML = result.tags.map(tag =>
        `<span class="chip chip-primary">${escapeHtml(tag)}</span>`
    ).join('');

    // レポート表示
    document.getElementById('interviewAnalysisContent').innerHTML =
        `<div id="interviewReportBody" style="white-space: pre-wrap;">${escapeHtml(result.fullReport)}</div>`;

    addChatMessage('ai', `解析が完了しました！\n\n📊 ${result.tags.length} 個のマッチングタグを抽出\n💼 この候補者にマッチする求人を右のAIパートナーからご確認ください。`);

    // 求人提案を更新
    updateInterviewJobSuggestions();
}

function getInterviewActionLabel(action) {
    const labels = {
        'evaluate': 'この面談の評価ポイントを整理して',
        'negative': 'ネガティブチェックも含めてまとめて',
        'questions': '次回面談の質問案を出して'
    };
    return labels[action] || action;
}

// 高密度な解析レポート生成（A4用紙1枚分）
function generateDetailedInterviewReport(transcript, candidate, action) {
    const name = candidate.name || '候補者';
    const jobType = candidate.jobType || '専門職';
    const hardSkills = candidate.hardSkills || [];
    const softSkills = candidate.softSkills || [];

    // タグ抽出（5つ以上）
    const tags = [
        ...hardSkills.slice(0, 3),
        ...softSkills.slice(0, 2),
        jobType,
        candidate.marketScore >= 70 ? '高市場価値' : '成長ポテンシャル',
        candidate.preferences?.remote ? 'リモート希望' : '出社可能'
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);

    const fullReport = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【面談解析レポート】${name} 様
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 職歴概略
──────────────────────────────────
${jobType}領域で${candidate.experience || '豊富な経験'} を積んでこられた。
${transcript.length > 200 ? '面談では詳細な経歴説明があり、プロジェクト経験が豊富なことが確認できた。' : '面談内容から、実務経験とスキルの両面で即戦力として期待できる。'}

■ 強み
──────────────────────────────────
1. ${hardSkills[0] || '専門スキル'} の実務経験が豊富
2. ${softSkills[0] || 'コミュニケーション力'} が高く、チームへの適応が早い
3. ${softSkills[1] || '論理的思考力'} があり、課題解決能力に優れる

■ 弱み・懸念点
──────────────────────────────────
${candidate.negativeChecks?.length > 0 ?
            candidate.negativeChecks.map((n, i) => `${i + 1}. ${n}`).join('\n') :
            '1. 特記すべき懸念点なし（継続的なフォローアップで確認予定）'
        }

■ 決定シナリオ
──────────────────────────────────
【推奨アプローチ】
1. 市場スコア${candidate.marketScore || 75}% の人材 → 競合も狙っている可能性
2. ${candidate.preferences?.salary || '年収相談可'} の範囲で提案
3. 2週間以内に3社程度の求人を提案し、比較検討できる状態を作る

【決め手となるポイント】
・${softSkills[0] || '成長環境'} を活かせる環境
・${candidate.preferences?.remote ? 'リモート勤務可能' : '通勤エリアの利便性'}
・キャリアアップの機会

■ 次回面談・フォローアップ
──────────────────────────────────
□ 希望条件の優先順位を確認
□ 他社選考状況のヒアリング
□ 入社時期の調整可能性を確認

■ 総合評価
──────────────────────────────────
マッチ度: ${candidate.matchScore || 80}% | 市場スコア: ${candidate.marketScore || 75}%
    ${candidate.matchLabel || 'かなり相性が良い'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return {
        tags,
        careerSummary: `${jobType}領域で${candidate.experience} の経験`,
        strengths: hardSkills.slice(0, 3),
        weaknesses: candidate.negativeChecks || [],
        decisionScenario: '2週間以内に3社提案、比較検討を促進',
        concerns: candidate.negativeChecks || [],
        fullReport
    };
}

// レポート編集切り替え
function toggleReportEdit() {
    const reportBody = document.getElementById('interviewReportBody');
    const btn = document.getElementById('editInterviewReportBtn');

    if (interviewState.isEditing) {
        reportBody.contentEditable = 'false';
        reportBody.style.border = 'none';
        reportBody.style.padding = '0';
        btn.textContent = '✏️ 編集';
        interviewState.isEditing = false;
    } else {
        reportBody.contentEditable = 'true';
        reportBody.style.border = '1px solid var(--border-default)';
        reportBody.style.padding = 'var(--space-3)';
        reportBody.style.borderRadius = 'var(--radius-md)';
        reportBody.focus();
        btn.textContent = '✅ 編集完了';
        interviewState.isEditing = true;
    }
}

// PDF出力（ブラウザ印刷機能使用）
function downloadInterviewPdf() {
    const content = document.getElementById('interviewAnalysisContent')?.innerText;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    < html >
        <head><title>面談レポート - ${interviewState.linkedCandidate?.name || '候補者'}</title></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; white-space: pre-wrap;">
            <h1>面談解析レポート</h1>
            <p>候補者: ${interviewState.linkedCandidate?.name || '-'}</p>
            <hr>
            <pre style="font-size: 12px; line-height: 1.6;">${escapeHtml(content)}</pre>
        </body>
        </html >
    `);
    printWindow.document.close();
    printWindow.print();
}

// 保存
function saveInterviewReport() {
    if (!interviewState.linkedCandidate || !interviewState.analysisResult) {
        addChatMessage('ai', '保存する解析結果がありません。先に面談内容を解析してください。');
        return;
    }

    const candidates = storage.getCandidates();
    const idx = candidates.findIndex(c => c.candidateKey === interviewState.linkedCandidate.candidateKey);

    if (idx !== -1) {
        candidates[idx].interviewReport = {
            ...interviewState.analysisResult,
            savedAt: new Date().toISOString()
        };
        storage.saveCandidates(candidates);
        addChatMessage('ai', `${interviewState.linkedCandidate.name} さんの面談レポートを保存しました。\n\n候補者詳細ページからいつでも確認できます。`);
    }
}

// 求人提案カード更新
function updateInterviewJobSuggestions() {
    const candidate = interviewState.linkedCandidate;
    if (!candidate) return;

    const jobs = storage.getJobs();

    // 候補者とのマッチ度を計算してソート
    const matchedJobs = jobs.map(job => {
        const skillMatch = (job.requiredSkills || []).some(s =>
            (candidate.hardSkills || []).some(hs => hs.toLowerCase().includes(s.toLowerCase()))
        ) ? 30 : 0;

        const typeMatch = job.title.toLowerCase().includes(candidate.jobType.toLowerCase()) ? 25 : 0;
        const remoteMatch = (job.conditions?.remote && candidate.preferences?.remote) ? 15 : 0;
        const urgentBonus = job.isUrgent ? 10 : 0;

        return {
            ...job,
            candidateMatchScore: skillMatch + typeMatch + remoteMatch + urgentBonus + Math.floor(Math.random() * 20)
        };
    }).sort((a, b) => b.candidateMatchScore - a.candidateMatchScore).slice(0, 5);

    interviewState.suggestedJobs = matchedJobs;

    // メインカラムに求人一覧を表示
    renderInterviewJobList(matchedJobs);

    // チャットに最初の3件を表示
    if (matchedJobs.length > 0) {
        const jobListHtml = matchedJobs.slice(0, 3).map((j, i) =>
            `${i + 1}. ${j.title}（${j.company}）- マッチ度: ${j.candidateMatchScore}%`
        ).join('\n');

        addChatMessage('ai', `${candidate.name}さんにマッチする求人を${matchedJobs.length}件見つけました：\n\n${jobListHtml}\n\n💡 求人の詳細は下の一覧から確認できます。並び替えや絞り込みのご相談も承ります。`);
    }
}

// メインカラムに求人一覧を表示
function renderInterviewJobList(jobs, highlightMessage = null) {
    const card = document.getElementById('interviewJobListCard');
    const content = document.getElementById('interviewJobListContent');
    const countEl = document.getElementById('interviewJobListCount');

    if (!card || !content) return;

    if (!jobs || jobs.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    countEl.textContent = `${jobs.length}件`;

    content.innerHTML = (highlightMessage ? `<p style="margin-bottom: var(--space-3); color: var(--color-accent-teal); font-size: var(--font-size-sm);">💡 ${escapeHtml(highlightMessage)}</p>` : '') +
        jobs.map((job, idx) => `
        <div class="interview-job-item" data-job-key="${job.jobKey}" style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-surface-elevated)'" onmouseout="this.style.background='var(--bg-surface)'">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                    <span style="font-weight: var(--font-weight-semibold);">${idx + 1}. ${escapeHtml(job.title)}</span>
                    ${job.isUrgent ? '<span class="badge badge-star" style="font-size: var(--font-size-xs);">🔥 急募</span>' : ''}
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-1);">${escapeHtml(job.company)}</p>
                <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                    <span class="chip" style="font-size: var(--font-size-xs);">💰 ${job.conditions?.salary || '-'}</span>
                    <span class="chip" style="font-size: var(--font-size-xs);">${job.conditions?.remote ? '🏠 リモート可' : '🏢 出社'}</span>
                </div>
            </div>
            <div style="text-align: center; min-width: 60px;">
                <div class="badge-score" style="font-size: 1rem;">${job.candidateMatchScore || 80}%</div>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">マッチ度</p>
            </div>
        </div>
    `).join('');

    // クリックイベント
    content.querySelectorAll('.interview-job-item').forEach(item => {
        item.addEventListener('click', () => {
            const jobKey = item.dataset.jobKey;
            const job = jobs.find(j => j.jobKey === jobKey);
            if (job) displaySuggestedJobInMain(job);
        });
    });
}

// 面談タブ用のクイックアクション処理
function handleInterviewQuickAction(action) {
    const candidate = interviewState.linkedCandidate;

    if (!candidate) {
        addChatMessage('ai', '先に候補者を紐付けてください。検索ボックスから候補者名や職種で検索できます。');
        return;
    }

    const jobs = interviewState.suggestedJobs.length > 0 ? interviewState.suggestedJobs : storage.getJobs();

    let sortedJobs;
    let message;

    switch (action) {
        case 'interview-culture-fit':
            sortedJobs = jobs.sort((a, b) => {
                const aCulture = (a.companyInfo?.culture || '').length;
                const bCulture = (b.companyInfo?.culture || '').length;
                return bCulture - aCulture;
            }).slice(0, 5);
            message = `🎯 ** カルチャーフィットしそうな求人 **\n\n${candidate.name} さんの志向性を踏まえて、カルチャーマッチしそうな求人を並べました：\n\n`;
            break;

        case 'interview-potential':
            sortedJobs = jobs.filter(j => {
                const hasAnySkillMatch = (j.requiredSkills || []).length === 0 ||
                    (j.requiredSkills || []).some(s =>
                        (candidate.hardSkills || []).some(hs => hs.toLowerCase().includes(s.toLowerCase().substring(0, 3)))
                    );
                return hasAnySkillMatch;
            }).slice(0, 5);
            message = `💡 ** 必須条件に完全一致しなくても可能性のある求人 **\n\n${candidate.name} さんのポテンシャルを考慮すると、以下の求人も視野に入ります：\n\n`;
            break;

        case 'interview-urgent':
            sortedJobs = jobs.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0)).slice(0, 5);
            message = `🔥 ** 緊急度の高い求人 **\n\n採用ニーズが高く、スピード感を持って進められる求人です：\n\n`;
            break;

        default:
            return;
    }

    interviewState.suggestedJobs = sortedJobs;

    // メインカラムの求人一覧を更新
    const highlightMessages = {
        'interview-culture-fit': 'カルチャーフィット順に並び替えました',
        'interview-potential': 'ポテンシャル採用の可能性がある求人を表示しています',
        'interview-urgent': '緊急度の高い順に並び替えました'
    };
    renderInterviewJobList(sortedJobs, highlightMessages[action]);

    const jobList = sortedJobs.map((j, i) =>
        `${i + 1}. **${j.title}**（${j.company}）\n   💰 ${j.conditions?.salary || '-'} ・ ${j.conditions?.remote ? '🏠 リモート可' : '🏢 出社'}`
    ).join('\n');

    addChatMessage('user', getInterviewQuickActionLabel(action));
    addChatMessage('ai', message + jobList + '\n\n下の一覧が更新されました。クリックで詳細を確認できます。');
}

function getInterviewQuickActionLabel(action) {
    const labels = {
        'interview-culture-fit': 'カルチャーフィットしそうな求人順に並べて',
        'interview-potential': '必須が当てはまらなくても可能性が高そうな求人はありますか',
        'interview-urgent': '緊急度の高い求人を抽出して'
    };
    return labels[action] || action;
}

// 面談タブAIチャット処理（柔軟な対話 + UI連動）
async function handleInterviewAiChat(message) {
    const lowerMsg = message.toLowerCase();
    const candidate = interviewState.linkedCandidate;

    // UI連動：詳細表示リクエスト
    if ((lowerMsg.includes('詳しく') || lowerMsg.includes('表示') || lowerMsg.includes('詳細') || lowerMsg.includes('お願い')) &&
        interviewState.suggestedJobs.length > 0) {

        // 番号指定を探す
        const numMatch = message.match(/([1-5一二三四五])/);
        let jobIndex = 0;

        if (numMatch) {
            const numMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '一': 0, '二': 1, '三': 2, '四': 3, '五': 4 };
            jobIndex = numMap[numMatch[1]] || 0;
        }

        const targetJob = interviewState.suggestedJobs[jobIndex];
        if (targetJob) {
            displaySuggestedJobInMain(targetJob);
            return `🎯 「${targetJob.title}」をメインエリアに表示しました！\n\n詳細をご確認の上、「この求人で提案する」ボタンから提案に進めます。`;
        }
    }

    // 並び替え・絞り込みリクエスト
    if (lowerMsg.includes('リモート') || lowerMsg.includes('在宅')) {
        const jobs = storage.getJobs().filter(j => j.conditions?.remote);
        const sorted = jobs.slice(0, 5).map((j, i) => ({ ...j, candidateMatchScore: 70 + i * 5 }));
        interviewState.suggestedJobs = sorted;
        renderInterviewJobList(sorted, 'リモート可能な求人に絞り込みました');
        return `🏠 リモート可能な求人に絞り込みました。\n\n下の一覧に${sorted.length}件表示しています。`;
    }

    if (lowerMsg.includes('年収') && (lowerMsg.includes('高い') || lowerMsg.includes('順'))) {
        const jobs = [...(interviewState.suggestedJobs.length > 0 ? interviewState.suggestedJobs : storage.getJobs())];
        const sorted = jobs.sort((a, b) => {
            const getSalary = (j) => parseInt((j.conditions?.salary || '0').replace(/[^0-9]/g, '')) || 0;
            return getSalary(b) - getSalary(a);
        }).slice(0, 5);
        interviewState.suggestedJobs = sorted;
        renderInterviewJobList(sorted, '年収の高い順に並び替えました');
        return `💰 年収の高い順に並び替えました。\n\n下の一覧をご確認ください。`;
    }

    if (lowerMsg.includes('急募') || lowerMsg.includes('緊急')) {
        const jobs = storage.getJobs().sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0)).slice(0, 5);
        const scored = jobs.map((j, i) => ({ ...j, candidateMatchScore: j.isUrgent ? 90 : 70 - i * 5 }));
        interviewState.suggestedJobs = scored;
        renderInterviewJobList(scored, '急募求人を優先表示しています');
        return `🔥 急募の求人を優先表示しました。\n\n採用ニーズが高く、スピード感を持って進められる求人です。`;
    }

    if (lowerMsg.includes('カルチャー') || lowerMsg.includes('フィット')) {
        handleInterviewQuickAction('interview-culture-fit');
        return '';  // handleInterviewQuickActionでチャットメッセージが追加されるため空を返す
    }

    // 代替提案ロジック
    if (lowerMsg.includes('他に') || lowerMsg.includes('別の') || lowerMsg.includes('もっと')) {
        updateInterviewJobSuggestions();
        return `他の求人候補を探しました。

エージェントとして率直に申し上げますと、**スキルの読み替え**で見えてくる求人もあります。下の一覧をご確認ください。`;
    }

    // 年収に関する質問（シニアコンサルタント視点）
    if (lowerMsg.includes('年収') && candidate) {
        const currentSalary = candidate.currentAnnualIncome || 500;
        const recommendedMin = currentSalary + 30;
        const recommendedMax = currentSalary + 80;
        return `💰 **${candidate.name}さんの年収提案アドバイス**

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 推奨提示額
━━━━━━━━━━━━━━━━━━━━━━━━━━

**${recommendedMin}〜${recommendedMax}万円**

市場の需給バランスを鑑みると、現年収${currentSalary}万円からの+5〜15%アップが妥当なレンジです。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 交渉のポイント
━━━━━━━━━━━━━━━━━━━━━━━━━━

**避けるべきこと**
・現年収を下回る提示（転職動機への疑問を生む）
・根拠なき大幅アップ要求（市場相場から乖離）

**効果的なアプローチ**
・「成長環境」「裁量の大きさ」など非金銭面の価値を訴求
・入社後の評価タイミングでの見直し可能性を確認
・ストックオプションや賞与込みの年収総額で比較

💡 ${candidate.name}さんの市場価値は高いので、複数オファーを取得してから条件交渉に臨むのが得策です。`;
    }

    // デフォルト応答（シニアコンサルタント視点）
    return `面談シート作成をサポートいたします。

エージェントとして率直に申し上げますと、${candidate ? `**${candidate.name}さん**の情報を踏まえて` : '候補者を紐付けると'}、より具体的なアドバイスが可能です。

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 対応可能なご相談
━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 求人の絞り込み・並び替え**
・「リモート可能な求人だけ見せて」
・「年収が高い順に並べて」
・「急募の求人を優先して」
・「カルチャーフィット順に並べて」

**💬 詳細表示・提案**
・「1番目の求人を詳しく見せて」
・「この求人で提案して」

**💰 条件アドバイス**
・「年収はいくらで提示すべき？」

💡 単なるリスト表示ではなく、**「なぜこの求人が合うか」**の視点でアドバイスします。`;
}

// メインカラムに求人を表示（UI連動の核心）
function displaySuggestedJobInMain(job) {
    interviewState.currentSuggestedJob = job;

    const card = document.getElementById('interviewSuggestedJobCard');
    const content = document.getElementById('interviewSuggestedJobContent');

    content.innerHTML = `
        <div style="display: flex; gap: var(--space-4); align-items: flex-start;">
            <div style="flex: 1;">
                <h3 style="margin-bottom: var(--space-2);">${escapeHtml(job.title)}</h3>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-3);">${escapeHtml(job.company)}</p>
                <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-3);">
                    <span class="chip">💰 ${job.conditions?.salary || '-'}</span>
                    <span class="chip">${job.conditions?.remote ? '🏠 リモート可' : '🏢 出社'}</span>
                    <span class="chip">📍 ${job.conditions?.location || '-'}</span>
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">
                    ${escapeHtml(job.description?.substring(0, 200) || '詳細なし')}...
                </p>
            </div>
            <div style="text-align: center; padding: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-lg);">
                <div class="badge-score" style="font-size: 1.5rem;">${job.candidateMatchScore || 80}%</div>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">マッチ度</p>
            </div>
        </div>
    `;

    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 提案実行
function proposeSuggestedJob() {
    const job = interviewState.currentSuggestedJob;
    const candidate = interviewState.linkedCandidate;

    if (!job || !candidate) {
        addChatMessage('ai', '求人と候補者の両方が必要です。');
        return;
    }

    const proposal = {
        proposalKey: generateUUID(),
        candidateKey: candidate.candidateKey,
        jobKey: job.jobKey,
        candidateName: candidate.name,
        jobTitle: job.title,
        status: '提案済み',
        memo: '面談シートから提案',
        lastUpdatedAt: new Date().toISOString(),
        history: [{ at: new Date().toISOString(), fromStatus: null, toStatus: '提案済み' }]
    };

    storage.addProposal(proposal);

    document.getElementById('interviewSuggestedJobCard').style.display = 'none';

    addChatMessage('ai', `✅ ${candidate.name} さんを「${job.title}」に提案しました！\n\n提案済み（進捗）タブから進捗管理ができます。`);
}

// ==========================================
// Proposals Tab AI Functions
// ==========================================
const proposalsState = {
    filteredKeys: null,  // AIによるフィルタ状態（nullなら全表示）
    lastSuggestedJob: null,  // 最後に提案した求人
    conversationContext: []  // 会話コンテキスト
};

// 停滞判定ロジック（7日以上更新なし）
function isStaleProposal(proposal) {
    const lastUpdate = new Date(proposal.lastUpdatedAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastUpdate < weekAgo;
}

// 急ぎ判定ロジック（カジュアル〜二次面接で3日以上動きなし）
function isUrgentProposal(proposal) {
    const urgentStatuses = ['カジュアル面談', '一次面接', '二次面接'];
    if (!urgentStatuses.includes(proposal.status)) return false;

    const lastUpdate = new Date(proposal.lastUpdatedAt);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return lastUpdate < threeDaysAgo;
}

// Proposalsタブ専用クイックアクション
function handleProposalsQuickAction(action) {
    const proposals = storage.getProposals();

    switch (action) {
        case 'proposals-urgent': {
            const urgentProposals = proposals.filter(isUrgentProposal);
            if (urgentProposals.length === 0) {
                addChatMessage('ai', '✅ 現在、急ぎ確認が必要な進捗はありません。\\n\\nすべての案件が順調に進行中です。');
                renderProposals();
                return;
            }

            const keys = urgentProposals.map(p => p.proposalKey);
            proposalsState.filteredKeys = keys;

            const summaryList = urgentProposals.map(p =>
                `• ${p.candidateName}（${p.status}）→ ${formatDate(p.lastUpdatedAt)} から停滞`
            ).join('\\n');

            addChatMessage('ai', `🚨 ** 急ぎ確認が必要な進捗が${urgentProposals.length} 件あります **\\n\\n${summaryList} \\n\\n⬆️ リストを該当者のみに絞り込みました。\\n💡 クリアするには「全件表示」と入力してください。`);
            renderProposals(keys);
            break;
        }

        case 'proposals-stale': {
            const staleProposals = proposals.filter(isStaleProposal);
            if (staleProposals.length === 0) {
                addChatMessage('ai', '✅ 7日以上動いていない進捗はありません。\\n\\n全案件がアクティブです！');
                renderProposals();
                return;
            }

            const keys = staleProposals.map(p => p.proposalKey);
            proposalsState.filteredKeys = keys;

            const summaryList = staleProposals.map(p =>
                `• ${p.candidateName}（${p.status}）→ ${formatDate(p.lastUpdatedAt)} 以降更新なし`
            ).join('\\n');

            addChatMessage('ai', `⏸️ ** 7日以上動いていない進捗が${staleProposals.length} 件あります **\\n\\n${summaryList} \\n\\n⬆️ リストを該当者のみに絞り込みました。\\n💡 「全件表示」で元に戻せます。`);
            renderProposals(keys);
            break;
        }
    }
}

// Proposalsタブ専用AI対話処理（シニアコンサルタント視点）
async function handleProposalsAiChat(message) {
    const lowerMessage = message.toLowerCase();
    const proposals = storage.getProposals();
    const jobs = storage.getJobs();

    // 全件表示リクエスト
    if (lowerMessage.includes('全件') || lowerMessage.includes('すべて') || lowerMessage.includes('リセット')) {
        proposalsState.filteredKeys = null;
        renderProposals();
        return `✅ リストをクリアし、全件表示に戻しました。

現在、全${proposals.length}件の進捗を管理中です。`;
    }

    // 急ぎ確認（停滞原因の3軸分析付き）
    if (lowerMessage.includes('急ぎ') || lowerMessage.includes('確認必要')) {
        const urgentProposals = proposals.filter(isUrgentProposal);
        if (urgentProposals.length === 0) {
            return `✅ 現在、急ぎ確認が必要な進捗はありません。

エージェントとして率直に申し上げますと、全案件が順調に進行しており、このペースを維持してください。

💡 **推奨アクション**
・各候補者への定期的な状況確認（週1回程度）
・企業側の意思決定スケジュールの確認
・他社選考状況の把握`;
        }

        const keys = urgentProposals.map(p => p.proposalKey);
        proposalsState.filteredKeys = keys;
        renderProposals(keys);

        const summaryList = urgentProposals.slice(0, 5).map(p =>
            `・**${p.candidateName}**（${p.status}）`
        ).join('\n');

        return `🚨 **急ぎ確認が必要な進捗が${urgentProposals.length}件あります**

${summaryList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 停滞原因の3軸分析
━━━━━━━━━━━━━━━━━━━━━━━━━━

【市場環境要因】
・同ポジションの競争率が高まっている可能性
・採用予算の見直しや組織変更が発生している可能性

【候補者の意向要因】
・他社選考との並行により優先順位が変動
・現職からの引き止めを受けている可能性

【企業の選考スピード要因】
・面接官のスケジュール調整に時間がかかっている
・社内稟議プロセスの遅延

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 推奨アクション
━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **今すぐ**: 候補者への連絡で他社状況を再確認
📋 **本日中**: 企業人事に次回ステップの見込み確認

⬆️ リストを絞り込みました。この条件で確認を進めますか？`;
    }

    // 動いていない進捗
    if (lowerMessage.includes('動いて') || lowerMessage.includes('止まっ') || lowerMessage.includes('停滞')) {
        const staleProposals = proposals.filter(isStaleProposal);
        if (staleProposals.length === 0) {
            return `✅ 7日以上動いていない進捗はありません。

市場の需給バランスを鑑みると、このスピード感は非常に良好です。全案件がアクティブに進行中ですので、このペースを維持してください。`;
        }

        const keys = staleProposals.map(p => p.proposalKey);
        proposalsState.filteredKeys = keys;
        renderProposals(keys);

        const summaryList = staleProposals.slice(0, 5).map(p =>
            `・**${p.candidateName}**（${p.status}）→ 最終更新: ${formatDate(p.lastUpdatedAt)}`
        ).join('\n');

        return `⏸️ **7日以上動いていない進捗が${staleProposals.length}件**

${summaryList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 停滞打破のための具体的アクション
━━━━━━━━━━━━━━━━━━━━━━━━━━

**1. 候補者へのアプローチ**
・業界ニュースや事例記事を送付し、接点を維持
・「その後いかがですか」ではなく「〇〇の情報をお伝えしたく」で連絡

**2. 企業へのアプローチ**
・選考状況の確認と次回ステップの日程具体化
・必要に応じて候補者の追加情報を提供

**3. 判断の要請**
・期限を設けた意思確認（「今週中にご判断いただけると幸いです」）

⬆️ リストを絞り込みました。代替求人を検討しますか？`;
    }

    // 代替求人の提案（ピボット戦略）
    if (lowerMessage.includes('他に') || lowerMessage.includes('別の') || lowerMessage.includes('求人') || lowerMessage.includes('代替') || lowerMessage.includes('ピボット')) {
        if (jobs.length === 0) {
            return '現在登録されている求人がありません。「求人票から検索」タブから求人を追加してください。';
        }

        // スコア付きで3件の求人を提案
        const shuffled = [...jobs].sort(() => 0.5 - Math.random()).slice(0, 3);
        proposalsState.lastSuggestedJob = shuffled[0];

        const jobList = shuffled.map((j, i) =>
            `**${i + 1}. ${j.title}**（${j.company}）
   💰 ${j.conditions?.salary || '要相談'} ${j.conditions?.remote ? '/ 🏠 リモート可' : ''}
   📊 マッチ度: ${70 + Math.floor(Math.random() * 20)}%`
        ).join('\n\n');

        return `💡 **ピボット提案：スキルの読み替えで可能性を広げます**

市場の需給バランスを鑑みると、以下の求人が候補として浮かびます。厳密には職種が異なるケースもありますが、**「課題解決力」**という軸で読み替えると、マッチングの可能性が見えてきます。

${jobList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

気になる求人があれば「1番目を詳しく」などとお伝えください。

**この条件でリストを絞り込みますか？** または **代替求人を詳しく表示しますか？**`;
    }

    // 承諾処理（「お願い」「それで」「OK」など）
    if (lowerMessage.includes('お願い') || lowerMessage.includes('それで') || lowerMessage.match(/^(ok|yes|はい)/)) {
        if (proposalsState.lastSuggestedJob) {
            const job = proposalsState.lastSuggestedJob;
            showJobDetailModal(job.jobKey);
            proposalsState.lastSuggestedJob = null;
            return `✅ 「${job.title}」の詳細を表示しました。

この求人で提案する候補者を選定してください。推薦文の作成もサポートします。`;
        }
        return 'どの求人についてでしょうか？「他に良い求人は？」などと聞いていただければ、ピボット戦略に基づいた提案をいたします。';
    }

    // 番号指定での求人選択
    const numberMatch = lowerMessage.match(/(\d+)番/);
    if (numberMatch) {
        const allJobs = storage.getJobs();
        const index = parseInt(numberMatch[1]) - 1;

        if (index >= 0 && index < allJobs.length) {
            const job = allJobs[index];
            showJobDetailModal(job.jobKey);
            return `✅ 「${job.title}」の詳細を表示しました。

エージェントとして率直に申し上げますと、この求人は**成長フェーズの企業**であり、変革を推進したい候補者に響きやすいポジションです。`;
        }
    }

    // ステータス別集計
    if (lowerMessage.includes('集計') || lowerMessage.includes('まとめ') || lowerMessage.includes('状況')) {
        const statusCounts = {};
        proposals.forEach(p => {
            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        });

        const statuses = ['提案済み', 'カジュアル面談', '一次面接', '二次面接', '三次面接', '内定', '内定承諾', '決定'];
        const summary = statuses.map(s =>
            statusCounts[s] ? `・**${s}**: ${statusCounts[s]}件` : null
        ).filter(Boolean).join('\n');

        const staleCount = proposals.filter(isStaleProposal).length;
        const urgentCount = proposals.filter(isUrgentProposal).length;
        const decisionRate = proposals.length > 0
            ? Math.round((statusCounts['決定'] || 0) / proposals.length * 100)
            : 0;

        return `📊 **進捗状況サマリ**

${summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ アラート
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 要確認: **${urgentCount}件**
⏸️ 停滞中: **${staleCount}件**

━━━━━━━━━━━━━━━━━━━━━━━━━━
■ KPI分析
━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 決定率: **${decisionRate}%**

私の経験則から申し上げると、${staleCount > 0 ? '停滞中の案件にテコ入れすることで、全体の決定率を10〜15%向上させることが可能です。' : '現在のパイプラインは健全な状態です。'}`;
    }

    // デフォルト応答（シニアコンサルタント視点）
    return `進捗管理についてサポートいたします。

エージェントとして率直に申し上げますと、以下の観点から進捗を分析できます：

📋 **対応可能なご相談**
・「急ぎ確認が必要な進捗は？」→ 停滞原因の3軸分析付き
・「動いていない進捗を教えて」→ 停滞打破の具体的アクション提案
・「状況を集計して」→ KPI分析と改善ポイント
・「他に良い求人は？」→ ピボット戦略に基づく代替提案

💡 **活用のコツ**
単なるリスト表示ではなく、**「なぜ停滞しているか」「どう打破するか」**の視点でアドバイスします。`;
}

