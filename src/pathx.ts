import * as path from "path";

export function is_name(pathLike: string): boolean {
    return path.basename(pathLike) === pathLike
}

/**{@link remove_ext Uses remove_ext}*/
export function replace_ext(pathLike: string, ext: string): string {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}


/**
 * @example
 * remove_ext("experiments/truths/fur_elise_B.txt")
 * >>> experiments/truths/fur_elise_B
 * remove_ext("fur_elise_B.txt")
 * >>> fur_elise_B */
export function remove_ext(pathLike: string): string {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}


/**{@link remove_ext Uses remove_ext} */
export function push_before_ext(pathLike: string, push: string | number): string {
    // safe because path.extname returns '' if no ext
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}

/**@example
 * const [ filename, ext ] = myfs.split_ext("shubi.dubi");
 * >>> filename     // "shubi"
 * >>> ext          // ".dubi"*/
export function split_ext(pathLike: string): [string, string] {
    // 'shubi.'         'shubi', '.'
    // 'shubi'          'shubi', ''
    // '/home/shubi'    'shubi', ''
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}