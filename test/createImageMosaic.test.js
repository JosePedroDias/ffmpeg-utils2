const fu2 = require('../index');
const tmpFolder = require('./auxiliary').tmpFolder;
const fs = require('fs');

jest.setTimeout(10000);

const FILES = [
  './test/assets/frames/1.jpg',
  './test/assets/frames/2.jpg',
  './test/assets/frames/3.jpg',
  './test/assets/frames/4.jpg',
  './test/assets/frames/5.jpg',
  './test/assets/frames/6.jpg',
  './test/assets/frames/7.jpg',
  './test/assets/frames/8.jpg',
  './test/assets/frames/9.jpg',
];

it('test createImageMosaic', async () => {
  expect.assertions(6);
  const folder = tmpFolder();
  const mosaic = folder + '/mosaic.png';

  const result = await fu2.createImageMosaic({
    files: FILES,
    frameDimensions: [160, 90],
    grid: [3, 3],
    outFile: mosaic
  });

  // console.log(result);
  expect(result.mosaicDimensions).toEqual([480, 270]);
  expect(result.frameDimensions).toEqual([160, 90]);
  expect(result.grid).toEqual([3, 3]);
  expect(result.n).toEqual(9);
  expect(result.outFile).toEqual(mosaic);

  expect(fs.existsSync(result.outFile)).toEqual(true);
});
