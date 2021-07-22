import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Env from "./env";

interface HeaderProps {
};

export default function AppHeader(props: HeaderProps) {
    return (<Env.ThemeContext.Consumer>
        {(theme) => (
            <div className={"header-main " + theme.themeClass}>
                <span className="logo">
                    手动记牌器
                </span>
                <span className="logo-comment">Record your card game by hand. Try it!</span>
            </div>
        )}
    </Env.ThemeContext.Consumer>);
}