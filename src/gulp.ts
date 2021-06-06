import * as RP from "rollup";
import { Transform } from "stream";
import { default as File } from "vinyl";
import * as S from "./stream";

/**
 * @summary
 * Gulp plugin for Rollup 2.
 *
 * `RollupOptions.input` has been omitted as a type because
 * the input type is received from `gulp.src()`.
 */
export function rollup({
  output = [],
  ...input
}: Omit<RP.RollupOptions, "input"> = {}) {
  return new Transform({
    objectMode: true,
    transform(file: File, _, callback) {
      if (file.isDirectory()) {
        return callback(new Error("Cannot bundle a directory!"));
      }

      if (file.path === null) {
        return callback(new Error("Cannot bundle a non-existent file!"));
      }

      const bundles = S.rollup({ ...input, input: file.path })(
        ...(Array.isArray(output) ? output : [output])
      );

      bundles.on("data", (chunk: RP.OutputChunk | RP.OutputAsset) => {
        const _file = file.clone();
        switch (chunk.type) {
          case "asset": {
            _file.basename = chunk.fileName;
            _file.contents = Buffer.from(chunk.source);
            this.push(file);
            break;
          }
          case "chunk": {
            _file.contents = Buffer.from(chunk.code);
            _file.basename = chunk.fileName;
            this.push(file);
            break;
          }
        }
      });

      bundles.once("end", () => {
        callback(null);
      });
    },
  });
}
