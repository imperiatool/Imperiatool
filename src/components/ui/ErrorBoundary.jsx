import { Component } from 'react';

/**
 * Keeps a failure local: if a part of the page throws while rendering, only
 * that part shows `fallback(retry)` instead of the whole app turning white.
 * `resetKey`: when it changes (another page), the part is tried again.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = () => this.setState({ error: null });
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.retry();
  }

  render() {
    if (this.state.error) return this.props.fallback ? this.props.fallback(this.retry, this.state.error) : null;
    return this.props.children;
  }
}
