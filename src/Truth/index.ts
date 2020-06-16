import * as path from "path";
import * as fs from 'fs'
import { bool } from "../util";
import myfs from '../MyFs'

/**An object wrapping an abs path with extension.*/
class File {

    constructor(absPathWithExt: string) {
        if (!bool(path.extname(absPathWithExt))) {
            console.error(`File constructor: passed 'absPathWithExt' is extensionless: ${absPathWithExt}. Returning`);
        }
        if (!path.isAbsolute(absPathWithExt)) {
            console.error(`File constructor: passed 'absPathWithExt' NOT absolute: ${absPathWithExt}. Returning`);
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
            console.error(`File set absPath: passed extensionless 'absPathWithExt': ${absPathWithExt}. Not setting`);
            return;
        }
        if (!path.isAbsolute(absPathWithExt)) {
            console.error(`File set absPath: passed non-absolute 'absPathWithExt': ${absPathWithExt}. Not setting`);
            return;
        }
        this._absPath = absPathWithExt;
        fs.renameSync(this._absPath, absPathWithExt);
    }

    /*toString() {
     return this.path;
     }*/
    /**@deprecated*/
    renameByOtherFile(other: File) {
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
            console.warn(`File: "${this._absPath}" isn't "mp4" or "mov"`);
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
    /**A File object representing the absolute ``*.txt`` path.*/
    readonly base: File;
    /**A File object representing the absolute ``*_on.txt``  path.*/
    readonly on: File;
    /**A File object representing the absolute ``*_off.txt`` path.*/
    readonly off: File;


    constructor(absPathNoExt: string) {
        if (!path.isAbsolute(absPathNoExt)) {
            console.error(`Txt constructor: passed 'absPathNoExt' NOT absolute: ${absPathNoExt}. returning`);
            return;
        }
        if (bool(path.extname(absPathNoExt))) {
            console.warn(`File constructor: passed 'absPathNoExt' is NOT extensionless: ${absPathNoExt}. Removing ext`);
            absPathNoExt = myfs.remove_ext(absPathNoExt);
        }
        this.base = new File(`${absPathNoExt}.txt`);
        this.on = new File(`${absPathNoExt}_on.txt`);
        this.off = new File(`${absPathNoExt}_off.txt`);

    }

    getAll(): [File, File, File] {
        return [this.base, this.on, this.off];
    }


    // getExisting(): [ (File | false), (File | false), (File | false) ] {
    getExisting(): { base?: File, on?: File, off?: File } {
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

export class Truth implements ReadonlyTruth {

    /**The basename without extension.*/
    readonly name: string;
    readonly txt: Txt;
    /**A File object of the midi file.*/
    readonly midi: File;
    /**A File object of the mp4 file.*/
    readonly mp4: File;
    /**A File object of the mov file.*/
    readonly mov: File;
    /**A File object of the onsets file.*/
    readonly onsets: File;

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
        this.midi = new File(`${absPathNoExt}.mid`);
        this.mp4 = new File(`${absPathNoExt}.mp4`);
        this.mov = new File(`${absPathNoExt}.mov`);
        this.onsets = new File(`${absPathNoExt}_onsets.json`);

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
