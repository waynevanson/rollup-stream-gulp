'use strict';

var rollup = require('rollup');
var stream = require('stream');
var Vinyl = require('vinyl');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Vinyl__default = /*#__PURE__*/_interopDefaultLegacy(Vinyl);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/**
 *
 * @summary
 * Seamless integration between `Rollup` and `Gulp`.
 *
 * @todo
 * - Support Rollup Configurations
 * - Support sourcemaps
 * - Support watch mode
 * - Handle collisions in names
 *   - Warn and explain default behaviour
 */
// Does `rollup` report an error when multiple files with the same name try to commit to the same space?
function index (options) {
    return new stream.Transform({
        objectMode: true,
        transform: function (chunk, _, callback) {
            build
                .call(this, chunk, options)
                .then(function () { return callback(); })["catch"](callback);
        }
    });
}
function build(chunk, options) {
    return __awaiter(this, void 0, void 0, function () {
        var input, build, outputs, _i, outputs_1, output, generated, _a, _b, output_1, contents, file;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // ensure we're piped from a gulp stream
                    if (!Vinyl__default['default'].isVinyl(chunk))
                        throw new Error();
                    // ensure we're dealing with files only
                    // todo - instead of error, traverse all files in directory
                    if (chunk.isDirectory())
                        throw new Error();
                    input = Object.assign({}, options, { input: chunk.path });
                    return [4 /*yield*/, rollup.rollup(input)];
                case 1:
                    build = _c.sent();
                    outputs = Array.isArray(options.output)
                        ? options.output
                        : [options.output || {}];
                    _i = 0, outputs_1 = outputs;
                    _c.label = 2;
                case 2:
                    if (!(_i < outputs_1.length)) return [3 /*break*/, 5];
                    output = outputs_1[_i];
                    return [4 /*yield*/, build.generate(output)];
                case 3:
                    generated = _c.sent();
                    for (_a = 0, _b = generated.output; _a < _b.length; _a++) {
                        output_1 = _b[_a];
                        contents = void 0;
                        if (output_1.type === "asset") {
                            contents = output_1.source;
                        }
                        else {
                            contents = output_1.code;
                            // todo - sourcemap support
                        }
                        file = chunk.clone();
                        // todo - make contents match the previous chunk
                        file.contents = Buffer.from(contents);
                        file.basename = output_1.fileName;
                        this.push(file);
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: 
                // signal end of bundling to rollup
                return [4 /*yield*/, build.close()];
                case 6:
                    // signal end of bundling to rollup
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}

module.exports = index;
