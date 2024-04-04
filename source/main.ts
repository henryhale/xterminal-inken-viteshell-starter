import "./style.css";

import XTerminal, { IKeyPress } from "xterminal";
import ViteShell from "viteshell";
import { red, green, cyan } from "inken";
import { store, greetUser } from "./util";

// create a shell
const vsh = new ViteShell();

// create the terminal interface
const term = new XTerminal();

// connect the shell to the terminal

// display primary output in color: green
vsh.onoutput = (data: string) => {
    term.write(green(data).toString());
}

// show errors in color: red
vsh.onerror = (reason: string) => {
    term.write(red(reason).toString());
};

// clear terminal
vsh.onclear = term.clear.bind(term);

// on `exit` command, cleanup resources
vsh.onexit = () => {
    store.write(vsh.exportState());
    term.dispose();

    document.body.innerHTML =
        "<div class='reload'>The terminal process terminated with code: " +
        vsh.env["?"] +
        "<br/> <a href='./'>Reload</a></div>";
};

// pass user input to the shell
term.on("data", async (line) => {
    await vsh.execute(line);
});

// abort execution on CTRL+C
term.on("keypress", (ev: IKeyPress) => {
    if (ev.ctrlKey && ev.key.toLowerCase() === "c") {
        ev.cancel();
        vsh.abort();
    }
});

// Configure shell
// prompt style
vsh.env["PS1"] = "" + red("┌[") + green("$USERNAME") + red("@") + cyan("$HOSTNAME") + red("]\n└$");

// define alias
vsh.alias["println"] = "echo";

// add a custom command
vsh.addCommand("login", {
    synopsis: "login",
    description: "Demo login process",
    async action({ env, stdin, stdout }) {
        stdout.write("Username: ");
        const username = await stdin.readline();
        stdout.write("Token: ");
        const token = await stdin.readline();
        stdout.write("Logging in as " + cyan(username) + "\n");
        env["USERNAME"] = username;
        env["TOKEN"] = token;
    },
});

// re-write the greeting on clearing screen
term.on("clear", () => term.write(greetUser()));

// setup the terminal
term.mount("#app");

// restore previously stored shell state
window.onload = () => {
    const backup = store.read();
    if (backup) vsh.loadState(backup);
    else store.write(vsh.exportState());

    // let's go
    vsh.reset();
};

// backup state to localstorage & cleanup
window.onunload = () => {
    store.write(vsh.exportState());
    term.dispose();
};
