'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Theme = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _colorbrewer = require('colorbrewer');

var _colorbrewer2 = _interopRequireDefault(_colorbrewer);

var _simpleStatistics = require('simple-statistics');

var _simpleStatistics2 = _interopRequireDefault(_simpleStatistics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Theme = exports.Theme = function () {
    _createClass(Theme, [{
        key: '_linear',
        value: function _linear(tc, vals) {

            // force to float
            vals = vals.map(function (v) {
                return +v;
            });

            // get min and max
            var e = _d2.default.extent(vals);
            var min = e[0],
                max = e[1];

            var colors = tc.interpolate || [_colorbrewer2.default[tc.colorScheme][3][0], _colorbrewer2.default[tc.colorScheme][3][2]];

            if (tc.middleValue != undefined && colors.length == 2 || colors.length == 3 && tc.middleValue == undefined) throw Error('For 3-way interpolation, must include middle value attributes to add between min and max.');

            // preparing for 3-way interpolation
            e = tc.middleValue != undefined ? [e[0], tc.middleValue, e[1]] : e;

            var scale = _d2.default.scale.linear().domain(e).range(colors);

            // build some intervals in the interpolation range for
            // use in the legend
            var legendDomain = _underscore2.default.range(min, max, (max - min) / 5.0);
            legendDomain.push(max); // push the max too

            this.legendParams = {
                grades: legendDomain,
                colors: legendDomain.map(function (a) {
                    return scale(a);
                })
            };

            return scale;
        }
    }, {
        key: '_manual',
        value: function _manual(tc) {

            var breaks = tc.breaks,
                numBins = breaks.length + 1;

            numBins = Math.max(3, Math.min(numBins, 9));

            var colors = _colorbrewer2.default[tc.colorScheme][numBins];

            var scale = _d2.default.scale.threshold().domain(breaks).range(colors);

            var grades = scale.range().map(function (grade) {
                return scale.invertExtent(grade).join('-');
            });

            this.legendParams = {
                grades: grades,
                colors: colors
            };

            return scale;
        }
    }, {
        key: '_jenks',
        value: function _jenks(tc, vals) {

            // force to float
            vals = vals.map(function (v) {
                return +v;
            });

            var breaks = _simpleStatistics2.default.ckmeans(vals, tc.numBins);

            breaks = breaks.map(function (vals) {
                return vals[0];
            }).splice(1);

            return this._manual(_underscore2.default.extend({}, tc, {
                breaks: breaks,
                numBins: breaks.length + 1
            }), vals);
        }
    }, {
        key: '_quantile',
        value: function _quantile(tc, vals) {

            // force to float
            vals = vals.map(function (v) {
                return +v;
            });

            var colors = _colorbrewer2.default[tc.colorScheme][tc.numBins];

            var scale = _d2.default.scale.quantile().domain(vals).range(colors);

            var grades = scale.range().map(function (grade) {
                return scale.invertExtent(grade).join('-');
            });

            this.legendParams = {
                grades: grades,
                colors: colors
            };

            return scale;
        }
    }, {
        key: '_categorical',
        value: function _categorical(tc) {

            var scale = function scale(v) {
                return tc.categories[v];
            };

            var keys = tc.legendKeys || _underscore2.default.keys(tc.categories);

            this.legendParams = {
                grades: keys,
                colors: keys.map(function (k) {
                    return tc.categories[k];
                })
            };

            return scale;
        }

        // create theme object from a javascript config onject
        // and a vector of data - the return object is useful to
        // pass to getStyle below

    }]);

    function Theme(themeConfig, vals) {
        _classCallCheck(this, Theme);

        var tc = themeConfig;

        var scale;

        if (tc.scaleType == 'linear') {

            scale = this._linear(themeConfig, vals);
        } else if (tc.scaleType == 'manual') {

            scale = this._manual(themeConfig);
        } else if (tc.scaleType == 'quantile') {

            scale = this._quantile(themeConfig, vals);
        } else if (tc.scaleType == 'categorical') {

            scale = this._categorical(themeConfig);
        } else if (tc.scaleType == 'jenks') {

            scale = this._jenks(themeConfig, vals);
        } else {

            throw Error('Theme type not supported');
        }

        this.theme = tc;
        this.scale = scale;
    }

    _createClass(Theme, [{
        key: 'getLegendParams',
        value: function getLegendParams() {
            return _underscore2.default.extend({}, this.legendParams, {
                heading: this.theme.legendName,
                dontFormatLegend: this.theme.dontFormatLegend
            });
        }

        // for use e.g. with setting radius on a circle

    }, {
        key: 'getScaledVal',
        value: function getScaledVal(v) {
            return this.scale(v);
        }
    }, {
        key: 'getStyle',
        value: function getStyle(v) {

            var tc = this.theme;
            var scale = this.scale;

            function isNan(v) {
                return v == undefined || Number.isNaN(v) || !scale(v) || v == tc.setToNan;
            }

            // style object to return at the end
            var style = {
                weight: tc.weight,
                fillColor: scale(v),
                fillOpacity: isNan(v) ? 0 : tc.opacity,
                color: tc.outlineColor
            };

            return style;
        }
    }]);

    return Theme;
}();