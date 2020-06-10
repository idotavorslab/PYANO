import * as fs from "fs";
export function createIfNotExists(path) {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            console.warn(`createIfNotExists(path) created: ${path}`);
            return false;
        }
        return true;
    }
    catch (e) {
        console.error(`createIfNotExists(${path})`, e);
    }
}
//# sourceMappingURL=myfs.js.map