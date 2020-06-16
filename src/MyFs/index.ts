/**import myfs from "../MyFs";*/
console.log('MyFs.index.ts');
import * as fs from "fs";
import * as path from "path";
import { bool } from "../util";


function is_name(pathLike: string): boolean {
    return path.basename(pathLike) === pathLike
}

/**{@link remove_ext Uses remove_ext}*/
function replace_ext(pathLike: string, ext: string): string {
    if ( ext.startsWith('.') )
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}


/**
 * @example
 * remove_ext("experiments/truths/fur_elise_B.txt")
 * >>> experiments/truths/fur_elise_B
 * remove_ext("fur_elise_B.txt")
 * >>> fur_elise_B */
function remove_ext(pathLike: string): string {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}


/**{@link remove_ext Uses remove_ext} */
function push_before_ext(pathLike: string, push: string | number): string {
    // safe because path.extname returns '' if no ext
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}

/**@example
 * const [ filename, ext ] = myfs.split_ext("shubi.dubi");
 * >>> filename     // "shubi"
 * >>> ext          // ".dubi"*/
function split_ext(pathLike: string): [ string, string ] {
    // 'shubi.'         'shubi', '.'
    // 'shubi'          'shubi', ''
    // '/home/shubi'    'shubi', ''
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [ filename, ext ];
}

/**Returns whether existed already*/
function createIfNotExists(path: string): boolean {
    try {
        if ( !fs.existsSync(path) ) {
            fs.mkdirSync(path);
            console.warn(`createIfNotExists(path) created: ${path}`);
            return false;
        }
        return true;
        
        
    } catch ( e ) {
        console.error(`createIfNotExists(${path})`, e);
    }
}

function isEmpty(abspath: string, { recursive }: { recursive: boolean }): boolean {
    const items = fs.readdirSync(abspath);
    if ( !recursive ) {
        return !bool(items)
    }
    for ( let item of items ) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        
        if ( stats.isDirectory() ) {
            let empty = isEmpty(itemAbs, { recursive : true });
            if ( !empty ) {
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
    if ( !bool(items) )
        return [ abspath ];
    
    for ( let item of items ) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        if ( stats.isDirectory() ) {
            if ( isEmpty(itemAbs, { recursive : true }) ) {
                emptyDirs.push(itemAbs);
            } else {
                emptyDirs.push(...getEmptyDirs(itemAbs));
            }
        } else {
            console.log('stats.size:', stats.size);
            if ( stats.size === 0 ) {
                fs.unlinkSync(itemAbs);
                removedFiles = true;
            }
        }
    }
    if ( removedFiles ) {
        // noinspection TailRecursionJS
        return getEmptyDirs(abspath);
    }
    return emptyDirs;
    
}

function removeEmptyDirs(abspath: string): void {
    const emptydirs = getEmptyDirs(abspath);
    console.log({ emptydirs });
    for ( let dir of emptydirs ) {
        fs.rmdirSync(dir)
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
}
