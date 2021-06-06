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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Transform } from "stream";
import * as S from "./stream";
/**
 * @summary
 * Gulp plugin for Rollup 2.
 *
 * `RollupOptions.input` has been omitted as a type because
 * the input type is received from `gulp.src()`.
 */
export function rollup(_a) {
    if (_a === void 0) { _a = {}; }
    var _b = _a.output, output = _b === void 0 ? [] : _b, input = __rest(_a, ["output"]);
    return new Transform({
        objectMode: true,
        transform: function (file, _, callback) {
            var _this = this;
            if (file.isDirectory()) {
                return callback(new Error("Cannot bundle a directory!"));
            }
            if (file.path === null) {
                return callback(new Error("Cannot bundle a non-existent file!"));
            }
            var bundles = S.rollup(__assign(__assign({}, input), { input: file.path })).apply(void 0, (Array.isArray(output) ? output : [output]));
            bundles.on("data", function (chunk) {
                var _file = file.clone();
                switch (chunk.type) {
                    case "asset": {
                        _file.basename = chunk.fileName;
                        _file.contents = Buffer.from(chunk.source);
                        _this.push(file);
                        break;
                    }
                    case "chunk": {
                        _file.contents = Buffer.from(chunk.code);
                        _file.basename = chunk.fileName;
                        _this.push(file);
                        break;
                    }
                }
            });
            bundles.once("end", function () {
                callback(null);
            });
        }
    });
}
