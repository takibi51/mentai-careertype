/**
 * Match App - UUID Generator and Utility Functions
 */

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format date to Japanese locale
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Format date with time
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Shuffle array (Fisher-Yates)
 * @param {Array} array
 * @returns {Array}
 */
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Pick random items from array
 * @param {Array} array
 * @param {number} count
 * @returns {Array}
 */
export function pickRandom(array, count) {
    return shuffleArray(array).slice(0, count);
}

/**
 * Clamp number between min and max
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Escape HTML entities
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Simple template parser (replaces {{key}} with values)
 * @param {string} template
 * @param {Object} data
 * @returns {string}
 */
export function parseTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
}

/**
 * Deep clone object
 * @param {Object} obj
 * @returns {Object}
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if string contains any of the keywords
 * @param {string} str
 * @param {string[]} keywords
 * @returns {boolean}
 */
export function containsAny(str, keywords) {
    const lowerStr = str.toLowerCase();
    return keywords.some(keyword => lowerStr.includes(keyword.toLowerCase()));
}

/**
 * Normalize Japanese text for search (hiragana/katakana)
 * @param {string} str
 * @returns {string}
 */
export function normalizeJapanese(str) {
    // Convert katakana to hiragana for unified search
    return str.replace(/[\u30a1-\u30f6]/g, match => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
    }).toLowerCase();
}

/**
 * Calculate similarity score between two strings
 * @param {string} str1
 * @param {string} str2
 * @returns {number} 0-1
 */
export function stringSimilarity(str1, str2) {
    const s1 = normalizeJapanese(str1);
    const s2 = normalizeJapanese(str2);

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Simple Jaccard-like similarity for Japanese text
    const set1 = new Set(s1.split(''));
    const set2 = new Set(s2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
}
