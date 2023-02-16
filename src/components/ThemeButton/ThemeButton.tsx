import { FC, useContext } from "react";
import { Button, ButtonProps } from "react-bootstrap";
import ThemeContext from "../../contexts/ThemeContext";

const ThemeButton: FC<ButtonProps> = (props) => {
  const [theme] = useContext(ThemeContext);
  return (
    <Button {...props} variant={theme.buttons}>
      {props.children}
    </Button>
  );
};

export default ThemeButton;
