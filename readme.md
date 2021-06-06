# rollup-stream-gulp

An implementation of both rollup 2 in a stream and a gulp plugin.

## Installation

```sh
yarn add -D rollup-stream-gulp
```

## Usage

There are two modules: `stream` and `rollup`

### Stream

Stream is simple. Each chunk emitted is of type `OutputChunk` or `OutputAsset`.
Streams in object mode (like this one) only emit one chunk at a time.

There are a few methods, but you'll find yourself using `/stream#rollup` most often.

```ts

```

### Gulp

Gulp is simple too. Use the gulp `src` and `dest` api's and rollup will bundle like it should, according to the configuration.

Need to add new files next!
