/**
 * Match App - Proposals & Other Dummy Data
 */

import { generateUUID } from '../lib/utils.js';

// ==========================================
// Proposals (10+ items)
// ==========================================
export const dummyProposals = [
    {
        proposalKey: generateUUID(),
        candidateKey: '', // Will be linked during initialization
        jobKey: '',
        candidateName: '山田 花子',
        jobTitle: '採用担当（新卒・中途）｜人事制度にも関われる',
        status: '面談調整',
        memo: '書類選考通過。来週中に1次面接を設定予定。',
        lastUpdatedAt: '2024-03-20T10:00:00Z',
        lastContactAt: '2024-03-19T15:00:00Z',
        nextActionAt: '2024-03-22T10:00:00Z',
        nextAction: '1次面接日程調整',
        owner: '自分',
        history: [
            { at: '2024-03-15T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-18T14:00:00Z', fromStatus: '提案済', toStatus: '返信待ち' },
            { at: '2024-03-19T15:00:00Z', fromStatus: '返信待ち', toStatus: '面談調整' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '佐藤 太郎',
        jobTitle: '経理（メンバー）｜20代歓迎',
        status: '提案済',
        memo: '経験豊富だが年齢面での懸念あり。',
        lastUpdatedAt: '2024-03-18T11:00:00Z',
        lastContactAt: null,
        nextActionAt: '2024-03-25T10:00:00Z',
        nextAction: 'フォローアップ連絡',
        owner: '自分',
        history: [
            { at: '2024-03-18T11:00:00Z', fromStatus: null, toStatus: '提案済' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '鈴木 一郎',
        jobTitle: 'カスタマーサクセス（リーダー候補）',
        status: '面談済',
        memo: '1次面接完了。好感触。2次面接に進む見込み。',
        lastUpdatedAt: '2024-03-19T16:00:00Z',
        lastContactAt: '2024-03-19T14:00:00Z',
        nextActionAt: '2024-03-21T10:00:00Z',
        nextAction: '2次面接調整',
        owner: '自分',
        history: [
            { at: '2024-03-10T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-12T11:00:00Z', fromStatus: '提案済', toStatus: '面談調整' },
            { at: '2024-03-19T14:00:00Z', fromStatus: '面談調整', toStatus: '面談済' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '田中 美咲',
        jobTitle: '採用担当（新卒・中途）｜人事制度にも関われる',
        status: '返信待ち',
        memo: 'マーケ経験を採用広報に活かせる可能性。',
        lastUpdatedAt: '2024-03-17T10:00:00Z',
        lastContactAt: '2024-03-17T10:00:00Z',
        nextActionAt: '2024-03-24T10:00:00Z',
        nextAction: '返信確認',
        owner: '自分',
        history: [
            { at: '2024-03-15T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-17T10:00:00Z', fromStatus: '提案済', toStatus: '返信待ち' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '高橋 健太',
        jobTitle: 'フロントエンドエンジニア｜React/TypeScript',
        status: '面談調整',
        memo: '技術面は申し分なし。カルチャーフィット確認が重要。',
        lastUpdatedAt: '2024-03-20T09:00:00Z',
        lastContactAt: '2024-03-19T18:00:00Z',
        nextActionAt: '2024-03-22T14:00:00Z',
        nextAction: '1次面接',
        owner: '自分',
        history: [
            { at: '2024-03-12T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-15T11:00:00Z', fromStatus: '提案済', toStatus: '返信待ち' },
            { at: '2024-03-18T10:00:00Z', fromStatus: '返信待ち', toStatus: '面談調整' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '伊藤 さくら',
        jobTitle: '経理（メンバー）｜20代歓迎',
        status: '決定',
        memo: '内定承諾！4月入社予定。',
        lastUpdatedAt: '2024-03-15T17:00:00Z',
        lastContactAt: '2024-03-15T17:00:00Z',
        nextActionAt: null,
        nextAction: '',
        owner: '自分',
        history: [
            { at: '2024-02-20T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-02-25T11:00:00Z', fromStatus: '提案済', toStatus: '面談調整' },
            { at: '2024-03-01T14:00:00Z', fromStatus: '面談調整', toStatus: '面談済' },
            { at: '2024-03-15T17:00:00Z', fromStatus: '面談済', toStatus: '決定' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '渡辺 誠',
        jobTitle: 'カスタマーサクセス（リーダー候補）',
        status: '見送り',
        memo: '他社で内定承諾のため辞退。',
        lastUpdatedAt: '2024-03-10T10:00:00Z',
        lastContactAt: '2024-03-10T10:00:00Z',
        nextActionAt: null,
        nextAction: '',
        owner: '自分',
        history: [
            { at: '2024-02-28T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-05T11:00:00Z', fromStatus: '提案済', toStatus: '面談調整' },
            { at: '2024-03-10T10:00:00Z', fromStatus: '面談調整', toStatus: '見送り' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '中村 陽子',
        jobTitle: 'カスタマーサクセス（リーダー候補）',
        status: '提案済',
        memo: 'CS経験あり。リーダー志向も強い。',
        lastUpdatedAt: '2024-03-19T11:00:00Z',
        lastContactAt: null,
        nextActionAt: '2024-03-26T10:00:00Z',
        nextAction: '初回フォロー',
        owner: '自分',
        history: [
            { at: '2024-03-19T11:00:00Z', fromStatus: null, toStatus: '提案済' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '加藤 あゆみ',
        jobTitle: '採用担当（新卒・中途）｜人事制度にも関われる',
        status: '面談済',
        memo: 'デザイン視点での採用ブランディングに期待。最終面接へ。',
        lastUpdatedAt: '2024-03-18T15:00:00Z',
        lastContactAt: '2024-03-18T14:00:00Z',
        nextActionAt: '2024-03-25T10:00:00Z',
        nextAction: '最終面接',
        owner: '自分',
        history: [
            { at: '2024-03-01T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-08T11:00:00Z', fromStatus: '提案済', toStatus: '面談調整' },
            { at: '2024-03-15T14:00:00Z', fromStatus: '面談調整', toStatus: '面談済' }
        ]
    },
    {
        proposalKey: generateUUID(),
        candidateKey: '',
        jobKey: '',
        candidateName: '林 健一',
        jobTitle: 'フロントエンドエンジニア｜React/TypeScript',
        status: '返信待ち',
        memo: 'PdMからエンジニアへのキャリアチェンジ希望。技術力要確認。',
        lastUpdatedAt: '2024-03-16T10:00:00Z',
        lastContactAt: '2024-03-16T10:00:00Z',
        nextActionAt: '2024-03-23T10:00:00Z',
        nextAction: '返信フォロー',
        owner: '自分',
        history: [
            { at: '2024-03-14T10:00:00Z', fromStatus: null, toStatus: '提案済' },
            { at: '2024-03-16T10:00:00Z', fromStatus: '提案済', toStatus: '返信待ち' }
        ]
    }
];

// ==========================================
// Interviews
// ==========================================
export const dummyInterviews = [
    {
        interviewKey: 'int-001',
        candidateKey: '', // Will be linked
        inputType: '文字起こし',
        originalText: `面接官: 本日はお時間いただきありがとうございます。まず自己紹介をお願いできますか。

鈴木さん: はい、鈴木一郎と申します。IT系企業で法人営業を8年ほど経験してきました。直近ではSaaSプロダクトの新規開拓からカスタマーサクセス的な役割まで幅広く担当しておりました。

面接官: 転職理由を教えてください。

鈴木さん: 現職ではセールスとマーケ両方を担当しているのですが、より営業に特化した環境で専門性を高めたいと考えています。特にエンタープライズ向けの営業力を磨きたいです。

面接官: 強みは何だと思いますか。

鈴木さん: チームでの協調性と、粘り強く顧客に向き合う姿勢だと思います。数字へのコミットメントも強いです。

面接官: 逆に改善したい点は？

鈴木さん: 正直、転職回数が多いのは自覚しています。ただ、それぞれで確実に成長してきたつもりです。次は長く腰を据えて働きたいと考えています。`,
        analysisReport: {
            careerSummary: 'IT系企業にて法人営業8年の経験。SaaS領域での新規開拓からCSまで幅広く担当。',
            hardEvaluation: '法人営業スキルは十分。MAツール活用経験あり。',
            softEvaluation: '協調性・粘り強さが強み。コミュニケーション良好。',
            hireability: '転職回数の多さが懸念だが、意欲は高い。',
            concerns: '転職回数が多い点は確認が必要。',
            preferences: '年収450万〜600万円、リモート希望',
            nextInterviewPoints: '長期就業意向の確認、具体的な成果のヒアリング',
            scenario: '1次面接で適性確認後、2次で条件交渉へ'
        },
        nextStep: '2次面接で具体的な成果と長期就業意向を確認',
        createdAt: '2024-03-15T14:00:00Z',
        updatedAt: '2024-03-15T15:00:00Z'
    },
    {
        interviewKey: 'int-002',
        candidateKey: '',
        inputType: '手入力',
        originalText: `田中さんとの面談メモ：

・デジタルマーケティング5年、SNS運用からWeb広告まで一貫して経験
・Tableauでのダッシュボード構築が得意
・論理的で話が分かりやすい
・成長意欲が高く、新しい領域にも積極的
・希望年収は400万〜550万円、リモート希望

懸念点：
・マネジメント経験がないため、リーダーポジションは難しい可能性
・BtoB経験が少ない

印象：
・明るく前向きで好印象
・質問への回答が具体的で論理的`,
        analysisReport: {
            careerSummary: 'EC企業でデジタルマーケティング5年経験。SNS運用、Web広告、データ分析が得意。',
            hardEvaluation: 'マーケティング全般のスキルあり。データ分析に強み。',
            softEvaluation: '論理性、創造性、スピード感あり。明るく前向き。',
            hireability: 'メンバーレベルであれば高評価。リーダーは要検討。',
            concerns: 'マネジメント経験なし、BtoB経験不足',
            preferences: '年収400万〜550万円、リモート希望',
            nextInterviewPoints: 'BtoB適性の確認、成長意欲の深掘り',
            scenario: 'メンバーとして採用し、1年後にリーダー候補へ'
        },
        nextStep: 'マッチする求人2〜3件を提案し反応を確認',
        createdAt: '2024-03-10T11:00:00Z',
        updatedAt: '2024-03-10T12:00:00Z'
    }
];

// ==========================================
// Saved Views
// ==========================================
export const dummySavedViews = [
    {
        id: generateUUID(),
        name: 'リモート希望の営業経験者',
        tabType: 'candidate-search',
        naturalQuery: 'リモート希望 営業',
        filters: {
            jobType: '営業',
            remote: true
        },
        sortType: 'matchScore',
        createdAt: '2024-03-01T10:00:00Z'
    },
    {
        id: generateUUID(),
        name: '高スコア候補者（80%以上）',
        tabType: 'candidate-search',
        naturalQuery: '決まりやすい人',
        filters: {
            minMarketScore: 80
        },
        sortType: 'marketScore',
        createdAt: '2024-03-05T14:00:00Z'
    },
    {
        id: generateUUID(),
        name: 'エンジニア（フルリモート可）',
        tabType: 'job-search',
        naturalQuery: 'エンジニア フルリモート',
        filters: {
            jobType: 'エンジニア',
            remote: true
        },
        sortType: 'salary',
        createdAt: '2024-03-10T09:00:00Z'
    }
];

// ==========================================
// Initial Chat History
// ==========================================
export const dummyChatHistory = {
    'global': [
        {
            role: 'ai',
            content: 'こんにちは！Matchへようこそ。候補者の検索、求人とのマッチング、面談シートの作成など、何でもお手伝いします。左のタブから機能を選択するか、こちらに質問をどうぞ。',
            timestamp: '2024-03-20T09:00:00Z'
        }
    ]
};
