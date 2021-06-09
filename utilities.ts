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

export const trimVinyl = new Transform({
  objectMode: true,
  transform({ contents, relative }: Vinyl, _, callback) {
    callback(null, { contents, relative });
  },
});
