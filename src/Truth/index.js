import * as path from "path";
import * as fs from 'fs';
import { bool } from "../util";
import myfs from '../MyFs';
class FileNew {
    constructor(absPathWithExt) {
        if (!bool(path.extname(absPathWithExt))) {
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
    renameByOtherFile(other) {
        console.warn('called renameByOtherFile(), use set absPath instead');
        this.absPath = other.absPath;
    }
    renameByCTime() {
        const stats = fs.lstatSync(this.absPath);
        const datestr = stats.ctime.human();
        const newPath = myfs.push_before_ext(this.absPath, `__CREATED_${datestr}`);
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
class Txt {
    constructor(absPathNoExt) {
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
    }
}
export class TruthNew {
    constructor(nameNoExt, dir) {
        let [name, ext] = myfs.split_ext(nameNoExt);
        if (bool(ext)) {
            console.warn(`Truth ctor, passed name is not extensionless: ${nameNoExt}. Continuing with "${name}"`);
        }
        if (name.endsWithAny('_off', '_on')) {
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
            else if (bool(s)) {
                notes++;
            }
        }
        return notes;
    }
}
export class _File {
    constructor(pathWithExt) {
        if (!util.bool(path.extname(pathWithExt))) {
            throw new Error(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        }
        this.path = pathWithExt;
        this.pathNoExt = fsx.remove_ext(this.path);
        if (path.isAbsolute(this.path)) {
            this.name = new _File(fsx.basename(this.path));
        }
    }
    toString() {
        return this.path;
    }
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
    async exists() {
        return await fsx.path_exists(this.path);
    }
    async remove() {
        return require('fs').unlinkSync(this.path);
    }
    async size() {
        let { size } = await require("fs").lstatSync(this.path);
        return size;
    }
}
export class Truth {
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
        this.pathNoExt = pathNoExt;
        this.name = fsx.basename(this.pathNoExt);
        this.txt = new class {
            constructor(pathNoExt) {
                this.base = new _File(`${pathNoExt}.txt`);
                this.on = new _File(`${pathNoExt}_on.txt`);
                this.off = new _File(`${pathNoExt}_off.txt`);
            }
            getAll() {
                return [this.base, this.on, this.off];
            }
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
            async allExist() {
                return all(await asx.concurrent(this.base.exists(), this.on.exists(), this.off.exists()));
            }
            async anyExist() {
                return any(await asx.concurrent(this.base.exists(), this.on.exists(), this.off.exists()));
            }
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
                return await asx.concurrent(fs.renameSync(this.base.path, other.base.path), fs.renameSync(this.on.path, other.on.path), fs.renameSync(this.off.path, other.off.path));
            }
        }(this.pathNoExt);
        this.midi = new _File(`${this.pathNoExt}.mid`);
        this.mp4 = new _File(`${this.pathNoExt}.mp4`);
        this.mov = new _File(`${this.pathNoExt}.mov`);
        this.onsets = new _File(`${this.pathNoExt}_onsets.json`);
    }
    numOfNotes() {
        return require("fs")
            .readFileSync(this.txt.on.path, { encoding: 'utf8' })
            .split('\n')
            .filter(line => util.bool(line)).length;
    }
}
