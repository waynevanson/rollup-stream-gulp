/// <reference types="node" />
import * as RP from "rollup";
import { Transform } from "stream";
/**
 * @summary
 * Gulp plugin for Rollup 2.
 *
 * `RollupOptions.input` has been omitted as a type because
 * the input type is received from `gulp.src()`.
 */
export declare function rollup({ output, ...input }?: Omit<RP.RollupOptions, "input">): Transform;
