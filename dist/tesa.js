function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size1), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial: partial1  } = err;
            assert(partial1 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial1.byteLength > 0 && partial1[partial1.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial1 = partial1.subarray(0, partial1.byteLength - 1);
            }
            return {
                line: partial1,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
        if (size2 <= 0) {
            size2 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size3);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const encoder = new TextEncoder();
function encode(input) {
    return encoder.encode(input);
}
const decoder = new TextDecoder();
function decode(input) {
    return decoder.decode(input);
}
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str(buf) {
    if (buf == null) {
        return "";
    } else {
        return decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
class TextProtoReader {
    constructor(r){
        this.r = r;
    }
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i = kv.indexOf(charCode(":"));
            if (i < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
            }
            const key = str(kv.subarray(0, i));
            if (key == "") {
                continue;
            }
            i++;
            while(i < kv.byteLength && (kv[i] == charCode(" ") || kv[i] == charCode("\t"))){
                i++;
            }
            const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
            try {
                m.append(key, value);
            } catch  {
            }
        }
    }
    async readLineSlice() {
        let line;
        while(true){
            const r1 = await this.r.readLine();
            if (r1 === null) return null;
            const { line: l , more  } = r1;
            if (!line && !more) {
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for(let i = 0; i < l.length; i++){
            if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
class StringReader extends Deno.Buffer {
    constructor(s){
        super(encode(s).buffer);
    }
}
class MultiReader {
    currentIndex = 0;
    constructor(...readers){
        this.readers = readers;
    }
    async read(p) {
        const r1 = this.readers[this.currentIndex];
        if (!r1) return null;
        const result = await r1.read(p);
        if (result === null) {
            this.currentIndex++;
            return 0;
        }
        return result;
    }
}
class LimitedReader {
    constructor(reader, limit){
        this.reader = reader;
        this.limit = limit;
    }
    async read(p) {
        if (this.limit <= 0) {
            return null;
        }
        if (p.length > this.limit) {
            p = p.subarray(0, this.limit);
        }
        const n = await this.reader.read(p);
        if (n == null) {
            return null;
        }
        this.limit -= n;
        return n;
    }
}
const INVALID_RUNE = [
    "\r",
    "\n",
    '"'
];
const ERR_BARE_QUOTE = 'bare " in non-quoted-field';
const ERR_QUOTE = 'extraneous or missing " in quoted-field';
const ERR_INVALID_DELIM = "Invalid Delimiter";
const ERR_FIELD_COUNT = "wrong number of fields";
class ParseError extends Error {
    constructor(start, line, column, message1){
        super();
        this.startLine = start;
        this.column = column;
        this.line = line;
        if (message1 === ERR_FIELD_COUNT) {
            this.message = `record on line ${line}: ${message1}`;
        } else if (start !== line) {
            this.message = `record on line ${start}; parse error on line ${line}, column ${column}: ${message1}`;
        } else {
            this.message = `parse error on line ${line}, column ${column}: ${message1}`;
        }
    }
}
function chkOptions(opt) {
    if (!opt.separator) {
        opt.separator = ",";
    }
    if (!opt.trimLeadingSpace) {
        opt.trimLeadingSpace = false;
    }
    if (INVALID_RUNE.includes(opt.separator) || typeof opt.comment === "string" && INVALID_RUNE.includes(opt.comment) || opt.separator === opt.comment) {
        throw new Error(ERR_INVALID_DELIM);
    }
}
async function readRecord(startLine, reader1, opt = {
    separator: ",",
    trimLeadingSpace: false
}) {
    const tp = new TextProtoReader(reader1);
    let line1 = await readLine(tp);
    let lineIndex = startLine + 1;
    if (line1 === null) return null;
    if (line1.length === 0) {
        return [];
    }
    if (opt.comment && line1[0] === opt.comment) {
        return [];
    }
    assert(opt.separator != null);
    let fullLine = line1;
    let quoteError = null;
    const quote = '"';
    const quoteLen = quote.length;
    const separatorLen = opt.separator.length;
    let recordBuffer = "";
    const fieldIndexes = [];
    parseField: for(;;){
        if (opt.trimLeadingSpace) {
            line1 = line1.trimLeft();
        }
        if (line1.length === 0 || !line1.startsWith(quote)) {
            const i = line1.indexOf(opt.separator);
            let field = line1;
            if (i >= 0) {
                field = field.substring(0, i);
            }
            if (!opt.lazyQuotes) {
                const j = field.indexOf(quote);
                if (j >= 0) {
                    const col = runeCount(fullLine.slice(0, fullLine.length - line1.slice(j).length));
                    quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_BARE_QUOTE);
                    break parseField;
                }
            }
            recordBuffer += field;
            fieldIndexes.push(recordBuffer.length);
            if (i >= 0) {
                line1 = line1.substring(i + separatorLen);
                continue parseField;
            }
            break parseField;
        } else {
            line1 = line1.substring(quoteLen);
            for(;;){
                const i = line1.indexOf(quote);
                if (i >= 0) {
                    recordBuffer += line1.substring(0, i);
                    line1 = line1.substring(i + quoteLen);
                    if (line1.startsWith(quote)) {
                        recordBuffer += quote;
                        line1 = line1.substring(quoteLen);
                    } else if (line1.startsWith(opt.separator)) {
                        line1 = line1.substring(separatorLen);
                        fieldIndexes.push(recordBuffer.length);
                        continue parseField;
                    } else if (0 === line1.length) {
                        fieldIndexes.push(recordBuffer.length);
                        break parseField;
                    } else if (opt.lazyQuotes) {
                        recordBuffer += quote;
                    } else {
                        const col = runeCount(fullLine.slice(0, fullLine.length - line1.length - quoteLen));
                        quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
                        break parseField;
                    }
                } else if (line1.length > 0 || !await isEOF(tp)) {
                    recordBuffer += line1;
                    const r1 = await readLine(tp);
                    lineIndex++;
                    line1 = r1 ?? "";
                    fullLine = line1;
                    if (r1 === null) {
                        if (!opt.lazyQuotes) {
                            const col = runeCount(fullLine);
                            quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
                            break parseField;
                        }
                        fieldIndexes.push(recordBuffer.length);
                        break parseField;
                    }
                    recordBuffer += "\n";
                } else {
                    if (!opt.lazyQuotes) {
                        const col = runeCount(fullLine);
                        quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_QUOTE);
                        break parseField;
                    }
                    fieldIndexes.push(recordBuffer.length);
                    break parseField;
                }
            }
        }
    }
    if (quoteError) {
        throw quoteError;
    }
    const result = [];
    let preIdx = 0;
    for (const i of fieldIndexes){
        result.push(recordBuffer.slice(preIdx, i));
        preIdx = i;
    }
    return result;
}
async function isEOF(tp) {
    return await tp.r.peek(0) === null;
}
function runeCount(s1) {
    return Array.from(s1).length;
}
async function readLine(tp) {
    let line1;
    const r1 = await tp.readLine();
    if (r1 === null) return null;
    line1 = r1;
    if (await isEOF(tp) && line1.length > 0 && line1[line1.length - 1] === "\r") {
        line1 = line1.substring(0, line1.length - 1);
    }
    if (line1.length >= 2 && line1[line1.length - 2] === "\r" && line1[line1.length - 1] === "\n") {
        line1 = line1.substring(0, line1.length - 2);
        line1 = line1 + "\n";
    }
    return line1;
}
async function readMatrix(reader1, opt = {
    separator: ",",
    trimLeadingSpace: false,
    lazyQuotes: false
}) {
    const result = [];
    let _nbFields;
    let lineResult;
    let first = true;
    let lineIndex = 0;
    chkOptions(opt);
    for(;;){
        const r1 = await readRecord(lineIndex, reader1, opt);
        if (r1 === null) break;
        lineResult = r1;
        lineIndex++;
        if (first) {
            first = false;
            if (opt.fieldsPerRecord !== undefined) {
                if (opt.fieldsPerRecord === 0) {
                    _nbFields = lineResult.length;
                } else {
                    _nbFields = opt.fieldsPerRecord;
                }
            }
        }
        if (lineResult.length > 0) {
            if (_nbFields && _nbFields !== lineResult.length) {
                throw new ParseError(lineIndex, lineIndex, null, ERR_FIELD_COUNT);
            }
            result.push(lineResult);
        }
    }
    return result;
}
async function parse(input, opt = {
    skipFirstRow: false
}) {
    let r1;
    if (input instanceof BufReader) {
        r1 = await readMatrix(input, opt);
    } else {
        r1 = await readMatrix(new BufReader(new StringReader(input)), opt);
    }
    if (opt.skipFirstRow || opt.columns) {
        let headers = [];
        let i = 0;
        if (opt.skipFirstRow) {
            const head = r1.shift();
            assert(head != null);
            headers = head.map((e)=>{
                return {
                    name: e
                };
            });
            i++;
        }
        if (opt.columns) {
            if (typeof opt.columns[0] !== "string") {
                headers = opt.columns;
            } else {
                const h = opt.columns;
                headers = h.map((e)=>{
                    return {
                        name: e
                    };
                });
            }
        }
        return r1.map((e)=>{
            if (e.length !== headers.length) {
                throw `Error number of fields line:${i}`;
            }
            i++;
            const out = {
            };
            for(let j = 0; j < e.length; j++){
                const h = headers[j];
                if (h.parse) {
                    out[h.name] = h.parse(e[j]);
                } else {
                    out[h.name] = e[j];
                }
            }
            if (opt.parse) {
                return opt.parse(out);
            }
            return out;
        });
    }
    if (opt.parse) {
        return r1.map((e)=>{
            assert(opt.parse, "opt.parse must be set");
            return opt.parse(e);
        });
    }
    return r1;
}
async function getOnePolygon1(alias, type) {
    let url;
    let doubles_url;
    let polygon;
    switch(type){
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv";
            break;
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv";
            break;
    }
    switch(type){
        case "country":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv";
            break;
        case "macroregion":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv";
            break;
        case "states":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv";
            break;
        case "middleregions":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv";
            break;
        case "microregions":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv";
            break;
        case "cities":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv";
            break;
    }
    if (type === "microregions" || type === "cities") {
        const doubles_list = await parse(await (await fetch(doubles_url)).text(), {
            skipFirstRow: true,
            separator: ";"
        });
        const doubles = doubles_list.filter((place)=>place.Alias === alias.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        ).map((place)=>[
                place.Opt1,
                place.Opt2,
                place.Opt3,
                place.Opt4,
                place.Opt5
            ]
        );
        if (doubles.length > 0) {
            console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n");
            doubles.flat().map((i)=>console.log(String(i))
            );
            return;
        }
    }
    try {
        const list = await parse(await (await fetch(url)).text(), {
            skipFirstRow: true,
            separator: ";"
        });
        const result = fetch(...list.filter((place)=>place.Alias === alias.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        ).map((place)=>place.Link
        ));
        polygon = await (await result).json();
        console.log('found!');
        return polygon;
    } catch (error) {
        console.log(error.message);
        return;
    }
}
async function getManyPolygons1(request) {
    let { type , aliases  } = request;
    let url;
    let code;
    let doubles_url;
    let base_url;
    let doubles_results = [];
    let place_codes = [];
    let unique_codes = [];
    let polygons;
    switch(type){
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv";
            break;
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv";
            break;
    }
    switch(type){
        case "country":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv";
            break;
        case "macroregion":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv";
            break;
        case "states":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv";
            break;
        case "middleregions":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv";
            break;
        case "microregions":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv";
            break;
        case "cities":
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv";
            break;
    }
    if (type === "microregions" || type === "cities") {
        const doubles_list = await parse(await (await fetch(doubles_url)).text(), {
            skipFirstRow: true,
            separator: ";"
        });
        let doubles = aliases.map((i)=>doubles_list.filter((place)=>place.Alias === i.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            ).map((place)=>[
                    place.Opt1,
                    place.Opt2,
                    place.Opt3,
                    place.Opt4,
                    place.Opt5
                ]
            )
        );
        doubles.map((i)=>i.map((o)=>doubles_results.push(...o)
            )
        );
        if (doubles_results.length > 0) {
            console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n");
            doubles_results.flat().map((i)=>console.log(String(i))
            );
            return;
        }
    }
    if (type === "macroregion" || type === "states") {
        switch(type){
            case "macroregion":
                base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=regiao";
                break;
            case "states":
                base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=UF";
                break;
            case "middleregions":
                base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`;
                break;
            case "microregions":
                base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`;
                break;
            case "cities":
                base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`;
                break;
        }
        const states_json = JSON.parse(await (await fetch(base_url)).text());
        const list = await parse(await (await fetch(url)).text(), {
            skipFirstRow: true,
            separator: ";"
        });
        const result = aliases.map((i)=>list.filter((place)=>place.Alias === i.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            ).map((place)=>place.Code
            )
        ).flat();
        result.map((i)=>place_codes.push(i.toString().substring(0, 2))
        );
        unique_codes = [
            ...new Set(place_codes)
        ];
        polygons = [
            ...result.map((i)=>states_json.features.filter((o)=>o.properties.codarea === i
                )
            ).flat()
        ];
        return polygons;
    }
    try {
        const list = await parse(await (await fetch(url)).text(), {
            skipFirstRow: true,
            separator: ";"
        });
        const result = aliases.map((i)=>list.filter((place)=>place.Alias === i.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            ).map((place)=>place.Code
            )
        ).flat();
        result.map((i)=>place_codes.push(i.toString().substring(0, 2))
        );
        unique_codes = [
            ...new Set(place_codes)
        ];
        const major_polygons = await Promise.all(unique_codes.map(async (i)=>{
            code = eval(i);
            switch(type){
                case "macroregion":
                    base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=regiao";
                    break;
                case "states":
                    base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=UF";
                    break;
                case "middleregions":
                    base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`;
                    break;
                case "microregions":
                    base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`;
                    break;
                case "cities":
                    base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`;
                    break;
            }
            return JSON.parse(await (await fetch(base_url)).text());
        }));
        polygons = [
            ...result.map((i)=>major_polygons.map((o)=>o.features.filter((u)=>u.properties.codarea === i
                    )
                )
            ).flat().flat()
        ];
        console.log('found!');
        return polygons;
    } catch (error) {
        console.log(error.message);
        return;
    }
}
export { getOnePolygon1 as getOnePolygon, getManyPolygons1 as getManyPolygons };
