![pjs](http://danielstjules.com/pjs/pjs-logo.png)

Pipeable JavaScript - another utility like sed/awk/wc... but with JS! Quickly
filter, map and reduce from the command line. Inspired by pipeable ruby.

[![Build Status](https://travis-ci.org/danielstjules/pjs.png)](https://travis-ci.org/danielstjules/pjs)

## Overview

pjs is a cli tool that can accept input on stdin, or read from a list of files.
Its filter, map and reduce options take expressions to be ran, in that order,
and applies them to the supplied input. The expressions themselves can contain
identifiers used by keys in String.prototype, which will automatically be bound
to the given line unless the `--explicit` flag is used. This let's you save a
bit of typing with your one-liners, while still giving you access to all your
JS string functions! Check out some of the examples below to see how they
translate.

``` bash
# Return all lines longer than 5 chars
# => lines.filter(function(line) { return line.length > 5; });
ls -1 | pjs -f 'length > 5'

# Count characters in each line
# => lines.map(function(line) { return line.length; });
ls -1 | pjs -m 'length'

# Uppercase and pad each line
# => lines.map(function(line) { return '  ' + line.toUpperCase()"; });
ls -1 | pjs -m '"  " + toUpperCase()'

# Return lines longer than 5 chars, and remove any digits
# => lines
#      .filter(function(line) { return line.length > 5; })
#      .map(function(line) { return line.replace(/\d/g, ''); });
ls -1 | pjs -f 'length > 5' -m 'replace(/\d/g, "")'
```

When using the `--explicit` flag, the current line and value can be accessed
via the $ variable.

``` bash
ls -1 | pjs -e -f '$.length > 5' -m '$.replace(/\d/g, "")'
```

## Installation

It can be installed via `npm` using:

```
npm install -g pipeable-js
```

## Usage

```
Usage: pjs [options] [files ...]

Functions and expressions are invoked in the following order:
filter, map, reduce

Built-in reduce functions: length, min, max, sum, avg, concat
Custom reduce expressions accept: prev, curr, i, array

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -e, --explicit           bind lines to $
  -j, --json               output as json
  -f, --filter <exp>       filter by a boolean expression
  -m, --map <exp>          map values using the expression
  -r, --reduce <func|exp>  reduce using a function or expression
```

## Examples

### filter

``` bash
# Print all lines greater than 80 chars in length
# awk 'length($0) > 80' file
pjs -f 'length > 80' file
```

### map

``` bash
# Remove all digits
# tr -d 0-9 < file
pjs -m "replace(/\d/g, '')" file

# Get second item of each line in csv
# awk -F "," '{print $2}' file
pjs -m 'split(",")[1]' file
```

### reduce

``` bash
# Count lines in file
# wc -l file
# awk 'END { print NR }' file
pjs -r length file

# Sum all decimal numbers in a file
# awk '{ sum += $1 } END { print sum }' file
# perl -nle '$sum += $_ } END { print $sum' file
pjs -r 'Number(prev) + Number(curr)' file
pjs -r '(+prev) + (+curr)' file
pjs -r sum file

# Concatenate all lines in multiple files
# awk '{printf $0;}' file1 file2
# cat file1 file2 | tr -d '\n'
pjs -r concat file1 file2
```

### mixed

``` bash
# Print the length of the longest line
# awk '{ if (length($0) > max) max = length($0) } END { print max }' file
pjs -m 'length' -r max file
```
