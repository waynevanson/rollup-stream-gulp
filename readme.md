# rollup-stream-gulp

A gulp plugin, and hopefully with enough work, love and consensus becomes `@rollup/gulp`

## Installation

```sh
yarn add -D rollup-stream-gulp
```

## Purpose

Currently the recommended way is to use `@rollup/stream`. This works well, but has a few limitations.

- `requires \`vinyl-source-stream\``
- Outputs utf-8 only and not the chunks containing rollup metadata
  - only allows outputing one file per stream instance
  - `options.manualChunks` not supported
- DX is non-optimal

## Usage

Accepts all the `RollupOption`'s excluding `input`, which is gathered from `gulp.src()`.

```ts
// gulpfile.ts
import gulp from "gulp";
import rollup from "rollup-stream-gulp";
// import rollup from "@rollup/gulp";

// generates two files, both in different formats under the `dist` directory.
export const build = async () =>
  gulp
    .src("src/index.ts")
    .pipe(
      rollup({
        output: [
          { file: "index.js", format: "cjs" },
          { file: "index.mjs", format: "esm" },
        ],
      })
    )
    .pipe(gulp.dest("dist"));
```

## Troubleshooting, Validation and Errors

There are a few caveats.

Internally we use `options.input = file.path`, which means we may not get errors about file conflicts.
We'll be looking to address these later on.
