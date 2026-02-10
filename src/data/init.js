/**
 * Match App - Data Initializer
 * Seeds the localStorage with dummy data if empty
 */

import { storage } from '../lib/storage.js';
import { dummyCandidates } from './candidates.js';
import { dummyJobs } from './jobs.js';
import { dummyProposals, dummyInterviews, dummySavedViews, dummyChatHistory } from './proposals.js';

/**
 * Initialize all data in localStorage
 * Only seeds if data doesn't already exist
 */
export function initializeData() {
    // Check if data already exists
    const existingCandidates = storage.getCandidates();

    if (existingCandidates.length > 0) {
        console.log('Data already exists, skipping initialization');
        return false;
    }

    console.log('Initializing demo data...');

    // Save candidates
    storage.saveCandidates(dummyCandidates);

    // Save jobs
    storage.saveJobs(dummyJobs);

    // Link proposals to actual candidate/job keys
    const candidates = storage.getCandidates();
    const jobs = storage.getJobs();

    const linkedProposals = dummyProposals.map((proposal, index) => {
        // Find matching candidate by name
        const candidate = candidates.find(c => c.name === proposal.candidateName);
        // Cycle through jobs
        const job = jobs[index % jobs.length];

        return {
            ...proposal,
            candidateKey: candidate?.candidateKey || candidates[index % candidates.length].candidateKey,
            jobKey: job?.jobKey || jobs[0].jobKey
        };
    });

    storage.saveProposals(linkedProposals);

    // Link interviews to candidates
    const linkedInterviews = dummyInterviews.map((interview, index) => {
        const candidateNames = ['鈴木 一郎', '田中 美咲'];
        const candidate = candidates.find(c => c.name === candidateNames[index]);

        return {
            ...interview,
            candidateKey: candidate?.candidateKey || candidates[index].candidateKey
        };
    });

    storage.saveInterviews(linkedInterviews);

    // Save saved views
    storage.saveSavedViews(dummySavedViews);

    // Initialize chat history
    Object.entries(dummyChatHistory).forEach(([key, messages]) => {
        messages.forEach(msg => {
            storage.addChatMessage(key, msg);
        });
    });

    // Update some jobs with saved candidates
    const updatedJobs = jobs.map((job, index) => {
        if (index < 2) {
            return {
                ...job,
                savedCandidateKeys: candidates.slice(0, 3).map(c => c.candidateKey)
            };
        }
        return job;
    });
    storage.saveJobs(updatedJobs);

    console.log('Demo data initialized successfully!');
    console.log(`- ${candidates.length} candidates`);
    console.log(`- ${jobs.length} jobs`);
    console.log(`- ${linkedProposals.length} proposals`);
    console.log(`- ${linkedInterviews.length} interviews`);

    return true;
}

/**
 * Reset all data to demo state
 */
export function resetToDemo() {
    storage.resetAllData();
    initializeData();
}

/**
 * Get summary stats for dashboard
 */
export function getDataStats() {
    return {
        candidateCount: storage.getCandidates().length,
        jobCount: storage.getJobs().length,
        proposalCount: storage.getProposals().length,
        interviewCount: storage.getInterviews().length,
        activeProposals: storage.getProposals().filter(p =>
            !['見送り', '決定'].includes(p.status)
        ).length
    };
}
