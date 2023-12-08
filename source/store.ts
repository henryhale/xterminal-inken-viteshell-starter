export default {
    key: "viteshell",
    read() {
        return localStorage.getItem(this.key);
    },
    write(data: string) {
        return localStorage.setItem(this.key, data);
    }
};