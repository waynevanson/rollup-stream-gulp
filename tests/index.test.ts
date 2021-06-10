/**
 * @description
 * We're using `gulp` in here so we know it not only works in real life,
 * but perhaps we can use this to generate some examples.
 *
 * `ava` has some cool features with snapshots, like including markdown alongside the snapshot.
 */
import test, { Macro } from "ava";
import del from "del";
import gulp from "gulp";
import path from "path";
import rollup, { RollupOptionsGulp } from "../src";
import {
  createSandboxedDirectory,
  streamToPromise,
  trimVinyl,
} from "./utilities";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

interface MacroProps {
  fixture: string;
  options?: RollupOptionsGulp;
  src: string;
  dest: string;
}

/**
 * @summary
 * This will test a fixture, run rollup and then return what is inside.
 */
const macro: Macro<[MacroProps]> = async (
  assert,
  { src, dest, fixture, options }
) => {
  const cwd = await createSandboxedDirectory(fixture);
  // run rollup
  await streamToPromise(
    gulp.src(src, { cwd }).pipe(rollup(options)).pipe(gulp.dest(dest, { cwd }))
  );

  // representing all directories and files in the destination
  const dests = path.join(dest, "./**");
  const result = await streamToPromise(
    gulp.src(dests, { cwd }).pipe(trimVinyl)
  );

  assert.snapshot(result);
  await del(cwd);

  // clean up directory
};

test("works with no input options", macro, {
  fixture: "simple",
  src: "index.js",
  dest: "dist",
});

test.only("manual chunks splits into manual chunks", macro, {
  fixture: "three-to-one",
  src: "index.js",
  dest: "dist",
  options: {
    output: { manualChunks: { reactor: ["react"] } },
    plugins: [resolve(), commonjs()],
  },
});
