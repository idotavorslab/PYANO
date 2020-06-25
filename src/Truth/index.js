import * as path from "path";
import * as fs from 'fs';
import * as util from "../util";
import * as pathx from "../pathx";
class FileNew {
    constructor(absPathWithExt) {
        if (!util.bool(path.extname(absPathWithExt))) {
            console.error(`FileNew constructor: passed 'absPathWithExt' is extensionless: ${absPathWithExt}. Returning`);
        }
        if (!path.isAbsolute(absPathWithExt)) {
            console.error(`FileNew constructor: passed 'absPathWithExt' NOT absolute: ${absPathWithExt}. Returning`);
        }
        this._absPath = absPathWithExt;
    }
    get absPath() {
        return this._absPath;
    }
    set absPath(absPathWithExt) {
        if (!util.bool(path.extname(absPathWithExt))) {
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
    renameByOtherFile(other) {
        console.warn('called renameByOtherFile(), use set absPath instead');
        this.absPath = other.absPath;
    }
    renameByCTime() {
        const stats = fs.lstatSync(this.absPath);
        const datestr = stats.ctime.human();
        const newPath = pathx.push_before_ext(this.absPath, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        this.absPath = newPath;
    }
    async getBitrateAndHeight() {
        if (!this._absPath.endsWith('mp4') && !this._absPath.endsWith('mov')) {
            console.warn(`FileNew: "${this._absPath}" isn't "mp4" or "mov"`);
            return undefined;
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(execSync(`${ffprobeCmd} "${this._absPath}"`, { encoding: 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] === "video");
        return [bit_rate, height];
    }
    exists() {
        return fs.existsSync(this._absPath);
    }
    remove() {
        fs.unlinkSync(this._absPath);
    }
    size() {
        let { size } = fs.lstatSync(this._absPath);
        return size;
    }
}
class TxtNew {
    constructor(absPathNoExt) {
        if (!path.isAbsolute(absPathNoExt)) {
            console.error(`TxtNew constructor: passed 'absPathNoExt' NOT absolute: ${absPathNoExt}. returning`);
            return;
        }
        if (util.bool(path.extname(absPathNoExt))) {
            console.warn(`FileNew constructor: passed 'absPathNoExt' is NOT extensionless: ${absPathNoExt}. Removing ext`);
            absPathNoExt = pathx.remove_ext(absPathNoExt);
        }
        this.base = new FileNew(`${absPathNoExt}.txt`);
        this.on = new FileNew(`${absPathNoExt}_on.txt`);
        this.off = new FileNew(`${absPathNoExt}_off.txt`);
    }
    getAll() {
        return [this.base, this.on, this.off];
    }
    getExisting() {
        const files = {
            base: this.base.exists() ? this.base : undefined,
            on: this.on.exists() ? this.on : undefined,
            off: this.off.exists() ? this.off : undefined,
        };
        return files;
    }
    getMissing() {
        const files = [];
        if (!this.base.exists()) {
            files.push("base");
        }
        if (!this.on.exists()) {
            files.push("on");
        }
        if (!this.off.exists()) {
            files.push("off");
        }
        return files;
    }
    allExist() {
        return (this.base.exists()
            && this.on.exists()
            && this.off.exists());
    }
    anyExist() {
        return (this.base.exists()
            || this.on.exists()
            || this.off.exists());
    }
    removeAll() {
        if (this.base.exists())
            this.base.remove();
        if (this.on.exists())
            this.on.remove();
        if (this.off.exists())
            this.off.remove();
    }
    renameByOtherTxt(other) {
        this.base.absPath = other.base.absPath;
        this.on.absPath = other.on.absPath;
        this.off.absPath = other.off.absPath;
        fs.renameSync(this.base.absPath, other.base.absPath);
        fs.renameSync(this.on.absPath, other.on.absPath);
        fs.renameSync(this.off.absPath, other.off.absPath);
    }
}
export class TruthNew {
    constructor(nameNoExt, dir) {
        let [name, ext] = pathx.split_ext(nameNoExt);
        if (util.bool(ext)) {
            console.warn(`Truth ctor, passed name is not extensionless: ${nameNoExt}. Continuing with "${name}"`);
        }
        if (name.endsWithAny('_off', '_on')) {
            name = `${name.upTo('_', true)}`;
            console.warn(`Passed path of "_on" or "_off" file and not base. Using name: "${name}"`);
        }
        this.name = name;
        if (!util.bool(dir)) {
            dir = TRUTHS_PATH_ABS;
        }
        const absPathNoExt = path.join(dir, name);
        this.txt = new TxtNew(absPathNoExt);
        this.midi = new FileNew(`${absPathNoExt}.mid`);
        this.mp4 = new FileNew(`${absPathNoExt}.mp4`);
        this.mov = new FileNew(`${absPathNoExt}.mov`);
        this.onsets = new FileNew(`${absPathNoExt}_onsets.json`);
    }
    toJSON(...include) {
        let readonlyTruth = {};
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
        const readonlySubFile = (subfile) => ({
            absPath: this[subfile].absPath
        });
        if (util.bool(include)) {
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
        }
        else {
            readonlyTruth = {
                name: this.name,
                txt: readonlyTxt(),
                mp4: readonlySubFile("mp4"),
                onsets: readonlySubFile("onsets"),
                midi: readonlySubFile("midi")
            };
        }
        return readonlyTruth;
    }
    numOfNotes() {
        if (!this.txt.on.exists()) {
            console.warn(`this.txt.on (${this.txt.on.absPath}) does not exist, returning undefined`);
            return undefined;
        }
        const strings = fs
            .readFileSync(this.txt.on.absPath, { encoding: 'utf8' })
            .split('\n');
        let notes = 0;
        for (let s of strings) {
            if (s.includes('\\')) {
                console.warn(`s includes backslash, ${this.txt.on}`);
            }
            else if (util.bool(s)) {
                notes++;
            }
        }
        return notes;
    }
}
class Txt {
    constructor(absPathNoExt) {
        if (!path.isAbsolute(absPathNoExt)) {
            console.error(`TxtNew constructor: passed 'absPathNoExt' NOT absolute: ${absPathNoExt}. returning`);
            return;
        }
        if (util.bool(path.extname(absPathNoExt))) {
            console.warn(`File constructor: passed 'absPathNoExt' is NOT extensionless: ${absPathNoExt}. Removing ext`);
            absPathNoExt = pathx.remove_ext(absPathNoExt);
        }
        this.base = new File(`${absPathNoExt}.txt`);
        this.on = new File(`${absPathNoExt}_on.txt`);
        this.off = new File(`${absPathNoExt}_off.txt`);
    }
    getAll() {
        return [this.base, this.on, this.off];
    }
    getExisting() {
        const files = {
            base: this.base.exists() ? this.base : undefined,
            on: this.on.exists() ? this.on : undefined,
            off: this.off.exists() ? this.off : undefined,
        };
        return files;
    }
    getMissing() {
        const files = [];
        if (!this.base.exists()) {
            files.push("base");
        }
        if (!this.on.exists()) {
            files.push("on");
        }
        if (!this.off.exists()) {
            files.push("off");
        }
        return files;
    }
    allExist() {
        return (this.base.exists()
            && this.on.exists()
            && this.off.exists());
    }
    anyExist() {
        return (this.base.exists()
            || this.on.exists()
            || this.off.exists());
    }
    removeAll() {
        if (this.base.exists())
            this.base.remove();
        if (this.on.exists())
            this.on.remove();
        if (this.off.exists())
            this.off.remove();
    }
    renameByOtherTxt(other) {
        this.base.path = other.base.path;
        this.on.path = other.on.path;
        this.off.path = other.off.path;
        fs.renameSync(this.base.path, other.base.path);
        fs.renameSync(this.on.path, other.on.path);
        fs.renameSync(this.off.path, other.off.path);
    }
}
export class File {
    constructor(pathWithExt) {
        if (!util.bool(path.extname(pathWithExt))) {
            alert(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        }
        this.path = pathWithExt;
        if (path.isAbsolute(this.path)) {
            this.name = new File(path.basename(this.path));
        }
        else {
            this.name = undefined;
        }
    }
    get pathNoExt() {
        return pathx.remove_ext(this.path);
    }
    renameByOtherFile(other) {
        fs.renameSync(this.path, other.path);
        this.path = other.path;
    }
    renameByCTime() {
        const stats = fs.lstatSync(this.path);
        const datestr = stats.ctime.human();
        const newPath = pathx.push_before_ext(this.path, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        fs.renameSync(this.path, newPath);
    }
    getBitrateAndHeight() {
        if (!this.path.endsWith('mp4') && !this.path.endsWith('mov')) {
            console.warn(`FileNew: "${this.path}" isn't "mp4" or "mov"`);
            return undefined;
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(execSync(`${ffprobeCmd} "${this.path}"`, { encoding: 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] == "video");
        return [bit_rate, height];
    }
    exists() {
        return fs.existsSync(this.path);
    }
    remove() {
        fs.unlinkSync(this.path);
    }
    size() {
        let { size } = fs.lstatSync(this.path);
        return size;
    }
}
export class Truth {
    constructor(pathNoExt) {
        if (!path.isAbsolute(pathNoExt)) {
            alert(`Passed path is not absolute: ${pathNoExt}`);
        }
        if (util.bool(path.extname(pathNoExt))) {
            alert(`Passed path is not extensionless: ${pathNoExt}`);
        }
        if (pathNoExt.endsWith('off') || pathNoExt.endsWith('on')) {
            alert(`Passed path of "_on" or "_off" file and not base: ${pathNoExt}`);
        }
        this.pathNoExt = pathNoExt;
        this.name = path.basename(this.pathNoExt);
        this.txt = new Txt(this.pathNoExt);
        this.midi = new File(`${this.pathNoExt}.mid`);
        this.mp4 = new File(`${this.pathNoExt}.mp4`);
        this.mov = new File(`${this.pathNoExt}.mov`);
        this.onsets = new File(`${this.pathNoExt}_onsets.json`);
    }
    numOfNotes() {
        if (!this.txt.on.exists()) {
            console.warn(`this.txt.on (${this.txt.on.path}) does not exist, returning undefined`);
            return undefined;
        }
        const strings = fs
            .readFileSync(this.txt.on.path, { encoding: 'utf8' })
            .split('\n');
        let notes = 0;
        for (let s of strings) {
            if (s.includes('\\')) {
                console.warn(`s includes backslash, ${this.txt.on}`);
            }
            else if (util.bool(s)) {
                notes++;
            }
        }
        return notes;
    }
}
