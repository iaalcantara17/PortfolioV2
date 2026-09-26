import { Component } from 'react'

// Wraps one section (App.jsx). An error thrown while rendering it, or in one of its
// effects, blanks only that section instead of the whole page. The section's wrapper
// keeps its place, so the counter, dots and nav still line up. React logs the error.
export default class SectionErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
