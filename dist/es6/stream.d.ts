/// <reference types="node" />
import * as RP from "rollup";
import { PassThrough, Readable, ReadableOptions } from "stream";
/**
 * @summary
 * Creates many chunks from one set of input and output options.
 */
export declare class ReadableRollup extends Readable {
    private readonly input;
    private readonly output;
    private chunks;
    private build;
    constructor(input: Omit<RP.InputOptions, "output">, output?: RP.OutputOptions, options?: ReadableOptions);
    _construct(this: this, done: StreamCallback): void;
    _read(this: this): void;
    _destroy(error: Error | null, done: (error: Error | null) => void): void;
}
/**
 * @summary
 * A curried function for calling `rollup.generate` into a `Readable` stream,
 * streaming many chunks from one set of input and output options.
 */
export declare function generate(input: InputOptions): (output?: OutputOptions | undefined) => Readable;
/**
 * @summary
 * Maps a call to `generate` for each output and combines them into a single stream.
 */
export declare function rollup(input: InputOptions): (...outputs: Array<OutputOptions>) => PassThrough;
export declare type StreamCallback = (error?: Error | null) => void;
export declare type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export interface InputOptions extends Require<RP.InputOptions, "input"> {
}
export interface OutputOptions extends RP.OutputOptions {
}
