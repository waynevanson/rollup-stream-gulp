import { io as IO, taskEither as TE } from "fp-ts";
import { InputOptions, OutputOptions, rollup, RollupBuild } from "rollup";

export const close =
  (build: RollupBuild): IO.IO<void> =>
  () =>
    build.close();

export const generate = (options: OutputOptions) => (build: RollupBuild) =>
  TE.tryCatch(
    () => build.generate(options),
    (e) => e as Error
  );

export const build = (input: InputOptions) =>
  TE.tryCatch(
    () => rollup(input),
    (e) => e as Error
  );

// not rollup specific
export const callback =
  <P extends readonly unknown[]>(callback: (...args: P) => void) =>
  (...args: P): IO.IO<void> =>
  () =>
    callback(...args);
