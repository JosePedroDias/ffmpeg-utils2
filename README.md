# ffmpeg-utils2

Version 2 is a rewrite of the old code. No longer compatible to avconv-utils. Tested though.

## dependencies needed

This modules uses ffmpeg and graphicsmagick to manipulate video and images.


## Mac OS X

    brew install ffmpeg graphicsmagick

## Windows

    // TODO

## Linux

    sudo apt-get install ffmpeg graphicsmagick


# Use cases

* get video metadata
* extract images from video
* create a image mosaic out of those images

see file sample.js for example calls.

# tests

Tests need to be ran against node>=8 with native async await (for testing convenience, sorry).

The module itself uses promises so does not impose such constraint.
