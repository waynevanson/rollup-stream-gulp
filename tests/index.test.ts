/**
 * @description
 * We're using `gulp` in here so we know it not only works in real life,
 * but perhaps we can use this to generate some examples.
 *
 * `ava` has some cool features with snapshots, like including markdown alongside the snapshot.
 */
import test from "ava";
import gulp from "gulp";
import path from "path";
import rollup, { RollupOptionsGulp } from "../src";
import { promise, removeStats } from "../utilities";

/**
 * @summary
 * This will test a fixture, run rollup and then return what is inside.
 *
 * Can't just change cwd because we're in a worker thread.
 *
 * @todo
 * - Clean up dist after snapshot taken, so we don't polute the workspace
 * - Many tests could use the same suite in parallel, provide some namespaces for each test run (using test name)
 */
async function dry(
  fixture: string,
  src: string,
  dest: string,
  options?: RollupOptionsGulp
) {
  const _src = path.resolve(__dirname, "./fixtures/", fixture, src);
  const _dest = path.resolve(__dirname, "./fixtures/", fixture, dest);
  const dests = path.join(_dest, "./**");

  // run rollup
  await promise(gulp.src(_src).pipe(rollup(options)).pipe(gulp.dest(_dest)));

  return await promise(gulp.src(dests).pipe(removeStats));
}

test("works", async (assert) => {
  const fixture = "simple";
  const src = "index.js";
  const dest = path.resolve(__dirname, "./fixtures/", "dist");
  const options: RollupOptionsGulp = {};

  const result = await dry(fixture, src, dest, options);

  assert.snapshot(result);
});
