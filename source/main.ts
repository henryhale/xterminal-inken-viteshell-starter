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

/**
 * clear terminal
 * 
 * usage:
 *  run the `clear` command
 */ 
vsh.onclear = term.clear.bind(term);

/**
 * cleanup resources
 * 
 * usage:
 *  run `exit` command
 */
vsh.onexit = () => {
    store.write(vsh.exportState());
    term.dispose();

    document.body.innerHTML =
        "<div class='reload'>The terminal process terminated with code: " +
        vsh.env["?"] +
        "<br/> <a href='./'>Reload</a></div>";
};

/**
 * pass user input to the shell
 * 
 * usage:
 *  type anything and hit Enter key
 */
term.on("data", (line) => vsh.execute(line));

/**
 * abort execution on CTRL+C
 * 
 * usage:
 *  run `sleep 20` to pause for 20s
 *  hit CTRL+C while the terminal is focused to abort
 * before the task is complete
 */
term.on("keypress", (ev: IKeyPress) => {
    if (ev.ctrlKey && ev.key.toLowerCase() === "c") {
        ev.cancel();
        vsh.abort("^C");
    }
});

/**
 * Configure shell environment
 */

/**
 * prompt style
 * 
 * to view it:
 *  run `export -p` and look for `PS1`
 * alternative:
 *  run `echo $PS1`
 */
vsh.env["PS1"] = "" + red("┌[") + green("$USERNAME") + red("@") + cyan("$HOSTNAME") + red("]\n└$");

/**
 * define alias
 * 
 * usage:
 *  run `println hello` instead of `echo hello`
 */
vsh.alias["println"] = "echo";

/**
 * set timeout beyond which the process is terminated
 * 
 * usage:
 *  run `sleep 15` and wait for 15s
 * the process will be timed out after 10s
 */
vsh.setExecutionTimeout(10);

/**
 * add a custom command
 * 
 * usage:
 *  run `login` to execute this command
 */
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

/**
 * re-write the greeting on clearing screen
 */
term.on("clear", () => term.write(greetUser()));

/**
 * setup the terminal
 */
term.mount("#app");

/**
 * restore previously stored shell state
 */
window.onload = () => {
    const backup = store.read();
    if (backup) vsh.loadState(backup);
    else store.write(vsh.exportState());

    /**
     * PLAY TIME!
     */
    vsh.reset();
};

/**
 * backup state to localstorage & cleanup
 */
window.onbeforeunload = () => {
    store.write(vsh.exportState());
    term.dispose();
};
