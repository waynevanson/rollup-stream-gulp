import crypto from "crypto";
import gulp from "gulp";
import path from "path";
import { Transform } from "stream";
import Vinyl from "vinyl";

const DIR_FIXTURES = path.resolve(__dirname, "fixtures");

/**
 * @summary
 * Copy's the contents of a fixture and put's it in it's on folder: a sandbox.
 *
 * @todo get unique hash by checking a cache for previously used values
 */
export async function createSandboxedDirectory(fixture_name: string) {
  // compute the location of all files within the fixture
  const dirFixture = path.resolve(DIR_FIXTURES, fixture_name);
  const fixtureFiles = path.resolve(dirFixture, "./**");

  // compute a randomly generated destination dir
  const hash = crypto.randomBytes(16).toString("hex");
  const environment = path.join(__dirname, "../__generated", hash);

  // copy files from fixtures to the test folder
  await streamToPromise(gulp.src(fixtureFiles).pipe(gulp.dest(environment)));

  return environment;
}

/**
 * @summary
 * Converts a stream, putting it's contents in order and returning a promise
 */
export function streamToPromise(stream: NodeJS.ReadableStream) {
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
 * Keeps only the propertied `contents` and `relative` from a `Vinyl` instance
 */
export const trimVinyl = new Transform({
  objectMode: true,
  transform({ contents, relative }: Vinyl, _, callback) {
    // convert contents to a human readable format
    const next: Promise<string | null> = Buffer.isBuffer(contents)
      ? Promise.resolve(contents.toString())
      : contents === null
      ? Promise.resolve(null)
      : streamToPromise(contents).then((contents) => contents.join(""));

    next.then((contents) => callback(null, { contents, relative }));
  },
});
