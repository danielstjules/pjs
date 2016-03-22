![pjs](http://danielstjules.com/github/pjs-logo.png)

Pipeable JavaScript - another utility like sed/awk/wc... but with JS! Quickly
filter, map and reduce from the command line. Features a streaming API.
Inspired by pipeable ruby.

[![Build Status](https://api.travis-ci.org/danielstjules/pjs.svg?branch=master)](https://travis-ci.org/danielstjules/pjs)

## Overview

pjs is a cli tool that can accept input on stdin, or read from a list of files.
Its filter, map and reduce options take expressions to be run, in that order,
and applies them to the supplied input. The expressions themselves can contain
identifiers used by keys in String.prototype, which will automatically be bound
to the given line. This lets you save a bit of typing with your one-liners,
while still giving you access to all your JS string functions! Check out some
of the examples below to see how they translate.

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

The current line and value can also be accessed via the `$` variable, and the
tool supports json output.

``` bash
(echo 'foo' && echo 'foobar') | pjs -jm '{name: $, length: length}'
[
{"name":"foo","length":3},
{"name":"foobar","length":6}
]
```

pjs also includes lodash functions, which can be accessed via the `_` object,
and chained using $$.

``` bash
echo 'hello' | pjs -m '_.upperFirst($)'
# Hello

echo 'please-titleize-this-sentence' | \
pjs -m '$$.lowerCase().split(" ").map(_.upperFirst).join(" ")'
# Please titleize this sentence
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

In addition to the line, all functions are passed i, its index
Built-in reduce functions: length, min, max, sum, avg, concat
Custom reduce expressions accept: prev, curr, i, array

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -i, --ignore             ignore empty lines
  -j, --json               output as json
  -f, --filter <exp>       filter by a boolean expression
  -m, --map <exp>          map values using the expression
  -r, --reduce <func|exp>  reduce using a function or expression
```

## Examples

### filter

``` bash
# Print all odd lines
# awk 'NR % 2 == 1' file
pjs -f 'i % 2 == 0' file

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

## Comparison

| Features              | pjs        | pythonpy               | pru        |
|-----------------------|------------|------------------------|------------|
| Language              | JavaScript | Python                 | Ruby       |
| Streaming             | Yes        | Limited <sup>[1]</sup> | Yes        |
| Implementation        | Streams    | Iterables              | Generators |
| Easy JSON output      | Yes        | No                     | No         |
| Webscale<sup>TM</sup> | YES        | No                     | No         |

<sub>[1] Can't perform "tail -f logfile | py -x x"</sub>
