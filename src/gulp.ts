import * as RP from "rollup";
import { Transform } from "stream";
import { default as File } from "vinyl";
import * as S from "./stream";

// what if two input files are passed through?
// two files could be written to the same location.
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

      const readable = S.rollup({ ...input, input: file.path })(
        ...(Array.isArray(output) ? output : [output])
      );

      readable.on("data", (chunk: RP.OutputChunk | RP.OutputAsset) => {
        switch (chunk.type) {
          case "asset": {
            // make a vinyl asset
            file.basename = chunk.fileName;
            file.contents = Buffer.from(chunk.source);
            callback(null, file);
            break;
          }
          case "chunk": {
            file.contents = Buffer.from(chunk.code);
            file.basename = chunk.fileName;
            callback(null, file);
            break;
          }
        }
      });

      readable.once("end", () => {
        this.push(null);
      });
    },
  });
}
