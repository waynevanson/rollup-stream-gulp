import { Transform } from "stream";
import Vinyl from "vinyl";

/**
 * @summary
 * Converts a stream, putting it's contents in order and returning a promise
 */
export function promise(stream: NodeJS.ReadableStream) {
  const x: unknown[] = [];
  return new Promise<unknown[]>((res, rej) => {
    stream
      .on("data", (data) => x.push(data))
      .on("end", () => res(x))
      .on("error", rej);
  });
}

/**
 * @summary
 * Removes the `stats` property from a vinyl instance.
 *
 * This is extremely useful when time is not on your side.
 */
export const removeStats = new Transform({
  objectMode: true,
  transform({ stat, ...file }: Vinyl, _, callback) {
    callback(null, file);
  },
});
