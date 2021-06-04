/**
 * @todo
 * -
 */
import {
  io as IO,
  ioRef as IOR,
  option as O,
  task as T,
  taskEither as TE,
} from "fp-ts";
import { constVoid, increment, pipe } from "fp-ts/lib/function";
import * as l from "monocle-ts/Lens";
import { InputOptions, OutputOptions, RollupBuild, RollupOutput } from "rollup";
import { Readable } from "stream";
import * as RP from "./Rollup";

export interface State {
  build: O.Option<RollupBuild>;
  output: O.Option<RollupOutput["output"]>;
  /**
   * @summary
   * Index of the current chunk.
   */
  position: number;
  /**
   * @summary
   * Index of the current output array.
   */
  index: number;
}

type Callback = (error?: Error | null) => void;

const construct = (
  ref: IOR.IORef<State>,
  input: InputOptions,
  callback: Callback
) =>
  pipe(
    RP.build(input),
    TE.chainIOK((build) => () => {
      ref.modify(
        pipe(
          l.id<State>(),
          l.prop("build"),
          l.modify(() => O.some(build))
        )
      );
    }),
    TE.matchE(T.fromIOK(RP.callback(callback)), () => T.of(constVoid()))
  );

const destroy = (ref: IOR.IORef<State>) =>
  pipe(
    ref.read,
    IO.map((state) => state.build),
    IO.chain(O.traverse(IO.Applicative)(RP.close))
  );

export default function (
  input: InputOptions,
  outputs: [OutputOptions, ...OutputOptions[]]
): Readable {
  const ref: IOR.IORef<State> = IOR.newIORef({
    build: O.none,
    output: O.none,
    position: 0,
    index: 0,
  })();

  return new Readable({
    objectMode: true,
    construct(callback) {
      construct(ref, input, callback)();
    },

    destroy(this, error) {
      destroy(ref)();
    },

    read(this, size) {
      // if no output exists, generate an output.
      // if a build exists, get it's size.
      // if the size is big enough, send it
    },
  });
}
