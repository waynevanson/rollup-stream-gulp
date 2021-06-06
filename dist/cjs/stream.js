"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.rollup = exports.generate = exports.ReadableRollup = void 0;
var RP = __importStar(require("rollup"));
var stream_1 = require("stream");
var merge_stream_1 = __importDefault(require("merge-stream"));
/**
 * @summary
 * Creates many chunks from one set of input and output options.
 */
var ReadableRollup = /** @class */ (function (_super) {
    __extends(ReadableRollup, _super);
    function ReadableRollup(input, output, options) {
        if (output === void 0) { output = {}; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, __assign(__assign({}, options), { objectMode: true })) || this;
        _this.input = input;
        _this.output = output;
        _this.chunks = null;
        _this.build = null;
        return _this;
    }
    ReadableRollup.prototype._construct = function (done) {
        var _this = this;
        RP.rollup(this.input)
            .then(function (build) {
            _this.build = build;
            return build.generate(_this.output);
        })
            .then(function (generated) {
            _this.chunks = generated.output;
            done();
        })["catch"](done);
    };
    ReadableRollup.prototype._read = function () {
        // if there are no chunks to get, this is an error
        if (!this.chunks) {
            return this.destroy(new Error("Chunks returned null. We cannot push chunks into the stream if they do not exist"));
        }
        // get the chunks we need, removing them from the chunks.
        this.push(this.chunks.splice(0, 1)[0]);
        // if we have no more chunks left, destroy the stream
        if (this.chunks.length <= 0)
            this.push(null);
    };
    ReadableRollup.prototype._destroy = function (error, done) {
        var _a;
        (_a = this.build) === null || _a === void 0 ? void 0 : _a.close();
        done(error);
    };
    return ReadableRollup;
}(stream_1.Readable));
exports.ReadableRollup = ReadableRollup;
/**
 * @summary
 * A curried function for calling `rollup.generate` into a `Readable` stream,
 * streaming many chunks from one set of input and output options.
 */
function generate(input) {
    return function (output) {
        return new ReadableRollup(input, output);
    };
}
exports.generate = generate;
/**
 * @summary
 * Maps a call to `generate` for each output and combines them into a single stream.
 */
function rollup(input) {
    return function () {
        var outputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            outputs[_i] = arguments[_i];
        }
        return merge_stream_1["default"].apply(void 0, outputs.map(generate(input)));
    };
}
exports.rollup = rollup;
