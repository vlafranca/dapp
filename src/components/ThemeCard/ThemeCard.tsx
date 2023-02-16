import { FC, useContext } from "react";
import { Card, CardProps } from "react-bootstrap";
import { Color } from "react-bootstrap/esm/types";
import ThemeContext from "../../contexts/ThemeContext";

const ThemeCard: FC<CardProps> = (props) => {
  const [theme] = useContext(ThemeContext);
  return (
    <Card {...props} bg={theme.theme} text={theme.contrast as Color}>
      {props.children}
    </Card>
  );
};

export default ThemeCard;
