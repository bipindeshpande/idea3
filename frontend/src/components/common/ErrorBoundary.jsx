import React from "react";

class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null, errorInfo: null };
 }

 static getDerivedStateFromError(error) {
 // Update state so the next render will show the fallback UI
 return { hasError: true };
 }

 componentDidCatch(error, errorInfo) {
 // Log error to console or error reporting service
 console.error("ErrorBoundary caught an error:", error, errorInfo);
 this.setState({
 error,
 errorInfo,
 });
 }

 handleReset = () => {
 this.setState({ hasError: false, error: null, errorInfo: null });
 };

 render() {
 if (this.state.hasError) {
 // Fallback UI
 return (
 <div className="min-h-screen flex items-center justify-center bg-app p-4">
 <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-6 border border-default">
 <div className="text-center">
 <div className="text-6xl mb-4">⚠️</div>
 <h1 className="text-2xl font-bold text-primary mb-2">
 Something went wrong
 </h1>
 <p className="text-secondary mb-6">
 We're sorry, but something unexpected happened. Please try refreshing the page.
 </p>
 <div className="flex gap-3 justify-center">
 <button
 onClick={this.handleReset}
 className="px-4 py-2 bg-accent text-on-accent rounded-lg hover:bg-accent-hover transition-colors"
 >
 Try Again
 </button>
 <button
 onClick={() => window.location.reload()}
 className="px-4 py-2 bg-surface text-primary rounded-lg hover:bg-surface-hover transition-colors"
 >
 Refresh Page
 </button>
 </div>
 {process.env.NODE_ENV === "development" && this.state.error && (
 <details className="mt-6 text-left">
 <summary className="cursor-pointer text-sm text-secondary mb-2">
 Error Details (Development Only)
 </summary>
 <pre className="text-xs bg-surface p-3 rounded overflow-auto max-h-48">
 {this.state.error.toString()}
 {this.state.errorInfo?.componentStack}
 </pre>
 </details>
 )}
 </div>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export default ErrorBoundary;



