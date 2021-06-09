import typescript from "@rollup/plugin-typescript";
import del from "del";
import gulp from "gulp";
import rollup from "./src";

export const clean = async () => del("dist");

export const build = async () =>
  gulp
    .src("./src/**/*.ts")
    .pipe(
      rollup({
        plugins: [
          typescript({
            include: ["src/**/*"],
            declaration: true,
            // must match out  in dirs
            declarationDir: "out",
          }),
        ],
        external: ["rollup", "stream", "vinyl"],
        output: [
          { dir: "out", format: "commonjs", exports: "auto" },
          { file: "index.mjs" },
        ],
      })
    )
    .pipe(gulp.dest("dist"));

export default gulp.series(clean, build);
