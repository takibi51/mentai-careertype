/**
 * Match App - LocalStorage Manager
 * Handles all data persistence with schema versioning
 */

const STORAGE_KEYS = {
    CANDIDATES: 'match_candidates',
    JOBS: 'match_jobs',
    PROPOSALS: 'match_proposals',
    INTERVIEWS: 'match_interviews',
    CHAT_HISTORY: 'match_chat_history',
    SEARCH_HISTORY: 'match_search_history',
    SAVED_VIEWS: 'match_saved_views',
    ADMIN_SETTINGS: 'match_admin_settings',
    SCHEMA_VERSION: 'match_schema_version'
};

const CURRENT_SCHEMA_VERSION = '1.0.0';

/**
 * Storage Manager Class
 */
class StorageManager {
    constructor() {
        this.checkSchemaVersion();
    }

    /**
     * Check and handle schema version migration
     */
    checkSchemaVersion() {
        const storedVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);

        if (!storedVersion) {
            // First time initialization
            localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
        } else if (storedVersion !== CURRENT_SCHEMA_VERSION) {
            // Version mismatch - would handle migration here
            console.warn(`Schema version mismatch: stored=${storedVersion}, current=${CURRENT_SCHEMA_VERSION}`);
            // For Phase1, we'll just update the version
            localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
        }
    }

    /**
     * Get data from localStorage
     * @param {string} key
     * @returns {any}
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error reading from localStorage: ${key}`, e);
            return null;
        }
    }

    /**
     * Set data to localStorage
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error writing to localStorage: ${key}`, e);
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key
     */
    remove(key) {
        localStorage.removeItem(key);
    }

    // ==========================================
    // Candidates
    // ==========================================
    getCandidates() {
        return this.get(STORAGE_KEYS.CANDIDATES) || [];
    }

    saveCandidates(candidates) {
        this.set(STORAGE_KEYS.CANDIDATES, candidates);
    }

    getCandidate(candidateKey) {
        const candidates = this.getCandidates();
        return candidates.find(c => c.candidateKey === candidateKey);
    }

    updateCandidate(candidateKey, updates) {
        const candidates = this.getCandidates();
        const index = candidates.findIndex(c => c.candidateKey === candidateKey);
        if (index !== -1) {
            candidates[index] = {
                ...candidates[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveCandidates(candidates);
            return candidates[index];
        }
        return null;
    }

    addCandidate(candidate) {
        const candidates = this.getCandidates();
        candidates.push(candidate);
        this.saveCandidates(candidates);
        return candidate;
    }

    // ==========================================
    // Jobs
    // ==========================================
    getJobs() {
        return this.get(STORAGE_KEYS.JOBS) || [];
    }

    saveJobs(jobs) {
        this.set(STORAGE_KEYS.JOBS, jobs);
    }

    getJob(jobKey) {
        const jobs = this.getJobs();
        return jobs.find(j => j.jobKey === jobKey);
    }

    updateJob(jobKey, updates) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(j => j.jobKey === jobKey);
        if (index !== -1) {
            jobs[index] = {
                ...jobs[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveJobs(jobs);
            return jobs[index];
        }
        return null;
    }

    addJob(job) {
        const jobs = this.getJobs();
        jobs.push(job);
        this.saveJobs(jobs);
        return job;
    }

    // ==========================================
    // Proposals
    // ==========================================
    getProposals() {
        return this.get(STORAGE_KEYS.PROPOSALS) || [];
    }

    saveProposals(proposals) {
        this.set(STORAGE_KEYS.PROPOSALS, proposals);
    }

    getProposal(proposalKey) {
        const proposals = this.getProposals();
        return proposals.find(p => p.proposalKey === proposalKey);
    }

    getProposalsByCandidateKey(candidateKey) {
        const proposals = this.getProposals();
        return proposals.filter(p => p.candidateKey === candidateKey);
    }

    getProposalsByJobKey(jobKey) {
        const proposals = this.getProposals();
        return proposals.filter(p => p.jobKey === jobKey);
    }

    updateProposal(proposalKey, updates) {
        const proposals = this.getProposals();
        const index = proposals.findIndex(p => p.proposalKey === proposalKey);
        if (index !== -1) {
            const oldStatus = proposals[index].status;
            proposals[index] = {
                ...proposals[index],
                ...updates,
                lastUpdatedAt: new Date().toISOString()
            };

            // Add status change to history if status changed
            if (updates.status && updates.status !== oldStatus) {
                proposals[index].history = proposals[index].history || [];
                proposals[index].history.push({
                    at: new Date().toISOString(),
                    fromStatus: oldStatus,
                    toStatus: updates.status
                });
            }

            this.saveProposals(proposals);
            return proposals[index];
        }
        return null;
    }

    addProposal(proposal) {
        const proposals = this.getProposals();
        proposals.push(proposal);
        this.saveProposals(proposals);
        return proposal;
    }

    // ==========================================
    // Interviews
    // ==========================================
    getInterviews() {
        return this.get(STORAGE_KEYS.INTERVIEWS) || [];
    }

    saveInterviews(interviews) {
        this.set(STORAGE_KEYS.INTERVIEWS, interviews);
    }

    getInterviewsByCandidateKey(candidateKey) {
        const interviews = this.getInterviews();
        return interviews.filter(i => i.candidateKey === candidateKey);
    }

    addInterview(interview) {
        const interviews = this.getInterviews();
        interviews.push(interview);
        this.saveInterviews(interviews);
        return interview;
    }

    // ==========================================
    // Chat History
    // ==========================================
    getChatHistory(contextKey) {
        const allHistory = this.get(STORAGE_KEYS.CHAT_HISTORY) || {};
        return allHistory[contextKey] || [];
    }

    addChatMessage(contextKey, message) {
        const allHistory = this.get(STORAGE_KEYS.CHAT_HISTORY) || {};
        if (!allHistory[contextKey]) {
            allHistory[contextKey] = [];
        }
        allHistory[contextKey].push({
            ...message,
            timestamp: new Date().toISOString()
        });
        this.set(STORAGE_KEYS.CHAT_HISTORY, allHistory);
    }

    // ==========================================
    // Search History
    // ==========================================
    getSearchHistory(tabType) {
        const allHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY) || {};
        return allHistory[tabType] || [];
    }

    addSearchHistory(tabType, query) {
        const allHistory = this.get(STORAGE_KEYS.SEARCH_HISTORY) || {};
        if (!allHistory[tabType]) {
            allHistory[tabType] = [];
        }

        // Remove duplicates and add to front
        allHistory[tabType] = allHistory[tabType].filter(h => h.query !== query);
        allHistory[tabType].unshift({
            query,
            timestamp: new Date().toISOString()
        });

        // Keep only last 20
        allHistory[tabType] = allHistory[tabType].slice(0, 20);
        this.set(STORAGE_KEYS.SEARCH_HISTORY, allHistory);
    }

    // ==========================================
    // Saved Views
    // ==========================================
    getSavedViews() {
        return this.get(STORAGE_KEYS.SAVED_VIEWS) || [];
    }

    saveSavedViews(views) {
        this.set(STORAGE_KEYS.SAVED_VIEWS, views);
    }

    addSavedView(view) {
        const views = this.getSavedViews();
        views.push(view);
        this.saveSavedViews(views);
        return view;
    }

    removeSavedView(viewId) {
        const views = this.getSavedViews();
        const filtered = views.filter(v => v.id !== viewId);
        this.saveSavedViews(filtered);
    }

    // ==========================================
    // Admin Settings
    // ==========================================
    getAdminSettings() {
        return this.get(STORAGE_KEYS.ADMIN_SETTINGS) || this.getDefaultAdminSettings();
    }

    saveAdminSettings(settings) {
        this.set(STORAGE_KEYS.ADMIN_SETTINGS, settings);
    }

    getDefaultAdminSettings() {
        return {
            weights: {
                hardSkillMatch: 40,
                softSkillMatch: 30,
                preferenceMatch: 20,
                negativeDeduction: 30,
                marketBonus: 10
            },
            thresholds: {
                marketStarThreshold: 70,
                softSkillPenaltyThreshold: 30
            },
            jobStarCriteria: {
                salaryAboveMarket: true,
                remoteAllowed: true,
                goodBenefits: true
            },
            dictionaries: {
                jobTypes: [
                    '営業', 'マーケティング', 'エンジニア', '経理', '人事', '総務',
                    '企画', '管理職', 'カスタマーサクセス', 'デザイナー', 'PM', 'PdM'
                ],
                skills: [
                    'Excel', 'SQL', 'Python', 'JavaScript', '営業', 'MA',
                    '採用', '経理', '財務', '法務', '人事', 'マネジメント'
                ]
            },
            templates: {
                marketStarReason: '市場での需要が高く、内定を得やすい傾向にあります',
                noJobStarReason: '求人条件の改善により、より多くの応募が期待できます'
            }
        };
    }

    // ==========================================
    // Data Management
    // ==========================================
    exportAllData() {
        return {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            candidates: this.getCandidates(),
            jobs: this.getJobs(),
            proposals: this.getProposals(),
            interviews: this.getInterviews(),
            chatHistory: this.get(STORAGE_KEYS.CHAT_HISTORY) || {},
            searchHistory: this.get(STORAGE_KEYS.SEARCH_HISTORY) || {},
            savedViews: this.getSavedViews(),
            adminSettings: this.getAdminSettings()
        };
    }

    importAllData(data) {
        if (data.candidates) this.saveCandidates(data.candidates);
        if (data.jobs) this.saveJobs(data.jobs);
        if (data.proposals) this.saveProposals(data.proposals);
        if (data.interviews) this.saveInterviews(data.interviews);
        if (data.chatHistory) this.set(STORAGE_KEYS.CHAT_HISTORY, data.chatHistory);
        if (data.searchHistory) this.set(STORAGE_KEYS.SEARCH_HISTORY, data.searchHistory);
        if (data.savedViews) this.saveSavedViews(data.savedViews);
        if (data.adminSettings) this.saveAdminSettings(data.adminSettings);
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, data.schemaVersion || CURRENT_SCHEMA_VERSION);
    }

    resetAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    }

    getSchemaVersion() {
        return localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || CURRENT_SCHEMA_VERSION;
    }
}

// Export singleton instance
export const storage = new StorageManager();
export { STORAGE_KEYS, CURRENT_SCHEMA_VERSION };
