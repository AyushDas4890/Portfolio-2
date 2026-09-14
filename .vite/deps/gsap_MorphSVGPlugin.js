import {
  cacheRawPathMeasurements,
  convertToPath,
  getRawPath,
  pointsToSegment,
  rawPathToString,
  reverseSegment,
  segmentToDistributedPoints,
  stringToRawPath
} from "./chunk-FS6FCKKJ.js";
import "./chunk-G3PMV62Z.js";

// node_modules/gsap/MorphSVGPlugin.js
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var gsap;
var _toArray;
var _lastLinkedAnchor;
var _doc;
var _coreInitted;
var PluginClass;
var _reverting;
var _getGSAP = function _getGSAP2() {
  return gsap || typeof window !== "undefined" && (gsap = window.gsap) && gsap.registerPlugin && gsap;
};
var _isFunction = function _isFunction2(value) {
  return typeof value === "function";
};
var _atan2 = Math.atan2;
var _cos = Math.cos;
var _sin = Math.sin;
var _sqrt = Math.sqrt;
var _PI = Math.PI;
var _2PI = _PI * 2;
var _angleMin = _PI * 0.3;
var _angleMax = _PI * 0.7;
var _bigNum = 1e20;
var _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/gi;
var _selectorExp = /(^[#.][a-z]|[a-y][a-z])/i;
var _commands = /[achlmqstvz]/i;
var _log = function _log2(message) {
  return console && console.warn(message);
};
var _round = function _round2(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
};
var _getAverageXY = function _getAverageXY2(segment) {
  var l = segment.length, x = 0, y = 0, i;
  for (i = 0; i < l; i++) {
    x += segment[i++];
    y += segment[i];
  }
  return [x / (l / 2), y / (l / 2)];
};
var _getSize = function _getSize2(segment) {
  var l = segment.length, xMax = segment[0], xMin = xMax, yMax = segment[1], yMin = yMax, x, y, i;
  for (i = 6; i < l; i += 6) {
    x = segment[i];
    y = segment[i + 1];
    if (x > xMax) {
      xMax = x;
    } else if (x < xMin) {
      xMin = x;
    }
    if (y > yMax) {
      yMax = y;
    } else if (y < yMin) {
      yMin = y;
    }
  }
  segment.centerX = (xMax + xMin) / 2;
  segment.centerY = (yMax + yMin) / 2;
  return segment.size = (xMax - xMin) * (yMax - yMin);
};
var _getTotalSize = function _getTotalSize2(rawPath, samplesPerBezier) {
  if (samplesPerBezier === void 0) {
    samplesPerBezier = 3;
  }
  var j = rawPath.length, xMax = rawPath[0][0], xMin = xMax, yMax = rawPath[0][1], yMin = yMax, inc = 1 / samplesPerBezier, l, x, y, i, segment, k, t, inv, x1, y1, x2, x3, x4, y2, y3, y4;
  while (--j > -1) {
    segment = rawPath[j];
    l = segment.length;
    for (i = 6; i < l; i += 6) {
      x1 = segment[i];
      y1 = segment[i + 1];
      x2 = segment[i + 2] - x1;
      y2 = segment[i + 3] - y1;
      x3 = segment[i + 4] - x1;
      y3 = segment[i + 5] - y1;
      x4 = segment[i + 6] - x1;
      y4 = segment[i + 7] - y1;
      k = samplesPerBezier;
      while (--k > -1) {
        t = inc * k;
        inv = 1 - t;
        x = (t * t * x4 + 3 * inv * (t * x3 + inv * x2)) * t + x1;
        y = (t * t * y4 + 3 * inv * (t * y3 + inv * y2)) * t + y1;
        if (x > xMax) {
          xMax = x;
        } else if (x < xMin) {
          xMin = x;
        }
        if (y > yMax) {
          yMax = y;
        } else if (y < yMin) {
          yMin = y;
        }
      }
    }
  }
  rawPath.centerX = (xMax + xMin) / 2;
  rawPath.centerY = (yMax + yMin) / 2;
  rawPath.left = xMin;
  rawPath.width = xMax - xMin;
  rawPath.top = yMin;
  rawPath.height = yMax - yMin;
  return rawPath.size = (xMax - xMin) * (yMax - yMin);
};
var _sortByComplexity = function _sortByComplexity2(a, b) {
  return b.length - a.length;
};
var _sortBySize = function _sortBySize2(a, b) {
  var sizeA = a.size || _getSize(a), sizeB = b.size || _getSize(b);
  return Math.abs(sizeB - sizeA) < (sizeA + sizeB) / 20 ? b.centerX - a.centerX || b.centerY - a.centerY : sizeB - sizeA;
};
var _offsetSegment = function _offsetSegment2(segment, shapeIndex) {
  var a = segment.slice(0), l = segment.length, wrap = l - 2, i, index;
  shapeIndex = shapeIndex | 0;
  for (i = 0; i < l; i++) {
    index = (i + shapeIndex) % wrap;
    segment[i++] = a[index];
    segment[i] = a[index + 1];
  }
};
var _getTotalMovement = function _getTotalMovement2(sb, eb, shapeIndex, offsetX, offsetY) {
  var l = sb.length, d = 0, wrap = l - 2, index, i, x, y;
  shapeIndex *= 6;
  for (i = 0; i < l; i += 6) {
    index = (i + shapeIndex) % wrap;
    y = sb[index] - (eb[i] - offsetX);
    x = sb[index + 1] - (eb[i + 1] - offsetY);
    d += _sqrt(x * x + y * y);
  }
  return d;
};
var _getClosestShapeIndex = function _getClosestShapeIndex2(sb, eb, checkReverse) {
  var l = sb.length, sCenter = _getAverageXY(sb), eCenter = _getAverageXY(eb), offsetX = eCenter[0] - sCenter[0], offsetY = eCenter[1] - sCenter[1], min = _getTotalMovement(sb, eb, 0, offsetX, offsetY), minIndex = 0, copy, d, i;
  for (i = 6; i < l; i += 6) {
    d = _getTotalMovement(sb, eb, i / 6, offsetX, offsetY);
    if (d < min) {
      min = d;
      minIndex = i;
    }
  }
  if (checkReverse) {
    copy = sb.slice(0);
    reverseSegment(copy);
    for (i = 6; i < l; i += 6) {
      d = _getTotalMovement(copy, eb, i / 6, offsetX, offsetY);
      if (d < min) {
        min = d;
        minIndex = -i;
      }
    }
  }
  return minIndex / 6;
};
var _getClosestAnchor = function _getClosestAnchor2(rawPath, x, y) {
  var j = rawPath.length, closestDistance = _bigNum, closestX = 0, closestY = 0, segment, dx, dy, d, i, l;
  while (--j > -1) {
    segment = rawPath[j];
    l = segment.length;
    for (i = 0; i < l; i += 6) {
      dx = segment[i] - x;
      dy = segment[i + 1] - y;
      d = _sqrt(dx * dx + dy * dy);
      if (d < closestDistance) {
        closestDistance = d;
        closestX = segment[i];
        closestY = segment[i + 1];
      }
    }
  }
  return [closestX, closestY];
};
var _getClosestSegment = function _getClosestSegment2(bezier, pool, startIndex, sortRatio, offsetX, offsetY) {
  var l = pool.length, index = 0, minSize = Math.min(bezier.size || _getSize(bezier), pool[startIndex].size || _getSize(pool[startIndex])) * sortRatio, min = _bigNum, cx = bezier.centerX + offsetX, cy = bezier.centerY + offsetY, size, i, dx, dy, d;
  for (i = startIndex; i < l; i++) {
    size = pool[i].size || _getSize(pool[i]);
    if (size < minSize) {
      break;
    }
    dx = pool[i].centerX - cx;
    dy = pool[i].centerY - cy;
    d = _sqrt(dx * dx + dy * dy);
    if (d < min) {
      index = i;
      min = d;
    }
  }
  d = pool[index];
  pool.splice(index, 1);
  return d;
};
var _addAnchorsToBezier = function _addAnchorsToBezier2(segment, i, quantity) {
  if (quantity === void 0) {
    quantity = 1;
  }
  var ax = segment[i], ay = segment[i + 1], cp1x = segment[i + 2], cp1y = segment[i + 3], cp2x = segment[i + 4], cp2y = segment[i + 5], bx = segment[i + 6], by = segment[i + 7], t, x1a, x2, y1a, y2, x1, y1, x2a, y2a;
  while (quantity-- > 0) {
    t = 1 - 1 / (quantity + 2);
    x1a = ax + (cp1x - ax) * t;
    x2 = cp1x + (cp2x - cp1x) * t;
    y1a = ay + (cp1y - ay) * t;
    y2 = cp1y + (cp2y - cp1y) * t;
    x1 = x1a + (x2 - x1a) * t;
    y1 = y1a + (y2 - y1a) * t;
    x2a = cp2x + (bx - cp2x) * t;
    y2a = cp2y + (by - cp2y) * t;
    x2 += (x2a - x2) * t;
    y2 += (y2a - y2) * t;
    segment.splice(
      i + 2,
      4,
      cp1x = _round(x1a),
      // first control point
      cp1y = _round(y1a),
      cp2x = _round(x1),
      // second control point
      cp2y = _round(y1),
      bx = _round(x1 + (x2 - x1) * t),
      // new fabricated anchor
      by = _round(y1 + (y2 - y1) * t),
      _round(x2),
      // third control point
      _round(y2),
      _round(x2a),
      // fourth control point
      _round(y2a)
    );
  }
};
var _getLargestIndex = function _getLargestIndex2(a) {
  var i = a.length, max = -_bigNum, largestIndex;
  while (i--) {
    if (a[i] > max) {
      max = a[i];
      largestIndex = i;
    }
  }
  return largestIndex;
};
var _subdivideSegmentQty = function _subdivideSegmentQty2(segment, quantity) {
  var distances = [], anchorsToAdd = [], l = segment.length - 2, i = 0;
  for (; i < l; i += 6) {
    distances.push(Math.pow(segment[i] - segment[i + 6], 2) + Math.pow(segment[i + 1] - segment[i + 7], 2));
  }
  while (quantity--) {
    i = _getLargestIndex(distances);
    anchorsToAdd[i] = l = (anchorsToAdd[i] || 0) + 1;
    distances[i] *= l / (l + 1);
  }
  i = distances.length;
  while (i--) {
    anchorsToAdd[i] && _addAnchorsToBezier(segment, i * 6, anchorsToAdd[i]);
  }
};
var _getDefaultSmoothPoints = function _getDefaultSmoothPoints2(rawPath, skipMeasure) {
  skipMeasure || cacheRawPathMeasurements(rawPath);
  return Math.max(4, Math.round(rawPath.totalLength / 4));
};
var _cloneAndSortRawPath = function _cloneAndSortRawPath2(ar) {
  return ar.slice(0).sort(_sortByComplexity);
};
var _segmentCanBeIgnored = function _segmentCanBeIgnored2(segment) {
  var x = segment[0], y = segment[1], i = 2;
  for (; i < segment.length; i += 2) {
    if (Math.abs(segment[i] - x) > 0.01 || Math.abs(segment[i + 1] - y) > 0.01) {
      return false;
    }
  }
  return true;
};
var _smoothRawPath = function _smoothRawPath2(rawPath, config) {
  config = config || {};
  var _config = config, redraw = _config.redraw, points = _config.points, _config$maxSegments = _config.maxSegments, maxSegments = _config$maxSegments === void 0 ? 999 : _config$maxSegments, pointsAdded = 0, sortedRawPath = rawPath, templateRawPath = Array.isArray(points) ? points : 0, segmentPointsToAdd, j, segment, smoothSegment, anchorDistance;
  redraw = redraw !== false;
  if (redraw) {
    cacheRawPathMeasurements(rawPath);
  } else {
    rawPath.totalPoints = 0;
    j = rawPath.length;
    while (j--) {
      rawPath.totalPoints += rawPath[j].length;
    }
  }
  if (templateRawPath) {
    sortedRawPath = _cloneAndSortRawPath(rawPath);
    templateRawPath = _cloneAndSortRawPath(templateRawPath);
    anchorDistance = templateRawPath[0].totalLength / Math.round(templateRawPath[0].length / 6);
  } else {
    if (!points || points === "auto") {
      points = _getDefaultSmoothPoints(rawPath, redraw);
      redraw || (points -= Math.round(rawPath.totalPoints / 6));
    }
    points = Math.max(redraw ? 10 : 4, Math.min(999, points));
  }
  for (j = 0; j < sortedRawPath.length; j++) {
    segment = sortedRawPath[j];
    segmentPointsToAdd = Math.max(redraw ? 10 : 4, templateRawPath ? Math.round(templateRawPath[j] ? templateRawPath[j].length / 6 : sortedRawPath[j].totalLength / anchorDistance || 0) : Math.round((pointsAdded / points + (redraw ? segment.totalLength / rawPath.totalLength : segment.length / rawPath.totalPoints)) * points) - pointsAdded);
    if (j >= maxSegments || templateRawPath && (!templateRawPath[j] || _segmentCanBeIgnored(templateRawPath[j]))) {
    } else if (redraw) {
      var _segment;
      smoothSegment = pointsToSegment(segmentToDistributedPoints(segment, segmentPointsToAdd), config.curviness);
      segment.length = 0;
      (_segment = segment).push.apply(_segment, smoothSegment);
    } else {
      _subdivideSegmentQty(segment, segmentPointsToAdd);
    }
    pointsAdded += segmentPointsToAdd;
  }
  return rawPath;
};
var _equalizeSegmentQuantity = function _equalizeSegmentQuantity2(start, end, shapeIndex, map, fillSafe) {
  var dif = end.length - start.length, longer = dif > 0 ? end : start, shorter = dif > 0 ? start : end, added = 0, sortMethod = map === "complexity" ? _sortByComplexity : _sortBySize, sortRatio = map === "position" ? 0 : typeof map === "number" ? map : 0.8, i = shorter.length, shapeIndices = typeof shapeIndex === "object" && shapeIndex.push ? shapeIndex.slice(0) : [shapeIndex], reverse = shapeIndices[0] === "reverse" || shapeIndices[0] < 0, log = shapeIndex === "log", eb, sb, b, x, y, offsetX, offsetY;
  if (!shorter[0]) {
    return;
  }
  if (longer.length > 1) {
    start.sort(sortMethod);
    end.sort(sortMethod);
    longer.size || _getTotalSize(longer);
    shorter.size || _getTotalSize(shorter);
    offsetX = longer.centerX - shorter.centerX;
    offsetY = longer.centerY - shorter.centerY;
    if (sortMethod === _sortBySize) {
      for (i = 0; i < shorter.length; i++) {
        longer.splice(i, 0, _getClosestSegment(shorter[i], longer, i, sortRatio, offsetX, offsetY));
      }
    }
  }
  if (dif) {
    dif < 0 && (dif = -dif);
    longer[0].length > shorter[0].length && _subdivideSegmentQty(shorter[0], (longer[0].length - shorter[0].length) / 6 | 0);
    i = shorter.length;
    while (added < dif) {
      x = longer[i].size || _getSize(longer[i]);
      b = _getClosestAnchor(shorter, longer[i].centerX, longer[i].centerY);
      x = b[0];
      y = b[1];
      shorter[i++] = [x, y, x, y, x, y, x, y];
      shorter.totalPoints += 8;
      added++;
    }
  }
  for (i = 0; i < start.length; i++) {
    eb = end[i];
    sb = start[i];
    dif = eb.length - sb.length;
    if (dif < 0) {
      _subdivideSegmentQty(eb, -dif / 6 | 0);
    } else if (dif > 0) {
      _subdivideSegmentQty(sb, dif / 6 | 0);
    }
    if (reverse && fillSafe !== false && !sb.reversed) {
      reverseSegment(sb);
    }
    shapeIndex = shapeIndices[i] || shapeIndices[i] === 0 ? shapeIndices[i] : "auto";
    if (shapeIndex) {
      if (sb.closed || Math.abs(sb[0] - sb[sb.length - 2]) < 0.5 && Math.abs(sb[1] - sb[sb.length - 1]) < 0.5) {
        if (shapeIndex === "auto" || shapeIndex === "log") {
          shapeIndices[i] = shapeIndex = _getClosestShapeIndex(sb, eb, !i || fillSafe === false);
          if (shapeIndex < 0) {
            reverse = true;
            reverseSegment(sb);
            shapeIndex = -shapeIndex;
          }
          _offsetSegment(sb, shapeIndex * 6);
        } else if (shapeIndex !== "reverse") {
          if (i && shapeIndex < 0) {
            reverseSegment(sb);
          }
          _offsetSegment(sb, (shapeIndex < 0 ? -shapeIndex : shapeIndex) * 6);
        }
      } else if (!reverse && (shapeIndex === "auto" && Math.abs(eb[0] - sb[0]) + Math.abs(eb[1] - sb[1]) + Math.abs(eb[eb.length - 2] - sb[sb.length - 2]) + Math.abs(eb[eb.length - 1] - sb[sb.length - 1]) > Math.abs(eb[0] - sb[sb.length - 2]) + Math.abs(eb[1] - sb[sb.length - 1]) + Math.abs(eb[eb.length - 2] - sb[0]) + Math.abs(eb[eb.length - 1] - sb[1]) || shapeIndex % 2)) {
        reverseSegment(sb);
        shapeIndices[i] = -1;
        reverse = true;
      } else if (shapeIndex === "auto") {
        shapeIndices[i] = 0;
      } else if (shapeIndex === "reverse") {
        shapeIndices[i] = -1;
      }
      if (sb.closed !== eb.closed) {
        sb.closed = eb.closed = false;
      }
    }
  }
  log && _log("shapeIndex:[" + shapeIndices.join(",") + "]");
  start.shapeIndex = shapeIndices;
  return shapeIndices;
};
var _pathFilter = function _pathFilter2(a, shapeIndex, map, precompile, fillSafe) {
  var start = stringToRawPath(a[0]), end = stringToRawPath(a[1]);
  if (!_equalizeSegmentQuantity(start, end, shapeIndex || shapeIndex === 0 ? shapeIndex : "auto", map, fillSafe)) {
    return;
  }
  a[0] = rawPathToString(start);
  a[1] = rawPathToString(end);
  (precompile === "log" || precompile === true) && _log('precompile:["' + a[0] + '","' + a[1] + '"]');
};
var _offsetPoints = function _offsetPoints2(text, offset) {
  if (!offset) {
    return text;
  }
  var a = text.match(_numExp) || [], l = a.length, s = "", inc, i, j;
  if (offset === "reverse") {
    i = l - 1;
    inc = -2;
  } else {
    i = ((parseInt(offset, 10) || 0) * 2 + 1 + l * 100) % l;
    inc = 2;
  }
  for (j = 0; j < l; j += 2) {
    s += a[i - 1] + "," + a[i] + " ";
    i = (i + inc) % l;
  }
  return s;
};
var _equalizePointQuantity = function _equalizePointQuantity2(a, quantity) {
  var tally = 0, x = parseFloat(a[0]), y = parseFloat(a[1]), s = x + "," + y + " ", max = 0.999999, newPointsPerSegment, i, l, j, factor, nextX, nextY;
  l = a.length;
  newPointsPerSegment = quantity * 0.5 / (l * 0.5 - 1);
  for (i = 0; i < l - 2; i += 2) {
    tally += newPointsPerSegment;
    nextX = parseFloat(a[i + 2]);
    nextY = parseFloat(a[i + 3]);
    if (tally > max) {
      factor = 1 / (Math.floor(tally) + 1);
      j = 1;
      while (tally > max) {
        s += (x + (nextX - x) * factor * j).toFixed(2) + "," + (y + (nextY - y) * factor * j).toFixed(2) + " ";
        tally--;
        j++;
      }
    }
    s += nextX + "," + nextY + " ";
    x = nextX;
    y = nextY;
  }
  return s;
};
var _pointsFilter = function _pointsFilter2(a) {
  var startNums = a[0].match(_numExp) || [], endNums = a[1].match(_numExp) || [], dif = endNums.length - startNums.length;
  if (dif > 0) {
    a[0] = _equalizePointQuantity(startNums, dif);
  } else {
    a[1] = _equalizePointQuantity(endNums, -dif);
  }
};
var _buildPointsFilter = function _buildPointsFilter2(shapeIndex) {
  return !isNaN(shapeIndex) ? function(a) {
    _pointsFilter(a);
    a[1] = _offsetPoints(a[1], parseInt(shapeIndex, 10));
  } : _pointsFilter;
};
var _parseShape = function _parseShape2(shape, forcePath, target) {
  var isString = typeof shape === "string", e, type;
  if (!isString || _selectorExp.test(shape) || (shape.match(_numExp) || []).length < 3) {
    e = _toArray(shape)[0];
    if (e) {
      type = (e.nodeName + "").toUpperCase();
      if (forcePath && type !== "PATH") {
        e = convertToPath(e, false);
        type = "PATH";
      }
      shape = e.getAttribute(type === "PATH" ? "d" : "points") || "";
      if (e === target) {
        shape = e.getAttributeNS(null, "data-original") || shape;
      }
    } else {
      _log("WARNING: invalid morph to: " + shape);
      shape = false;
    }
  }
  return shape;
};
var _recordControlPointData = function _recordControlPointData2(rawPath) {
  var j = rawPath.length, segment, x, y, x2, y2, i, l, cpData;
  while (--j > -1) {
    segment = rawPath[j];
    cpData = segment.cpData = segment.cpData || [];
    cpData.length = 0;
    l = segment.length - 2;
    for (i = 0; i < l; i += 6) {
      x = segment[i] - segment[i + 2];
      y = segment[i + 1] - segment[i + 3];
      x2 = segment[i + 6] - segment[i + 4];
      y2 = segment[i + 7] - segment[i + 5];
      cpData[i + 2] = _atan2(y, x);
      cpData[i + 3] = _sqrt(x * x + y * y);
      cpData[i + 4] = _atan2(y2, x2);
      cpData[i + 5] = _sqrt(x2 * x2 + y2 * y2);
    }
  }
  return rawPath;
};
var _parseOriginFactors = function _parseOriginFactors2(v) {
  var a = v.trim().split(" "), x = ~v.indexOf("left") ? 0 : ~v.indexOf("right") ? 100 : isNaN(parseFloat(a[0])) ? 50 : parseFloat(a[0]), y = ~v.indexOf("top") ? 0 : ~v.indexOf("bottom") ? 100 : isNaN(parseFloat(a[1])) ? 50 : parseFloat(a[1]);
  return {
    x: x / 100,
    y: y / 100
  };
};
var _shortAngle = function _shortAngle2(dif) {
  return dif !== dif % _PI ? dif + (dif < 0 ? _2PI : -_2PI) : dif;
};
var _morphMessage = "Use MorphSVGPlugin.convertToPath() to convert to a path before morphing.";
var _tweenRotation = function _tweenRotation2(start, end, i, linkedPT) {
  var so = this._origin, eo = this._eOrigin, dx = start[i] - so.x, dy = start[i + 1] - so.y, d = _sqrt(dx * dx + dy * dy), sa = _atan2(dy, dx), angleDif, _short;
  dx = end[i] - eo.x;
  dy = end[i + 1] - eo.y;
  angleDif = _atan2(dy, dx) - sa;
  _short = _shortAngle(angleDif);
  if (!linkedPT && _lastLinkedAnchor && Math.abs(_short + _lastLinkedAnchor.ca) < _angleMin) {
    linkedPT = _lastLinkedAnchor;
  }
  return this._anchorPT = _lastLinkedAnchor = {
    _next: this._anchorPT,
    t: start,
    sa,
    // starting angle
    ca: linkedPT && _short * linkedPT.ca < 0 && Math.abs(_short) > _angleMax ? angleDif : _short,
    //change in angle
    sl: d,
    // starting length
    cl: _sqrt(dx * dx + dy * dy) - d,
    // change in length
    i
  };
};
var _initCore = function _initCore2(required) {
  gsap = _getGSAP();
  PluginClass = PluginClass || gsap && gsap.plugins.morphSVG;
  if (gsap && PluginClass) {
    _toArray = gsap.utils.toArray;
    _reverting = gsap.core.reverting || function() {
    };
    _doc = document;
    PluginClass.prototype._tweenRotation = _tweenRotation;
    _coreInitted = 1;
  } else if (required) {
    _log("Please gsap.registerPlugin(MorphSVGPlugin)");
  }
};
var MorphSVGPlugin = {
  version: "3.15.0",
  name: "morphSVG",
  rawVars: 1,
  // otherwise "render" would be interpreted as a function-based value.
  register: function register(core, Plugin) {
    gsap = core;
    PluginClass = Plugin;
    _initCore();
  },
  init: function init(target, value, tween, index, targets) {
    _coreInitted || _initCore(1);
    if (!value) {
      _log("invalid shape");
      return false;
    }
    _isFunction(value) && (value = value.call(tween, index, target, targets));
    var type, p, pt, shape, isPoly, shapeIndex, map, startCPData, endCPData, start, end, i, j, l, startSeg, endSeg, precompiled, originFactors, useRotation, curveMode;
    if (typeof value === "string" || value.getBBox || value[0]) {
      value = {
        shape: value
      };
    } else if (typeof value === "object") {
      type = {};
      for (p in value) {
        type[p] = _isFunction(value[p]) && p !== "render" ? value[p].call(tween, index, target, targets) : value[p];
      }
      value = type;
    }
    var cs = target.nodeType ? window.getComputedStyle(target) : {}, fill = cs.fill + "", fillSafe = !(fill === "none" || (fill.match(_numExp) || [])[3] === "0" || cs.fillRule === "evenodd"), smooth = value.smooth, origins = (value.origin || "50 50").split(",");
    smooth === true || smooth === "auto" ? smooth = {} : typeof smooth === "number" && (smooth = {
      points: smooth
    });
    type = (target.nodeName + "").toUpperCase();
    isPoly = type === "POLYLINE" || type === "POLYGON";
    if (type !== "PATH" && !isPoly && !value.prop) {
      _log("Cannot morph a <" + type + "> element. " + _morphMessage);
      return false;
    }
    p = type === "PATH" ? "d" : "points";
    if (!value.prop && !_isFunction(target.setAttribute)) {
      return false;
    }
    shape = _parseShape(value.shape || value.d || value.points || "", p === "d", target);
    if (isPoly && _commands.test(shape)) {
      _log("A <" + type + "> cannot accept path data. " + _morphMessage);
      return false;
    }
    shapeIndex = value.shapeIndex || value.shapeIndex === 0 ? value.shapeIndex : "auto";
    map = value.map || MorphSVGPlugin.defaultMap;
    this._prop = value.prop;
    this._render = value.render || MorphSVGPlugin.defaultRender;
    this._apply = "updateTarget" in value ? value.updateTarget : MorphSVGPlugin.defaultUpdateTarget;
    this._rnd = Math.pow(10, isNaN(value.precision) ? 2 : +value.precision);
    this._tween = tween;
    if (shape) {
      this._target = target;
      precompiled = typeof value.precompile === "object";
      start = this._original = this._prop ? target[this._prop] : target.getAttribute(p);
      if (!this._prop && !target.getAttributeNS(null, "data-original")) {
        target.setAttributeNS(null, "data-original", start);
      }
      if (p === "d" || this._prop) {
        start = stringToRawPath(precompiled ? value.precompile[0] : start);
        end = stringToRawPath(precompiled ? value.precompile[1] : shape);
        if (smooth) {
          j = start.length;
          while (--j) {
            _segmentCanBeIgnored(start[j]) && start.splice(j, 1);
          }
          _smoothRawPath(start, _extends({}, smooth, {
            points: +smooth.points || Math.max(_getDefaultSmoothPoints(start), _getDefaultSmoothPoints(end)),
            maxSegments: end.length
          }));
          _smoothRawPath(end, smooth.redraw === false ? smooth : _extends({}, smooth, {
            points: start
          }));
        }
        if (!precompiled && !_equalizeSegmentQuantity(start, end, shapeIndex, map, fillSafe)) {
          return false;
        }
        if (value.precompile === "log" || value.precompile === true) {
          _log('precompile:["' + rawPathToString(start) + '","' + rawPathToString(end) + '"]');
        }
        useRotation = (value.type || MorphSVGPlugin.defaultType) !== "linear";
        curveMode = value.curveMode || useRotation;
        _recordControlPointData(start);
        _recordControlPointData(end);
        if (useRotation) {
          start.size || _getTotalSize(start);
          end.size || _getTotalSize(end);
          originFactors = _parseOriginFactors(origins[0]);
          this._origin = start.origin = {
            x: start.left + originFactors.x * start.width,
            y: start.top + originFactors.y * start.height
          };
          origins[1] && (originFactors = _parseOriginFactors(origins[1]));
          this._eOrigin = {
            x: end.left + originFactors.x * end.width,
            y: end.top + originFactors.y * end.height
          };
        }
        this._rawPath = target._gsRawPath = start;
        j = start.length;
        while (--j > -1) {
          startSeg = start[j];
          endSeg = end[j];
          startCPData = startSeg.cpData;
          endCPData = endSeg.cpData;
          l = startSeg.length;
          _lastLinkedAnchor = 0;
          for (i = 0; i < l; i += 6) {
            if (endSeg[i] !== startSeg[i] || endSeg[i + 1] !== startSeg[i + 1]) {
              if (useRotation) {
                pt = this._tweenRotation(startSeg, endSeg, i);
              } else {
                pt = this.add(startSeg, i, startSeg[i], endSeg[i], 0, 0, 0, 0, 0, 1);
                pt = this.add(startSeg, i + 1, startSeg[i + 1], endSeg[i + 1], 0, 0, 0, 0, 0, 1) || pt;
              }
            }
          }
          for (i = 0; i < l; i += 2) {
            if (curveMode && (startCPData[i] !== endCPData[i] || startCPData[i + 1] !== endCPData[i + 1]) && startCPData[i + 1] && endCPData[i + 1]) {
              this._controlPT = {
                _next: this._controlPT,
                i,
                j,
                ai: i % 6 > 3 ? i + 2 : i - 2,
                sa: startCPData[i],
                ca: _shortAngle(endCPData[i] - startCPData[i]),
                sl: startCPData[i + 1],
                cl: endCPData[i + 1] - startCPData[i + 1]
              };
            } else {
              endSeg[i] !== startSeg[i] && (pt = this.add(startSeg, i, startSeg[i], endSeg[i], 0, 0, 0, 0, 0, 1));
              endSeg[i + 1] !== startSeg[i + 1] && (pt = this.add(startSeg, i + 1, startSeg[i + 1], endSeg[i + 1], 0, 0, 0, 0, 0, 1) || pt);
            }
          }
        }
      } else {
        pt = this.add(target, "setAttribute", target.getAttribute(p) + "", shape + "", index, targets, 0, _buildPointsFilter(shapeIndex), p);
      }
      if (useRotation) {
        this.add(this._origin, "x", this._origin.x, this._eOrigin.x, 0, 0, 0, 0, 0, 1);
        pt = this.add(this._origin, "y", this._origin.y, this._eOrigin.y, 0, 0, 0, 0, 0, 1);
      }
      if (pt) {
        this._props.push("morphSVG");
        pt.end = smooth && smooth.persist !== false ? rawPathToString(end) : shape;
        pt.endProp = p;
      }
    }
    return 1;
  },
  render: function render(ratio, data) {
    var rawPath = data._rawPath, controlPT = data._controlPT, anchorPT = data._anchorPT, rnd = data._rnd, target = data._target, pt = data._pt, s, space, segment, l, angle, i, j, sin, cos;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
    if (ratio === 1 && data._apply) {
      pt = data._pt;
      while (pt) {
        if (pt.end) {
          if (data._prop) {
            target[data._prop] = pt.end;
          } else {
            target.setAttribute(pt.endProp, pt.end);
          }
        }
        pt = pt._next;
      }
    } else if (rawPath) {
      while (anchorPT) {
        angle = anchorPT.sa + ratio * anchorPT.ca;
        l = anchorPT.sl + ratio * anchorPT.cl;
        anchorPT.t[anchorPT.i] = data._origin.x + _cos(angle) * l;
        anchorPT.t[anchorPT.i + 1] = data._origin.y + _sin(angle) * l;
        anchorPT = anchorPT._next;
      }
      while (controlPT) {
        segment = rawPath[controlPT.j];
        i = controlPT.i;
        angle = controlPT.sa + ratio * controlPT.ca;
        sin = _sin(angle);
        cos = _cos(angle);
        l = controlPT.sl + ratio * controlPT.cl;
        segment[i] = segment[controlPT.ai] - cos * l;
        segment[i + 1] = segment[controlPT.ai + 1] - sin * l;
        controlPT = controlPT._next;
      }
      if (!ratio && _reverting()) {
        rawPath = stringToRawPath(data._original);
      }
      target._gsRawPath = rawPath;
      if (data._apply) {
        s = "";
        space = " ";
        for (j = 0; j < rawPath.length; j++) {
          segment = rawPath[j];
          l = segment.length;
          s += "M" + (segment[0] * rnd | 0) / rnd + space + (segment[1] * rnd | 0) / rnd + " C";
          for (i = 2; i < l; i++) {
            s += (segment[i] * rnd | 0) / rnd + space;
          }
          segment.closed && (s += "z");
        }
        if (data._prop) {
          target[data._prop] = s;
        } else {
          target.setAttribute("d", s);
        }
      }
    }
    data._render && rawPath && data._render.call(data._tween, rawPath, target);
  },
  kill: function kill(property) {
    this._pt = this._rawPath = 0;
  },
  getRawPath,
  stringToRawPath,
  rawPathToString,
  smoothRawPath: _smoothRawPath,
  normalizeStrings: function normalizeStrings(shape1, shape2, _ref) {
    var shapeIndex = _ref.shapeIndex, map = _ref.map;
    var result = [shape1, shape2];
    _pathFilter(result, shapeIndex, map);
    return result;
  },
  pathFilter: _pathFilter,
  pointsFilter: _pointsFilter,
  getTotalSize: _getTotalSize,
  equalizeSegmentQuantity: _equalizeSegmentQuantity,
  convertToPath: function convertToPath2(targets, swap) {
    return _toArray(targets).map(function(target) {
      return convertToPath(target, swap !== false);
    });
  },
  defaultType: "linear",
  defaultUpdateTarget: true,
  defaultMap: "size"
};
_getGSAP() && gsap.registerPlugin(MorphSVGPlugin);
export {
  MorphSVGPlugin,
  MorphSVGPlugin as default
};
/*! Bundled license information:

gsap/MorphSVGPlugin.js:
  (*!
   * MorphSVGPlugin 3.15.0
   * https://gsap.com
   *
   * @license Copyright 2008-2026, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)
*/
//# sourceMappingURL=gsap_MorphSVGPlugin.js.map
