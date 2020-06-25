import * as path from "path";
export function is_name(pathLike) {
    return path.basename(pathLike) === pathLike;
}
export function replace_ext(pathLike, ext) {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}
export function remove_ext(pathLike) {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}
export function push_before_ext(pathLike, push) {
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}
export function split_ext(pathLike) {
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}
