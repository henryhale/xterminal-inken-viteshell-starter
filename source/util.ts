import { dim, gray, green, italic, magenta } from "inken";

export const store = {
    key: "viteshell",
    read() {
        return localStorage.getItem(this.key);
    },
    write(data: string) {
        return localStorage.setItem(this.key, data);
    }
};

export function greetUser() {
    return `<div class="greeting">
<img src="xterminal.png" width="45" />

${green(`WELCOME TO THE COMMAND LINE INTERFACE`)}

${dim(italic("powered by") + "")}

${magenta(`<a href="https://github.com/henryhale/viteshell">ViteShell</a>`)} ${gray("~")} ${magenta(`<a href="https://github.com/henryhale/inken">Inken</a>`)} ${gray("~")} ${magenta(`<a href="https://github.com/henryhale/xterminal">XTerminal</a>
`)}
</div>`;
}