/**
 * Match App - Dummy Data Generator
 * Creates realistic demo data based on user-provided examples
 */

import { generateUUID } from '../lib/utils.js';

// ==========================================
// Candidates Data
// ==========================================
export const dummyCandidates = [
    {
        candidateKey: generateUUID(),
        name: '山田 花子',
        jobType: '採用・人事',
        experience: '6年',
        hardSkills: ['採用', 'PM', 'UI/UX設計', '新規事業'],
        softSkills: ['論理性', '主体性', 'コミュニケーション力'],
        negativeChecks: [],
        marketScore: 82,
        matchScore: 88,
        matchLabel: 'かなり相性が良い',
        matchReasons: [
            '採用領域での豊富な実務経験があります',
            'PM・プロダクト企画のスキルが活かせます',
            'スタートアップでの成長意欲が高いです'
        ],
        preferences: {
            salary: '500万〜700万円',
            remote: true,
            location: '東京都',
            startDate: '相談可'
        },
        proposalMemo: '',
        resume: {
            summary: '大手人材サービス企業での新卒採用・採用支援営業を経て、新卒領域プロダクトのPMOを担当。その後、家業関連企業にて飲食・宿泊の新規事業立ち上げを統括。現在はスタートアップにて採用企画・候補者体験設計に従事。副業でAI面接関連プロダクトのUI/UX設計にも参画中。',
            detail: '【経歴詳細】\n\n■ A社（大手人材サービス）2018年〜2021年\n・新卒採用支援営業として2年間で目標達成率120%\n・採用イベント企画・運営（年間50件以上）\n・新卒向けプロダクトのPMOとして機能改善を推進\n\n■ B社（家業関連）2021年〜2023年\n・飲食・宿泊新規事業の立ち上げ責任者（役員）\n・事業計画策定、採用・育成、運営設計を統括\n・初年度から黒字化を達成\n\n■ C社（スタートアップ）2023年〜現在\n・採用業務全般を担当\n・候補者体験設計、選考プロセス改善を推進\n・応募数30%増加に貢献'
        },
        interviewDataKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-20T15:30:00Z'
    },
    {
        candidateKey: generateUUID(),
        name: '佐藤 太郎',
        jobType: '財務・経理',
        experience: '22年',
        hardSkills: ['財務', '経理', '監査対応', '銀行交渉', 'マネジメント'],
        softSkills: ['正確性', '柔軟性', '問題解決力'],
        negativeChecks: ['年齢層が高め'],
        marketScore: 68,
        matchScore: 75,
        matchLabel: '相性が良い',
        matchReasons: [
            '財務経理の幅広い実務経験があります',
            'マネジメント経験が豊富です',
            '複数業界での経験が活かせます'
        ],
        preferences: {
            salary: '600万〜800万円',
            remote: false,
            location: '東京都・千葉県',
            startDate: '1ヶ月後'
        },
        proposalMemo: '',
        resume: {
            summary: '会計事務所・事業会社等で約20年以上、財務経理に従事。帳票作成から監査対応、銀行交渉、申告関連まで幅広く対応。システム導入、業務フロー改善、複数社の経営管理、バックオフィス部門のマネジメント経験あり。簿記2級保有。',
            detail: '【経歴詳細】\n\n■ E社（医療・福祉関連）\n・財務経理から経営企画まで担当\n・グループ複数社の管理\n・取締役として規程整備、ISO/ISMS管理\n\n■ H社（医療・福祉関連）\n・管理部門課長として人事総務労務給与+財務経理\n・銀行交渉を担当\n\n■ I社（会計事務所）\n・巡回監査、申告書作成\n・経営分析、融資交渉\n・セミナー講師'
        },
        interviewDataKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-03-18T11:00:00Z'
    },
    {
        candidateKey: generateUUID(),
        name: '鈴木 一郎',
        jobType: '営業',
        experience: '8年',
        hardSkills: ['法人営業', 'MA', 'CRM', 'プレゼンテーション'],
        softSkills: ['はきはき', '協調性', '粘り強さ'],
        negativeChecks: ['転職回数が多い'],
        marketScore: 71,
        matchScore: 72,
        matchLabel: '相性が良い',
        matchReasons: [
            '法人営業の豊富な経験があります',
            'MAツールの活用経験が強みです',
            'チームでの協調性が高評価です'
        ],
        preferences: {
            salary: '450万〜600万円',
            remote: true,
            location: '首都圏',
            startDate: '即日可'
        },
        proposalMemo: '熱意があり即戦力として期待。',
        resume: {
            summary: 'IT系企業を中心に法人営業を8年経験。SaaSプロダクトの新規開拓から既存顧客のアップセルまで幅広く担当。直近ではMA/CRMを活用した営業効率化プロジェクトをリード。',
            detail: '【経歴詳細】\n\n■ IT企業A 2016年〜2019年\n・法人営業として新規開拓を担当\n・年間売上目標達成率130%\n\n■ SaaS企業B 2019年〜2022年\n・エンタープライズ営業\n・契約単価平均200万円/年\n・チームリーダーとして5名をマネジメント\n\n■ スタートアップC 2022年〜現在\n・セールス&マーケティング担当\n・MA導入プロジェクトをリード'
        },
        interviewDataKeys: ['int-001'],
        chatHistoryKeys: [],
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-03-15T09:00:00Z'
    },
    {
        candidateKey: generateUUID(),
        name: '田中 美咲',
        jobType: 'マーケティング',
        experience: '5年',
        hardSkills: ['デジタルマーケ', 'SNS運用', 'データ分析', 'Tableau'],
        softSkills: ['創造性', 'スピード感', '論理性'],
        negativeChecks: [],
        marketScore: 78,
        matchScore: 81,
        matchLabel: 'かなり相性が良い',
        matchReasons: [
            'デジタルマーケティングの実績が豊富です',
            'データドリブンなアプローチが得意です',
            '成長意欲が高く学習速度が速いです'
        ],
        preferences: {
            salary: '400万〜550万円',
            remote: true,
            location: '東京都',
            startDate: '相談可'
        },
        proposalMemo: '',
        resume: {
            summary: 'EC企業でデジタルマーケティングを5年経験。SNS運用からWeb広告、データ分析まで一貫して担当。Tableauを活用したダッシュボード構築でチームの意思決定速度を向上。',
            detail: '【経歴詳細】\n\n■ EC企業 2019年〜現在\n・デジタルマーケティング担当\n・SNSフォロワー10万人増加に貢献\n・Web広告ROAS 400%達成\n・Tableauでの分析基盤構築'
        },
        interviewDataKeys: ['int-002'],
        chatHistoryKeys: [],
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-03-19T16:00:00Z'
    },
    {
        candidateKey: generateUUID(),
        name: '高橋 健太',
        jobType: 'エンジニア',
        experience: '7年',
        hardSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
        softSkills: ['論理性', '自走力', '丁寧さ'],
        negativeChecks: ['コミュニケーション面で改善余地'],
        marketScore: 85,
        matchScore: 79,
        matchLabel: '相性が良い',
        matchReasons: [
            'フロントエンド技術に強みがあります',
            'クラウド経験もあり幅広く対応可能です',
            '自走して開発を進められます'
        ],
        preferences: {
            salary: '600万〜900万円',
            remote: true,
            location: 'フルリモート可',
            startDate: '2ヶ月後'
        },
        proposalMemo: '技術力高い。コミュニケーション面は面談で確認。',
        resume: {
            summary: 'Web系企業でフロントエンド開発を中心に7年の経験。React/TypeScriptを用いた大規模SPA開発に従事。AWSでのインフラ構築経験もあり、フルスタックに対応可能。',
            detail: '【経歴詳細】\n\n■ Web企業A 2017年〜2020年\n・フロントエンドエンジニア\n・Reactでの管理画面開発\n\n■ スタートアップB 2020年〜現在\n・リードエンジニア\n・TypeScript/React/Node.jsのフルスタック開発\n・AWS環境構築・運用'
        },
        interviewDataKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-01-25T11:00:00Z',
        updatedAt: '2024-03-17T14:00:00Z'
    }
];

// Generate additional 15 candidates
const additionalCandidateTemplates = [
    { name: '伊藤 さくら', jobType: '経理', experience: '4年', marketScore: 74, skills: ['経理', '仕訳', '月次決算'] },
    { name: '渡辺 誠', jobType: 'PM', experience: '6年', marketScore: 80, skills: ['PM', 'Agile', 'Jira'] },
    { name: '中村 陽子', jobType: 'カスタマーサクセス', experience: '3年', marketScore: 69, skills: ['CS', 'チャーン防止', 'オンボーディング'] },
    { name: '小林 大輔', jobType: '総務', experience: '10年', marketScore: 62, skills: ['総務', '法務', '規程管理'] },
    { name: '加藤 あゆみ', jobType: 'デザイナー', experience: '5年', marketScore: 77, skills: ['Figma', 'UI設計', 'ブランディング'] },
    { name: '吉田 翔', jobType: '営業', experience: '3年', marketScore: 66, skills: ['インサイドセールス', 'SaaS', 'Salesforce'] },
    { name: '山本 愛', jobType: '人事', experience: '8年', marketScore: 73, skills: ['採用', '教育研修', '制度設計'] },
    { name: '中島 拓也', jobType: 'マーケティング', experience: '4年', marketScore: 71, skills: ['コンテンツマーケ', 'SEO', 'GA4'] },
    { name: '松本 理恵', jobType: 'エンジニア', experience: '5年', marketScore: 83, skills: ['Python', 'Django', 'GCP'] },
    { name: '井上 雄太', jobType: '企画', experience: '6年', marketScore: 70, skills: ['事業企画', '市場調査', 'Excel'] },
    { name: '木村 千夏', jobType: '経理', experience: '7年', marketScore: 76, skills: ['決算', '税務', '監査対応'] },
    { name: '林 健一', jobType: 'PdM', experience: '4年', marketScore: 82, skills: ['PdM', 'ユーザーリサーチ', 'ロードマップ'] },
    { name: '斎藤 梨花', jobType: '広報', experience: '5年', marketScore: 68, skills: ['PR', 'メディアリレーション', 'SNS'] },
    { name: '清水 俊介', jobType: 'エンジニア', experience: '8年', marketScore: 86, skills: ['Go', 'Kubernetes', 'マイクロサービス'] },
    { name: '森 美穂', jobType: '管理職', experience: '12年', marketScore: 65, skills: ['マネジメント', '組織開発', '人材育成'] }
];

additionalCandidateTemplates.forEach((template, index) => {
    const softSkillOptions = [
        ['協調性', '真面目', '責任感'],
        ['論理性', '主体性', 'スピード感'],
        ['コミュニケーション力', '傾聴力', '柔軟性'],
        ['はきはき', '積極的', 'ポジティブ']
    ];

    const negativeOptions = [
        [],
        ['応答が遅い傾向'],
        ['経験領域が狭い'],
        ['転職回数が多め']
    ];

    const labels = ['かなり相性が良い', '相性が良い', '可能性あり', '要検討'];
    const matchScore = 50 + Math.floor(Math.random() * 40);
    const labelIndex = matchScore >= 85 ? 0 : matchScore >= 70 ? 1 : matchScore >= 55 ? 2 : 3;

    dummyCandidates.push({
        candidateKey: generateUUID(),
        name: template.name,
        jobType: template.jobType,
        experience: template.experience,
        hardSkills: template.skills,
        softSkills: softSkillOptions[index % 4],
        negativeChecks: negativeOptions[index % 4],
        marketScore: template.marketScore,
        matchScore: matchScore,
        matchLabel: labels[labelIndex],
        matchReasons: [
            `${template.jobType}領域での経験が活かせます`,
            `${template.skills[0]}のスキルがマッチしています`,
            '成長意欲が感じられます'
        ],
        preferences: {
            salary: `${400 + index * 20}万〜${550 + index * 20}万円`,
            remote: index % 2 === 0,
            location: '首都圏',
            startDate: '相談可'
        },
        proposalMemo: '',
        resume: {
            summary: `${template.jobType}領域で${template.experience}の経験を有する。${template.skills.join('・')}のスキルを持ち、即戦力として期待できる。`,
            detail: ''
        },
        interviewDataKeys: index % 3 === 0 ? [`int-0${index}`] : [],
        chatHistoryKeys: [],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
});
