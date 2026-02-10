/**
 * Match App - Jobs Dummy Data
 */

import { generateUUID } from '../lib/utils.js';

export const dummyJobs = [
    {
        jobKey: generateUUID(),
        title: '経理（メンバー）｜20代歓迎｜経理×財務×経営の経験ができる環境',
        company: 'A社（成長IT企業）',
        description: `【入社直後／まずお任せしたいこと】
・仕訳入力、伝票処理
・月次締めのサポート
・入出金管理
・経費精算のチェック
・各種データ集計

【半年後〜お任せしたい業務】
・月次決算の担当
・取引先ごとの科目集計
・支払業務の管理
・財務領域のサポート

【将来的に挑戦できる領域】
・予算策定／実績管理
・経営分析
・関連会社の経理
・一部のIR・管理会計領域

▼このチームで働く魅力
・裁量がありつつ、数字の規模も大きく、レベルの高い経験が積める
・育成環境があり、伸びしろ／素直さ／吸収力を重視
・成長意欲がある人に業務幅を任せる文化`,
        highlights: [
            '裁量が大きく成長できる環境',
            '経理から経営企画へのキャリアパスあり',
            'フルフレックス制度',
            '育成重視の文化'
        ],
        conditions: {
            salary: '350万〜500万円',
            salaryHigh: false,
            remote: true,
            location: '東京都内（主要駅徒歩圏）',
            employmentType: '正社員',
            workStyle: 'フルフレックス'
        },
        requiredSkills: ['経理実務経験2〜3年', '月次業務の理解', '簿記3級以上'],
        preferredSkills: ['簿記2級', 'スプレッドシート／Excelでの集計経験', '財務・管理会計への関心'],
        benefits: ['交通費支給', '近隣住宅手当', '家族手当', '結婚祝い金'],
        hasStar: true,
        starReason: 'リモートワーク対応、フルフレックス制度で柔軟な働き方が可能',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-03-15T14:00:00Z'
    },
    {
        jobKey: generateUUID(),
        title: '事務長（多店舗マネジメント経験者向け）',
        company: 'B社（医療・ヘルスケア）',
        description: `飲食・小売・美容・サービス業などで培った「人を育て、チームを安定運営し、成果を出すマネジメント力」を、医療現場で活かしていただくポジションです。

医療知識やレセプト等の現場実務は入社後に習得可能なため、最優先するのはピープルマネジメント力・組織運営力・現場改善力です。

【組織マネジメント】
・医師・看護師・事務スタッフ等のマネジメント
・シフト／配置設計、育成、モチベーションマネジメント
・現場課題の抽出と改善推進
・本部方針・ルールの現場浸透

【運営・改善】
・業務オペレーションの標準化・改善
・患者満足度／業務品質向上の施策
・数値管理・KPI改善

▼ポジションの魅力
・サービス業で培ったマネジメント力を医療領域で活かせる
・組織づくり／仕組み化に本気で関われる
・多拠点マネージャー／事業責任者などキャリアパスあり`,
        highlights: [
            'サービス業経験が活かせる',
            '医療業界未経験OK',
            'マネージャーへのキャリアパスあり',
            'リモート制度あり（評価による）'
        ],
        conditions: {
            salary: '400万〜600万円',
            salaryHigh: false,
            remote: false,
            location: '首都圏（千葉県内）',
            employmentType: '正社員',
            workStyle: 'シフト制'
        },
        requiredSkills: ['10名以上のスタッフマネジメント経験', '複数店舗のマネジメント経験', '現場オペレーション改善'],
        preferredSkills: ['店長／SV経験', 'KPI管理', '医療・ヘルスケアへの関心'],
        benefits: ['副業可', '社会保険完備', '健康診断'],
        hasStar: false,
        starReason: 'シフト制のため柔軟性に欠ける点が改善ポイントです',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-03-10T11:00:00Z'
    },
    {
        jobKey: generateUUID(),
        title: 'フロントエンドエンジニア｜React/TypeScript｜フルリモート可',
        company: 'C社（SaaSスタートアップ）',
        description: `【業務内容】
・自社SaaSプロダクトのフロントエンド開発
・React/TypeScriptを用いたSPA開発
・デザイナーと連携したUI/UX改善
・パフォーマンス最適化
・テスト自動化の推進

【技術スタック】
・React 18 / TypeScript
・Next.js / Vite
・TanStack Query / Zustand
・Tailwind CSS
・Jest / Playwright

【チーム構成】
・エンジニア8名（フロント3名、バックエンド4名、SRE1名）
・PdM 2名、デザイナー2名

【魅力ポイント】
・技術選定に関われる
・週1出社、それ以外はフルリモート
・書籍購入・カンファレンス参加支援あり`,
        highlights: [
            'フルリモート可（週1出社）',
            '技術選定に関われる',
            'モダンな技術スタック',
            '学習支援制度充実'
        ],
        conditions: {
            salary: '600万〜900万円',
            salaryHigh: true,
            remote: true,
            location: 'フルリモート（月1〜4出社）',
            employmentType: '正社員',
            workStyle: 'フレックス'
        },
        requiredSkills: ['React経験3年以上', 'TypeScript実務経験', 'SPA開発経験'],
        preferredSkills: ['Next.js', 'テスト自動化', 'CI/CD構築'],
        benefits: ['書籍購入支援', 'カンファレンス参加支援', 'リモートワーク手当', '副業OK'],
        hasStar: true,
        starReason: '年収が市場水準より高く、フルリモート対応で注目が集まりやすいです',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-02-20T10:00:00Z',
        updatedAt: '2024-03-18T16:00:00Z'
    },
    {
        jobKey: generateUUID(),
        title: 'カスタマーサクセス（リーダー候補）',
        company: 'D社（BtoB SaaS）',
        description: `【募集背景】
事業拡大に伴い、CSチームの強化を図るためリーダー候補を募集しています。

【業務内容】
・エンタープライズ顧客のオンボーディング
・チャーン防止施策の企画・実行
・アップセル・クロスセル機会の創出
・顧客の声をプロダクトへフィードバック
・メンバー育成・チーム運営

【キャリアパス】
・CSマネージャー
・事業企画
・PdM

【チーム構成】
・CS 6名（マネージャー1名、メンバー5名）`,
        highlights: [
            'リーダー候補としての採用',
            '成長中のSaaS企業',
            'プロダクトへの影響力が高い',
            'キャリアパス豊富'
        ],
        conditions: {
            salary: '500万〜700万円',
            salaryHigh: false,
            remote: true,
            location: '東京都（週2出社）',
            employmentType: '正社員',
            workStyle: 'フレックス'
        },
        requiredSkills: ['CS経験2年以上', 'BtoB SaaS経験', '顧客折衝経験'],
        preferredSkills: ['チームリード経験', 'データ分析', 'Salesforce'],
        benefits: ['ストックオプション', 'リモートワーク', '育休取得実績あり'],
        hasStar: true,
        starReason: 'リモート対応、SO付与で注目が集まりやすいポジションです',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-03-01T09:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z'
    },
    {
        jobKey: generateUUID(),
        title: '採用担当（新卒・中途）｜人事制度にも関われる',
        company: 'E社（メガベンチャー）',
        description: `【業務内容】
・新卒採用の企画・運営（年間50名規模）
・中途採用の母集団形成〜クロージング
・採用ブランディング施策
・面接官トレーニング
・将来的には人事制度設計にも参画可能

【チーム】
・人事部10名（採用チーム4名）

【魅力】
・採用だけでなく制度設計まで幅広く関われる
・経営陣との距離が近い
・裁量が大きい環境`,
        highlights: [
            '採用から制度設計まで関われる',
            '経営陣との距離が近い',
            '裁量が大きい',
            '週3リモート可'
        ],
        conditions: {
            salary: '450万〜650万円',
            salaryHigh: false,
            remote: true,
            location: '東京都',
            employmentType: '正社員',
            workStyle: 'フレックス'
        },
        requiredSkills: ['採用実務経験2年以上', '新卒または中途採用の経験', '複数部門との調整経験'],
        preferredSkills: ['採用広報経験', '人事制度設計', 'データ活用'],
        benefits: ['フレックス', 'リモートワーク', '書籍購入支援'],
        hasStar: false,
        starReason: '年収レンジが市場並みのため、業務内容の魅力で訴求する必要があります',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: '2024-02-15T11:00:00Z',
        updatedAt: '2024-03-19T15:00:00Z'
    }
];
