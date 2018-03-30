const fs = require('fs');

const fu2 = require('./index');

const SAMPLE = parseInt(process.argv.pop(), 10);

const TEST_MOVIE = './test/assets/movie.mp4';

function log(s) { console.log(s); }
function error(s) { console.error(s); }

if (SAMPLE === 0) {

  fu2.getMetadata(TEST_MOVIE)
  .then(log)
  .catch(error);

  /*
  {
    duration: '00:00:33.83',
    durationSecs: 33,
    fps: 25,
    vCodec: 'h264',
    vBitrate: 828,
    dimensions: [640, 360],
    aCodec: 'aac',
    aBitrate: '127'
  }
  */

} else if (SAMPLE === 1) {

  const folder = 'frames';
  fs.mkdirSync(folder);

  fu2.extractFrames({
    inFile: TEST_MOVIE,
    outPath: folder,
    fps: 0.1,
    scale: 0.25,
    // outImageMask: "frame_%s.jpg"
  })
  .then(log)
  .catch(error);

  /*
  {
    files: [
      'frames/frame_160x90_1.jpg',
      'frames/frame_160x90_2.jpg',
      'frames/frame_160x90_3.jpg',
      'frames/frame_160x90_4.jpg',
      'frames/frame_160x90_5.jpg'
    ],
    frameDimensions: [160, 90]
  }
  */

} else if (SAMPLE === 2) {

  fu2.doMosaicFromVideo({
    video: TEST_MOVIE,
    // outPath: 'frames2',
    mosaic: 'mosaic.png',
    number: 9,
    scale: 0.25,
  })
  .then(log)
  .catch(error);

  /*
  {
    mosaicDimensions: [480, 270],
    frameDimensions: [160, 90],
    strategy: 'least-area+',
    outFile: 'mosaic.png',
    grid: [3, 3],
    n: 9
  }
  */

} else {
  console.log('expected numeric argument: 0-2');
}
