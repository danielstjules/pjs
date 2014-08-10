![pjs](http://danielstjules.com/pjs/pjslogo.png)

Pipeable JavaScript - an alternative to sed/awk scripts, with JS! Inspired by
pipeable ruby.

[![Build Status](https://travis-ci.org/danielstjules/pjs.png)](https://travis-ci.org/danielstjules/pjs)

## Overview

pjs is a cli tool that can accept input on stdin, or read from a list of files.
Its filter, map and reduce options take expressions to be ran, in that order,
and applies them to the supplied input. The expressions themselves can contain
identifiers used by keys in String.prototpe, which will automatically be bound
to the given line unless the `--explicit` flag is used. This let's you save a
bit of typing with your one-liners, while still giving you access to all your
JS string functions! Check out some of the examples below to see how they
translate.

``` bash
# Return all lines longer than 5 chars
# => lines.filter(function(line) { return line.length > 5; });
ls -1 | pjs -f "length > 5"

# Count characters in each line
# => lines.map(function(line) { return line.length; });
ls -1 | pjs -m "length"

# Uppercase and pad each line
# => lines.map(function(line) { return '  ' + line.toUpperCase()"; });
ls -1 | pjs -m "'  ' + toUpperCase()"

# Return lines longer than 5 chars, and remove any digits
# => lines
#      .filter(function(line) { return line.length > 5; })
#      .map(function(line) { return line.replace(/\d/g, ''); });
ls -1 | pjs -f "length > 5" -m "replace(/\d/g, '')"
```

## Examples

``` bash
# Explicitly bind lines to $
ls -1 | pjs -e -f "$.length > 5" -m "$.replace(/\d/g', '')"

# Concatenate strings
ls -1 | pjs -r concat

# Sum all values
cat numbers | pjs -r sum

# Sum all values using an anonymous function
cat numbers | pjs -r "function(i, j) { return i + j; }"
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

Options:

  -h, --help                          output usage information
  -V, --version                       output the version number
  -e, --explicit                      bind lines to $
  -f, --filter <exp>                  filter by a boolean expression
  -m, --map <exp>                     map values using the expression
  -r, --reduce <sum|avg|concat|func>  reduce using a function
```
