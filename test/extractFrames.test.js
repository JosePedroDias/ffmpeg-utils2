const fu2 = require('../index');
const tmpFolder = require('./auxiliary').tmpFolder;
const fs = require('fs');

jest.setTimeout(10000);

it('extractFrames with fps 0.25', async () => {
  expect.assertions(2);
  const folder = tmpFolder();

  const result = await fu2.extractFrames({
    inFile: './test/assets/movie.mp4',
    fps: 0.25,
    scale: 0.25,
    outPath: folder,
    outImageMask: "f_%s.jpg"
  });
  // console.log(result);
  expect(result.frameDimensions).toEqual([160, 90]);
  expect(result.files.length).toEqual(10);
});

it('extractFrames with number 3', async () => {
  expect.assertions(2 + 3);
  const folder = tmpFolder();

  const result = await fu2.extractFrames({
    inFile: './test/assets/movie.mp4',
    number: 3,
    scale: 0.25,
    outPath: folder,
    outImageMask: "f_%s.jpg"
  });
  // console.log(result);
  expect(result.frameDimensions).toEqual([160, 90]);
  expect(result.files.length).toEqual(3);
  result.files.forEach(f => expect(fs.existsSync(f)).toBe(true));
});
