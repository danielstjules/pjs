![pjs](http://danielstjules.com/pjs/pjslogo.png)

Pipeable JavaScript - a utility like sed/awk, but with JS! Inspired by pipeable
ruby.

[![Build Status](https://travis-ci.org/danielstjules/pjs.png)](https://travis-ci.org/danielstjules/pjs)

## Overview

```
# Return all lines longer than 5 chars
ls -1 | pjs -f "length > 5"

# Count characters in each line
ls -1 | pjs -m "length"

# Return lines longer than 5 chars, and remove any digits
ls -1 | pjs -f "length > 5" -m "replace(/\d/g', '')"

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
