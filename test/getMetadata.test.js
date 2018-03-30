const fu2 = require('../index');

it('test video returns the expected metadata', async () => {
  expect.assertions(5);
  const md = await fu2.getMetadata('./test/assets/movie.mp4');
  expect(md.dimensions).toEqual([640, 360]);
  expect(md.durationSecs).toEqual(33);
  expect(md.fps).toEqual(25);
  expect(md.vCodec).toEqual('h264');
  expect(md.aCodec).toEqual('aac');
  //console.log(md);
});

it('unexistant video fails', async () => {
  expect.assertions(1);
  try {
    await fu2.getMetadata('./test/assets/sraisins.mp4');
  } catch (ex) {
    expect(ex).toBeDefined();
  }
});
