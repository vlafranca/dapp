import { FC } from "react";
import { Col, Row, Spinner as SpinnerBootstrap } from "react-bootstrap";

interface LoadingIndicatorProps {}

const LoadingIndicator: FC<LoadingIndicatorProps> = () => (
  <Row>
    <Col className="text-center mt-5">
      <SpinnerBootstrap animation="border" />
    </Col>
  </Row>
);

export default LoadingIndicator;
