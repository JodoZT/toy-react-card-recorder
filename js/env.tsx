import * as React from "react";

export interface ThemeInterface{
    themeClass : string,
    toggleTheme : Function
}

export const ThemeContext = React.createContext<ThemeInterface>({themeClass : "theme-light",
                                                                toggleTheme : (newtheme : string) => {} });