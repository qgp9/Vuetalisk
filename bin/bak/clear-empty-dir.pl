#!/usr/bin/env perl

use File::Find;
use v5.10;

finddepth(sub {rmdir $_ if -d}, 'dist');
