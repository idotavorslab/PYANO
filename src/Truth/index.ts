import * as path from "path";
import * as fs from 'fs'
import { bool } from "../util";
import myfs from '../MyFs'

/**An object wrapping an abs path with extension.*/
class FileNew {

    constructor(absPathWithExt: string) {
        if (!bool(path.extname(absPathWithExt))) {
            console.error(`FileNew constructor: passed 'absPathWithExt' is extensionless: ${absPathWithExt}. Returning`);
        }
        if (!path.isAbsolute(absPathWithExt)) {
            console.error(`FileNew constructor: passed 'absPathWithExt' NOT absolute: ${absPathWithExt}. Returning`);
        }

        this._absPath = absPathWithExt;

        // this.pathNoExt = myfs.remove_ext(absPathWithExt);


    }

    /**The abs path WITH extension*/
    private _absPath: string;

    get absPath(): string {
        return this._absPath;
    }

    /**Sets this._absPath and also RENAMES the actual file.*/
    set absPath(absPathWithExt: string) {
        if (!bool(path.extname(absPathWithExt))) {
            console.error(`FileNew set absPath: passed extensionless 'absPathWithExt': ${absPathWithExt}. Not setting`);
            return;
        }
        if (!path.isAbsolute(absPathWithExt)) {
            console.error(`FileNew set absPath: passed non-absolute 'absPathWithExt': ${absPathWithExt}. Not setting`);
            return;
        }
        this._absPath = absPathWithExt;
        fs.renameSync(this._absPath, absPathWithExt);
    }

    /*toString() {
     return this.path;
     }*/
    /**@deprecated*/
    renameByOtherFile(other: FileNew) {
        console.warn('called renameByOtherFile(), use set absPath instead');
        this.absPath = other.absPath;
    }

    renameByCTime() {
        const stats = fs.lstatSync(this.absPath);
        // @ts-ignore
        const datestr = stats.ctime.human();
        const newPath = myfs.push_before_ext(this.absPath, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        this.absPath = newPath;
    }


    async getBitrateAndHeight(): Promise<[string, string]> {
        if (!this._absPath.endsWith('mp4') && !this._absPath.endsWith('mov')) {
            console.warn(`FileNew: "${this._absPath}" isn't "mp4" or "mov"`);
            return undefined
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(execSync(`${ffprobeCmd} "${this._absPath}"`, { encoding: 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] === "video");
        return [bit_rate, height];
    }


    exists(): boolean {
        return fs.existsSync(this._absPath);
    }

    remove() {
        fs.unlinkSync(this._absPath);
    }

    size(): number {
        let { size } = fs.lstatSync(this._absPath);
        return size;
    }
}


class Txt {
    /**A FileNew object representing the absolute ``*.txt`` path.*/
    readonly base: FileNew;
    /**A FileNew object representing the absolute ``*_on.txt``  path.*/
    readonly on: FileNew;
    /**A FileNew object representing the absolute ``*_off.txt`` path.*/
    readonly off: FileNew;


    constructor(absPathNoExt: string) {
        if (!path.isAbsolute(absPathNoExt)) {
            console.error(`Txt constructor: passed 'absPathNoExt' NOT absolute: ${absPathNoExt}. returning`);
            return;
        }
        if (bool(path.extname(absPathNoExt))) {
            console.warn(`FileNew constructor: passed 'absPathNoExt' is NOT extensionless: ${absPathNoExt}. Removing ext`);
            absPathNoExt = myfs.remove_ext(absPathNoExt);
        }
        this.base = new FileNew(`${absPathNoExt}.txt`);
        this.on = new FileNew(`${absPathNoExt}_on.txt`);
        this.off = new FileNew(`${absPathNoExt}_off.txt`);

    }

    getAll(): [FileNew, FileNew, FileNew] {
        return [this.base, this.on, this.off];
    }


    // getExisting(): [ (File | false), (File | false), (File | false) ] {
    getExisting(): { base?: FileNew, on?: FileNew, off?: FileNew } {
        const files = {
            base: this.base.exists() ? this.base : undefined,
            on: this.on.exists() ? this.on : undefined,
            off: this.off.exists() ? this.off : undefined,
        };

        return files;
    }

    getMissing(): string[] {
        const files = [];
        if (!this.base.exists()) {
            files.push("base")
        }
        if (!this.on.exists()) {
            files.push("on")
        }
        if (!this.off.exists()) {
            files.push("off")
        }
        return files;

    }

    allExist(): boolean {
        return (
            this.base.exists()
            && this.on.exists()
            && this.off.exists()
        );
    }

    anyExist(): boolean {
        return (
            this.base.exists()
            || this.on.exists()
            || this.off.exists()
        );

    }

    removeAll(): void {
        if (this.base.exists())
            this.base.remove();
        if (this.on.exists())
            this.on.remove();
        if (this.off.exists())
            this.off.remove();

    }

    renameByOtherTxt(other: Txt): void {
        // console.warn('renameByOtherTxt: didnt set new this base / on / off');
        this.base.absPath = other.base.absPath;
        this.on.absPath = other.on.absPath;
        this.off.absPath = other.off.absPath;
        // fs.renameSync(this.base.path, other.base.path);
        // fs.renameSync(this.on.path, other.on.path);
        // fs.renameSync(this.off.path, other.off.path);

    }
}

export interface ReadonlyTruth {
    /**The basename without extension.*/
    name: string,
    txt: {
        base: {
            absPath: string
        },
        on: {
            absPath: string
        },
        off: {
            absPath: string
        }
    },
    midi: { absPath: string },
    mp4: { absPath: string },
    onsets: { absPath: string },
}

export class TruthNew implements ReadonlyTruth {

    /**The basename without extension.*/
    readonly name: string;
    readonly txt: Txt;
    /**A FileNew object of the midi file.*/
    readonly midi: FileNew;
    /**A FileNew object of the mp4 file.*/
    readonly mp4: FileNew;
    /**A FileNew object of the mov file.*/
    readonly mov: FileNew;
    /**A FileNew object of the onsets file.*/
    readonly onsets: FileNew;

    /**
     * @param nameNoExt - Expects a file base name with no extension.
     * @param dir - Optional abs dir path of the truth. Defaults to `TRUTHS_PATH_ABS`
     */
    constructor(nameNoExt: string, dir?: string) {
        let [name, ext] = myfs.split_ext(nameNoExt);

        if (bool(ext)) {
            console.warn(`Truth ctor, passed name is not extensionless: ${nameNoExt}. Continuing with "${name}"`);
        }

        if (name.endsWithAny('_off', '_on')) {
            // TODO: THIS IS BUGGY
            name = `${name.upTo('_', true)}`;
            console.warn(`Passed path of "_on" or "_off" file and not base. Using name: "${name}"`);

        }


        this.name = name;
        if (!bool(dir)) {
            dir = TRUTHS_PATH_ABS;
        }
        const absPathNoExt = path.join(dir, name);
        this.txt = new Txt(absPathNoExt);
        this.midi = new FileNew(`${absPathNoExt}.mid`);
        this.mp4 = new FileNew(`${absPathNoExt}.mp4`);
        this.mov = new FileNew(`${absPathNoExt}.mov`);
        this.onsets = new FileNew(`${absPathNoExt}_onsets.json`);

    }

    toJSON(...include: ("txt" | "midi" | "mp4" | "onsets")[]): ReadonlyTruth {
        let readonlyTruth = {} as ReadonlyTruth;
        const readonlyTxt = () => ({
            base: {
                absPath: this.txt.base.absPath
            },
            on: {
                absPath: this.txt.on.absPath
            },
            off: {
                absPath: this.txt.off.absPath
            }
        });
        const readonlySubFile = (subfile: "midi" | "mp4" | "onsets") => ({
            absPath: this[subfile].absPath
        });
        if (bool(include)) {
            for (let inc of include) {
                switch (inc) {
                    case "txt":
                        readonlyTruth.txt = readonlyTxt();
                        break;
                    case "midi":
                        readonlyTruth.midi = readonlySubFile("midi");
                        break;
                    case "mp4":
                        readonlyTruth.mp4 = readonlySubFile("mp4");
                        break;
                    case "onsets":
                        readonlyTruth.onsets = readonlySubFile("onsets");
                        break;
                }
            }

        } else {
            readonlyTruth = {
                name: this.name,
                txt: readonlyTxt(),
                mp4: readonlySubFile("mp4"),
                onsets: readonlySubFile("onsets"),
                midi: readonlySubFile("midi")
            }
        }
        return readonlyTruth;

    }

    /**Counts the number of non-empty lines in the txt on path file.*/
    numOfNotes(): number {
        if (!this.txt.on.exists()) {
            console.warn(`this.txt.on (${this.txt.on.absPath}) does not exist, returning undefined`);
            return undefined
        }
        const strings = fs
            .readFileSync(this.txt.on.absPath, { encoding: 'utf8' })
            .split('\n');
        let notes: number = 0;
        for (let s of strings) {
            if (s.includes('\\')) {
                console.warn(`s includes backslash, ${this.txt.on}`);
            } else if (bool(s)) {
                notes++;
            }

        }
        return notes;
    }
}

/**An object wrapping a path with extension. Can be absolute or base.
 * ``toString()`` returns ``this.path``.
 * ``name`` property exists only if wrapping an absolute path.*/
export class _File {
    constructor(pathWithExt) {
        if (!util.bool(path.extname(pathWithExt))) {
            throw new Error(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        }
        /**The path including extension. Can be either absolute or a file name.
         * @type {string} path*/
        this.path = pathWithExt;
        /**The path without extension. Can be either absolute or a file name.
         * @type {string} pathNoExt*/
        this.pathNoExt = fsx.remove_ext(this.path);
        if (path.isAbsolute(this.path)) {
            /**If exists, a File object of the basename.
             * @type {_File} name*/
            this.name = new _File(fsx.basename(this.path));
        }

    }

    toString() {
        return this.path;
    }

    /**@param {_File} other*/
    async renameByOtherFile(other) {
        const fs = require("fs");
        await fs.renameSync(this.path, other.path);
    }

    async renameByCTime() {
        const fs = require("fs");

        const stats = await fs.lstatSync(this.path);
        const datestr = stats.ctime.human();
        const newPath = fsx.push_before_ext(this.path, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        await fs.renameSync(this.path, newPath);
    }

    /**@throws {Error} error if file isn't "mp4" or "mov"
     * @return {Promise<[string,string]>}
     * */
    async getBitrateAndHeight() {
        if (!this.path.endsWith('mp4') && !this.path.endsWith('mov')) {
            throw new Error(`_File: "${this.path}" isn't "mp4" or "mov"`);
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(await execSync(`${ffprobeCmd} "${this.path}"`, { encoding: 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] == "video");
        return [bit_rate, height];
    }


    /**@return {Promise<boolean>}*/
    async exists() {
        return await fsx.path_exists(this.path);
    }

    /**@return {Promise<void>}*/
    async remove() {
        return require('fs').unlinkSync(this.path);
    }

    /**@return {number}*/
    async size() {
        let { size } = await require("fs").lstatSync(this.path);
        return size;
    }
}

export class Truth {
    /**An object wrapping an absolute path without extension.
     * @param {string} pathNoExt*/
    constructor(pathNoExt) {
        if (!path.isAbsolute(pathNoExt)) {
            throw new Error(`Passed path is not absolute: ${pathNoExt}`);
        }
        if (util.bool(fsx.extname(pathNoExt))) {
            throw new Error(`Passed path is not extensionless: ${pathNoExt}`);
        }
        if (pathNoExt.endsWith('off') || pathNoExt.endsWith('on')) {
            throw new Error(`Passed path of "_on" or "_off" file and not base: ${pathNoExt}`);
        }
        /**The absolute path without extension.
         * @type {string} pathNoExt*/
        this.pathNoExt = pathNoExt;
        /**The basename without extension.
         * @type {string} name*/
        this.name = fsx.basename(this.pathNoExt);
        /**
         * @prop {_File} base - A _File object representing the absolute ``*.txt`` path.
         * @prop {_File} on - A _File object representing the absolute ``*_on.txt``  path.
         * @prop {_File} off - A _File object representing the absolute ``*_off.txt`` path.
         * */
        this.txt = new class {
            /**@param {string} pathNoExt*/
            constructor(pathNoExt) {
                this.base = new _File(`${pathNoExt}.txt`);
                this.on = new _File(`${pathNoExt}_on.txt`);
                this.off = new _File(`${pathNoExt}_off.txt`);
            }

            /**@return {[_File,_File,_File]}*/
            getAll() {
                return [this.base, this.on, this.off];
            }

            /**@return {_File[]}*/
            async getMissing() {
                let missing = [];
                if (!(await this.base.exists())) {
                    missing.push(this.base);
                }
                if (!(await this.on.exists())) {
                    missing.push(this.on);
                }
                if (!(await this.off.exists())) {
                    missing.push(this.off);
                }

                return missing;
            }

            /**@return {Promise<boolean>}*/
            async allExist() {
                return all(await asx.concurrent(
                    this.base.exists(),
                    this.on.exists(),
                    this.off.exists()));
            }

            /**@return {Promise<boolean>}*/
            async anyExist() {
                return any(await asx.concurrent(
                    this.base.exists(),
                    this.on.exists(),
                    this.off.exists()));
            }

            /**@return {Promise<void>}*/
            async removeAll() {
                if (await this.base.exists()) {
                    await this.base.remove();
                }
                if (await this.on.exists()) {
                    await this.on.remove();
                }
                if (await this.off.exists()) {
                    await this.off.remove();
                }

            }

            async renameByOtherTxt(other) {
                const fs = require("fs");
                return await asx.concurrent(
                    fs.renameSync(this.base.path, other.base.path),
                    fs.renameSync(this.on.path, other.on.path),
                    fs.renameSync(this.off.path, other.off.path),
                );
            }


        }(this.pathNoExt);

        /**A _File object of the midi file.
         * @type {_File} midi*/
        this.midi = new _File(`${this.pathNoExt}.mid`);
        /**A _File object of the mp4 file.
         * @type {_File} mp4*/
        this.mp4 = new _File(`${this.pathNoExt}.mp4`);
        /**A _File object of the mov file.
         * @type {_File} mov*/
        this.mov = new _File(`${this.pathNoExt}.mov`);
        /**A _File object of the onsets file.
         * @type {_File} onsets*/
        this.onsets = new _File(`${this.pathNoExt}_onsets.json`);

    }

    /**Counts the number of non-empty lines in the txt on path file.
     @return {number}*/
    numOfNotes() {
        return require("fs")
            .readFileSync(this.txt.on.path, { encoding: 'utf8' })
            .split('\n')
            .filter(line => util.bool(line)).length;
    }
}