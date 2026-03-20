/**
 * Centralized logging utility for the Humbolth App.
 * In a production environment, this can be hooked up to Sentry, Datadog, or your custom backend endpoints.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    /**
     * Log an error.
     * @param {Error|String} error - The error to log
     * @param {Object} [errorInfo] - Additional react component stack info or context
     */
    error: (error, errorInfo = null) => {
        // Always log to console in development
        if (!isProduction) {
            console.error('🛑 [Logger] App Error:', error);
            if (errorInfo) {
                console.error('      Component Stack:', errorInfo);
            }
        }

        // Implementation for Production logging
        // For example:
        // fetch('/api/logs', { method: 'POST', body: JSON.stringify({ level: 'error', message: error.toString(), info: errorInfo }) })

        // TODO: if Sentry is added, do Sentry.captureException(error);
    },

    /**
     * Log a warning.
     * @param {String} message - The warning to log
     * @param {Object} [data] - Additional data
     */
    warn: (message, data = null) => {
        if (!isProduction) {
            console.warn(`⚠️ [Logger] ${message}`, data || '');
        }
    },

    /**
     * Log standard info.
     * @param {String} message - The message to log
     * @param {Object} [data] - Additional data
     */
    info: (message, data = null) => {
        if (!isProduction) {
            console.info(`ℹ️ [Logger] ${message}`, data || '');
        }
    }
};

export default logger;
