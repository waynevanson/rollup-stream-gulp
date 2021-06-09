/**
 * @description
 * We're using `gulp` in here so we know it not only works in real life,
 * but perhaps we can use this to generate some examples.
 *
 * `ava` has some cool features with snapshots, like including markdown alongside the snapshot.
 */
import test, { Macro } from "ava";
import gulp from "gulp";
import path from "path";
import rollup, { RollupOptionsGulp } from "../src";
import { promise, trimVinyl } from "../utilities";
import { createHash } from "crypto";
import del from "del";

interface MacroProps {
  fixture: string;
  options?: RollupOptionsGulp;
  src: string;
  dest: string;
}

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
const macro: Macro<[MacroProps]> = async (assert, props) => {
  // cwd that points to the fixture
  const cwd = path.resolve(__dirname, "./fixtures", props.fixture);

  // generate an alphabetical has from title
  const namespace = createHash("sha256")
    .update(assert.title + props.fixture)
    .digest("hex")
    .replace(/[0-9]/g, "");

  // "__generated" to ignore
  const dest = path.join("__generated", namespace, props.dest);

  // clean up destination
  await del(dest);

  // todo - copy fixture to namespace
  // await promise(gulp.src(props.src, { cwd }));

  // run rollup
  await promise(
    gulp
      .src(props.src, { cwd })
      .pipe(rollup(props.options))
      .pipe(gulp.dest(dest, { cwd }))
  );

  // representing all directories and files in the destination
  const dests = path.join(dest, "./**");
  const result = await promise(gulp.src(dests, { cwd }).pipe(trimVinyl));

  assert.snapshot(result);
};

test("works with no input options", macro, {
  fixture: "simple",
  src: "index.js",
  dest: "dist",
});
