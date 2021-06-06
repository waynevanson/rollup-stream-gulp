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
import * as RP from "rollup";
import { Readable } from "stream";
import { default as merge } from "merge-stream";
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
}(Readable));
export { ReadableRollup };
/**
 * @summary
 * A curried function for calling `rollup.generate` into a `Readable` stream,
 * streaming many chunks from one set of input and output options.
 */
export function generate(input) {
    return function (output) {
        return new ReadableRollup(input, output);
    };
}
/**
 * @summary
 * Maps a call to `generate` for each output and combines them into a single stream.
 */
export function rollup(input) {
    return function () {
        var outputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            outputs[_i] = arguments[_i];
        }
        return merge.apply(void 0, outputs.map(generate(input)));
    };
}
