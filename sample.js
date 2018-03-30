const fs = require('fs');

const fu2 = require('./index');

const SAMPLE = parseInt(process.argv.pop(), 10);

console.log('SAMPLE #%s', SAMPLE);

const TEST_MOVIE = './test/assets/movie.mp4';

(async () => {

  try {

    if (SAMPLE === 0) {
      const md = await fu2.getMetadata(TEST_MOVIE);
      console.log(md);
    } else if (SAMPLE === 1) {
      const folder = 'frames';
      fs.mkdirSync(folder);
      const result = await fu2.extractFrames({
        inFile: TEST_MOVIE,
        outPath: folder,
        fps: 0.1,
        scale: 0.25,
        // outImageMask: "frame_%s.jpg"
      });
      console.log(result);
    } else if (SAMPLE === 2) {
      const result = await fu2.doMosaicFromVideo({
        video: TEST_MOVIE,
        outPath: 'frames2',
        mosaic: 'mosaic.png',
        number: 9,
        scale: 0.25,
      });
      console.log(result);
    } else if (SAMPLE === -1) {
      const combinations = await fu2._generateMosaicCombinations([4,3], 12);
      console.log(combinations);
    }

  } catch (ex) {
    console.error(ex);
  }

})();
