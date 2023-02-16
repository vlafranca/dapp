import React from "react";

interface ThemeState {
  theme: string;
  buttons: string;
  secondary: string;
  contrast: string;
}

export const DarkTheme = {
  theme: "dark",
  buttons: "dark",
  secondary: "secondary",
  contrast: "light",
};

export const LightTheme = {
  theme: "light",
  buttons: "primary",
  secondary: "white",
  contrast: "black",
};

const ThemeContext = React.createContext<
  [ThemeState, (theme: ThemeState) => void]
>([LightTheme, (theme) => {}]);

export const ThemeProvider = ThemeContext.Provider;
export default ThemeContext;
