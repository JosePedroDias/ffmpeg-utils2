const fu2 = require('../index');

it('_generateMosaicCombinations works', async () => {
  expect.assertions(1);
  const combinations = await fu2._generateMosaicCombinations([4,3], 12);
  expect(combinations).toEqual([
    { grid: [ 1, 12 ], dims: [ 4, 36 ] },
    { grid: [ 2, 6 ], dims: [ 8, 18 ] },
    { grid: [ 3, 4 ], dims: [ 12, 12 ] },
    { grid: [ 4, 3 ], dims: [ 16, 9 ] },
    { grid: [ 5, 3 ], dims: [ 20, 9 ] },
    { grid: [ 6, 2 ], dims: [ 24, 6 ] },
    { grid: [ 7, 2 ], dims: [ 28, 6 ] },
    { grid: [ 8, 2 ], dims: [ 32, 6 ] },
    { grid: [ 9, 2 ], dims: [ 36, 6 ] },
    { grid: [ 10, 2 ], dims: [ 40, 6 ] },
    { grid: [ 11, 2 ], dims: [ 44, 6 ] },
    { grid: [ 12, 1 ], dims: [ 48, 3 ] }
  ]);

});

