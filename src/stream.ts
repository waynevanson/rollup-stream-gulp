import * as RP from "rollup";
import { PassThrough, Readable, ReadableOptions } from "stream";
import { default as merge } from "merge-stream";

/**
 * @summary
 * Creates many chunks from one set of input and output options.
 */
export class ReadableRollup extends Readable {
  private chunks: RP.RollupOutput["output"] | null = null;
  private build: RP.RollupBuild | null = null;

  constructor(
    private readonly input: Omit<RP.InputOptions, "output">,
    private readonly output: RP.OutputOptions = {},
    options: ReadableOptions = {}
  ) {
    super({ ...options, objectMode: true });
  }

  _construct(this: this, done: StreamCallback) {
    RP.rollup(this.input)
      .then((build) => {
        this.build = build;
        return build.generate(this.output);
      })
      .then((generated) => {
        this.chunks = generated.output;
        done();
      })
      .catch(done);
  }

  _read(this: this) {
    // if there are no chunks to get, this is an error
    if (!this.chunks) {
      return this.destroy(
        new Error(
          `Chunks returned null. We cannot push chunks into the stream if they do not exist`
        )
      );
    }

    // get the chunks we need, removing them from the chunks.
    this.push(this.chunks.splice(0, 1)[0]);

    // if we have no more chunks left, destroy the stream
    if (this.chunks.length <= 0) this.push(null);
  }

  _destroy(error: Error | null, done: (error: Error | null) => void) {
    this.build?.close();
    done(error);
  }
}

/**
 * @summary
 * A curried function for calling `rollup.generate` into a `Readable` stream,
 * streaming many chunks from one set of input and output options.
 */
export function generate(input: InputOptions) {
  return (output?: OutputOptions): Readable => {
    return new ReadableRollup(input, output);
  };
}

/**
 * @summary
 * Maps a call to `generate` for each output and combines them into a single stream.
 */
export function rollup(input: InputOptions) {
  return (...outputs: Array<OutputOptions>): PassThrough =>
    merge(...outputs.map(generate(input))) as any;
}

export type StreamCallback = (error?: Error | null) => void;

export type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface InputOptions extends Require<RP.InputOptions, "input"> {}
export interface OutputOptions extends RP.OutputOptions {}
