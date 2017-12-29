const ffmpeg = require("ffmpeg"); // see INSTALL.md
const async = require("async");
const extend = require("extend");
const fs = require("fs");
const gm = require("gm"); // sudo apt-get install graphicsmagick
const guid = require("uuid");
const os = require("os");

const getMetadata = function(media, cb) {
  new ffmpeg(media)
    .then(video => {
      const md = video.metadata;
      cb(null, {
        duration: md.duration.raw,
        durationSecs: md.duration.seconds,
        fps: md.video.fps,
        vCodec: md.video.codec,
        vBitrate: md.video.bitrate,
        dimensions: [md.video.resolution.w, md.video.resolution.h],
        aCodec: md.audio.codec,
        aBitrate: md.audio.bitrate
      });
    })
    .catch(err => {
      cb(err);
    });
};

/**
 * Extracts and stores video frames from given video.
 *
 * @function extractFrames
 * @param {Object}     o
 * @param {String}     o.inFile                        video file to use
 * @param {Number[2]}  o.videoDimensions               dimensions assumed for the video (used if scale is passed)
 * @param {String}    [o.guid]                         if ommited a GUID will be auto generated
 * @param {Number}    [o.fps]=1                        sample every n frames per second
 * @param {Number}    [o.startTime]                    start time to sample, in seconds
 * @param {Number}    [o.numFrames]                    number of frames to sample
 * @param {Number}    [o.duration]                     max duration to sample, in seconds
 * @param {Number}    [o.scale]=1                      scales the video frames
 * @param {String}    [o.outPath]='/tmp'               directory where generated content will be put
 * @param {String}    [o.outImageMask]='GUID_%04.png'  generated images mask
 * @param {Function}   cb                              callback
 */
function extractFrames(o, cb) {
  o = extend(
    {
      fps: 1,
      scale: 1,
      outPath: os.tmpdir(),
      outImageMask: "GUID_%05d.jpg"
    },
    o
  );

  new ffmpeg(o.inFile)
    .then(video => {
      if (!o.guid) {
        o.guid = guid.v1();
      }
      o.outImageMask = o.outImageMask.replace("GUID", o.guid);

      const dims = [
        video.metadata.video.resolution.w,
        video.metadata.video.resolution.h
      ];
      const s = o.scale;
      const fDims = [Math.round(dims[0] * s), Math.round(dims[1] * s)];

      video.fnExtractFrameToJPG(
        o.outPath,
        {
          start_time: o.startTime, // Start time to recording
          duration_time: o.duration, // Duration of recording
          frame_rate: o.fps, // Number of the frames to capture in one second
          size: fDims.join("x"), // Dimension each frame
          padding_color: "black", // Padding color
          file_name: o.outImageMask, // File name
          number: o.numFrames
        },
        (err, files) => {
          if (err) {
            return cb(err);
          }
          cb(null, {
            files: files,
            frameDimensions: fDims
          });
        }
      );
    })
    .catch(err => {
      cb(err);
    });
}

// choose mosaic grid automatically

const generateMosaicCombinations = function(dims, n) {
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

const strategies = {
  horizontal: function(res) {
    return res.pop().grid;
  },
  vertical: function(res) {
    return res.shift().grid;
  },
  generic: function(res) {
    // minimizes .v
    const getV = function(i) {
      return i.v;
    };
    const sorter = function(a, b) {
      return getV(a) - getV(b);
    };
    res.sort(sorter);
    return res.shift().grid; // get least value
  }
};

/**
 * Creates image mosaic from the given frames.
 *
 * Uses the given grid to layout frames or generates grid based on strategy.
 *
 * ar_a_b tries to generate a mosaic with closest aspect ratio to a / b.
 *
 * @function createImageMosaic
 * @param {Object}     o
 * @param {String}     o.outFile                 image file to save mosaic in
 * @param {String[]}   o.files                   each image file to mosaic
 * @param {Number[2]}  o.frameDimensions         each extracted frame dimensions
 * @param {Number[2]} [o.grid]                   if ommitted uses strategy option to generate the grid automatically
 * @param {String}    [o.strategy]='horizontal'  one of: 'horizontal', 'vertical', 'ar_a_b'. used if grid option is ommitted to elect the mosaic aspect
 * @param {Boolean}   [o.deleteFiles]=false      if trueish and mosaic is created, deletes frame files
 * @param {Function}   cb                        callback
 */
const createImageMosaic = function(o, cb) {
  if (!o.grid) {
    const res = generateMosaicCombinations(o.frameDimensions, o.files.length);

    if (!o.strategy) {
      o.strategy = "horizontal";
    } else if (o.strategy === "square") {
      o.strategy = "ar_1_1";
    } else if (o.strategy === "leastArea") {
      // handles old strategies too
      o.strategy = "horizontal";
    }

    let stratFn;
    if (o.strategy.indexOf("ar_") === 0) {
      const parts = o.strategy.split("_");
      if (parts.length !== 3) {
        return cb("ar strategy expects ar_<int>_<int>!");
      }
      const targetAR = parseInt(parts[1], 10) / parseInt(parts[2], 10);
      if (isNaN(targetAR)) {
        return cb("ar strategy expects ar_<int>_<int>!");
      }

      res.forEach(function(item) {
        const ar = item.dims[0] / item.dims[1];
        item.v = ar < targetAR ? targetAR - ar : ar - targetAR;
      });

      stratFn = strategies.generic;
    } else {
      stratFn = strategies[o.strategy];
      if (!stratFn) {
        return cb(
          'strategy not found! use one of: "horizontal", "vertical", "ar_a_b"'
        );
      }
    }

    o.grid = stratFn(res);
  }

  // http://stackoverflow.com/questions/17369842/tile-four-images-together-using-node-js-and-graphicsmagick
  let g = gm();
  let x,
    y,
    f,
    i = 0;
  const w = o.frameDimensions[0];
  const h = o.frameDimensions[1];
  for (y = 0; y < o.grid[1]; ++y) {
    for (x = 0; x < o.grid[0]; ++x) {
      f = o.files[i++];
      if (!f) {
        break;
      }
      g = g.in("-page", ["+", x * w, "+", y * h].join("")).in(f);
    }
  }

  g.mosaic().write(o.outFile, function(err) {
    if (err) {
      return cb(err);
    }

    const cb2 = function(err) {
      o.n = o.files.length;
      delete o.files;
      cb(
        err,
        extend(
          {
            mosaicDimensions: [w * o.grid[0], h * o.grid[1]]
          },
          o
        )
      );
    };

    if (o.deleteFiles) {
      async.each(o.files, fs.unlink, cb2);
    } else {
      cb2(null);
    }
  });
};

/**
 * High level function which uses the other ones to perform whole workflow.
 *
 * ar_a_b tries to generate a mosaic with closest aspect ratio to a / b.
 *
 * @function doMosaicMagic
 * @param {Object}     o
 * @param {String}     o.video                   path to video file to analyse
 * @param {String}     o.mosaic                  path where to store the generated mosaic image
 * @param {Number}    [o.fps]=1                  sample every n frames per second
 * @param {Number}    [o.scale]=1                scales the video frames
 * @param {String}    [o.strategy]='horizontal'  one of: 'horizontal', 'vertical', 'ar_a_b'
 * @param {Function}   cb                        callback
 */
const doMosaicMagic = function(o, cb) {
  getMetadata(o.video, function(err, md) {
    if (err) {
      return cb("problem in getMetadata: " + err);
    }

    extractFrames(
      {
        inFile: o.video,
        videoDimensions: md.dimensions,
        fps: o.fps,
        scale: o.scale
      },
      function(err, info) {
        if (err) {
          return cb("problem in extractFrames: " + err);
        }

        createImageMosaic(
          {
            files: info.files,
            frameDimensions: info.frameDimensions,
            strategy: o.strategy,
            outFile: o.mosaic,
            deleteFiles: true
          },
          function(err, info2) {
            if (err) {
              return cb("problem in createImageMosaic: " + err);
            }

            info2.videoDuration = md.durationSecs;
            info2.videoDimensions = md.dimensions;

            cb(null, info2);
          }
        );
      }
    );
  });
};

module.exports = {
  getMetadata: getMetadata,
  extractFrames: extractFrames,
  createImageMosaic: createImageMosaic,
  doMosaicMagic: doMosaicMagic
};
