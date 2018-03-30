const ffmpeg = require("ffmpeg"); // https://www.npmjs.com/package/ffmpeg
const async = require("async");
const extend = require("extend");
const fs = require("fs");
const gm = require("gm");
const os = require("os");

const tmpFolder = () => {
  const folder = os.tmpdir() + '/tmp' + ~~(Math.random() * 1000000);
  fs.mkdirSync(folder);
  return folder;
}

const getMetadata = (media) => {
  return new Promise((resolve, reject) => {
    new ffmpeg(media)
    .then(video => {
      const md = video.metadata;
      resolve({
        duration: md.duration.raw,
        durationSecs: md.duration.seconds,
        fps: md.video.fps,
        vCodec: md.video.codec,
        vBitrate: md.video.bitrate,
        dimensions: [md.video.resolution.w, md.video.resolution.h],
        aCodec: md.audio && md.audio.codec,
        aBitrate: md.audio && md.audio.bitrate
      });
    })
    .catch(reject);
  });
};

const extractFrames = (o) => {
  return new Promise((resolve, reject) => {
    o = extend(
      {
        scale: 1,
        outPath: tmpFolder(),
        outImageMask: "frame_%s.jpg"
      },
      o
    );

    new ffmpeg(o.inFile)
    .then(video => {
      const dims = [
        video.metadata.video.resolution.w,
        video.metadata.video.resolution.h
      ];
      const s = o.scale;
      const fDims = [Math.round(dims[0] * s), Math.round(dims[1] * s)];

      const opts = {
        size: fDims.join("x"), // Dimension each frame
        padding_color: "black", // Padding color
        file_name: o.outImageMask, // File name
      };

      if (o.number) {
        opts.number = o.number;
        opts.every_n_percentage = 100 / o.number;
      }
      else { // TODO: FPS SEEMS UNRELIABLE?
        if (!o.fps) { o.fps = 1; }
        // opts.every_n_percentage = 100 / (o.fps / video.metadata.video.fps);
        opts.frame_rate = o.fps;
      }

      video.fnExtractFrameToJPG(
        o.outPath,
        opts,
        (err, files) => {
          if (err) {
            return reject(err);
          }
          resolve({
            files: files,
            frameDimensions: fDims
          });
        }
      );
    })
    .catch(reject);
  });
}

// choose mosaic grid automatically

const _generateMosaicCombinations = (dims, n) => {
  let i = 1;
  const res = [];
  let g;
  do {
    g = [i, Math.ceil(n / i)];
    res.push({
      grid: g,
      dims: [dims[0] * g[0], dims[1] * g[1]]
    });
    ++i;
  } while (i <= n);
  return res;
};

// strategies

function srt(a, b) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

const strategies = {
  horizontal: function(res) {
    return res.pop().grid;
  },
  vertical: function(res) {
    return res.shift().grid;
  },
  "most-square": function(res) {
    const getV = o => Math.abs(o.dims[0] - o.dims[1]);
    res.sort((a, b) => srt(getV(a), getV(b)));
    return res.shift().grid; // get least value
  },
  "least-area": function(res) {
    const getArea = o => o.dims[0] * o.dims[1];
    res.sort((a, b) => srt(getArea(a), getArea(b)));
    return res.shift().grid; // get least value
  },
  "least-area+": function(res) {
    const getArea = o => o.dims[0] * o.dims[1] + Math.abs(o.grid[0] - o.grid[1]);
    res.sort((a, b) => srt(getArea(a), getArea(b)));
    return res.shift().grid; // get least value
  }
};

function _computeGrid(o) {
  const res = _generateMosaicCombinations(o.frameDimensions, o.files.length);

  if (!o.strategy) {
    o.strategy = "least-area+";
  }

  const stratFn = strategies[o.strategy];
  if (!stratFn) {
    throw 'strategy not found! use one of: "horizontal", "vertical", "most-square", "least-area", "least-area+"';
  }

  //console.log(res);
  o.grid = stratFn(res);
  //console.log(o.grid);
}


// http://stackoverflow.com/questions/17369842/tile-four-images-together-using-node-js-and-graphicsmagick
const createImageMosaic = function(o) {
  if (!o.grid) {
    _computeGrid(o);
  }

  return new Promise((resolve, reject) => {
    const w = o.frameDimensions[0];
    const h = o.frameDimensions[1];
    const W = w * o.grid[0];
    const H = h * o.grid[1];

    let g = gm();

    let x, y, f, i = 0;
    for (y = 0; y < o.grid[1]; ++y) {
      for (x = 0; x < o.grid[0]; ++x) {
        f = o.files[i++];
        if (!f) { break; }
        g = g.in("-page", ["+", x * w, "+", y * h].join('')).in(f);
      }
    }

    //g = g.background('black');

    g.mosaic().write(o.outFile, function(err) {
      if (err) {
        return reject(err);
      }

      function cb2(err2) {
        if (err2) {
          return reject(err2);
        }
        o.n = o.files.length;
        delete o.files;

        resolve(extend({
          mosaicDimensions: [W, H]
        }, o));
      };

      if (o.deleteFiles) {
        delete o.deleteFiles;
        async.each(o.files, fs.unlink, cb2);
      } else {
        cb2(null);
      }
    });
  });
};

const doMosaicFromVideo = (o) => {
  return extractFrames({
    inFile: o.video,
    fps: o.fps,
    number: o.number,
    scale: o.scale,
    outPath: o.outPath
  })
  .then(info => {
    return createImageMosaic({
      files: info.files,
      frameDimensions: info.frameDimensions,
      strategy: o.strategy,
      outFile: o.mosaic
    });
  })
};

module.exports = {
  getMetadata: getMetadata, // TESTED
  extractFrames: extractFrames, // TESTED
  createImageMosaic: createImageMosaic, // TESTED
  doMosaicFromVideo: doMosaicFromVideo, // TESTED
  _computeGrid: _computeGrid, // TESTED
  _generateMosaicCombinations: _generateMosaicCombinations // TESTED
};
