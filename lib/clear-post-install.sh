#!/bin/bash

#find dist | grep index.html$ | xargs rm
perl -MFile::Find -e'finddepth(sub{rmdir if -d;unlink if /^index.html$/}, "dist")'
