import { rollup, RollupOptions } from "rollup";
import { Transform } from "stream";
import Vinyl from "vinyl";

/**
 *
 * @summary
 * Seamless integration between `Rollup` and `Gulp`.
 *
 * @todo
 * - Support Rollup Configurations
 * - Support watch mode
 * - Handle collisions in names
 *   - Warn and explain default behaviour
 */
// Does `rollup` report an error when multiple files with the same name try to commit to the same space?
export default function (options: RollupOptionsGulp = {}) {
  return new Transform({
    objectMode: true,
    transform(this, chunk, _, callback) {
      build
        .call(this, chunk, options)
        .then(() => callback())
        .catch(callback);
    },
  });
}

async function build(
  this: Transform,
  chunk: unknown,
  options: RollupOptionsGulp
) {
  // ensure we're piped from a gulp stream
  if (!Vinyl.isVinyl(chunk)) throw new Error();

  // ensure we're dealing with files only
  // todo - instead of error, traverse all files in directory
  if (chunk.isDirectory()) throw new Error();

  // build
  const input = Object.assign({}, options, { input: chunk.path });
  const build = await rollup(input);

  // generate
  const outputs = Array.isArray(options.output)
    ? options.output
    : [options.output || {}];

  for (const output of outputs) {
    const generated = await build.generate(output);

    for (const output of generated.output) {
      let contents: string | Uint8Array;

      if (output.type === "asset") {
        contents = output.source;
      } else {
        contents = output.code;
        if (output.map) {
          contents += output.map.toUrl();
        }
      }

      const file = chunk.clone({ contents: false });

      // todo - make contents match the previous chunk
      file.contents = Buffer.from(contents);
      file.basename = output.fileName;
      this.push(file);
    }
  }
  // signal end of bundling to rollup
  await build.close();
}

/**
 * Input files will be received from `Vinyl.path`, which is why they're omitted.
 */
export interface RollupOptionsGulp extends Omit<RollupOptions, "input"> {}
