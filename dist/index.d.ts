/// <reference types="node" />
import { RollupOptions } from "rollup";
import { Transform } from "stream";
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
export default function (options: RollupOptionsGulp): Transform;
/**
 * Input files will be received from `Vinyl.path`, which is why they're omitted.
 */
export interface RollupOptionsGulp extends Omit<RollupOptions, "input"> {
}
