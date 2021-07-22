import * as React from "react";
import * as ReactDOM from "react-dom";
import CardGame from "./app";
import AppHeader from "./header";
import * as Env from "./env";

const maincontainer = document.getElementById("maincontainer");
interface PageState {
    user : string;
    userid : number;
}
class Page extends React.Component<{}, PageState&Env.ThemeInterface, {}>{
    state = {
        user : "Guest",
        userid : 0,
        themeClass: "theme-light",
        toggleTheme: (newtheme: string) => {
            this.setState({themeClass:newtheme});
        }
    }

    render() {
        return (<Env.ThemeContext.Provider value={this.state}>
                    <div><AppHeader></AppHeader></div>
                    <div><CardGame></CardGame></div>
                </Env.ThemeContext.Provider>);
    }
}
ReactDOM.render(<Page></Page>, maincontainer);
