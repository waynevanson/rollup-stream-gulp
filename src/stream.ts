import {
  InputOptions,
  OutputOptions,
  rollup as _rollup,
  RollupOutput,
} from "rollup";
import { Readable } from "stream";

export interface RollupStreamProps<
  O extends readonly [OutputOptions, ...OutputOptions[]]
> {
  input: InputOptions;
  outputs: O;
}

export interface RollupStreamReturn<
  O extends readonly [OutputOptions, ...OutputOptions[]]
> {
  /**
   * @summary
   * The readable stream for each output bundle,
   * strictly typed for your pleasure
   */
  streams: readonly Readable[] & { length: O["length"] };
  /**
   * @summary
   * When you're done building all the files, call this function.
   *
   * Rollup plugins might contain hooks that require them to end.
   */
  close: () => void;
  /**
   * @summary
   *
   */
  isDone: () => void;
}

export function rollup<O extends readonly [OutputOptions, ...OutputOptions[]]>({
  input,
  outputs,
}: RollupStreamProps<O>): RollupStreamReturn<O> {
  const build = _rollup(input);

  const countofoutputs = outputs.length;
  let countdestroyed = 0;

  const isDone = () => countdestroyed >= countofoutputs;

  const close = () => {
    build.then((value) => {
      value.closed || value.close();
    });
  };

  const streams: readonly Readable[] & { length: O["length"] } = outputs.map(
    (output) => {
      let _chunks: null | RollupOutput["output"] = null;
      return new Readable({
        objectMode: true,
        construct(this, callback) {
          build
            // generate a build for a single output
            .then((build) => build.generate(output))
            //  assign the chunks for use in read
            .then(({ output }) => {
              _chunks = output;
              callback();
            })
            // advise the stream if something went wrong.
            .catch(callback);
        },
        read(this, size) {
          // if null then don't read
          //
          // this should not be null because we made it non-null
          // with the construct method
          if (!_chunks)
            return this.destroy(
              new Error("the code output was null, add some details")
            );

          // get the chunks
          const chunks = _chunks.splice(0, size);

          // push the chunks
          for (const chunk of chunks) {
            this.push(chunk);
          }

          // if we couldn't send enough chunks, we're at the end
          // cleanup this stream
          if (chunks.length !== size) this.destroy();
        },
        destroy(this, error, callback) {
          // if build is not closed or is done,
          // close it
          build.then((build) => {
            (build.closed || isDone) && build.close();
          });
        },
      });
    }
  );

  return { streams, close, isDone };
}
