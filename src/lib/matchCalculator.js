/**
 * Match App - Match Score Calculator
 * Calculates match scores based on admin-configurable weights
 */

import { storage } from './storage.js';

/**
 * Calculate match score between a candidate and job
 * @param {Object} candidate
 * @param {Object} job
 * @returns {Object} Score details
 */
export function calculateMatchScore(candidate, job) {
    const settings = storage.getAdminSettings();
    const weights = settings.weights;

    let score = 0;
    const reasons = [];

    // Hard skill matching (max: hardSkillMatch%)
    const hardSkillScore = calculateHardSkillMatch(candidate, job);
    score += (hardSkillScore / 100) * weights.hardSkillMatch;
    if (hardSkillScore >= 70) {
        reasons.push(`${candidate.jobType || '専門領域'}での経験が求人要件にマッチしています`);
    }
    if (hardSkillScore >= 50 && candidate.hardSkills?.length > 0) {
        reasons.push(`${candidate.hardSkills.slice(0, 2).join('・')}のスキルが活かせるポジションです`);
    }

    // Soft skill matching (max: softSkillMatch%)
    const softSkillScore = calculateSoftSkillMatch(candidate, job);
    score += (softSkillScore / 100) * weights.softSkillMatch;
    if (softSkillScore >= 60 && candidate.softSkills?.length > 0) {
        reasons.push(`「${candidate.softSkills[0]}」な姿勢が高く評価されます`);
    }

    // Preference matching (max: preferenceMatch%)
    const preferenceScore = calculatePreferenceMatch(candidate, job);
    score += (preferenceScore / 100) * weights.preferenceMatch;
    if (preferenceScore >= 80) {
        reasons.push('希望条件（年収・勤務形態）が求人条件と合致しています');
    }

    // Negative deduction (max: -negativeDeduction%)
    const negativeDeduction = calculateNegativeDeduction(candidate);
    score -= (negativeDeduction / 100) * weights.negativeDeduction;

    // Market score bonus (max: marketBonus%)
    if (candidate.marketScore >= settings.thresholds.marketStarThreshold) {
        score += weights.marketBonus;
        reasons.push('市場での需要が高く、複数オファーが期待できます');
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine label based on score
    const label = getMatchLabel(score);

    // Ensure we have at least 3 reasons, max 6
    while (reasons.length < 3) {
        reasons.push(getGenericReason(score, reasons.length));
    }

    return {
        score,
        label,
        reasons: reasons.slice(0, 6)
    };
}

/**
 * Calculate hard skill match percentage
 */
function calculateHardSkillMatch(candidate, job) {
    if (!candidate.hardSkills?.length) return 50;
    if (!job?.requiredSkills?.length) return 70;

    const matches = candidate.hardSkills.filter(skill =>
        job.requiredSkills.some(req =>
            req.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(req.toLowerCase())
        )
    );

    return Math.min(100, (matches.length / job.requiredSkills.length) * 100 + 30);
}

/**
 * Calculate soft skill match percentage
 */
function calculateSoftSkillMatch(candidate, job) {
    if (!candidate.softSkills?.length) return 50;

    // Base score on number of positive soft skills
    const baseScore = Math.min(100, candidate.softSkills.length * 20 + 40);

    // Check for desirable traits
    const desirable = ['協調性', 'コミュニケーション', '論理性', '主体性', '積極的'];
    const matches = candidate.softSkills.filter(s => desirable.includes(s));

    return Math.min(100, baseScore + matches.length * 10);
}

/**
 * Calculate preference match percentage
 */
function calculatePreferenceMatch(candidate, job) {
    if (!candidate.preferences || !job) return 60;

    let score = 60;

    // Remote preference match
    if (candidate.preferences.remote && job.conditions?.remote) {
        score += 20;
    } else if (!candidate.preferences.remote) {
        score += 10;
    }

    // Salary match (simplified)
    score += 20;

    return Math.min(100, score);
}

/**
 * Calculate negative deduction percentage
 */
function calculateNegativeDeduction(candidate) {
    if (!candidate.negativeChecks?.length) return 0;

    // Each negative check costs 15% of the deduction weight
    return Math.min(100, candidate.negativeChecks.length * 25);
}

/**
 * Get match label based on score
 * @param {number} score
 * @returns {string}
 */
function getMatchLabel(score) {
    if (score >= 85) return 'かなり相性が良い';
    if (score >= 70) return '相性が良い';
    if (score >= 55) return '可能性あり';
    return '要検討';
}

/**
 * Get CSS class for match label
 * @param {string} label
 * @returns {string}
 */
export function getMatchLabelClass(label) {
    switch (label) {
        case 'かなり相性が良い': return 'match-label-excellent';
        case '相性が良い': return 'match-label-good';
        case '可能性あり': return 'match-label-possible';
        default: return 'match-label-review';
    }
}

/**
 * Get generic filler reasons
 */
function getGenericReason(score, index) {
    const highReasons = [
        '即戦力としての活躍が期待できます',
        '長期的なキャリア形成に適した環境です',
        '企業文化との親和性が高いと予測されます'
    ];

    const mediumReasons = [
        '一定の適応期間で力を発揮できる見込みです',
        'スキルアップの機会が多い環境です',
        'キャリアの幅を広げる良い機会となります'
    ];

    const lowReasons = [
        '詳細な面談で適性を確認することを推奨します',
        '条件面での調整が必要な可能性があります',
        '他の候補求人との比較をお勧めします'
    ];

    if (score >= 70) return highReasons[index % highReasons.length];
    if (score >= 50) return mediumReasons[index % mediumReasons.length];
    return lowReasons[index % lowReasons.length];
}

/**
 * Check if candidate qualifies for market star
 * @param {Object} candidate
 * @returns {boolean}
 */
export function checkMarketStar(candidate) {
    const settings = storage.getAdminSettings();
    return candidate.marketScore >= settings.thresholds.marketStarThreshold;
}

/**
 * Get market star reason
 * @param {Object} candidate
 * @returns {string}
 */
export function getMarketStarReason(candidate) {
    const settings = storage.getAdminSettings();

    if (checkMarketStar(candidate)) {
        return settings.templates.marketStarReason ||
            '市場での需要が高く、内定を得やすい傾向にあります';
    }

    return '市場スコアが閾値を下回っています。スキルアップや条件調整で改善可能です。';
}

/**
 * Check if job qualifies for job star
 * @param {Object} job
 * @returns {boolean}
 */
export function checkJobStar(job) {
    const settings = storage.getAdminSettings();
    const criteria = settings.jobStarCriteria;

    let qualifies = false;

    if (criteria.salaryAboveMarket && job.conditions?.salaryHigh) {
        qualifies = true;
    }

    if (criteria.remoteAllowed && job.conditions?.remote) {
        qualifies = true;
    }

    if (criteria.goodBenefits && job.benefits?.length > 3) {
        qualifies = true;
    }

    return qualifies;
}

/**
 * Get job star reason
 * @param {Object} job
 * @returns {string}
 */
export function getJobStarReason(job) {
    const settings = storage.getAdminSettings();

    if (checkJobStar(job)) {
        const reasons = [];
        if (job.conditions?.salaryHigh) reasons.push('年収が市場水準より高い');
        if (job.conditions?.remote) reasons.push('リモートワーク対応');
        if (job.benefits?.length > 3) reasons.push('充実した福利厚生');
        return `注目が集まりやすい理由：${reasons.join('、')}`;
    }

    return settings.templates.noJobStarReason ||
        '求人条件の改善により、より多くの応募が期待できます';
}

/**
 * Recalculate all candidate scores against a specific job
 * @param {Object[]} candidates
 * @param {Object} job
 * @returns {Object[]}
 */
export function recalculateAllScores(candidates, job) {
    return candidates.map(candidate => {
        const matchResult = calculateMatchScore(candidate, job);
        return {
            ...candidate,
            matchScore: matchResult.score,
            matchLabel: matchResult.label,
            matchReasons: matchResult.reasons
        };
    });
}
