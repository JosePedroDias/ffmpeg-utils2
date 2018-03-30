# ffmpeg-utils2

Version 2 is a rewrite of the old code with a simpler, promises-based API.
No longer compatible to avconv-utils. Somewhat tested with jest.

## dependencies needed

This modules uses ffmpeg and graphicsmagick to manipulate video and images.


### Mac OS X

    brew install ffmpeg graphicsmagick

### Windows

in a powershell run as administrator do:

    choco install ffmpeg graphicsmagick

### Linux

    sudo apt-get install ffmpeg graphicsmagick


## Use cases

Public API always returns a promise.


### 1) create a mosaic image from video

![example mosaic](examples/mosaic.png)

```js
.doMosaicFromVideo({
  video: string, // path to video file
  mosaic: string, // path where to store generated mosaic
  outPath?: string, // where to store extracted frames (temp dir by default)
  strategy?: 'horizontal' | 'vertical' | 'most-square' | 'least-area' | 'least-area+'
  fps?: number,
  number?: number, // must specify either fps or number of frames
  scale?: number // scale to apply to frames from original video size
})
```

successful promise resolves to:

```js
{
  mosaicDimensions: number[2], // dimensions of whole mosaic, in pixels
  frameDimensions: number[2], // dimensions of a frame, in pixels
  strategy: string, // applied strategy
  outFile: string, // saved mosaic path
  grid: number[2], // distribution of frames between dimensions (from top left -> top right, .... last row)
  n: number // number of frames
}
```

### 2) extract images from video

```js
.extractFrames({
  inFile: string, // video path
  outPath: folder, // where to store extracted frames
  fps?: number,
  number?: number, // must specify either fps or number of frames
  scale: number,
  outImageMask?: string
})
```

successful promise resolves to:

```js
{
  files: Array<string>, // path to each image
  frameDimensions: number[2] // dimension of each frame, in pixels
})
```

### 3) get video metadata

```js
.getMetadata({
  string // path to video file
})
```

successful promise resolves to:

```js
{
  duration: string, // 'HH:MM:SS.MS',
  durationSecs: number, // secs
  fps: number,
  vCodec: string,
  vBitrate: number,
  dimensions: number[2], // in pixels
  aCodec: string,
  aBitrate: number
}
```


see file `sample.js` for example calls.

## tests

Tests need to be ran against node>=8 with native async await (for testing convenience, sorry).

The module itself uses promises so does not impose such constraint.
