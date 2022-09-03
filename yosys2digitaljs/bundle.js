(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":5,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":6,"inherits":2}],5:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
const yosys2digitals = require('yosys2digitaljs');
},{"yosys2digitaljs":8}],8:[function(require,module,exports){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io_ui = exports.yosys2digitaljs = void 0;
// import * as child_process from 'child_process';
const assert = require("assert");
// import * as fs from 'fs';
// import * as path from 'path';
const HashMap = require("hashmap");
const bigInt = require("big-integer");
// import {promisify} from 'util';
const _3vl_1 = require("3vl");
const topsort = require('topsort');
const sanitize = require("sanitize-filename");
const unary_gates = new Set([
    '$not', '$neg', '$pos', '$reduce_and', '$reduce_or', '$reduce_xor',
    '$reduce_xnor', '$reduce_bool', '$logic_not'
]);
const binary_gates = new Set([
    '$and', '$or', '$xor', '$xnor',
    '$add', '$sub', '$mul', '$div', '$mod', '$pow',
    '$lt', '$le', '$eq', '$ne', '$ge', '$gt', '$eqx', '$nex',
    '$shl', '$shr', '$sshl', '$sshr', '$shift', '$shiftx',
    '$logic_and', '$logic_or'
]);
const gate_subst = new Map([
    ['$not', 'Not'],
    ['$and', 'And'],
    ['$nand', 'Nand'],
    ['$or', 'Or'],
    ['$nor', 'Nor'],
    ['$xor', 'Xor'],
    ['$xnor', 'Xnor'],
    ['$reduce_and', 'AndReduce'],
    ['$reduce_nand', 'NandReduce'],
    ['$reduce_or', 'OrReduce'],
    ['$reduce_nor', 'NorReduce'],
    ['$reduce_xor', 'XorReduce'],
    ['$reduce_xnor', 'XnorReduce'],
    ['$reduce_bool', 'OrReduce'],
    ['$logic_not', 'NorReduce'],
    ['$repeater', 'Repeater'],
    ['$shl', 'ShiftLeft'],
    ['$shr', 'ShiftRight'],
    ['$lt', 'Lt'],
    ['$le', 'Le'],
    ['$eq', 'Eq'],
    ['$ne', 'Ne'],
    ['$gt', 'Gt'],
    ['$ge', 'Ge'],
    ['$constant', 'Constant'],
    ['$neg', 'Negation'],
    ['$pos', 'UnaryPlus'],
    ['$add', 'Addition'],
    ['$sub', 'Subtraction'],
    ['$mul', 'Multiplication'],
    ['$div', 'Division'],
    ['$mod', 'Modulo'],
    ['$pow', 'Power'],
    ['$mux', 'Mux'],
    ['$pmux', 'Mux1Hot'],
    ['$mem', 'Memory'],
    ['$mem_v2', 'Memory'],
    ['$fsm', 'FSM'],
    ['$clock', 'Clock'],
    ['$button', 'Button'],
    ['$lamp', 'Lamp'],
    ['$numdisplay', 'NumDisplay'],
    ['$numentry', 'NumEntry'],
    ['$input', 'Input'],
    ['$output', 'Output'],
    ['$busgroup', 'BusGroup'],
    ['$busungroup', 'BusUngroup'],
    ['$busslice', 'BusSlice'],
    ['$zeroextend', 'ZeroExtend'],
    ['$signextend', 'SignExtend'],
    ['$reduce_bool', 'OrReduce'],
    ['$eqx', 'Eq'],
    ['$nex', 'Ne'],
    ['$sshl', 'ShiftLeft'],
    ['$sshr', 'ShiftRight'],
    ['$shift', 'ShiftRight'],
    ['$shiftx', 'ShiftRight'],
    ['$logic_and', 'And'],
    ['$logic_or', 'Or'],
    ['$dff', 'Dff'],
    ['$dffe', 'Dff'],
    ['$adff', 'Dff'],
    ['$adffe', 'Dff'],
    ['$sdff', 'Dff'],
    ['$sdffe', 'Dff'],
    ['$sdffce', 'Dff'],
    ['$dlatch', 'Dff'],
    ['$adlatch', 'Dff'],
    ['$sr', 'Dff'],
    ['$dffsr', 'Dff'],
    ['$dffsre', 'Dff'],
    ['$aldff', 'Dff'],
    ['$aldffe', 'Dff']
]);
const gate_negations = new Map([
    ['And', 'Nand'],
    ['Nand', 'And'],
    ['Nor', 'Or'],
    ['Or', 'Nor'],
    ['Xor', 'Xnor'],
    ['Xnor', 'Xor'],
    ['AndReduce', 'NandReduce'],
    ['NandReduce', 'AndReduce'],
    ['NorReduce', 'OrReduce'],
    ['OrReduce', 'NorReduce'],
    ['XorReduce', 'XnorReduce'],
    ['XnorReduce', 'XorReduce']
]);
;
;
// function chunkArray(a, chunk_size){
//     let results = [];
// 	let ca = a.splice();
//     while (ca.length) {
//         results.push(ca.splice(0, chunk_size));
//     }
//     return results;
// }
function module_deps(data) {
    const out = [];
    for (const [name, mod] of Object.entries(data.modules)) {
        out.push([name, 1 / 0]);
        for (const cname in mod.cells) {
            const cell = mod.cells[cname];
            if (cell.type in data.modules)
                out.push([cell.type, name]);
        }
    }
    return out;
}
function order_ports(data) {
    const unmap = { A: 'in', Y: 'out' };
    const binmap = { A: 'in1', B: 'in2', Y: 'out' };
    const out = {
        '$mux': { A: 'in0', B: 'in1', S: 'sel', Y: 'out' },
        '$dff': { CLK: 'clk', D: 'in', Q: 'out' },
        '$dffe': { CLK: 'clk', EN: 'en', D: 'in', Q: 'out' },
        '$adff': { CLK: 'clk', ARST: 'arst', D: 'in', Q: 'out' },
        '$adffe': { CLK: 'clk', EN: 'en', ARST: 'arst', D: 'in', Q: 'out' },
        '$sdff': { CLK: 'clk', SRST: 'srst', D: 'in', Q: 'out' },
        '$sdffe': { CLK: 'clk', EN: 'en', SRST: 'srst', D: 'in', Q: 'out' },
        '$sdffce': { CLK: 'clk', EN: 'en', SRST: 'srst', D: 'in', Q: 'out' },
        '$dlatch': { EN: 'en', D: 'in', Q: 'out' },
        '$adlatch': { EN: 'en', ARST: 'arst', D: 'in', Q: 'out' },
        '$dffsr': { CLK: 'clk', SET: 'set', CLR: 'clr', D: 'in', Q: 'out' },
        '$dffsre': { CLK: 'clk', EN: 'en', SET: 'set', CLR: 'clr', D: 'in', Q: 'out' },
        '$aldff': { CLK: 'clk', ALOAD: 'aload', AD: 'ain', D: 'in', Q: 'out' },
        '$aldffe': { CLK: 'clk', EN: 'en', ALOAD: 'aload', AD: 'ain', D: 'in', Q: 'out' },
        '$sr': { SET: 'set', CLR: 'clr', Q: 'out' },
        '$fsm': { ARST: 'arst', CLK: 'clk', CTRL_IN: 'in', CTRL_OUT: 'out' }
    };
    binary_gates.forEach((nm) => out[nm] = binmap);
    unary_gates.forEach((nm) => out[nm] = unmap);
    for (const [name, mod] of Object.entries(data.modules)) {
        const portmap = {};
        const ins = [], outs = [];
        for (const pname in mod.ports) {
            portmap[pname] = pname;
        }
        out[name] = portmap;
    }
    return out;
}
function decode_json_bigint(param) {
    if (typeof param == 'string')
        return bigInt(param, 2);
    else if (typeof param == 'number')
        return bigInt(param);
    else
        assert(false);
}
function decode_json_number(param) {
    if (typeof param == 'string')
        return Number.parseInt(param, 2);
    else if (typeof param == 'number')
        return param;
    else
        assert(false);
}
function decode_json_bigint_as_array(param) {
    return decode_json_bigint(param).toArray(2).value;
}
function decode_json_constant(param, bits, fill = '0') {
    if (typeof param == 'number')
        return bigInt(param).toArray(2).value.map(String).reverse()
            .concat(Array(bits).fill(fill)).slice(0, bits).reverse().join('');
    else
        return param;
}
function parse_source_positions(str) {
    const ret = [];
    for (const entry of str.split('|')) {
        const colonIdx = entry.lastIndexOf(':');
        const name = entry.slice(0, colonIdx);
        const pos = entry.slice(colonIdx + 1);
        const [from, to] = pos.split('-').map(s => s.split('.').map(v => Number(v))).map(([line, column]) => ({ line, column }));
        ret.push({ name, from, to });
    }
    return ret;
}
function yosys_to_digitaljs(data, portmaps, options = {}) {
    const out = {};
    for (const [name, mod] of Object.entries(data.modules)) {
        out[name] = yosys_to_digitaljs_mod(name, mod, portmaps, options);
    }
    return out;
}
function yosys_to_digitaljs_mod(name, mod, portmaps, options = {}) {
    function constbit(bit) {
        return bit == '0' || bit == '1' || bit == 'x';
    }
    const nets = new HashMap();
    const netnames = new HashMap();
    const netsrc = new HashMap();
    const bits = new Map();
    const devnets = new Map();
    let n = 0, pn = 0;
    function gen_name() {
        const nm = `dev${n++}`;
        devnets.set(nm, new Map());
        return nm;
    }
    function gen_bitname() {
        return `bit${pn++}`;
    }
    function get_net(k) {
        // create net if does not exist yet
        if (!nets.has(k)) {
            const nms = netnames.get(k);
            const src = netsrc.get(k);
            nets.set(k, { source: undefined, targets: [], name: nms ? nms[0] : undefined, source_positions: src || [] });
        }
        return nets.get(k);
    }
    function add_net_source(k, d, p, primary = false) {
        if (k.length == 0)
            return; // for unconnected ports
        const net = get_net(k);
        if (net.source !== undefined) {
            // multiple sources driving one net, disallowed in digitaljs
            console.log(k);
            console.log(net);
            throw Error('Multiple sources driving net: ' + net.name);
        }
        net.source = { id: d, port: p };
        if (primary)
            for (const [nbit, bit] of k.entries()) {
                bits.set(bit, { id: d, port: p, num: nbit });
            }
        devnets.get(d).set(p, k);
    }
    function add_net_target(k, d, p) {
        if (k.length == 0)
            return; // for unconnected ports
        const net = get_net(k);
        net.targets.push({ id: d, port: p });
        devnets.get(d).set(p, k);
    }
    const mout = {
        devices: {},
        connectors: []
    };
    function add_device(dev) {
        const dname = gen_name();
        if (options.propagation !== undefined)
            dev.propagation = options.propagation;
        mout.devices[dname] = dev;
        return dname;
    }
    function add_busgroup(nbits, groups) {
        if (get_net(nbits).source !== undefined)
            return; // the bits were already grouped
        const dname = add_device({
            type: 'BusGroup',
            groups: groups.map(g => g.length)
        });
        add_net_source(nbits, dname, 'out');
        for (const [gn, group] of groups.entries()) {
            add_net_target(group, dname, 'in' + gn);
        }
    }
    function connect_device(dname, cell, portmap) {
        for (const [pname, pdir] of Object.entries(cell.port_directions)) {
            const pconn = cell.connections[pname];
            switch (pdir) {
                case 'input':
                    add_net_target(pconn, dname, portmap[pname]);
                    break;
                case 'output':
                    add_net_source(pconn, dname, portmap[pname], true);
                    break;
                default:
                    throw Error('Invalid port direction: ' + pdir);
            }
        }
    }
    function connect_pmux(dname, cell) {
        add_net_target(cell.connections.A, dname, 'in0');
        add_net_target(cell.connections.S.slice().reverse(), dname, 'sel');
        add_net_source(cell.connections.Y, dname, 'out', true);
        for (const i of Array(decode_json_number(cell.parameters.S_WIDTH)).keys()) {
            const p = (decode_json_number(cell.parameters.S_WIDTH) - i - 1) * decode_json_number(cell.parameters.WIDTH);
            add_net_target(cell.connections.B.slice(p, p + decode_json_number(cell.parameters.WIDTH)), dname, 'in' + (i + 1));
        }
    }
    function connect_mem(dname, cell, dev) {
        for (const [k, port] of dev.rdports.entries()) {
            const portname = "rd" + k;
            add_net_target(cell.connections.RD_ADDR.slice(dev.abits * k, dev.abits * (k + 1)), dname, portname + "addr");
            add_net_source(cell.connections.RD_DATA.slice(dev.bits * k, dev.bits * (k + 1)), dname, portname + "data", true);
            if ('clock_polarity' in port)
                add_net_target([cell.connections.RD_CLK[k]], dname, portname + "clk");
            if ('enable_polarity' in port)
                add_net_target([cell.connections.RD_EN[k]], dname, portname + "en");
            if ('arst_polarity' in port)
                add_net_target([cell.connections.RD_ARST[k]], dname, portname + "arst");
            if ('srst_polarity' in port)
                add_net_target([cell.connections.RD_SRST[k]], dname, portname + "srst");
        }
        for (const [k, port] of dev.wrports.entries()) {
            const portname = "wr" + k;
            add_net_target(cell.connections.WR_ADDR.slice(dev.abits * k, dev.abits * (k + 1)), dname, portname + "addr");
            add_net_target(cell.connections.WR_DATA.slice(dev.bits * k, dev.bits * (k + 1)), dname, portname + "data");
            if ('clock_polarity' in port)
                add_net_target([cell.connections.WR_CLK[k]], dname, portname + "clk");
            if ('enable_polarity' in port) {
                if (port.no_bit_enable)
                    add_net_target([cell.connections.WR_EN[dev.bits * k]], dname, portname + "en");
                else
                    add_net_target(cell.connections.WR_EN.slice(dev.bits * k, dev.bits * (k + 1)), dname, portname + "en");
            }
        }
    }
    // Find net names
    for (const [nname, data] of Object.entries(mod.netnames)) {
        if (data.hide_name)
            continue;
        let l = netnames.get(data.bits);
        if (l === undefined) {
            l = [];
            netnames.set(data.bits, l);
        }
        l.push(nname);
        if (typeof data.attributes == 'object' && data.attributes.src) {
            let l = netsrc.get(data.bits);
            if (l === undefined) {
                l = [];
                netsrc.set(data.bits, l);
            }
            const positions = parse_source_positions(data.attributes.src);
            l.push(...positions);
        }
    }
    // Add inputs/outputs
    for (const [pname, port] of Object.entries(mod.ports)) {
        const dir = port.direction == "input" ? "Input" :
            port.direction == "output" ? "Output" :
                undefined;
        const dname = add_device({
            type: dir,
            net: pname,
            order: n,
            bits: port.bits.length
        });
        switch (port.direction) {
            case 'input':
                add_net_source(port.bits, dname, 'out', true);
                break;
            case 'output':
                add_net_target(port.bits, dname, 'in');
                break;
            default: throw Error('Invalid port direction: ' + port.direction);
        }
    }
    // Add gates
    for (const [cname, cell] of Object.entries(mod.cells)) {
        const dev = {
            label: cname,
            type: gate_subst.get(cell.type)
        };
        if (dev.type == undefined) {
            dev.type = 'Subcircuit';
            dev.celltype = cell.type;
        }
        if (typeof cell.attributes == 'object' && cell.attributes.src) {
            dev.source_positions = parse_source_positions(cell.attributes.src);
        }
        const dname = add_device(dev);
        function match_port(con, nsig, sz) {
            const sig = decode_json_number(nsig);
            if (con.length > sz)
                con.splice(sz);
            else if (con.length < sz) {
                const ccon = con.slice();
                const pad = sig ? con.slice(-1)[0] : '0';
                con.splice(con.length, 0, ...Array(sz - con.length).fill(pad));
                if (!con.every(constbit) && get_net(con).source === undefined) {
                    // WARNING: potentially troublesome hack for readability
                    // handled generally in the grouping phase,
                    // but it's hard to add sign extensions there
                    const extname = add_device({
                        type: sig ? 'SignExtend' : 'ZeroExtend',
                        extend: { input: ccon.length, output: con.length }
                    });
                    add_net_target(ccon, extname, 'in');
                    add_net_source(con, extname, 'out');
                }
            }
        }
        function zero_extend_output(con) {
            if (con.length > 1) {
                const ccon = con.slice();
                con.splice(1);
                const extname = add_device({
                    type: 'ZeroExtend',
                    extend: { input: con.length, output: ccon.length }
                });
                add_net_source(ccon, extname, 'out');
                add_net_target(con, extname, 'in');
            }
        }
        if (unary_gates.has(cell.type)) {
            assert(cell.connections.A.length == decode_json_number(cell.parameters.A_WIDTH));
            assert(cell.connections.Y.length == decode_json_number(cell.parameters.Y_WIDTH));
            assert(cell.port_directions.A == 'input');
            assert(cell.port_directions.Y == 'output');
        }
        if (binary_gates.has(cell.type)) {
            assert(cell.connections.A.length == decode_json_number(cell.parameters.A_WIDTH));
            assert(cell.connections.B.length == decode_json_number(cell.parameters.B_WIDTH));
            assert(cell.connections.Y.length == decode_json_number(cell.parameters.Y_WIDTH));
            assert(cell.port_directions.A == 'input');
            assert(cell.port_directions.B == 'input');
            assert(cell.port_directions.Y == 'output');
        }
        if (['$dff', '$dffe', '$adff', '$adffe', '$sdff', '$sdffe', '$sdffce', '$dlatch', '$adlatch', '$dffsr', '$dffsre', '$aldff', '$aldffe'].includes(cell.type)) {
            assert(cell.connections.D.length == decode_json_number(cell.parameters.WIDTH));
            assert(cell.connections.Q.length == decode_json_number(cell.parameters.WIDTH));
            assert(cell.port_directions.D == 'input');
            assert(cell.port_directions.Q == 'output');
            if (cell.type != '$dlatch' && cell.type != '$adlatch') {
                assert(cell.connections.CLK.length == 1);
                assert(cell.port_directions.CLK == 'input');
            }
        }
        if (['$dffe', '$adffe', '$sdffe', '$sdffce', '$dffsre', '$aldffe', '$dlatch', '$adlatch'].includes(cell.type)) {
            assert(cell.connections.EN.length == 1);
            assert(cell.port_directions.EN == 'input');
        }
        if (['$adff', '$adffe', '$adlatch'].includes(cell.type)) {
            assert(cell.connections.ARST.length == 1);
            assert(cell.port_directions.ARST == 'input');
        }
        if (['$sdff', '$sdffe', '$sdffce'].includes(cell.type)) {
            assert(cell.connections.SRST.length == 1);
            assert(cell.port_directions.SRST == 'input');
        }
        if (['$dffsr', '$dffsre'].includes(cell.type)) {
            assert(cell.connections.SET.length == decode_json_number(cell.parameters.WIDTH));
            assert(cell.connections.CLR.length == decode_json_number(cell.parameters.WIDTH));
            assert(cell.port_directions.SET == 'input');
            assert(cell.port_directions.CLR == 'input');
        }
        switch (cell.type) {
            case '$neg':
            case '$pos':
                dev.bits = {
                    in: cell.connections.A.length,
                    out: cell.connections.Y.length
                };
                dev.signed = Boolean(decode_json_number(cell.parameters.A_SIGNED));
                break;
            case '$not':
                match_port(cell.connections.A, cell.parameters.A_SIGNED, cell.connections.Y.length);
                dev.bits = cell.connections.Y.length;
                break;
            case '$add':
            case '$sub':
            case '$mul':
            case '$div':
            case '$mod':
            case '$pow':
                dev.bits = {
                    in1: cell.connections.A.length,
                    in2: cell.connections.B.length,
                    out: cell.connections.Y.length
                };
                dev.signed = {
                    in1: Boolean(decode_json_number(cell.parameters.A_SIGNED)),
                    in2: Boolean(decode_json_number(cell.parameters.B_SIGNED))
                };
                break;
            case '$and':
            case '$or':
            case '$xor':
            case '$xnor':
                match_port(cell.connections.A, cell.parameters.A_SIGNED, cell.connections.Y.length);
                match_port(cell.connections.B, cell.parameters.B_SIGNED, cell.connections.Y.length);
                dev.bits = cell.connections.Y.length;
                break;
            case '$reduce_and':
            case '$reduce_or':
            case '$reduce_xor':
            case '$reduce_xnor':
            case '$reduce_bool':
            case '$logic_not':
                dev.bits = cell.connections.A.length;
                zero_extend_output(cell.connections.Y);
                if (dev.bits == 1) {
                    if (['$reduce_xnor', '$logic_not'].includes(cell.type))
                        dev.type = 'Not';
                    else
                        dev.type = 'Repeater';
                }
                break;
            case '$eq':
            case '$ne':
            case '$lt':
            case '$le':
            case '$gt':
            case '$ge':
            case '$eqx':
            case '$nex':
                dev.bits = {
                    in1: cell.connections.A.length,
                    in2: cell.connections.B.length
                };
                dev.signed = {
                    in1: Boolean(decode_json_number(cell.parameters.A_SIGNED)),
                    in2: Boolean(decode_json_number(cell.parameters.B_SIGNED))
                };
                zero_extend_output(cell.connections.Y);
                break;
            case '$shl':
            case '$shr':
            case '$sshl':
            case '$sshr':
            case '$shift':
            case '$shiftx':
                dev.bits = {
                    in1: cell.connections.A.length,
                    in2: cell.connections.B.length,
                    out: cell.connections.Y.length
                };
                dev.signed = {
                    in1: Boolean(decode_json_number(cell.parameters.A_SIGNED)),
                    in2: Boolean(decode_json_number(cell.parameters.B_SIGNED) && ['$shift', '$shiftx'].includes(cell.type)),
                    out: Boolean(decode_json_number(cell.parameters.A_SIGNED) && ['$sshl', '$sshr'].includes(cell.type))
                };
                dev.fillx = cell.type == '$shiftx';
                break;
            case '$logic_and':
            case '$logic_or': {
                function reduce_input(con) {
                    const ccon = con.slice();
                    con.splice(0, con.length, gen_bitname());
                    const extname = add_device({
                        type: 'OrReduce',
                        bits: ccon.length
                    });
                    add_net_source(con, extname, 'out');
                    add_net_target(ccon, extname, 'in');
                }
                if (cell.connections.A.length > 1)
                    reduce_input(cell.connections.A);
                if (cell.connections.B.length > 1)
                    reduce_input(cell.connections.B);
                zero_extend_output(cell.connections.Y);
                break;
            }
            case '$mux':
                assert(cell.connections.A.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.B.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.Y.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.port_directions.A == 'input');
                assert(cell.port_directions.B == 'input');
                assert(cell.port_directions.Y == 'output');
                dev.bits = {
                    in: decode_json_number(cell.parameters.WIDTH),
                    sel: 1
                };
                break;
            case '$pmux':
                assert(cell.connections.B.length == decode_json_number(cell.parameters.WIDTH) * decode_json_number(cell.parameters.S_WIDTH));
                assert(cell.connections.A.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.S.length == decode_json_number(cell.parameters.S_WIDTH));
                assert(cell.connections.Y.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.port_directions.A == 'input');
                assert(cell.port_directions.B == 'input');
                assert(cell.port_directions.S == 'input');
                assert(cell.port_directions.Y == 'output');
                dev.bits = {
                    in: decode_json_number(cell.parameters.WIDTH),
                    sel: decode_json_number(cell.parameters.S_WIDTH)
                };
                break;
            case '$dff':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY))
                };
                break;
            case '$dffe':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY))
                };
                break;
            case '$aldff':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    aload: Boolean(decode_json_number(cell.parameters.ALOAD_POLARITY))
                };
                break;
            case '$aldffe':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY)),
                    aload: Boolean(decode_json_number(cell.parameters.ALOAD_POLARITY))
                };
                break;
            case '$adff':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    arst: Boolean(decode_json_number(cell.parameters.ARST_POLARITY))
                };
                dev.arst_value = decode_json_constant(cell.parameters.ARST_VALUE, dev.bits);
                break;
            case '$sdff':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    srst: Boolean(decode_json_number(cell.parameters.SRST_POLARITY))
                };
                dev.srst_value = decode_json_constant(cell.parameters.SRST_VALUE, dev.bits);
                break;
            case '$adffe':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    arst: Boolean(decode_json_number(cell.parameters.ARST_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY))
                };
                dev.arst_value = decode_json_constant(cell.parameters.ARST_VALUE, dev.bits);
                break;
            case '$sdffe':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    srst: Boolean(decode_json_number(cell.parameters.SRST_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY))
                };
                dev.srst_value = decode_json_constant(cell.parameters.SRST_VALUE, dev.bits);
                break;
            case '$sdffce':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    srst: Boolean(decode_json_number(cell.parameters.SRST_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY))
                };
                dev.enable_srst = true;
                dev.srst_value = decode_json_constant(cell.parameters.SRST_VALUE, dev.bits);
                break;
            case '$dlatch':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY))
                };
                break;
            case '$adlatch':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY)),
                    arst: Boolean(decode_json_number(cell.parameters.ARST_POLARITY))
                };
                dev.arst_value = decode_json_constant(cell.parameters.ARST_VALUE, dev.bits);
                break;
            case '$dffsr':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    set: Boolean(decode_json_number(cell.parameters.SET_POLARITY)),
                    clr: Boolean(decode_json_number(cell.parameters.CLR_POLARITY))
                };
                break;
            case '$dffsre':
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    enable: Boolean(decode_json_number(cell.parameters.EN_POLARITY)),
                    set: Boolean(decode_json_number(cell.parameters.SET_POLARITY)),
                    clr: Boolean(decode_json_number(cell.parameters.CLR_POLARITY))
                };
                break;
            case '$sr':
                assert(cell.connections.Q.length == decode_json_number(cell.parameters.WIDTH));
                assert(cell.port_directions.Q == 'output');
                dev.no_data = true;
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.polarity = {
                    set: Boolean(decode_json_number(cell.parameters.SET_POLARITY)),
                    clr: Boolean(decode_json_number(cell.parameters.CLR_POLARITY))
                };
                break;
            case '$fsm': {
                assert(cell.connections.ARST.length == 1);
                assert(cell.connections.CLK.length == 1);
                assert(cell.connections.CTRL_IN.length == decode_json_number(cell.parameters.CTRL_IN_WIDTH));
                assert(cell.connections.CTRL_OUT.length == decode_json_number(cell.parameters.CTRL_OUT_WIDTH));
                const TRANS_NUM = decode_json_number(cell.parameters.TRANS_NUM);
                const STATE_NUM_LOG2 = decode_json_number(cell.parameters.STATE_NUM_LOG2);
                const step = 2 * STATE_NUM_LOG2
                    + decode_json_number(cell.parameters.CTRL_IN_WIDTH)
                    + decode_json_number(cell.parameters.CTRL_OUT_WIDTH);
                const tt = typeof (cell.parameters.TRANS_TABLE) == "number"
                    ? _3vl_1.Vector3vl.fromBin(bigInt(cell.parameters.TRANS_TABLE).toString(2), TRANS_NUM * step).toBin() // workaround for yosys silliness
                    : cell.parameters.TRANS_TABLE;
                assert(tt.length == TRANS_NUM * step);
                dev.polarity = {
                    clock: Boolean(decode_json_number(cell.parameters.CLK_POLARITY)),
                    arst: Boolean(decode_json_number(cell.parameters.ARST_POLARITY))
                };
                dev.wirename = cell.parameters.NAME;
                dev.bits = {
                    in: decode_json_number(cell.parameters.CTRL_IN_WIDTH),
                    out: decode_json_number(cell.parameters.CTRL_OUT_WIDTH)
                };
                dev.states = decode_json_number(cell.parameters.STATE_NUM);
                dev.init_state = decode_json_number(cell.parameters.STATE_RST);
                dev.trans_table = [];
                for (let i = 0; i < TRANS_NUM; i++) {
                    let base = i * step;
                    const f = (sz) => {
                        const ret = tt.slice(base, base + sz);
                        base += sz;
                        return ret;
                    };
                    const o = {
                        state_in: parseInt(f(STATE_NUM_LOG2), 2),
                        ctrl_in: f(decode_json_number(cell.parameters.CTRL_IN_WIDTH)).replace(/-/g, 'x'),
                        state_out: parseInt(f(STATE_NUM_LOG2), 2),
                        ctrl_out: f(decode_json_number(cell.parameters.CTRL_OUT_WIDTH))
                    };
                    dev.trans_table.push(o);
                }
                break;
            }
            case '$mem':
            case '$mem_v2': {
                const RD_PORTS = decode_json_number(cell.parameters.RD_PORTS);
                const WR_PORTS = decode_json_number(cell.parameters.WR_PORTS);
                assert(cell.connections.RD_EN.length == RD_PORTS);
                assert(cell.connections.RD_CLK.length == RD_PORTS);
                assert(cell.connections.RD_DATA.length == RD_PORTS * decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.RD_ADDR.length == RD_PORTS * decode_json_number(cell.parameters.ABITS));
                assert(cell.connections.WR_EN.length == WR_PORTS * decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.WR_CLK.length == WR_PORTS);
                assert(cell.connections.WR_DATA.length == WR_PORTS * decode_json_number(cell.parameters.WIDTH));
                assert(cell.connections.WR_ADDR.length == WR_PORTS * decode_json_number(cell.parameters.ABITS));
                if (cell.type == "$mem_v2") {
                    assert(cell.connections.RD_ARST.length == RD_PORTS);
                    assert(cell.connections.RD_SRST.length == RD_PORTS);
                }
                dev.bits = decode_json_number(cell.parameters.WIDTH);
                dev.abits = decode_json_number(cell.parameters.ABITS);
                dev.words = decode_json_number(cell.parameters.SIZE);
                dev.offset = decode_json_number(cell.parameters.OFFSET);
                dev.rdports = [];
                dev.wrports = [];
                const rdpol = decode_json_bigint_as_array(cell.parameters.RD_CLK_POLARITY).reverse();
                const rden = decode_json_bigint_as_array(cell.parameters.RD_CLK_ENABLE).reverse();
                const rdtr = cell.type == "$mem_v2"
                    ? []
                    : decode_json_bigint_as_array(cell.parameters.RD_TRANSPARENT).reverse();
                const wrpol = decode_json_bigint_as_array(cell.parameters.WR_CLK_POLARITY).reverse();
                const wren = decode_json_bigint_as_array(cell.parameters.WR_CLK_ENABLE).reverse();
                const init = typeof (cell.parameters.INIT) == 'number'
                    ? bigInt(cell.parameters.INIT).toArray(2).value.map(String).reverse()
                    : cell.parameters.INIT.split('').reverse();
                const v2_feature = (param) => cell.type == "$mem_v2" ? decode_json_bigint_as_array(param).reverse() : [];
                const v2_feature_const = (param, size) => cell.type == "$mem_v2" ? decode_json_constant(param, size) : "";
                const rdtrmask = v2_feature(cell.parameters.RD_TRANSPARENCY_MASK);
                const rdcolmask = v2_feature(cell.parameters.RD_COLLISION_X_MASK);
                const rdensrst = v2_feature(cell.parameters.RD_CE_OVER_SRST);
                const rdinit = v2_feature_const(cell.parameters.RD_INIT_VALUE, dev.bits * RD_PORTS);
                const rdarst = v2_feature_const(cell.parameters.RD_ARST_VALUE, dev.bits * RD_PORTS);
                const rdsrst = v2_feature_const(cell.parameters.RD_SRST_VALUE, dev.bits * RD_PORTS);
                if (cell.parameters.INIT) {
                    const l = init.slice(-1)[0] == 'x' ? 'x' : '0';
                    const memdata = new _3vl_1.Mem3vl(dev.bits, dev.words);
                    for (const k of Array(dev.words).keys()) {
                        const wrd = init.slice(dev.bits * k, dev.bits * (k + 1));
                        while (wrd.length < dev.bits)
                            wrd.push(l);
                        memdata.set(k, _3vl_1.Vector3vl.fromBin(wrd.reverse().join('')));
                    }
                    dev.memdata = memdata.toJSON();
                }
                for (const k of Array(RD_PORTS).keys()) {
                    const port = {};
                    if (rden[k]) {
                        port.clock_polarity = Boolean(rdpol[k]);
                        if (cell.connections.RD_EN[k] != '1')
                            port.enable_polarity = true;
                    }
                    ;
                    if (rdtr[k])
                        port.transparent = true;
                    if (cell.type == "$mem_v2") {
                        if (rdensrst[k])
                            port.enable_srst = true;
                        function mk_init(s, f) {
                            const v = s.slice(dev.bits * k, dev.bits * (k + 1));
                            if (!v.split('').every(c => c == 'x'))
                                f(v);
                        }
                        ;
                        mk_init(rdinit, v => port.init_value = v);
                        if (cell.connections.RD_ARST[k] != '0') {
                            port.arst_polarity = true;
                            mk_init(rdarst, v => port.arst_value = v);
                        }
                        if (cell.connections.RD_SRST[k] != '0') {
                            port.srst_polarity = true;
                            mk_init(rdsrst, v => port.srst_value = v);
                        }
                        function mk_mask(s, f) {
                            const v = Array(WR_PORTS).fill(0);
                            s.slice(WR_PORTS * k, WR_PORTS * (k + 1)).map((c, i) => { v[i] = c; });
                            if (v.every(c => c))
                                f(true);
                            else if (v.some(c => c))
                                f(v.map(c => Boolean(c)));
                        }
                        mk_mask(rdtrmask, v => port.transparent = v);
                        mk_mask(rdcolmask, v => port.collision = v);
                    }
                    dev.rdports.push(port);
                }
                for (const k of Array(WR_PORTS).keys()) {
                    const port = {};
                    if (wren[k]) {
                        port.clock_polarity = Boolean(wrpol[k]);
                        const wr_en_connections = cell.connections.WR_EN.slice(dev.bits * k, dev.bits * (k + 1));
                        if (wr_en_connections.some(z => z != '1')) {
                            port.enable_polarity = true;
                            if (wr_en_connections.every(z => z == wr_en_connections[0]))
                                port.no_bit_enable = true;
                        }
                    }
                    ;
                    dev.wrports.push(port);
                }
                break;
            }
            default:
        }
        if (dev.type == 'Dff') {
            // find register initial value, if exists
            // Yosys puts initial values in net attributes; there can be many for single actual net!
            const nms = netnames.get(cell.connections.Q);
            if (nms !== undefined) {
                for (const nm of nms) {
                    if (mod.netnames[nm].attributes.init !== undefined)
                        dev.initial = decode_json_constant(mod.netnames[nm].attributes.init, dev.bits);
                }
            }
        }
        const portmap = portmaps[cell.type];
        if (portmap)
            connect_device(dname, cell, portmap);
        else if (cell.type == '$pmux')
            connect_pmux(dname, cell);
        else if (cell.type == '$mem')
            connect_mem(dname, cell, dev);
        else if (cell.type == '$mem_v2')
            connect_mem(dname, cell, dev);
        else
            throw Error('Invalid cell type: ' + cell.type);
    }
    // Group bits into nets for complex sources
    for (const [nbits, net] of nets.entries()) {
        if (net.source !== undefined)
            continue;
        const groups = [[]];
        let pbitinfo = undefined;
        for (const bit of nbits) {
            let bitinfo = bits.get(bit);
            if (bitinfo == undefined && constbit(bit))
                bitinfo = 'const';
            if (groups.slice(-1)[0].length > 0 &&
                (typeof bitinfo != typeof pbitinfo ||
                    typeof bitinfo == 'object' &&
                        typeof pbitinfo == 'object' &&
                        (bitinfo.id != pbitinfo.id ||
                            bitinfo.port != pbitinfo.port ||
                            bitinfo.num != pbitinfo.num + 1))) {
                groups.push([]);
            }
            groups.slice(-1)[0].push(bit);
            pbitinfo = bitinfo;
        }
        if (groups.length == 1)
            continue;
        if (groups.slice(-1)[0].every(x => x == '0')) {
            // infer zero-extend
            const ilen = nbits.length - groups.slice(-1)[0].length;
            const dname = add_device({
                type: 'ZeroExtend',
                extend: { output: nbits.length, input: ilen }
            });
            const zbits = nbits.slice(0, ilen);
            add_net_source(nbits, dname, 'out');
            add_net_target(zbits, dname, 'in');
            if (groups.length > 2)
                add_busgroup(zbits, groups.slice(0, groups.length - 1));
        }
        else
            add_busgroup(nbits, groups);
    }
    // Add constants
    for (const [nbits, net] of nets.entries()) {
        if (net.source !== undefined)
            continue;
        if (!nbits.every(constbit))
            continue;
        const dname = add_device({
            //            label: String(val), // TODO
            type: 'Constant',
            constant: nbits.slice().reverse().join('')
        });
        add_net_source(nbits, dname, 'out');
    }
    // Select bits from complex targets
    for (const [nbits, net] of nets.entries()) {
        if (net.source !== undefined)
            continue;
        // constants should be already handled!
        assert(nbits.every(x => x > 1));
        const bitinfos = nbits.map(x => bits.get(x));
        if (!bitinfos.every(x => typeof x == 'object'))
            continue; // ignore not fully driven ports
        // complex sources should be already handled!
        assert(bitinfos.every(info => info.id == bitinfos[0].id &&
            info.port == bitinfos[0].port));
        const cconn = devnets.get(bitinfos[0].id).get(bitinfos[0].port);
        const dname = add_device({
            type: 'BusSlice',
            slice: {
                first: bitinfos[0].num,
                count: bitinfos.length,
                total: cconn.length
            }
        });
        add_net_source(nbits, dname, 'out');
        add_net_target(cconn, dname, 'in');
    }
    // Generate connections between devices
    for (const [nbits, net] of nets.entries()) {
        if (net.source === undefined) {
            console.warn('Undriven net in ' + name + ': ' + nbits);
            continue;
        }
        let first = true;
        for (const target in net.targets) {
            const conn = {
                to: net.targets[target],
                from: net.source
            };
            if (net.name)
                conn.name = net.name;
            if (net.source_positions)
                conn.source_positions = net.source_positions;
            if (!first && mout.devices[conn.from.id].type == "Constant") {
                // replicate constants for better clarity
                const dname = add_device({
                    type: 'Constant',
                    constant: mout.devices[conn.from.id].constant
                });
                conn.from = { id: dname, port: 'out' };
            }
            mout.connectors.push(conn);
            first = false;
        }
    }
    return mout;
}
// function escape_filename(cmd: string): string {
//     return '"' + cmd.replace(/(["\s'$`\\])/g,'\\$1') + '"';
// }
// const verilator_re = /^%(Warning|Error)[^:]*: ([^:]*):([0-9]+):([0-9]+): (.*)$/;
// export async function verilator_lint(filenames: string[], dirname?: string, options: Options = {}): Promise<LintMessage[]> {
//     try {
//         const output: LintMessage[] = [];
//         const verilator_result: {stdout: string, stderr: string} = await promisify(child_process.exec)(
//             'verilator -lint-only -Wall -Wno-DECLFILENAME -Wno-UNOPT -Wno-UNOPTFLAT ' + filenames.map(escape_filename).join(' '),
//             {maxBuffer: 1000000, cwd: dirname || null, timeout: options.timeout || 60000})
//             .catch(exc => exc);
//         for (const line of verilator_result.stderr.split('\n')) {
//             const result = line.match(verilator_re);
//             if (result == null) continue;
//             output.push({
//                 type: result[1],
//                 file: path.basename(result[2]),
//                 line: Number(result[3]),
//                 column: Number(result[4]),
//                 message: result[5]
//             });
//         }
//         return output;
//     } catch (exc) {
//         return null;
//     }
// }
function yosys2digitaljs(obj, options = {}) {
    const portmaps = order_ports(obj);
    const out = yosys_to_digitaljs(obj, portmaps, options);
    const toporder = topsort(module_deps(obj));
    toporder.pop();
    const toplevel = toporder.pop();
    const output = Object.assign({ subcircuits: {} }, out[toplevel]);
    for (const x of toporder)
        output.subcircuits[x] = out[x];
    return output;
}
window.yosys2digitaljs = yosys2digitaljs;
// export async function process(filenames: string[], dirname?: string, options: Options = {}): Promise<Output> {
//     const optimize_simp = options.optimize ? "; opt" : "; opt_clean";
//     const optimize = options.optimize ? "; opt -full" : "; opt_clean";
//     const fsmexpand = options.fsmexpand ? " -expand" : "";
//     const fsmpass = options.fsm == "nomap" ? "; fsm -nomap" + fsmexpand
//                   : options.fsm ? "; fsm" + fsmexpand
//                   : "";
//     const tmpjson = await tmp.tmpName({ postfix: '.json' });
//     let obj = undefined;
//     const yosys_result: {stdout: string, stderr: string, killed?: boolean, code?: number} = await promisify(child_process.exec)(
//         'yosys -p "hierarchy -auto-top; proc' + optimize_simp + fsmpass + '; memory -nomap; wreduce -memx' + 
//         optimize + '" -o "' + tmpjson + '" ' + filenames.map(escape_filename).join(' '),
//         {maxBuffer: 1000000, cwd: dirname || null, timeout: options.timeout || 60000})
//         .catch(exc => exc);
//     try {
//         if (yosys_result instanceof Error) {
//             if (yosys_result.killed) 
//                 yosys_result.message = "Yosys killed"
//             else if (yosys_result.code)
//                 yosys_result.message = "Yosys failed with code " + yosys_result.code;
//             else
//                 yosys_result.message = "Yosys failed";
//             throw yosys_result;
//         }
//         obj = JSON.parse(fs.readFileSync(tmpjson, 'utf8'));
//         await promisify(fs.unlink)(tmpjson);
//         const output = yosys2digitaljs(obj, options);
//         const ret: Output = {
//             output: output,
//             yosys_output: obj,
//             yosys_stdout: yosys_result.stdout,
//             yosys_stderr: yosys_result.stderr
//         };
//         if (options.lint)
//             ret.lint = await verilator_lint(filenames, dirname, options);
//         return ret;
//     } catch (exc) {
//         if (obj !== undefined) exc.yosys_output = obj;
//         exc.yosys_stdout = yosys_result.stdout;
//         exc.yosys_stderr = yosys_result.stderr;
//         throw exc;
//     }
// }
function io_ui(output) {
    for (const [name, dev] of Object.entries(output.devices)) {
        if (dev.type == 'Input' || dev.type == 'Output') {
            dev.label = dev.net;
        }
        // use clock for clocky named inputs
        if (dev.type == 'Input' && dev.bits == 1 && (dev.label == 'clk' || dev.label == 'clock')) {
            dev.type = 'Clock';
            dev.propagation = 100;
        }
        if (dev.type == 'Input')
            dev.type = dev.bits == 1 ? 'Button' : 'NumEntry';
        if (dev.type == 'Output')
            dev.type = dev.bits == 1 ? 'Lamp' : 'NumDisplay';
    }
}
exports.io_ui = io_ui;

},{"3vl":9,"assert":1,"big-integer":10,"hashmap":11,"sanitize-filename":12,"topsort":13}],9:[function(require,module,exports){
"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _regex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Display3vl = exports.Display3vlOct = exports.Display3vlBin = exports.Display3vlHex = exports.Display3vlWithRegex = exports.Mem3vl = exports.Vector3vl = exports.Error3vl = void 0;
function zip(f, a, b) {
    return a.map((x, i) => f(x, b[i]));
}
function zip4(f, a, b, c, d) {
    return a.map((x, i) => f(x, b[i], c[i], d[i]));
}
function bitfold(f, a, lastmask, neutral) {
    if (a.length == 0)
        return (neutral == 1) ? 1 : 0;
    let acc = a[a.length - 1];
    if (neutral == 1)
        acc |= ~lastmask;
    else
        acc &= lastmask;
    for (let i = 0; i < a.length - 1; i++)
        acc = f(acc, a[i]);
    acc = f(acc, acc >>> 16);
    acc = f(acc, acc >>> 8);
    acc = f(acc, acc >>> 4);
    acc = f(acc, acc >>> 2);
    acc = f(acc, acc >>> 1);
    return acc & 1;
}
function wordnum(n) {
    return n >> 5;
}
function bitnum(n) {
    return n & 0x1f;
}
function fillRest(m, k, words, avec, bvec) {
    const last_x = m > 0 && !(avec[k] & (1 << (m - 1)))
        && (bvec[k] & (1 << (m - 1)));
    if (last_x && bitnum(m))
        bvec[k] |= (-1) << m;
    if (last_x && k + 1 < words) {
        bvec.fill(-1, k + 1);
    }
}
function makeMap(bits, depth) {
    const ret = {};
    function g(what, val) {
        ret[what] = val;
        if (what.length * bits >= depth)
            return;
        for (let i = 0; i < (1 << bits); i += 1)
            g(what + i.toString(1 << bits), (val << bits) | i | (i << 16));
        g(what + 'x', (val << bits) | ((1 << bits) - 1));
    }
    g("", 0);
    Object.seal(ret);
    return ret;
}
const fromBinMap = makeMap(1, 8);
const fromOctMap = makeMap(3, 3);
const fromHexMap = makeMap(4, 8);
function toHexInternal(start, bits, avec, bvec) {
    // copy-paste'y code for performance
    const out = [];
    let bit = 0, k = start;
    while (bit < bits) {
        const a = '00000000' + avec[k].toString(16);
        const x = avec[k] ^ bvec[k];
        k++;
        for (let b = 0; b < 8 && bit < bits; b++, bit += 4) {
            if (x & (0xf << 4 * b))
                out.push('x');
            else
                out.push(a[a.length - 1 - b]);
        }
    }
    return out.reverse().join('');
}
function toBinInternal(start, bits, avec, bvec) {
    // copy-paste'y code for performance
    const out = [];
    let bit = 0, k = start;
    while (bit < bits) {
        const a = '00000000000000000000000000000000'
            + avec[k].toString(2);
        const x = avec[k] ^ bvec[k];
        k++;
        for (let b = 0; b < 32 && bit < bits; b++, bit++) {
            if (x & (1 << b))
                out.push('x');
            else
                out.push(a[a.length - 1 - b]);
        }
    }
    return out.reverse().join('');
}
function fromHexInternal(data, start, nbits, avec, bvec) {
    // copy-paste'y code for performance
    const skip = 4;
    const words = (nbits + 31) >>> 5;
    let m = 0, k = -1 + start;
    for (let i = data.length; i > 0;) {
        const frag = data.slice(Math.max(0, i - 2), i);
        i -= frag.length;
        const v = fromHexMap[frag];
        if (bitnum(m) == 0)
            k++;
        const mask = (1 << skip * frag.length) - 1;
        avec[k] |= ((v >>> 16) & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip * frag.length;
    }
    if (m < nbits)
        fillRest(m, k, words, avec, bvec);
}
function fromBinInternal(data, start, nbits, avec, bvec) {
    // copy-paste'y code for performance
    const skip = 1;
    const words = (nbits + 31) >>> 5;
    let m = 0, k = -1 + start;
    for (let i = data.length; i > 0;) {
        const frag = data.slice(Math.max(0, i - 8), i);
        i -= frag.length;
        const v = fromBinMap[frag];
        if (bitnum(m) == 0)
            k++;
        const mask = (1 << skip * frag.length) - 1;
        avec[k] |= ((v >>> 16) & mask) << m;
        bvec[k] |= (v & mask) << m;
        m += skip * frag.length;
    }
    if (m < nbits)
        fillRest(m, k, words, avec, bvec);
}
/**
 * Exception for three-value vectors.
 */
class Error3vl extends Error {
    constructor(s) {
        super(s);
        Object.setPrototypeOf(this, Error3vl.prototype);
    }
}
exports.Error3vl = Error3vl;
function assert(c, s) {
    if (!c)
        throw new Error3vl("Assertion failed: " + s);
}
/**
 * Three-value logic vectors.
 *
 * This is a data class -- its contents are not mutable. Operations on logic
 * vectors return a freshly allocated vector.
 *
 * The internal representation is two bit vectors: bit vector A and B.
 * The value at position _n_ is encoded by two bits, one at position _n_ in
 * bit vector A, the other at same position in bit vector B. The bit
 * combinations have the following meanings:
 *
 * * A: 0, B: 0 -- logical 0,
 * * A: 0, B: 1 -- undefined value, "x",
 * * A: 1, B: 1 -- logical 1.
 */
class Vector3vl {
    /**
     * Private constructor for three-value logic vectors.
     *
     * **Only for internal use.**
     *
     * @param bits Number of bits in the vector.
     * @param avec Bit vector A.
     * @param bvec Bit vector B.
     */
    constructor(bits, avec, bvec) {
        this._bits = bits;
        this._avec = avec;
        this._bvec = bvec;
    }
    /**
     * Construct a vector with a constant value at each position.
     *
     * @param bits Number of bits in the vector.
     * @param init Initializer. Recognized values:
     * * false, -1, '0' for logical 0,
     * * 0, 'x' for undefined value,
     * * true, 1, '1' for logical 1.
     */
    static make(bits, init) {
        bits = bits | 0;
        let iva, ivb;
        switch (init) {
            case true:
            case '1':
            case 1:
                iva = ivb = ~0;
                break;
            case false:
            case '0':
            case -1:
            case undefined:
                iva = ivb = 0;
                break;
            case 'x':
            case 0:
                iva = 0;
                ivb = ~0;
                break;
            default: assert(false, "Vector3vl.make() called with invalid initializer");
        }
        const words = (bits + 31) / 32 | 0;
        return new Vector3vl(bits, new Uint32Array(words).fill(iva), new Uint32Array(words).fill(ivb));
    }
    /**
     * Construct a vector containing only zeros.
     *
     * @param bits Number of bits in the vector.
     */
    static zeros(bits) {
        return Vector3vl.make(bits, -1);
    }
    /**
     * Construct a vector containing only ones.
     *
     * @param bits Number of bits in the vector.
     */
    static ones(bits) {
        return Vector3vl.make(bits, 1);
    }
    /**
     * Construct a vector containing only undefined values.
     *
     * @param bits Number of bits in the vector.
     */
    static xes(bits) {
        return Vector3vl.make(bits, 0);
    }
    /**
     * Construct a vector containing Boolean value _b_.
     *
     * @param b Boolean value for the vector.
     * @param bits Number of bits in the vector.
     */
    static fromBool(b, bits = 1) {
        return Vector3vl.make(bits, b ? 1 : -1);
    }
    /**
     * Concatenate vectors into a single big vector.
     *
     * @param vs Vectors to concatenate.
     *           Arguments are ordered least significant bit first.
     */
    static concat(...vs) {
        const sumbits = vs.reduce((y, x) => x.bits + y, 0);
        const words = (sumbits + 31) >>> 5;
        let bits = 0, idx = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
        for (const v of vs) {
            v.normalize();
            if (bitnum(bits) == 0) {
                avec.set(v._avec, idx + 1);
                bvec.set(v._bvec, idx + 1);
                bits += v._bits;
                idx += (v._bits + 31) >>> 5;
            }
            else {
                for (const k in v._avec) {
                    avec[idx] |= v._avec[k] << bits;
                    bvec[idx] |= v._bvec[k] << bits;
                    idx++;
                    if (idx == words)
                        break;
                    avec[idx] = v._avec[k] >>> -bits;
                    bvec[idx] = v._bvec[k] >>> -bits;
                }
                bits += v._bits;
                if (idx + 1 > (bits + 31) >>> 5) {
                    idx--;
                }
            }
        }
        return new Vector3vl(bits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function calls [[fromIteratorAnySkip]] or [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIterator(iter, skip, nbits) {
        if ((skip & (skip - 1)) == 0)
            return Vector3vl.fromIteratorPow2(iter, skip, nbits);
        else
            return Vector3vl.fromIteratorAnySkip(iter, skip, nbits);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is more generic, but slower, than [[fromIteratorPow2]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step. 1 to 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorAnySkip(iter, skip, nbits) {
        const words = (nbits + 31) >>> 5;
        let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
        const mask = (1 << skip) - 1;
        for (const v of iter) {
            if (bitnum(m) == 0)
                k++;
            avec[k] |= ((v >>> skip) & mask) << m;
            bvec[k] |= (v & mask) << m;
            if (((mask << m) >>> m) != mask) {
                k++;
                avec[k] = ((v >>> skip) & mask) >>> -m;
                bvec[k] = (v & mask) >>> -m;
            }
            m += skip;
        }
        if (m < nbits)
            fillRest(m, k, words, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an iterable.
     *
     * This function is limited to power of 2 _skip_ values.
     * For generic version, see [[fromIteratorAnySkip]].
     *
     * @param iter Iterable returning initialization values, least to most
     *             significant. First _skip_ bits go to vector B, next
     *             _skip_ bits go to vector A.
     * @param skip Number of bits in a single iterator step.
     *             Limited to powers of 2: 1, 2, 4, 8, 16.
     * @param nbits Number of bits in the vector.
     */
    static fromIteratorPow2(iter, skip, nbits) {
        const words = (nbits + 31) >>> 5;
        let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
        const mask = (1 << skip) - 1;
        for (const v of iter) {
            if (bitnum(m) == 0)
                k++;
            avec[k] |= ((v >>> skip) & mask) << m;
            bvec[k] |= (v & mask) << m;
            m += skip;
        }
        if (m < nbits)
            fillRest(m, k, words, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an array of numbers.
     *
     * The following interpretation is used:
     * * -1 for logical 0,
     * * 0 for undefined value,
     * * 1 for logical 1.
     *
     * @param data Input array.
     */
    static fromArray(data) {
        // copy-paste'y code for performance
        const nbits = data.length;
        const skip = 1;
        const words = (nbits + 31) >>> 5;
        let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
        const mask = (1 << skip) - 1;
        for (const x of data) {
            const v = x + 1 + Number(x > 0);
            if (bitnum(m) == 0)
                k++;
            avec[k] |= ((v >>> skip) & mask) << m;
            bvec[k] |= (v & mask) << m;
            m += skip;
        }
        if (m < nbits)
            fillRest(m, k, words, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a binary string.
     *
     * Three characters are accepted:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The binary string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_.
     */
    static fromBin(data, nbits) {
        if (nbits === undefined)
            nbits = data.length;
        const words = (nbits + 31) >>> 5;
        const avec = new Uint32Array(words), bvec = new Uint32Array(words);
        fromBinInternal(data, 0, nbits, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from an octal number.
     *
     * Characters '0' to '7' and 'x' are accepted. The character 'x'
     * means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The octal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times three.
     */
    static fromOct(data, nbits) {
        // copy-paste'y code for performance
        const skip = 3;
        if (nbits === undefined)
            nbits = data.length * skip;
        const words = (nbits + 31) >>> 5;
        let m = 0, k = -1, avec = new Uint32Array(words), bvec = new Uint32Array(words);
        const mask = (1 << skip) - 1;
        for (let i = data.length - 1; i >= 0; i--) {
            const v = fromOctMap[data[i]];
            if (bitnum(m) == 0)
                k++;
            avec[k] |= ((v >>> 16) & mask) << m;
            bvec[k] |= (v & mask) << m;
            if (((mask << m) >>> m) != mask) {
                k++;
                avec[k] = ((v >>> 16) & mask) >>> -m;
                bvec[k] = (v & mask) >>> -m;
            }
            m += skip;
        }
        if (m < nbits)
            fillRest(m, k, words, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a hexadecimal number.
     *
     * Characters '0' to '9', 'a' to 'f' and 'x' are accepted. The character
     * 'x' means three undefined bits.
     *
     * If _nbits_ is given, _data_ is either truncated, or extended with
     * undefined values.
     *
     * @param data The hexadecimal string to be parsed.
     * @param nbits Number of bits in the vector. If omitted, the resulting
     *              vector has number of bits equal to the length of _data_
     *              times four.
     */
    static fromHex(data, nbits) {
        if (nbits === undefined)
            nbits = data.length * 4;
        const words = (nbits + 31) >>> 5;
        const avec = new Uint32Array(words), bvec = new Uint32Array(words);
        fromHexInternal(data, 0, nbits, avec, bvec);
        return new Vector3vl(nbits, avec, bvec);
    }
    /**
     * Construct a vector from a Verilog-like string.
     */
    static fromString(data) {
        const re = /^([0-9]*)'?(b[01x]*|o[0-7x]*|h[0-9a-fx]*|d[0-9]*)$/;
        const res = re.exec(data);
        assert(res != null, "Vector3vl.fromString() Invalid string");
        const bits = res[1].length ? Number(res[1]) : undefined;
        const num = res[2].slice(1);
        switch (res[2][0]) {
            case 'b': return Vector3vl.fromBin(num, bits);
            case 'o': return Vector3vl.fromOct(num, bits);
            case 'h': return Vector3vl.fromHex(num, bits);
            case 'd': return Vector3vl.fromNumber(BigInt(num), bits);
        }
    }
    /**
     * Construct a vector from a number or a bigint.
     *
     * If _nbits_ bits are not enough to represent the number, it is
     * truncated. If it's larger, the number is sign-extended.
     * If it is not given, the resulting vector will have enough bits
     * to represent the number completely.
     *
     * @param data The initialization value.
     * @param nbits Number of bits in the vector.
     */
    static fromNumber(data, nbits) {
        const fbits = nbits === undefined ? 0 : nbits;
        const bdata = BigInt(data);
        if (bdata >= BigInt(0)) {
            let b = bdata.toString(2);
            return Vector3vl.fromBin('0'.repeat(Math.max(0, fbits - b.length)) + b, nbits);
        }
        else {
            const c = (-bdata).toString(2).length;
            const j = bdata + (BigInt(1) << BigInt(c));
            let b = j.toString(2);
            return Vector3vl.fromBin('1'.repeat(Math.max(1, fbits - c)) + '0'.repeat(c - b.length) + b, nbits);
        }
    }
    /**
     * Number of bits in the vector.
     */
    get bits() {
        return this._bits;
    }
    /**
     * Most significant bit in the vector. Returns -1, 0 or 1.
     */
    get msb() {
        return this.get(this._bits - 1);
    }
    /**
     * Least significant bit in the vector. Returns -1, 0 or 1.
     */
    get lsb() {
        return this.get(0);
    }
    /**
     * Gets _n_th value in the vector. Returns -1, 0 or 1.
     */
    get(n) {
        const bn = bitnum(n);
        const wn = wordnum(n);
        const a = (this._avec[wn] >>> bn) & 1;
        const b = (this._bvec[wn] >>> bn) & 1;
        return a + b - 1;
    }
    /**
     * Tests if the vector is all ones.
     */
    get isHigh() {
        if (this._bits == 0)
            return true;
        const lastmask = this._lastmask;
        const vechigh = (vec) => vec.slice(0, vec.length - 1).every(x => ~x == 0) && (vec[vec.length - 1] & lastmask) == lastmask;
        return vechigh(this._avec) && vechigh(this._bvec);
    }
    /**
     * Tests if the vector is all zeros.
     */
    get isLow() {
        if (this._bits == 0)
            return true;
        const lastmask = this._lastmask;
        const veclow = (vec) => vec.slice(0, vec.length - 1).every(x => x == 0) && (vec[vec.length - 1] & lastmask) == 0;
        return veclow(this._avec) && veclow(this._bvec);
    }
    /**
     * Tests if there is any defined bit in the vector.
     */
    get isDefined() {
        if (this._bits == 0)
            return false;
        const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
        dvec[dvec.length - 1] |= ~this._lastmask;
        return !dvec.every(x => ~x == 0);
    }
    /**
     * Tests if every bit in the vector is defined.
     */
    get isFullyDefined() {
        if (this._bits == 0)
            return true;
        const dvec = zip((a, b) => a ^ b, this._avec, this._bvec);
        dvec[dvec.length - 1] &= this._lastmask;
        return !dvec.some(x => Boolean(x));
    }
    /**
     * Bitwise AND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    and(v) {
        assert(v._bits == this._bits, "Vector3vl.and() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip((a, b) => a & b, v._avec, this._avec), zip((a, b) => a & b, v._bvec, this._bvec));
    }
    /**
     * Bitwise OR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    or(v) {
        assert(v._bits == this._bits, "Vector3vl.or() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip((a, b) => a | b, v._avec, this._avec), zip((a, b) => a | b, v._bvec, this._bvec));
    }
    /**
     * Bitwise XOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xor(v) {
        assert(v._bits == this._bits, "Vector3vl.xor() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip4((a1, a2, b1, b2) => (a1 | b1) & (a2 ^ b2), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => (a1 & b1) ^ (a2 | b2), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NAND of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nand(v) {
        assert(v._bits == this._bits, "Vector3vl.nand() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip((a, b) => ~(a & b), v._bvec, this._bvec), zip((a, b) => ~(a & b), v._avec, this._avec));
    }
    /**
     * Bitwise NOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    nor(v) {
        assert(v._bits == this._bits, "Vector3vl.nor() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip((a, b) => ~(a | b), v._bvec, this._bvec), zip((a, b) => ~(a | b), v._avec, this._avec));
    }
    /**
     * Bitwise XNOR of two vectors.
     *
     * The vectors need to be the same bit length.
     *
     * @param v The other vector.
     */
    xnor(v) {
        assert(v._bits == this._bits, "Vector3vl.xnor() called with vectors of different sizes");
        return new Vector3vl(this._bits, zip4((a1, a2, b1, b2) => ~((a1 & b1) ^ (a2 | b2)), v._avec, v._bvec, this._avec, this._bvec), zip4((a1, a2, b1, b2) => ~((a1 | b1) & (a2 ^ b2)), v._avec, v._bvec, this._avec, this._bvec));
    }
    /**
     * Bitwise NOT of a vector. */
    not() {
        return new Vector3vl(this._bits, this._bvec.map(a => ~a), this._avec.map(a => ~a));
    }
    /**
     * Return a vector with 1 on locations with x, the rest with 0.
     */
    xmask() {
        const v = zip((a, b) => a ^ b, this._avec, this._bvec);
        return new Vector3vl(this._bits, v, v);
    }
    /**
     * Reducing AND of a vector.
     *
     * ANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceAnd() {
        return new Vector3vl(1, Uint32Array.of(bitfold((a, b) => a & b, this._avec, this._lastmask, 1)), Uint32Array.of(bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)));
    }
    /**
     * Reducing OR of a vector.
     *
     * ORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceOr() {
        return new Vector3vl(1, Uint32Array.of(bitfold((a, b) => a | b, this._avec, this._lastmask, 0)), Uint32Array.of(bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)));
    }
    /**
     * Reducing NAND of a vector.
     *
     * NANDs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNand() {
        return new Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a & b, this._bvec, this._lastmask, 1)), Uint32Array.of(~bitfold((a, b) => a & b, this._avec, this._lastmask, 1)));
    }
    /**
     * Reducing NOR of a vector.
     *
     * NORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceNor() {
        return new Vector3vl(1, Uint32Array.of(~bitfold((a, b) => a | b, this._bvec, this._lastmask, 0)), Uint32Array.of(~bitfold((a, b) => a | b, this._avec, this._lastmask, 0)));
    }
    /**
     * Reducing XOR of a vector.
     *
     * XORs all bits of the vector together, producing a single bit.
     *
     * @returns Singleton vector.
     */
    reduceXor() {
        const xes = zip((a, b) => ~a & b, this._avec, this._bvec);
        const has_x = bitfold((a, b) => a | b, xes, this._lastmask, 0);
        const v = bitfold((a, b) => a ^ b, this._avec, this._lastmask, 0);
        return new Vector3vl(1, Uint32Array.of(v & ~has_x), Uint32Array.of(v | has_x));
    }
    /**
     * Reducing XNOR of a vector.
     *
     * XNORs all bits of the vector together, producing a single bit.
     *
     * @return Singleton vector.
     */
    reduceXnor() {
        return this.reduceXor().not();
    }
    /**
     * Concatenates vectors, including this one, into a single vector.
     *
     * @param vs The other vectors.
     */
    concat(...vs) {
        return Vector3vl.concat(this, ...vs);
    }
    /**
     * Return a subvector.
     *
     * Uses same conventions as the slice function for JS arrays.
     *
     * @param start Number of the first bit to include in the result.
     *              If omitted, first bit of the vector is used.
     * @param end Number of the last bit to include in the result, plus one.
     *            If omitted, last bit of the vector is used.
     */
    slice(start, end) {
        if (start === undefined)
            start = 0;
        if (end === undefined)
            end = this._bits;
        if (end > this.bits)
            end = this.bits;
        if (start > end)
            end = start;
        if (bitnum(start) == 0) {
            const avec = this._avec.slice(start >>> 5, (end + 31) >>> 5);
            const bvec = this._bvec.slice(start >>> 5, (end + 31) >>> 5);
            return new Vector3vl(end - start, avec, bvec);
        }
        else {
            const words = (end - start + 31) >>> 5;
            const avec = new Uint32Array(words), bvec = new Uint32Array(words);
            let k = 0;
            avec[k] = this._avec[start >> 5] >>> start;
            bvec[k] = this._bvec[start >> 5] >>> start;
            for (let idx = (start >> 5) + 1; idx <= (end >>> 5); idx++) {
                avec[k] |= this._avec[idx] << -start;
                bvec[k] |= this._bvec[idx] << -start;
                k++;
                if (k == words)
                    break;
                avec[k] = this._avec[idx] >>> start;
                bvec[k] = this._bvec[idx] >>> start;
            }
            return new Vector3vl(end - start, avec, bvec);
        }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * This function calls [[toIteratorAnySkip]] or [[toIteratorPow2]].
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    toIterator(skip) {
        if ((skip & (skip - 1)) == 0)
            return this.toIteratorPow2(skip);
        else
            return this.toIteratorAnySkip(skip);
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1 to 16.
     */
    *toIteratorAnySkip(skip) {
        this.normalize();
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            let a = (this._avec[k] & m) >>> bit;
            let b = (this._bvec[k] & m) >>> bit;
            if ((m >>> bit) != sm && k + 1 != this._avec.length) {
                const m1 = sm >> -bit;
                a |= (this._avec[k + 1] & m1) << -bit;
                b |= (this._bvec[k + 1] & m1) << -bit;
            }
            yield (a << skip) | b;
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = (sm << bit);
            }
        }
    }
    /**
     * Returns an iterator describing the vector.
     *
     * In each returned value, first _skip_ bits come from the vector B,
     * the next _skip_ bits come from the vector A.
     *
     * @param skip Number of bits in a single iterator step. 1, 2, 4, 8 or 16.
     */
    *toIteratorPow2(skip) {
        this.normalize();
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            const a = (this._avec[k] & m) >>> bit;
            const b = (this._bvec[k] & m) >>> bit;
            yield (a << skip) | b;
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = sm;
            }
        }
    }
    /** Returns an array representation of the vector.
     *
     * The resulting array contains values -1, 0, 1.
     */
    toArray() {
        // copy-paste'y code for performance
        this.normalize();
        const skip = 1;
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            const a = (this._avec[k] & m) >>> bit;
            const b = (this._bvec[k] & m) >>> bit;
            const v = (a << skip) | b;
            out.push(v - 1 - Number(v > 1));
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = sm;
            }
        }
        return out;
    }
    /** Returns a binary representation of the vector.
     *
     * Three characters are used:
     * * '0' for logical 0,
     * * 'x' for undefined value,
     * * '1' for logical 1.
     */
    toBin() {
        return toBinInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns an octal representation of the vector.
     *
     * Returned characters can be '0' to '7' and 'x'. An 'x' value is returned
     * if any of the three bits is undefined.
     */
    toOct() {
        // copy-paste'y code for performance
        this.normalize();
        const skip = 3;
        const sm = (1 << skip) - 1;
        let bit = 0, k = 0, m = sm, out = [];
        while (bit < this._bits) {
            let a = (this._avec[k] & m) >>> bit;
            let b = (this._bvec[k] & m) >>> bit;
            if ((m >>> bit) != sm && k + 1 != this._avec.length) {
                const m1 = sm >> -bit;
                a |= (this._avec[k + 1] & m1) << -bit;
                b |= (this._bvec[k + 1] & m1) << -bit;
            }
            const v = (a << skip) | b;
            if (0x7 & v & ~(v >> 3))
                out.push('x');
            else
                out.push((v >> 3).toString());
            m <<= skip;
            bit += skip;
            if (m == 0) {
                k++;
                m = (sm << bit);
            }
        }
        return out.reverse().join('');
    }
    /** Returns an hexadecimal representation of the vector.
     *
     * Returned characters can be '0' to '9', 'a' to 'f' and 'x'. An 'x' value
     * is returned if any of the four bits is undefined.
     */
    toHex() {
        this.normalize();
        return toHexInternal(0, this._bits, this._avec, this._bvec);
    }
    /** Returns a string describing the vector. */
    toString() {
        return "Vector3vl " + this.toBin();
    }
    /** Returns a number representing the vector. */
    toNumber(signed = false) {
        if (signed)
            return this.toNumberSigned();
        assert(this.isFullyDefined, "Vector3vl.toNumber() called on a not fully defined vector");
        assert(this._bits < 32, "Vector3vl.toNumber() called on a too wide vector");
        if (this._bits == 0)
            return 0;
        else
            return Number.parseInt(this.toHex(), 16);
    }
    /** Return a signed number representing the vector. */
    toNumberSigned() {
        assert(this.isFullyDefined, "Vector3vl.toNumberSigned() called on a not fully defined vector");
        assert(this._bits < 32, "Vector3vl.toNumberSigned() called on a too wide vector");
        assert(this._bits > 0, "Vector3vl.toNumberSigned() called on an empty vector");
        const sign = this.msb == 1;
        return sign ? Number.parseInt(this.toHex(), 16) - (1 << this._bits)
            : Number.parseInt(this.toHex(), 16);
    }
    /** Returns a BigInt representing the vector. */
    toBigInt(signed = false) {
        if (signed)
            return this.toBigIntSigned();
        assert(this.isFullyDefined, "Vector3vl.toBigInt() called on a not fully defined vector");
        if (this._bits == 0)
            return BigInt(0);
        else
            return BigInt("0x" + this.toHex());
    }
    /** Return a signed BigInt representing the vector. */
    toBigIntSigned() {
        assert(this.isFullyDefined, "Vector3vl.toBigIntSigned() called on a not fully defined vector");
        assert(this._bits > 0, "Vector3vl.toBigIntSigned() called on an empty vector");
        const sign = this.msb == 1;
        return sign ? BigInt("0x" + this.toHex()) - (BigInt(1) << BigInt(this._bits))
            : BigInt("0x" + this.toHex());
    }
    /** Compares two vectors for equality. */
    eq(v) {
        if (v._bits != this._bits)
            return false;
        this.normalize();
        v.normalize();
        for (const i in this._avec) {
            if (this._avec[i] != v._avec[i])
                return false;
            if (this._bvec[i] != v._bvec[i])
                return false;
        }
        return true;
    }
    /** Normalize the vector.
     *
     * Because of the representation used, if _bits_ is not a multiple
     * of 32, some internal bits do not contribute to the vector value,
     * and for performance reasons can get arbitrary values in the course
     * of computations. This procedure clears these bits.
     * For internal use.
     */
    normalize() {
        const lastmask = this._lastmask;
        this._avec[this._avec.length - 1] &= lastmask;
        this._bvec[this._bvec.length - 1] &= lastmask;
    }
    /** Mask for unused bits.
     *
     * For internal use.
     */
    get _lastmask() {
        return (~0) >>> -this.bits;
    }
}
exports.Vector3vl = Vector3vl;
/**
 * An empty vector.
 */
Vector3vl.empty = Vector3vl.zeros(0);
/**
 * A single one.
 */
Vector3vl.one = Vector3vl.ones(1);
/**
 * A single zero.
 */
Vector3vl.zero = Vector3vl.zeros(1);
/**
 * A single undefined value.
 */
Vector3vl.x = Vector3vl.xes(1);
;
class Mem3vl {
    constructor(bits, size, val) {
        if (val === undefined)
            val = 0;
        this._bits = bits | 0;
        this._size = size | 0;
        this._wpc = (bits + 31) / 32 | 0;
        this._avec = new Uint32Array(size * this._wpc).fill(val > 0 ? ~0 : 0);
        this._bvec = new Uint32Array(size * this._wpc).fill(val >= 0 ? ~0 : 0);
        if (this._size)
            this.set(this._size - 1, this.get(this._size - 1)); // TODO faster
    }
    static fromData(data) {
        if (data.length == 0)
            return new Mem3vl(0, 0);
        const ret = new Mem3vl(data[0].bits, data.length);
        for (const i in data) {
            data[i].normalize();
            assert(data[i].bits == ret._bits, "Mem3vl.fromData() called with vectors of different sizes");
            for (let j = 0; j < ret._wpc; j++) {
                const idx = Number(i) * ret._wpc + j;
                ret._avec[idx] = data[i]._avec[j];
                ret._bvec[idx] = data[i]._bvec[j];
            }
        }
        return ret;
    }
    get bits() {
        return this._bits;
    }
    get words() {
        return this._size;
    }
    get(i) {
        const idx = this._wpc * i;
        return new Vector3vl(this._bits, this._avec.slice(idx, idx + this._wpc), this._bvec.slice(idx, idx + this._wpc));
    }
    set(i, v) {
        assert(v.bits == this._bits, "Mem3vl.set() called with a vector with different bit width than the memory");
        v.normalize();
        for (let j = 0; j < this._wpc; j++) {
            this._avec[i * this._wpc + j] = v._avec[j];
            this._bvec[i * this._wpc + j] = v._bvec[j];
        }
    }
    toJSON() {
        const rep = [];
        let hexbuf = [];
        let rleval, rlecnt = 0;
        const hexflush = () => {
            if (hexbuf.length == 0)
                return;
            if (hexbuf.reduce((a, b) => a + b.length, 0) == this._bits) { // to avoid confusion
                const last = hexbuf.pop();
                if (hexbuf.length > 0)
                    rep.push(hexbuf.join(''));
                rep.push(last);
            }
            else {
                rep.push(hexbuf.join(''));
            }
            hexbuf = [];
        };
        const rleflush = () => {
            if (rlecnt == 0)
                return;
            else if (rlecnt == 1) {
                if (rleval.length == this._bits) {
                    hexflush();
                    rep.push(rleval);
                }
                else
                    hexbuf.push(rleval);
            }
            else {
                hexflush();
                rep.push(rlecnt);
                rep.push(rleval);
            }
            rleval = undefined;
            rlecnt = 0;
        };
        const rlepush = (v) => {
            if (rleval == v)
                rlecnt++;
            else {
                rleflush();
                rleval = v;
                rlecnt = 1;
            }
        };
        for (let i = 0; i < this._size; i++) {
            const check = () => {
                for (let j = 0; j < this._wpc; j++) {
                    const xx = this._avec[i * this._wpc + j] ^ this._bvec[i * this._wpc + j];
                    for (let k = 0; k < 4; k++) {
                        const m = 0xff << (k * 16);
                        const xm = xx & m;
                        if (xm != m || xm != 0)
                            return false;
                    }
                }
                return true;
            };
            if (this._bits > 0 && check()) {
                rlepush(toHexInternal(i * this._wpc, this._bits, this._avec, this._bvec));
            }
            else {
                rlepush(toBinInternal(i * this._wpc, this._bits, this._avec, this._bvec));
            }
        }
        rleflush();
        hexflush();
        return rep;
    }
    static fromJSON(bits, rep) {
        const hexlen = Math.ceil(bits / 4);
        let size = 0;
        const xsize = (x) => {
            if (x.length == bits || x.length == hexlen)
                return 1;
            else
                return x.length / hexlen;
        };
        for (let i = 0; i < rep.length; i++) {
            if (typeof rep[i] === "string") {
                size += xsize(rep[i]);
            }
            else if (typeof rep[i] === "number") {
                size += rep[i] * xsize(rep[i + 1]);
                i++;
            }
        }
        const ret = new Mem3vl(bits, size, -1);
        let w = 0;
        const decode = (x) => {
            if (x.length == bits) {
                fromBinInternal(x, w, bits, ret._avec, ret._bvec);
                w += ret._wpc;
            }
            else if (x.length == hexlen) {
                fromHexInternal(x, w, bits, ret._avec, ret._bvec);
                w += ret._wpc;
            }
            else {
                for (let i = 0; i < x.length / hexlen; i++) {
                    fromHexInternal(x.slice(i * hexlen, (i + 1) * hexlen), w, bits, ret._avec, ret._bvec);
                    w += ret._wpc;
                }
            }
        };
        for (let i = 0; i < rep.length; i++) {
            if (typeof rep[i] === "string")
                decode(rep[i]);
            else if (typeof rep[i] === "number") {
                for (const j of Array(rep[i]).keys())
                    decode(rep[i + 1]);
                i++;
            }
        }
        return ret;
    }
    toArray() {
        return Array(this._size).fill(0).map((a, i) => this.get(i));
    }
    toHex() {
        // TODO faster
        return this.toArray().map(x => x.toHex());
    }
    eq(m) {
        if (m._bits != this._bits || m._size != this._size)
            return false;
        // TODO faster
        for (let i = 0; i < this._size; i++)
            if (!m.get(i).eq(this.get(i)))
                return false;
        return true;
    }
}
exports.Mem3vl = Mem3vl;
;
;
class Display3vlWithRegex {
    constructor(pattern) {
        _regex.set(this, void 0);
        this.pattern = pattern;
        __classPrivateFieldSet(this, _regex, RegExp('^(?:' + this.pattern + ')$'));
    }
    validate(data, bits) {
        return __classPrivateFieldGet(this, _regex).test(data);
    }
}
exports.Display3vlWithRegex = Display3vlWithRegex;
_regex = new WeakMap();
class Display3vlHex extends Display3vlWithRegex {
    constructor() {
        super("[0-9a-fx]*");
        this.name = "hex";
        this.sort = 0;
    }
    can(kind, bits) {
        return true;
    }
    read(data, bits) {
        return Vector3vl.fromHex(data, bits);
    }
    show(data) {
        return data.toHex();
    }
    size(bits) {
        return Math.ceil(bits / 4);
    }
}
exports.Display3vlHex = Display3vlHex;
;
class Display3vlBin extends Display3vlWithRegex {
    constructor() {
        super("[01x]*");
        this.name = "bin";
        this.sort = 0;
    }
    can(kind, bits) {
        return true;
    }
    read(data, bits) {
        return Vector3vl.fromBin(data, bits);
    }
    show(data) {
        return data.toBin();
    }
    size(bits) {
        return bits;
    }
}
exports.Display3vlBin = Display3vlBin;
;
class Display3vlOct extends Display3vlWithRegex {
    constructor() {
        super("[0-7x]*");
        this.name = "oct";
        this.sort = 0;
    }
    can(kind, bits) {
        return true;
    }
    read(data, bits) {
        return Vector3vl.fromOct(data, bits);
    }
    show(data) {
        return data.toOct();
    }
    size(bits) {
        return Math.ceil(bits / 3);
    }
}
exports.Display3vlOct = Display3vlOct;
;
class Display3vlDec extends Display3vlWithRegex {
    constructor() {
        super('[0-9]*|x');
    }
    get name() {
        return "dec";
    }
    get sort() {
        return 0;
    }
    can(kind, bits) {
        return true;
    }
    read(data, bits) {
        if (data == 'x')
            return Vector3vl.xes(bits);
        return Vector3vl.fromNumber(BigInt(data), bits);
    }
    show(data) {
        if (!data.isFullyDefined)
            return 'x';
        return data.toBigInt().toString();
    }
    size(bits) {
        return Math.max(1, Math.ceil(bits / Math.log2(10)));
    }
}
;
class Display3vlDec2c extends Display3vlWithRegex {
    constructor() {
        super('-?[0-9]*|x');
    }
    get name() {
        return "dec2c";
    }
    get sort() {
        return 0;
    }
    can(kind, bits) {
        return bits > 0;
    }
    read(data, bits) {
        if (data == 'x')
            return Vector3vl.xes(bits);
        return Vector3vl.fromNumber(BigInt(data), bits);
    }
    show(data) {
        if (!data.isFullyDefined)
            return 'x';
        return data.toBigIntSigned().toString();
    }
    size(bits) {
        return 1 + Math.ceil(bits / Math.log2(10));
    }
}
;
class Display3vl {
    constructor() {
        this.displays = {};
        this.addDisplay(new Display3vlHex());
        this.addDisplay(new Display3vlBin());
        this.addDisplay(new Display3vlOct());
        this.addDisplay(new Display3vlDec());
        this.addDisplay(new Display3vlDec2c());
    }
    addDisplay(display) {
        this.displays[display.name] = display;
    }
    usableDisplays(kind, bits) {
        const ret = [];
        for (let iface of Object.values(this.displays)) {
            if (iface.can(kind, bits))
                ret.push(iface);
        }
        return ret.sort((x, y) => x.sort - y.sort ? x.sort - y.sort : x.name.localeCompare(y.name))
            .map(x => x.name);
    }
    show(name, data) {
        return this.displays[name].show(data);
    }
    read(name, data, bits) {
        return this.displays[name].read(data, bits);
    }
    pattern(name) {
        return this.displays[name].pattern;
    }
    validate(name, data, bits) {
        return this.displays[name].validate(data, bits);
    }
    size(name, bits) {
        return this.displays[name].size(bits);
    }
}
exports.Display3vl = Display3vl;
;

},{}],10:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    var supportsNativeBigInt = typeof BigInt === "function";

    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    NativeBigInt.prototype.add = function (v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    }
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    NativeBigInt.prototype.subtract = function (v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    }
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function () {
        return new NativeBigInt(-this.value);
    }

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function () {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    }


    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    NativeBigInt.prototype.multiply = function (v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    }
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    NativeBigInt.prototype.square = function (v) {
        return new NativeBigInt(this.value * this.value);
    }

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    NativeBigInt.prototype.pow = function (v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    }

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function (v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    }

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    NativeBigInt.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    }
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    }

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function () {
        return this.value === BigInt(0);
    }

    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    function millerRabinTest(n, a) {
        var nPrev = n.prev(),
            b = nPrev,
            r = 0,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }

    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function (strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function () {
        return new NativeBigInt(this.value + BigInt(1));
    }

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function () {
        return new NativeBigInt(this.value - BigInt(1));
    }

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    BigInteger.prototype.shiftLeft = function (v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I :
                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
                    v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    BigInteger.prototype.bitLength = function () {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    }
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < top) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }

    var parseBase = function (text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return { value: [0], isNegative: false };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(n.toJSNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
    }

    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
            return stringify(x, alphabet);
        }).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    NativeBigInt.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };

    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    }

    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += (new Array(exp + 1)).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if (typeof define === "function" && define.amd) {
    define( function () {
        return bigInt;
    });
}

},{}],11:[function(require,module,exports){
/**
 * HashMap - HashMap Class for JavaScript
 * @author Ariel Flesler <aflesler@gmail.com>
 * @version 2.4.0
 * Homepage: https://github.com/flesler/hashmap
 */

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module === 'object') {
		// Node js environment
		var HashMap = module.exports = factory();
		// Keep it backwards compatible
		HashMap.HashMap = HashMap;
	} else {
		// Browser globals (this is window)
		this.HashMap = factory();
	}
}(function() {

	function HashMap(other) {
		this.clear();
		switch (arguments.length) {
			case 0: break;
			case 1: {
				if ('length' in other) {
					// Flatten 2D array to alternating key-value array
					multi(this, Array.prototype.concat.apply([], other));
				} else { // Assumed to be a HashMap instance
					this.copy(other);
				}
				break;
			}
			default: multi(this, arguments); break;
		}
	}

	var proto = HashMap.prototype = {
		constructor:HashMap,

		get:function(key) {
			var data = this._data[this.hash(key)];
			return data && data[1];
		},

		set:function(key, value) {
			// Store original key as well (for iteration)
			var hash = this.hash(key);
			if ( !(hash in this._data) ) {
				this.size++;
			}
			this._data[hash] = [key, value];
		},

		multi:function() {
			multi(this, arguments);
		},

		copy:function(other) {
			for (var hash in other._data) {
				if ( !(hash in this._data) ) {
					this.size++;
				}
				this._data[hash] = other._data[hash];
			}
		},

		has:function(key) {
			return this.hash(key) in this._data;
		},

		search:function(value) {
			for (var key in this._data) {
				if (this._data[key][1] === value) {
					return this._data[key][0];
				}
			}

			return null;
		},

		delete:function(key) {
			var hash = this.hash(key);
			if ( hash in this._data ) {
				this.size--;
				delete this._data[hash];
			}
		},

		type:function(key) {
			var str = Object.prototype.toString.call(key);
			var type = str.slice(8, -1).toLowerCase();
			// Some browsers yield DOMWindow or Window for null and undefined, works fine on Node
			if (!key && (type === 'domwindow' || type === 'window')) {
				return key + '';
			}
			return type;
		},

		keys:function() {
			var keys = [];
			this.forEach(function(_, key) { keys.push(key); });
			return keys;
		},

		values:function() {
			var values = [];
			this.forEach(function(value) { values.push(value); });
			return values;
		},

		entries:function() {
			var entries = [];
			this.forEach(function(value, key) { entries.push([key, value]); });
			return entries;
		},

		// TODO: This is deprecated and will be deleted in a future version
		count:function() {
			return this.size;
		},

		clear:function() {
			// TODO: Would Object.create(null) make any difference
			this._data = {};
			this.size = 0;
		},

		clone:function() {
			return new HashMap(this);
		},

		hash:function(key) {
			switch (this.type(key)) {
				case 'undefined':
				case 'null':
				case 'boolean':
				case 'number':
				case 'regexp':
					return key + '';

				case 'date':
					return '♣' + key.getTime();

				case 'string':
					return '♠' + key;

				case 'array':
					var hashes = [];
					for (var i = 0; i < key.length; i++) {
						hashes[i] = this.hash(key[i]);
					}
					return '♥' + hashes.join('⁞');

				default:
					// TODO: Don't use expandos when Object.defineProperty is not available?
					if (!key.hasOwnProperty('_hmuid_')) {
						key._hmuid_ = ++HashMap.uid;
						hide(key, '_hmuid_');
					}

					return '♦' + key._hmuid_;
			}
		},

		forEach:function(func, ctx) {
			for (var key in this._data) {
				var data = this._data[key];
				func.call(ctx || this, data[1], data[0]);
			}
		}
	};

	HashMap.uid = 0;

	// Iterator protocol for ES6
	if (typeof Symbol !== 'undefined' && typeof Symbol.iterator !== 'undefined') {
		proto[Symbol.iterator] = function() {
			var entries = this.entries();
			var i = 0;
			return {
				next:function() {
					if (i === entries.length) { return { done: true }; }
					var currentEntry = entries[i++];
					return {
						value: { key: currentEntry[0], value: currentEntry[1] },
						done: false
					};
				}
			};
		};
	}

	//- Add chaining to all methods that don't return something

	['set','multi','copy','delete','clear','forEach'].forEach(function(method) {
		var fn = proto[method];
		proto[method] = function() {
			fn.apply(this, arguments);
			return this;
		};
	});

	//- Backwards compatibility

	// TODO: remove() is deprecated and will be deleted in a future version
	HashMap.prototype.remove = HashMap.prototype.delete;

	//- Utils

	function multi(map, args) {
		for (var i = 0; i < args.length; i += 2) {
			map.set(args[i], args[i+1]);
		}
	}

	function hide(obj, prop) {
		// Make non iterable if supported
		if (Object.defineProperty) {
			Object.defineProperty(obj, prop, {enumerable:false});
		}
	}

	return HashMap;
}));

},{}],12:[function(require,module,exports){
/*jshint node:true*/
'use strict';

/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @param  {Object} options {replacement: String | Function }
 * @return {String}         Sanitized filename
 */

var truncate = require("truncate-utf8-bytes");

var illegalRe = /[\/\?<>\\:\*\|"]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement) {
  if (typeof input !== 'string') {
    throw new Error('Input must be string');
  }
  var sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return truncate(sanitized, 255);
}

module.exports = function (input, options) {
  var replacement = (options && options.replacement) || '';
  var output = sanitize(input, replacement);
  if (replacement === '') {
    return output;
  }
  return sanitize(output, '');
};

},{"truncate-utf8-bytes":14}],13:[function(require,module,exports){
/*
* @author Samuel Neff (https://github.com/samuelneff)
*
* based almost entirely on gist from
*
* @author SHIN Suzuki (shinout310@gmail.com)
*
* https://gist.github.com/shinout/1232505
*/
/// <reference path="../typings/node/node.d.ts" />
var EdgeNode = (function () {
    function EdgeNode(id) {
        this.id = id;
        this.afters = [];
    }
    return EdgeNode;
})();

function sortDesc(a, b) {
    if (a < b)
        return 1;
    if (a > b)
        return -1;

    // a must be equal to b
    return 0;
}

/**
* general topological sort
* @param edges : list of edges. each edge forms Array<ID,ID> e.g. [12 , 3]
* @param options When provided with 'continueOnCircularDependency' set to true, sorting will continue even if a
*                  circular dependency is found. The precise sort is not guaranteed.
* @returns Array : topological sorted list of IDs
**/
function topsort(edges, options) {
    var nodes = {};
    options = options || { continueOnCircularDependency: false };

    var sorted = [];

    // hash: id of already visited node => true
    var visited = {};

    // 1. build data structures
    edges.forEach(function (edge) {
        var fromEdge = edge[0];
        var fromStr = fromEdge.toString();
        var fromNode;

        if (!(fromNode = nodes[fromStr])) {
            fromNode = nodes[fromStr] = new EdgeNode(fromEdge);
        }

        edge.forEach(function (toEdge) {
            // since from and to are in same array, we'll always see from again, so make sure we skip it..
            if (toEdge == fromEdge) {
                return;
            }

            var toEdgeStr = toEdge.toString();

            if (!nodes[toEdgeStr]) {
                nodes[toEdgeStr] = new EdgeNode(toEdge);
            }
            fromNode.afters.push(toEdge);
        });
    });

    // 2. topological sort
    var keys = Object.keys(nodes);
    keys.sort(sortDesc);
    keys.forEach(function visit(idstr, ancestorsIn) {
        var node = nodes[idstr];
        var id = node.id;

        // if already exists, do nothing
        if (visited[idstr]) {
            return;
        }

        var ancestors = Array.isArray(ancestorsIn) ? ancestorsIn : [];

        ancestors.push(id);
        visited[idstr] = true;

        node.afters.sort(sortDesc);
        node.afters.forEach(function (afterID) {
            // if already in ancestors, a closed chain exists.
            if (ancestors.indexOf(afterID) >= 0) {
                if (options.continueOnCircularDependency) {
                    return;
                }
                throw new Error('Circular chain found: ' + id + ' must be before ' + afterID + ' due to a direct order specification, but ' + afterID + ' must be before ' + id + ' based on other specifications.');
            }

            // recursive call
            visit(afterID.toString(), ancestors.map(function (v) {
                return v;
            }));
        });

        sorted.unshift(id);
    });

    return sorted;
}

module.exports = topsort;


},{}],14:[function(require,module,exports){
'use strict';

var truncate = require("./lib/truncate");
var getLength = require("utf8-byte-length/browser");
module.exports = truncate.bind(null, getLength);

},{"./lib/truncate":15,"utf8-byte-length/browser":16}],15:[function(require,module,exports){
'use strict';

function isHighSurrogate(codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

// Truncate string by size in bytes
module.exports = function truncate(getLength, string, byteLength) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }

  var charLength = string.length;
  var curByteLength = 0;
  var codePoint;
  var segment;

  for (var i = 0; i < charLength; i += 1) {
    codePoint = string.charCodeAt(i);
    segment = string[i];

    if (isHighSurrogate(codePoint) && isLowSurrogate(string.charCodeAt(i + 1))) {
      i += 1;
      segment += string[i];
    }

    curByteLength += getLength(segment);

    if (curByteLength === byteLength) {
      return string.slice(0, i + 1);
    }
    else if (curByteLength > byteLength) {
      return string.slice(0, i - segment.length + 1);
    }
  }

  return string;
};


},{}],16:[function(require,module,exports){
'use strict';

function isHighSurrogate(codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

// Truncate string by size in bytes
module.exports = function getByteLength(string) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }

  var charLength = string.length;
  var byteLength = 0;
  var codePoint = null;
  var prevCodePoint = null;
  for (var i = 0; i < charLength; i++) {
    codePoint = string.charCodeAt(i);
    // handle 4-byte non-BMP chars
    // low surrogate
    if (isLowSurrogate(codePoint)) {
      // when parsing previous hi-surrogate, 3 is added to byteLength
      if (prevCodePoint != null && isHighSurrogate(prevCodePoint)) {
        byteLength += 1;
      }
      else {
        byteLength += 3;
      }
    }
    else if (codePoint <= 0x7f ) {
      byteLength += 1;
    }
    else if (codePoint >= 0x80 && codePoint <= 0x7ff) {
      byteLength += 2;
    }
    else if (codePoint >= 0x800 && codePoint <= 0xffff) {
      byteLength += 3;
    }
    prevCodePoint = codePoint;
  }

  return byteLength;
};

},{}]},{},[7]);
