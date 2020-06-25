/**import myfs from "../MyFs";*/
console.log('MyFs.index.ts');
import * as fs from "fs";
import * as path from "path";
import { bool } from "../util";


/**Returns whether existed already*/
function createIfNotExists(path: string): boolean {
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

function isEmpty(abspath: string, { recursive }: { recursive: boolean }): boolean {
    const items = fs.readdirSync(abspath);
    if (!recursive) {
        return !bool(items)
    }
    for (let item of items) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);

        if (stats.isDirectory()) {
            let empty = isEmpty(itemAbs, { recursive: true });
            if (!empty) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;

}

/**Returns a list of absolute paths of empty dirs*/
function getEmptyDirs(abspath: string): string[] {
    const emptyDirs = [];
    const items = fs.readdirSync(abspath);
    let removedFiles = false;
    if (!bool(items))
        return [abspath];

    for (let item of items) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        if (stats.isDirectory()) {
            if (isEmpty(itemAbs, { recursive: true })) {
                emptyDirs.push(itemAbs);
            } else {
                emptyDirs.push(...getEmptyDirs(itemAbs));
            }
        } else {
            console.log('stats.size:', stats.size);
            if (stats.size === 0) {
                fs.unlinkSync(itemAbs);
                removedFiles = true;
            }
        }
    }
    if (removedFiles) {
        // noinspection TailRecursionJS
        return getEmptyDirs(abspath);
    }
    return emptyDirs;

}

function removeEmptyDirs(abspath: string): void {
    const emptydirs = getEmptyDirs(abspath);
    console.log({ emptydirs });
    for (let dir of emptydirs) {
        fs.rmdirSync(dir)
    }
}

export default {

    createIfNotExists,
    isEmpty,
    getEmptyDirs,
    removeEmptyDirs
}
