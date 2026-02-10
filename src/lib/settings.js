// =====================================================
// Settings Manager - Admin Settings Data Layer
// =====================================================

const SettingsManager = {
    STORAGE_KEYS: {
        ORG: 'match_settings_org_v1',
        PERSONAL: 'match_settings_personal_v1',
        SCHEMA_VERSION: 'match_schema_version'
    },

    CURRENT_SCHEMA_VERSION: 1,

    // Default settings (System Default)
    getDefaultSettings() {
        return {
            schemaVersion: this.CURRENT_SCHEMA_VERSION,
            weights: {
                job: 35,
                skill: 35,
                soft: 20,
                conditions: 10
            },
            labelThreshold: {
                recommended: 85,
                good: 70
            },
            marketFitRule: {
                mode: 'binary',           // 'binary' (5軸評価) | 'threshold' (従来方式)
                requiredPositives: 3,     // ⭐付与に必要なポジティブ軸数
                blockOnMajorNegative: true, // 重大ネガティブ要因がある場合は⭐非付与
                // 5軸: LLMが自動評価（設定は表示用）
                axes: [
                    { id: 'demandFit', label: '📈 市場需要一致度（Demand Fit）', desc: '現在の市場で需要がある人材か' },
                    { id: 'friction', label: '🔄 条件摩擦の少なさ（Friction）', desc: '希望条件と市場相場のギャップが小さいか' },
                    { id: 'decisionReadiness', label: '⚡ 意思決定スピード（Decision Readiness）', desc: '転職意向が明確で動きが早いか' },
                    { id: 'marketRangeFit', label: '📊 市場適合レンジ（Market Range Fit）', desc: '年収・ポジションが市場レンジ内か' },
                    { id: 'risk', label: '🛡️ リスク要因の少なさ（Risk）', desc: '転職回数・ブランク等のリスクが低いか' }
                ]
            },
            reasonsPool: [
                '職種経験が豊富',
                '顧客折衝が強い',
                '改善推進が得意',
                'リーダーシップあり',
                'コミュニケーション能力が高い',
                '論理的思考力がある',
                'チームワークを重視',
                '自走力がある',
                '学習意欲が高い',
                '柔軟性がある',
                'ストレス耐性が高い',
                '目標達成意識が強い'
            ],
            bannedWords: [],
            aiPresets: {
                candidateSearch: [
                    '💬 コミュニケーション能力が高い人だけ表示',
                    '💪 メンタルが強い人だけ表示',
                    '🚀 ベンチャーマインドが強い人だけ表示'
                ],
                jobSearch: [
                    '💬 コミュニケーション能力が高い人だけ表示',
                    '💪 メンタルが強い人だけ表示',
                    '🚀 ベンチャーマインドが強い人だけ表示'
                ],
                interviewSheet: [
                    '🎯 カルチャーフィットしそうな求人順に並べて',
                    '💡 必須が当てはまらなくても可能性が高そうな求人は？',
                    '🔥 緊急度の高い求人を抽出して'
                ],
                proposals: [
                    '🚨 急ぎ確認必要な進捗を教えて',
                    '⏸️ 動いていない進捗を教えて'
                ],
                candidatePopup: [
                    '📝 この候補者の強みを教えて',
                    '💼 適した求人を提案して',
                    '⚠️ 注意すべき点は？'
                ],
                jobPopup: [
                    '👥 この求人に合う候補者は？',
                    '📊 求人の改善点を教えて',
                    '🎯 競合他社の類似求人との違いは？'
                ]
            },
            prompts: {
                scout: 'あなたは優秀なリクルーターです。候補者に魅力的なスカウトメッセージを作成してください。200字以上で具体的なポジションの魅力を伝えてください。',
                jobImprove: 'あなたは求人改善のエキスパートです。この求人を分析し、より魅力的にするための改善提案を200字以上で行ってください。',
                interviewReport: 'あなたは面談分析のエキスパートです。面談シートの内容を分析し、候補者の特徴と適した求人の方向性を200字以上で報告してください。'
            }
        };
    },

    // Get Org settings from localStorage
    getOrgSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.ORG);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to parse org settings:', e);
        }
        return null;
    },

    // Get Personal settings from localStorage
    getPersonalSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.PERSONAL);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to parse personal settings:', e);
        }
        return null;
    },

    // Get effective settings (Personal > Org > Default)
    getEffectiveSettings() {
        const defaults = this.getDefaultSettings();
        const org = this.getOrgSettings() || {};
        const personal = this.getPersonalSettings() || {};

        // Deep merge: Default < Org < Personal
        return this.deepMerge(defaults, this.deepMerge(org, personal));
    },

    // Deep merge two objects
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] !== null && source[key] !== undefined) {
                if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    },

    // Save Org settings
    saveOrgSettings(settings) {
        settings.schemaVersion = this.CURRENT_SCHEMA_VERSION;
        localStorage.setItem(this.STORAGE_KEYS.ORG, JSON.stringify(settings));
    },

    // Save Personal settings
    savePersonalSettings(settings) {
        settings.schemaVersion = this.CURRENT_SCHEMA_VERSION;
        localStorage.setItem(this.STORAGE_KEYS.PERSONAL, JSON.stringify(settings));
    },

    // Reset Org settings
    resetOrgSettings() {
        localStorage.removeItem(this.STORAGE_KEYS.ORG);
    },

    // Reset Personal settings
    resetPersonalSettings() {
        localStorage.removeItem(this.STORAGE_KEYS.PERSONAL);
    },

    // Export all settings as JSON
    exportSettings() {
        return {
            schemaVersion: this.CURRENT_SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            org: this.getOrgSettings(),
            personal: this.getPersonalSettings()
        };
    },

    // Import settings from JSON
    importSettings(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            // Validate schema version
            if (data.schemaVersion && data.schemaVersion !== this.CURRENT_SCHEMA_VERSION) {
                return { success: false, error: `スキーマバージョンが異なります（期待: ${this.CURRENT_SCHEMA_VERSION}, 受信: ${data.schemaVersion}）` };
            }

            // Validate required keys
            const requiredKeys = ['weights', 'labelThreshold', 'marketFitRule'];
            const missingKeys = [];

            if (data.org) {
                for (const key of requiredKeys) {
                    if (!data.org[key]) missingKeys.push(`org.${key}`);
                }
            }
            if (data.personal) {
                for (const key of requiredKeys) {
                    if (!data.personal[key]) missingKeys.push(`personal.${key}`);
                }
            }

            if (missingKeys.length > 0) {
                return { success: false, error: `必須キーが不足しています: ${missingKeys.join(', ')}` };
            }

            // Save settings
            if (data.org) {
                this.saveOrgSettings(data.org);
            }
            if (data.personal) {
                this.savePersonalSettings(data.personal);
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: `JSONパースエラー: ${e.message}` };
        }
    },

    // =====================================================
    // Compute Functions
    // =====================================================

    // Compute match score with weights
    computeMatchScore(candidate, job, settings) {
        const weights = settings.weights;
        const baseScore = candidate.matchScore || 75;

        // Simulate weighted score calculation
        // In real implementation, this would calculate actual component scores
        let jobMatchScore = 0;
        let skillMatchScore = 0;
        let softMatchScore = 0;
        let conditionsMatchScore = 0;

        // Job type match
        if (job) {
            jobMatchScore = candidate.jobType === job.category ? 100 : 50;
        } else {
            jobMatchScore = 70 + Math.random() * 30;
        }

        // Skill match (based on skills array length)
        const candidateSkills = candidate.technicalSkills || [];
        skillMatchScore = Math.min(100, 50 + candidateSkills.length * 10);

        // Soft skills match
        const softSkills = candidate.softSkills || [];
        softMatchScore = Math.min(100, 40 + softSkills.length * 15);

        // Conditions match (salary, location, etc.)
        conditionsMatchScore = 60 + Math.random() * 40;

        // Calculate weighted score
        const totalWeight = weights.job + weights.skill + weights.soft + weights.conditions;
        const weightedScore = (
            (jobMatchScore * weights.job) +
            (skillMatchScore * weights.skill) +
            (softMatchScore * weights.soft) +
            (conditionsMatchScore * weights.conditions)
        ) / totalWeight;

        return {
            total: Math.round(weightedScore),
            breakdown: {
                job: Math.round(jobMatchScore),
                skill: Math.round(skillMatchScore),
                soft: Math.round(softMatchScore),
                conditions: Math.round(conditionsMatchScore)
            }
        };
    },

    // Compute label based on score
    computeLabel(score, settings) {
        const thresholds = settings.labelThreshold;
        if (score >= thresholds.recommended) return '推奨';
        if (score >= thresholds.good) return '良好';
        return '要確認';
    },

    // Compute market stars based on score (legacy - kept for compatibility)
    computeMarketStars(score, settings) {
        // 新しい二値モードの場合は1か0を返す
        if (settings.marketFitRule?.mode === 'binary') {
            return score >= 70 ? 1 : 0;
        }
        // 従来の3段階モード（フォールバック）
        const rules = settings.marketFitRule;
        if (rules.star3 && score >= rules.star3) return 3;
        if (rules.star2 && score >= rules.star2) return 2;
        if (rules.star1 && score >= rules.star1) return 1;
        return 0;
    },

    // 5軸評価でMarket Fitを判定（二値: 付与/非付与）
    evaluateMarketFit(candidate, settings) {
        const rules = settings?.marketFitRule || this.getDefaultSettings().marketFitRule;

        // 各軸を評価（デモ用のヒューリスティック判定）
        const axes = {
            demandFit: this._evaluateAxis('demandFit', candidate),
            friction: this._evaluateAxis('friction', candidate),
            decisionReadiness: this._evaluateAxis('decisionReadiness', candidate),
            marketRangeFit: this._evaluateAxis('marketRangeFit', candidate),
            risk: this._evaluateAxis('risk', candidate)
        };

        // ポジティブ数をカウント
        const positiveCount = Object.values(axes).filter(v => v === 'positive').length;

        // 重大ネガティブの有無をチェック
        const hasMajorNegative = Object.values(axes).includes('negative') && rules.blockOnMajorNegative;

        // ⭐付与判定: ポジティブ >= requiredPositives かつ 重大ネガティブなし
        const hasStar = positiveCount >= (rules.requiredPositives || 3) && !hasMajorNegative;

        return {
            hasStar,
            axes,
            positiveCount,
            hasMajorNegative,
            reason: hasStar ? this._generateMarketFitReason(candidate, axes) : null
        };
    },

    // 軸ごとの評価（デモ用ヒューリスティック）
    _evaluateAxis(axisId, candidate) {
        const marketScore = candidate.marketScore || 70;
        const negatives = candidate.negativeChecks || [];

        switch (axisId) {
            case 'demandFit':
                // 職種の市場需要（職種 + スキル数で判定）
                const skills = candidate.technicalSkills || candidate.hardSkills || [];
                if (skills.length >= 3 && marketScore >= 70) return 'positive';
                if (skills.length >= 1) return 'neutral';
                return 'negative';

            case 'friction':
                // 条件摩擦（希望年収が市場相場内か）
                const salary = candidate.currentSalary || 500;
                if (salary >= 300 && salary <= 800 && (!candidate.preferences?.remote || candidate.preferences?.remote)) {
                    return 'positive';
                }
                if (salary <= 1000) return 'neutral';
                return 'negative';

            case 'decisionReadiness':
                // 意思決定スピード（転職意向の明確さ）
                if (marketScore >= 75) return 'positive';
                if (marketScore >= 60) return 'neutral';
                return 'negative';

            case 'marketRangeFit':
                // 市場適合レンジ
                if (marketScore >= 70 && (!candidate.experience || candidate.experience <= 15)) {
                    return 'positive';
                }
                if (marketScore >= 55) return 'neutral';
                return 'negative';

            case 'risk':
                // リスク要因の少なさ
                if (negatives.length === 0) return 'positive';
                if (negatives.length <= 1) return 'neutral';
                return 'negative';

            default:
                return 'neutral';
        }
    },

    // Market Fit理由の生成
    _generateMarketFitReason(candidate, axes) {
        const reasons = [];

        if (axes.demandFit === 'positive') {
            reasons.push(`${candidate.jobType || '専門領域'}の人材需要は現在高く、複数企業からのオファーが期待できます`);
        }
        if (axes.friction === 'positive') {
            reasons.push('希望条件と市場相場のギャップが小さく、条件面でのミスマッチが起きにくいです');
        }
        if (axes.decisionReadiness === 'positive') {
            reasons.push('転職意向が明確で、スムーズな選考進行が期待できます');
        }
        if (axes.marketRangeFit === 'positive') {
            reasons.push('経験・年収レンジが市場の求人ボリュームゾーンに合致しています');
        }
        if (axes.risk === 'positive') {
            reasons.push('経歴上のリスク要因が少なく、書類選考通過率が高いと予測されます');
        }

        // 1〜2文に絞る
        if (reasons.length === 0) {
            return '市場的に決まりやすい条件が揃っています。';
        }
        return reasons.slice(0, 2).join('。') + '。';
    },

    // Generate reasons based on candidate attributes
    generateReasons(candidate, settings) {
        const pool = settings.reasonsPool || this.getDefaultSettings().reasonsPool;
        const bannedWords = settings.bannedWords || [];

        // Filter out banned words
        const filteredPool = pool.filter(reason => {
            return !bannedWords.some(banned => reason.includes(banned));
        });

        // Select 3-5 reasons based on candidate attributes
        const selected = [];
        const numReasons = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numReasons && filteredPool.length > 0; i++) {
            const idx = Math.floor(Math.random() * filteredPool.length);
            selected.push(filteredPool[idx]);
            filteredPool.splice(idx, 1);
        }

        return selected;
    },

    // Get AI presets for a specific tab
    getAiPresetsForTab(tabId) {
        const settings = this.getEffectiveSettings();
        const presets = settings.aiPresets || {};

        // Map tab IDs to preset keys
        const tabToPresetKey = {
            'candidate-search': 'candidateSearch',
            'job-search': 'jobSearch',
            'interview': 'interviewSheet',
            'proposals': 'proposals'
        };

        const key = tabToPresetKey[tabId] || 'candidateSearch';
        return presets[key] || this.getDefaultSettings().aiPresets[key];
    }
};

// Make available globally
window.SettingsManager = SettingsManager;
