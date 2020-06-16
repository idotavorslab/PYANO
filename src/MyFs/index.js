console.log('MyFs.index.ts');
import * as fs from "fs";
import * as path from "path";
import { bool } from "../util";
function is_name(pathLike) {
    return path.basename(pathLike) === pathLike;
}
function replace_ext(pathLike, ext) {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}
function remove_ext(pathLike) {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}
function push_before_ext(pathLike, push) {
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}
function split_ext(pathLike) {
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}
function createIfNotExists(path) {
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
function isEmpty(abspath, { recursive }) {
    const items = fs.readdirSync(abspath);
    if (!recursive) {
        return !bool(items);
    }
    for (let item of items) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        if (stats.isDirectory()) {
            let empty = isEmpty(itemAbs, { recursive: true });
            if (!empty) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
}
function getEmptyDirs(abspath) {
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
            }
            else {
                emptyDirs.push(...getEmptyDirs(itemAbs));
            }
        }
        else {
            console.log('stats.size:', stats.size);
            if (stats.size === 0) {
                fs.unlinkSync(itemAbs);
                removedFiles = true;
            }
        }
    }
    if (removedFiles) {
        return getEmptyDirs(abspath);
    }
    return emptyDirs;
}
function removeEmptyDirs(abspath) {
    const emptydirs = getEmptyDirs(abspath);
    console.log({ emptydirs });
    for (let dir of emptydirs) {
        fs.rmdirSync(dir);
    }
}
export default {
    split_ext,
    replace_ext,
    remove_ext,
    push_before_ext,
    is_name,
    createIfNotExists,
    isEmpty,
    getEmptyDirs,
    removeEmptyDirs
};
