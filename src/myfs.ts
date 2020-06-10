import * as fs from "fs"

/**Returns whether existed already*/
export function createIfNotExists(path: string): boolean {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            console.warn(`createIfNotExists(path) created: ${path}`);
            return false;
        }
        return true;


    } catch (e) {
        console.error(`createIfNotExists(${path})`, e);
    }
}