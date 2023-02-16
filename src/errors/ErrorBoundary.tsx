import React from "react";
import { Alert, Container } from "react-bootstrap";

export class ErrorBoundary extends React.Component {
  state: { hasError: boolean };
  props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container className="text-center mt-5">
          <Alert variant="danger">An error occured generating the page.</Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}
