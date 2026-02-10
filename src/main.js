/**
 * Match App - Main Application
 */

import { storage } from './lib/storage.js';
import { initializeData, resetToDemo } from './data/init.js';
import { calculateMatchScore, getMatchLabelClass, checkMarketStar } from './lib/matchCalculator.js';
import * as ai from './lib/aiStub.js';
import { formatDate, formatDateTime, escapeHtml, debounce } from './lib/utils.js';

// ==========================================
// App State
// ==========================================
const state = {
    currentTab: 'candidate-search',
    selectedCandidate: null,
    selectedJob: null,
    selectedCandidates: new Set(),
    comparisonList: [],
    filters: {
        jobType: '',
        experience: '',
        remote: false,
        unproposed: false,
        sort: 'matchScore'
    }
};

// ==========================================
// Initialization
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

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openSettings);

    // Close modals
    document.getElementById('modalBackdrop').addEventListener('click', closeAllModals);
    document.getElementById('closeCandidateModal').addEventListener('click', () => closeModal('candidateModal'));
    document.getElementById('closeJobModal').addEventListener('click', () => closeModal('jobModal'));
    document.getElementById('closeAddJobModal').addEventListener('click', () => closeModal('addJobModal'));
    document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal('settingsModal'));

    // Candidate search
    const searchInput = document.getElementById('candidateSearchInput');
    searchInput.addEventListener('input', debounce(() => searchCandidates(), 300));

    // Example chips
    document.querySelectorAll('#candidateExampleChips .example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            searchInput.value = chip.dataset.query;
            searchCandidates();
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

    document.getElementById('filterUnproposed').addEventListener('click', (e) => {
        state.filters.unproposed = !state.filters.unproposed;
        e.target.classList.toggle('active', state.filters.unproposed);
        renderCandidates();
    });

    document.getElementById('sortCandidates').addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        renderCandidates();
    });

    // Job select
    document.getElementById('jobSelect').addEventListener('change', selectJob);
    document.getElementById('addJobBtn').addEventListener('click', () => openModal('addJobModal'));
    document.getElementById('saveNewJob').addEventListener('click', saveNewJob);
    document.getElementById('cancelAddJob').addEventListener('click', () => closeModal('addJobModal'));

    // Chat
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Quick actions
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
    });

    // Proposal subtabs
    document.querySelectorAll('#tab-proposals .subtab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('#tab-proposals .subtab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderProposals();
        });
    });

    // Interview
    document.getElementById('interviewCandidateSearch').addEventListener('input',
        debounce(() => searchInterviewCandidates(), 300));

    document.querySelectorAll('#tab-interview .example-chip').forEach(chip => {
        chip.addEventListener('click', () => generateInterviewAnalysis(chip.dataset.action));
    });

    // Bulk actions
    document.getElementById('bulkSaveBtn').addEventListener('click', bulkSave);
    document.getElementById('bulkProposeBtn').addEventListener('click', bulkPropose);

    // Export
    document.getElementById('exportCandidatesBtn').addEventListener('click', exportCandidates);
    document.getElementById('exportProposalsBtn').addEventListener('click', exportProposals);

    // Modal actions
    document.getElementById('generateResumeBtn').addEventListener('click', generateResume);
    document.getElementById('proposeFromModalBtn').addEventListener('click', proposeFromModal);

    addWelcomeMessage();
}

// ==========================================
// Tab Management
// ==========================================
function switchTab(tabId) {
    state.currentTab = tabId;
    state.selectedCandidate = null;
    state.selectedCandidates.clear();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    renderCurrentTab();
    updateQuickActions();
}

function renderCurrentTab() {
    switch (state.currentTab) {
        case 'candidate-search':
            renderCandidates();
            break;
        case 'job-search':
            renderJobSelect();
            break;
        case 'interview':
            break;
        case 'proposals':
            renderProposals();
            break;
    }
}

// ==========================================
// Candidate Search
// ==========================================
function searchCandidates() {
    const query = document.getElementById('candidateSearchInput').value;
    if (query) {
        storage.addSearchHistory('candidate-search', query);
    }
    renderCandidates();
}

function renderCandidates() {
    let candidates = storage.getCandidates();
    const query = document.getElementById('candidateSearchInput').value.toLowerCase();
    const proposals = storage.getProposals();

    // Filter
    if (query) {
        candidates = candidates.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.jobType.toLowerCase().includes(query) ||
            c.hardSkills.some(s => s.toLowerCase().includes(query)) ||
            c.softSkills.some(s => s.toLowerCase().includes(query))
        );
    }

    if (state.filters.jobType) {
        candidates = candidates.filter(c => c.jobType.includes(state.filters.jobType));
    }

    if (state.filters.remote) {
        candidates = candidates.filter(c => c.preferences?.remote);
    }

    if (state.filters.unproposed) {
        const proposedKeys = new Set(proposals.map(p => p.candidateKey));
        candidates = candidates.filter(c => !proposedKeys.has(c.candidateKey));
    }

    // Sort
    candidates.sort((a, b) => {
        if (state.filters.sort === 'matchScore') return b.matchScore - a.matchScore;
        if (state.filters.sort === 'marketScore') return b.marketScore - a.marketScore;
        return a.name.localeCompare(b.name, 'ja');
    });

    // Render
    const container = document.getElementById('candidateResults');
    document.getElementById('candidateResultCount').innerHTML = `<strong>${candidates.length}</strong> 件の候補者`;

    if (candidates.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">候補者が見つかりません</h3>
        <p class="empty-state-desc">検索条件を変更してお試しください。</p>
      </div>`;
        return;
    }

    container.innerHTML = candidates.map(c => renderCandidateCard(c)).join('');

    // Event listeners
    container.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.checkbox') && !e.target.closest('.btn')) {
                openCandidateDetail(card.dataset.key);
            }
        });
    });

    container.querySelectorAll('.checkbox').forEach(cb => {
        cb.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCandidateSelection(cb.dataset.key);
        });
    });

    container.querySelectorAll('.add-compare-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToComparison(btn.dataset.key);
        });
    });

    updateBulkButtons();
}

function renderCandidateCard(c) {
    const hasStar = checkMarketStar(c);
    const isSelected = state.selectedCandidates.has(c.candidateKey);

    return `
    <div class="candidate-card" data-key="${c.candidateKey}">
      <div class="candidate-checkbox">
        <div class="checkbox ${isSelected ? 'checked' : ''}" data-key="${c.candidateKey}"></div>
      </div>
      <div class="candidate-info">
        <div class="candidate-header">
          <span class="candidate-name">${escapeHtml(c.name)}</span>
          <span class="match-label ${getMatchLabelClass(c.matchLabel)}">${c.matchLabel}</span>
          ${hasStar ? '<span class="badge badge-star">⭐</span>' : ''}
        </div>
        <div class="candidate-job">${escapeHtml(c.jobType)} ・ ${c.experience}</div>
        <div class="candidate-tags">
          ${c.hardSkills.slice(0, 3).map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')}
          ${c.softSkills.slice(0, 2).map(s => `<span class="chip chip-primary">${escapeHtml(s)}</span>`).join('')}
        </div>
        <div class="candidate-meta">
          <span>${c.preferences?.remote ? '🏠 リモート希望' : '🏢 出社可'}</span>
          <span>💰 ${c.preferences?.salary || '相談可'}</span>
        </div>
        <div class="candidate-reasons">
          ${c.matchReasons.slice(0, 2).map(r => `• ${escapeHtml(r)}`).join('<br>')}
        </div>
      </div>
      <div class="candidate-scores">
        <div class="score-display">
          <div class="score-value">${c.matchScore}%</div>
          <div class="score-label">マッチ度のスコアです</div>
        </div>
        <div class="candidate-actions">
          <button class="btn btn-ghost btn-sm add-compare-btn" data-key="${c.candidateKey}">📊</button>
        </div>
      </div>
    </div>`;
}

function toggleCandidateSelection(key) {
    if (state.selectedCandidates.has(key)) {
        state.selectedCandidates.delete(key);
    } else {
        state.selectedCandidates.add(key);
    }
    renderCandidates();
}

function updateBulkButtons() {
    const count = state.selectedCandidates.size;
    document.getElementById('bulkSaveBtn').disabled = count === 0;
    document.getElementById('bulkProposeBtn').disabled = count === 0;
}

// ==========================================
// Candidate Detail Modal
// ==========================================
function openCandidateDetail(key) {
    const candidate = storage.getCandidate(key);
    if (!candidate) return;

    state.selectedCandidate = candidate;

    document.getElementById('candidateModalTitle').textContent = candidate.name;

    const proposals = storage.getProposalsByCandidateKey(key);
    const interviews = storage.getInterviewsByCandidateKey(key);
    const hasStar = checkMarketStar(candidate);

    document.getElementById('candidateModalBody').innerHTML = `
    <div style="display: grid; gap: var(--space-6);">
      <div style="display: flex; gap: var(--space-4); align-items: center;">
        <div class="badge-score">${candidate.matchScore}%</div>
        <div>
          <span class="match-label ${getMatchLabelClass(candidate.matchLabel)}">${candidate.matchLabel}</span>
          <p style="font-size: var(--font-size-sm); color: var(--text-muted); margin-top: var(--space-1);">
            マッチ度のスコアです
          </p>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: var(--space-2);">マッチ理由</h4>
        <ul style="color: var(--text-secondary); font-size: var(--font-size-sm);">
          ${candidate.matchReasons.map(r => `<li style="margin-bottom: var(--space-1);">• ${escapeHtml(r)}</li>`).join('')}
        </ul>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-2);">
          マッチ度の理由です
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        <div>
          <h4 style="margin-bottom: var(--space-2);">ハードスキル</h4>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${candidate.hardSkills.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div>
          <h4 style="margin-bottom: var(--space-2);">ソフトスキル</h4>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${candidate.softSkills.map(s => `<span class="chip chip-primary">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div>
        <h4 style="margin-bottom: var(--space-2);">
          ⭐ 市場決まりやすさ: ${candidate.marketScore}%
          ${hasStar ? '<span class="badge badge-star">注目</span>' : ''}
        </h4>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">市場の決まりやすさのスコアです</p>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: var(--space-1);">
          ${hasStar ? '市場での需要が高く、内定を得やすい傾向にあります。' : '市場スコアは標準レベルです。'}
        </p>
      </div>
      
      ${candidate.negativeChecks.length > 0 ? `
        <div>
          <h4 style="margin-bottom: var(--space-2); color: var(--color-accent-red);">⚠️ ネガティブチェック</h4>
          <ul style="color: var(--text-secondary); font-size: var(--font-size-sm);">
            ${candidate.negativeChecks.map(n => `<li>• ${escapeHtml(n)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div>
        <h4 style="margin-bottom: var(--space-2);">希望条件</h4>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
          💰 ${candidate.preferences?.salary || '相談可'} ・ 
          ${candidate.preferences?.remote ? '🏠 リモート希望' : '🏢 出社可'} ・
          📍 ${candidate.preferences?.location || '首都圏'}
        </p>
      </div>
      
      <div>
        <h4 style="margin-bottom: var(--space-2);">職務要約</h4>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); white-space: pre-wrap;">
          ${escapeHtml(candidate.resume?.summary || '未設定')}
        </p>
      </div>
      
      ${proposals.length > 0 ? `
        <div>
          <h4 style="margin-bottom: var(--space-2);">関連する提案</h4>
          ${proposals.map(p => `
            <div style="padding: var(--space-2); background: var(--bg-surface-elevated); border-radius: var(--radius-md); margin-bottom: var(--space-2);">
              <span style="font-size: var(--font-size-sm);">${escapeHtml(p.jobTitle)}</span>
              <span class="status-pill status-${p.status.replace(/[^a-z]/g, '')}" style="margin-left: var(--space-2);">${p.status}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${interviews.length > 0 ? `
        <div>
          <h4 style="margin-bottom: var(--space-2);">面談履歴</h4>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
            ${interviews.length}件の面談記録があります
          </p>
        </div>
      ` : ''}
    </div>`;

    openModal('candidateModal');
    updateQuickActions();
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

    const starBadge = document.getElementById('selectedJobStar');
    starBadge.style.display = job.hasStar ? 'inline-flex' : 'none';

    renderJobCandidates();
    updateQuickActions();
}

function renderJobCandidates() {
    if (!state.selectedJob) return;

    let candidates = storage.getCandidates();
    const showSavedOnly = document.getElementById('filterSavedOnly')?.classList.contains('active');

    if (showSavedOnly && state.selectedJob.savedCandidateKeys?.length) {
        candidates = candidates.filter(c =>
            state.selectedJob.savedCandidateKeys.includes(c.candidateKey)
        );
    }

    // Recalculate scores for this job
    candidates = candidates.map(c => {
        const result = calculateMatchScore(c, state.selectedJob);
        return { ...c, matchScore: result.score, matchLabel: result.label, matchReasons: result.reasons };
    });

    candidates.sort((a, b) => b.matchScore - a.matchScore);

    const container = document.getElementById('jobCandidateResults');
    document.getElementById('jobCandidateCount').innerHTML = `<strong>${candidates.length}</strong> 件の候補者`;

    container.innerHTML = candidates.map(c => renderCandidateCard(c)).join('');

    container.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', () => openCandidateDetail(card.dataset.key));
    });
}

function saveNewJob() {
    const title = document.getElementById('newJobTitle').value;
    const company = document.getElementById('newJobCompany').value;
    const description = document.getElementById('newJobDescription').value;
    const salary = document.getElementById('newJobSalary').value;
    const remote = document.getElementById('newJobRemote').value === 'true';

    if (!title || !company) {
        alert('タイトルと会社名は必須です');
        return;
    }

    const newJob = {
        jobKey: crypto.randomUUID(),
        title, company, description,
        highlights: [],
        conditions: { salary, remote, salaryHigh: false },
        requiredSkills: [],
        preferredSkills: [],
        benefits: [],
        hasStar: remote,
        starReason: remote ? 'リモートワーク対応' : '',
        savedCandidateKeys: [],
        chatHistoryKeys: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    storage.addJob(newJob);
    closeModal('addJobModal');
    renderJobSelect();

    // Clear form
    document.getElementById('newJobTitle').value = '';
    document.getElementById('newJobCompany').value = '';
    document.getElementById('newJobDescription').value = '';
}

// ==========================================
// Proposals Tab  
// ==========================================
function renderProposals() {
    const proposals = storage.getProposals();
    const tbody = document.getElementById('proposalsTableBody');
    const statusFilter = document.getElementById('filterProposalStatus').value;

    let filtered = proposals;
    if (statusFilter) {
        filtered = proposals.filter(p => p.status === statusFilter);
    }

    tbody.innerHTML = filtered.map(p => `
    <tr>
      <td class="clickable" data-candidate="${p.candidateKey}">${escapeHtml(p.candidateName)}</td>
      <td class="clickable" data-job="${p.jobKey}">${escapeHtml(p.jobTitle?.substring(0, 30) || '-')}...</td>
      <td>
        <select class="filter-select" data-proposal="${p.proposalKey}" style="width: 120px;">
          ${['提案済', '返信待ち', '面談調整', '面談済', '見送り', '決定'].map(s =>
        `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`
    ).join('')}
        </select>
      </td>
      <td>
        <input type="text" class="inline-edit" value="${escapeHtml(p.memo || '')}" 
               data-proposal="${p.proposalKey}" data-field="memo">
      </td>
      <td style="font-size: var(--font-size-sm);">${formatDate(p.lastUpdatedAt)}</td>
      <td style="font-size: var(--font-size-sm);">
        ${p.nextActionAt ? formatDate(p.nextActionAt) : '-'}<br>
        <span style="color: var(--text-muted);">${escapeHtml(p.nextAction || '')}</span>
      </td>
    </tr>
  `).join('');

    // Status change
    tbody.querySelectorAll('select[data-proposal]').forEach(sel => {
        sel.addEventListener('change', (e) => {
            storage.updateProposal(e.target.dataset.proposal, { status: e.target.value });
            renderProposals();
        });
    });

    // Memo edit
    tbody.querySelectorAll('input[data-field="memo"]').forEach(input => {
        input.addEventListener('blur', (e) => {
            storage.updateProposal(e.target.dataset.proposal, { memo: e.target.value });
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

    const context = { candidate: state.selectedCandidate, job: state.selectedJob };
    const response = await ai.generateChatResponse(message, context);
    addChatMessage('ai', response);
}

async function handleQuickAction(action) {
    if (!state.selectedCandidate && ['scout', 'concerns', 'hireability'].includes(action)) {
        addChatMessage('ai', '候補者を選択してから、このアクションをお試しください。候補者一覧から対象者をクリックしてください。');
        return;
    }

    addChatMessage('user', getQuickActionLabel(action));

    let response;
    switch (action) {
        case 'scout':
            response = await ai.generateScoutMessage(state.selectedCandidate);
            break;
        case 'concerns':
            response = await ai.generateConcernsAndQuestions(state.selectedCandidate);
            break;
        case 'hireability':
            response = await ai.generateHireabilityReason(state.selectedCandidate);
            break;
        default:
            response = await ai.generateChatResponse(getQuickActionLabel(action), {});
    }

    addChatMessage('ai', response);
}

function getQuickActionLabel(action) {
    const labels = {
        scout: 'スカウト文を提案して',
        concerns: '懸念点と確認質問を出して',
        hireability: '決まりやすい理由を整理して'
    };
    return labels[action] || action;
}

function updateQuickActions() {
    const actions = document.getElementById('quickActions');
    if (state.currentTab === 'job-search' && state.selectedJob) {
        actions.innerHTML = `
      <button class="quick-action-btn" data-action="improve">📝 求人票の改善ポイントを提案して</button>
      <button class="quick-action-btn" data-action="expression">✨ 応募が集まりやすい表現に</button>`;

        actions.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                addChatMessage('user', btn.textContent.trim());
                const response = await ai.generateJobImprovements(state.selectedJob);
                addChatMessage('ai', response);
            });
        });
    }
}

// ==========================================
// Interview Tab
// ==========================================
function searchInterviewCandidates() {
    const query = document.getElementById('interviewCandidateSearch').value.toLowerCase();
    if (!query) {
        document.getElementById('interviewCandidateResults').innerHTML = '';
        return;
    }

    const candidates = storage.getCandidates().filter(c =>
        c.name.toLowerCase().includes(query) || c.jobType.toLowerCase().includes(query)
    ).slice(0, 5);

    const container = document.getElementById('interviewCandidateResults');
    container.innerHTML = candidates.map(c => `
    <div class="chip" style="margin-right: var(--space-2); cursor: pointer;" data-key="${c.candidateKey}">
      ${escapeHtml(c.name)} (${c.jobType})
    </div>
  `).join('');

    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => linkInterviewCandidate(chip.dataset.key));
    });
}

function linkInterviewCandidate(key) {
    const candidate = storage.getCandidate(key);
    state.selectedCandidate = candidate;

    document.getElementById('interviewCandidateSearch').style.display = 'none';
    document.getElementById('interviewCandidateResults').innerHTML = '';
    document.getElementById('linkedCandidate').style.display = 'flex';
    document.getElementById('linkedCandidateName').textContent = candidate.name;

    document.getElementById('unlinkCandidate').addEventListener('click', () => {
        state.selectedCandidate = null;
        document.getElementById('interviewCandidateSearch').style.display = 'block';
        document.getElementById('linkedCandidate').style.display = 'none';
    });
}

async function generateInterviewAnalysis(action) {
    const text = document.getElementById('interviewText').value;
    if (!text) {
        alert('面談内容を入力してください');
        return;
    }

    addChatMessage('user', document.querySelector(`[data-action="${action}"]`).textContent);

    const result = await ai.generateInterviewAnalysis(text, state.selectedCandidate);
    addChatMessage('ai', result.summary);

    document.getElementById('interviewAnalysisCard').style.display = 'block';
    document.getElementById('interviewAnalysisContent').innerHTML =
        `<pre style="white-space: pre-wrap; font-family: inherit; font-size: var(--font-size-sm);">${escapeHtml(result.summary)}</pre>`;
}

// ==========================================
// Bulk Actions
// ==========================================
function bulkSave() {
    if (!state.selectedJob) {
        alert('先に求人を選択してください');
        return;
    }

    const job = state.selectedJob;
    const keys = [...state.selectedCandidates];
    job.savedCandidateKeys = [...new Set([...job.savedCandidateKeys, ...keys])];
    storage.updateJob(job.jobKey, { savedCandidateKeys: job.savedCandidateKeys });

    alert(`${keys.length}名を求人に保存しました`);
    state.selectedCandidates.clear();
    renderCandidates();
}

function bulkPropose() {
    if (!state.selectedJob) {
        alert('先に求人を選択してください');
        return;
    }

    const keys = [...state.selectedCandidates];
    keys.forEach(candidateKey => {
        const candidate = storage.getCandidate(candidateKey);
        createProposal(candidate, state.selectedJob);
    });

    alert(`${keys.length}名の提案を作成しました`);
    state.selectedCandidates.clear();
    renderCandidates();
}

function createProposal(candidate, job) {
    const proposal = {
        proposalKey: crypto.randomUUID(),
        candidateKey: candidate.candidateKey,
        jobKey: job.jobKey,
        candidateName: candidate.name,
        jobTitle: job.title,
        status: '提案済',
        memo: '',
        lastUpdatedAt: new Date().toISOString(),
        lastContactAt: null,
        nextActionAt: null,
        nextAction: '',
        owner: '自分',
        history: [{ at: new Date().toISOString(), fromStatus: null, toStatus: '提案済' }]
    };
    storage.addProposal(proposal);
}

async function generateResume() {
    if (!state.selectedCandidate) return;
    addChatMessage('user', '提案用レジュメを生成して');
    const response = await ai.generateProposalResume(state.selectedCandidate, state.selectedJob);
    addChatMessage('ai', response);
}

function proposeFromModal() {
    if (!state.selectedCandidate) return;

    const jobs = storage.getJobs();
    const jobKey = prompt('提案先の求人を選択（番号入力）:\n' +
        jobs.map((j, i) => `${i + 1}. ${j.title}`).join('\n'));

    if (jobKey && jobs[parseInt(jobKey) - 1]) {
        createProposal(state.selectedCandidate, jobs[parseInt(jobKey) - 1]);
        alert('提案を作成しました');
        closeModal('candidateModal');
    }
}

// ==========================================
// Export
// ==========================================
function exportCandidates() {
    const data = storage.getCandidates();
    downloadJSON(data, 'candidates.json');
}

function exportProposals() {
    const data = storage.getProposals();
    downloadJSON(data, 'proposals.json');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==========================================
// Comparison
// ==========================================
function addToComparison(key) {
    if (state.comparisonList.includes(key)) return;
    if (state.comparisonList.length >= 3) {
        state.comparisonList.shift();
    }
    state.comparisonList.push(key);
    renderComparison();
}

function renderComparison() {
    const panel = document.getElementById('comparisonPanel');
    const grid = document.getElementById('comparisonGrid');

    if (state.comparisonList.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    grid.innerHTML = state.comparisonList.map(key => {
        const c = storage.getCandidate(key);
        return `
      <div class="comparison-item">
        <button class="comparison-remove" data-key="${key}">✕</button>
        <h4>${escapeHtml(c.name)}</h4>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">${c.jobType}</p>
        <div class="score-value" style="font-size: var(--font-size-xl);">${c.matchScore}%</div>
        <p style="font-size: var(--font-size-xs); margin-top: var(--space-2);">
          市場: ${c.marketScore}%
        </p>
      </div>`;
    }).join('');

    grid.querySelectorAll('.comparison-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            state.comparisonList = state.comparisonList.filter(k => k !== btn.dataset.key);
            renderComparison();
        });
    });

    document.getElementById('clearComparison').addEventListener('click', () => {
        state.comparisonList = [];
        renderComparison();
    });
}

// ==========================================
// Settings
// ==========================================
function openSettings() {
    renderSettingsContent('weights');
    openModal('settingsModal');

    document.querySelectorAll('#settingsModal .subtab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('#settingsModal .subtab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderSettingsContent(e.target.dataset.settings);
        });
    });
}

function renderSettingsContent(section) {
    const container = document.getElementById('settingsContent');
    const settings = storage.getAdminSettings();

    switch (section) {
        case 'weights':
            container.innerHTML = `
        <h4 style="margin-bottom: var(--space-4);">マッチスコアの重み設定</h4>
        ${Object.entries(settings.weights).map(([key, value]) => `
          <div class="input-group" style="margin-bottom: var(--space-3);">
            <label class="input-label">${getWeightLabel(key)}</label>
            <input type="range" min="0" max="50" value="${value}" 
                   class="input" data-weight="${key}" style="width: 100%;">
            <span>${value}%</span>
          </div>
        `).join('')}
        <button class="btn btn-primary" id="saveWeights" style="margin-top: var(--space-4);">保存</button>`;

            container.getElementById('saveWeights')?.addEventListener('click', () => {
                const weights = {};
                container.querySelectorAll('[data-weight]').forEach(input => {
                    weights[input.dataset.weight] = parseInt(input.value);
                });
                storage.saveAdminSettings({ ...settings, weights });
                alert('保存しました');
            });
            break;

        case 'data':
            container.innerHTML = `
        <h4 style="margin-bottom: var(--space-4);">データ管理</h4>
        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
          スキーマバージョン: ${storage.getSchemaVersion()}
        </p>
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <button class="btn btn-secondary" id="exportAllBtn">📤 全データエクスポート</button>
          <button class="btn btn-secondary" id="importAllBtn">📥 インポート</button>
          <button class="btn btn-ghost" id="resetDataBtn" style="color: var(--color-accent-red);">
            🔄 デモデータにリセット
          </button>
        </div>`;

            container.querySelector('#exportAllBtn')?.addEventListener('click', () => {
                downloadJSON(storage.exportAllData(), 'match_backup.json');
            });

            container.querySelector('#resetDataBtn')?.addEventListener('click', () => {
                if (confirm('全データを初期状態にリセットしますか？')) {
                    resetToDemo();
                    location.reload();
                }
            });
            break;

        default:
            container.innerHTML = '<p>設定項目を選択してください</p>';
    }
}

function getWeightLabel(key) {
    const labels = {
        hardSkillMatch: 'ハードスキル一致',
        softSkillMatch: 'ソフトスキル一致',
        preferenceMatch: '希望条件一致',
        negativeDeduction: 'ネガティブ減点',
        marketBonus: '市場スコア加点'
    };
    return labels[key] || key;
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
