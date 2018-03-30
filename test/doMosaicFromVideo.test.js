const fu2 = require('../index');
const tmpFolder = require('./aux').tmpFolder;
const fs = require('fs');

jest.setTimeout(10000);

it('test doMosaicFromVideo fps 0.25', async () => {
  expect.assertions(6);
  const folder = tmpFolder();
  const mosaic = folder + '/mosaic.png';

  const result = await fu2.doMosaicFromVideo({
    video: './test/assets/movie.mp4',
    mosaic: mosaic,
    fps: 0.25,
    scale: 0.25,
  });

  // console.log(result);
  expect(result.n).toEqual(10);
  expect(result.grid).toEqual([2, 5]);
  expect(result.mosaicDimensions).toEqual([320, 450]);
  expect(result.frameDimensions).toEqual([160, 90]);
  expect(result.outFile).toEqual(mosaic);

  expect(fs.existsSync(result.outFile)).toEqual(true);
});

it('test doMosaicFromVideo number 9', async () => {
  expect.assertions(6);
  const folder = tmpFolder();
  const mosaic = folder + '/mosaic2.png';

  const result = await fu2.doMosaicFromVideo({
    video: './test/assets/movie.mp4',
    mosaic: mosaic,
    strategy: 'least-area+',
    number: 9,
    scale: 0.25,
  });

  // console.log(result);
  expect(result.n).toEqual(9);
  expect(result.grid).toEqual([3, 3]);
  expect(result.mosaicDimensions).toEqual([480, 270]);
  expect(result.frameDimensions).toEqual([160, 90]);
  expect(result.outFile).toEqual(mosaic);

  expect(fs.existsSync(result.outFile)).toEqual(true);
});