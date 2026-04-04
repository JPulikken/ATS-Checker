/**
 * Helper utility functions for formatting and UI logic.
 */

/**
 * Returns a color class based on a score value.
 * @param {number} score - 0 to 100
 * @returns {{ color: string, label: string, bgClass: string }}
 */
export function getScoreColor(score) {
  if (score >= 80) return { color: '#10b981', label: 'Excellent', bgClass: 'success' };
  if (score >= 60) return { color: '#6366f1', label: 'Good',      bgClass: 'primary' };
  if (score >= 40) return { color: '#f59e0b', label: 'Fair',      bgClass: 'warning' };
  return               { color: '#ef4444', label: 'Poor',         bgClass: 'danger' };
}

/**
 * Returns a gradient for progress bars based on score.
 */
export function getScoreGradient(score) {
  if (score >= 80) return 'linear-gradient(90deg, #10b981, #34d399)';
  if (score >= 60) return 'linear-gradient(90deg, #6366f1, #8b5cf6)';
  if (score >= 40) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  return 'linear-gradient(90deg, #ef4444, #f87171)';
}

/**
 * Formats a number as a percentage string.
 */
export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

/**
 * Truncates a filename to a max length.
 */
export function truncateFilename(name, maxLen = 30) {
  if (!name || name.length <= maxLen) return name;
  const ext = name.split('.').pop();
  return `${name.slice(0, maxLen - ext.length - 4)}...${ext}`;
}

/**
 * Formats file size in bytes to KB/MB.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Capitalizes the first letter of each word.
 */
export function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Returns a grade letter (A+, A, B+...) based on score.
 */
export function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
}

/**
 * Section display config.
 */
export const SECTION_CONFIG = {
  skills: {
    label: 'Technical Skills',
    description: '40% weight — Matches tools, languages, frameworks',
    icon: '⚡',
    weight: 40,
  },
  experience: {
    label: 'Work Experience',
    description: '30% weight — Action verbs, metrics, JD alignment',
    icon: '💼',
    weight: 30,
  },
  tools: {
    label: 'Tools & Platforms',
    description: '20% weight — Cloud, DevOps, databases',
    icon: '🔧',
    weight: 20,
  },
  education: {
    label: 'Education',
    description: '10% weight — Degree, certifications, qualifications',
    icon: '🎓',
    weight: 10,
  },
};
