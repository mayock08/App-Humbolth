import React from 'react';
import logger from '../utils/logger';
import ServerError from '../pages/shared/ServerError';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to our centralized logging service
        logger.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render the fallback ServerError UI
            return <ServerError />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
