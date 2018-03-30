const fu2 = require('../index');

const DEF = 'least-area+';
const SQR = 'most-square';

it('computeGrid 9 auto', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [40, 30], files: { length: 9 } };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual(DEF);
  expect(o.grid).toEqual([3, 3]);
  // console.log(o);
});

it('computeGrid 9 10x1 auto', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [10, 1], files: { length: 9 }, strategy: SQR };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual(SQR);
  expect(o.grid).toEqual([1, 9]);
  // console.log(o);
});

it('computeGrid 9 1x10 auto', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [1, 10], files: { length: 9 }, strategy: SQR };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual(SQR);
  expect(o.grid).toEqual([9, 1]);
  // console.log(o);
});

it('computeGrid 9 1x1 auto', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [1, 1], files: { length: 9 }, strategy: SQR };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual(SQR);
  expect(o.grid).toEqual([3, 3]);
  // console.log(o);
});

it('computeGrid 9 horizontal', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [40, 30], files: { length: 9 }, strategy: 'horizontal' };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual('horizontal');
  expect(o.grid).toEqual([9, 1]);
  // console.log(o);
});

it('computeGrid 9 vertical', async () => {
  expect.assertions(2);
  const o = { frameDimensions: [40, 30], files: { length: 9 }, strategy: 'vertical' };
  fu2._computeGrid(o);
  expect(o.strategy).toEqual('vertical');
  expect(o.grid).toEqual([1, 9]);
  // console.log(o);
});
