import d3 from 'd3';
import _ from 'lodash';
import colorbrewer from 'colorbrewer';
import ss from 'simple-statistics';

const hashStr = (str, mod) => {
  let hash = 0, i, chr;
  if (str === undefined || str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash % mod;
};


export class Theme {

    _linear (tc, vals) {

        // force to float
        vals = vals.map((v) => +v);

        // get min and max
        var e = d3.extent(vals);
        var min = e[0], max = e[1];

        var colors = tc.interpolate || 
            [colorbrewer[tc.colorScheme][3][0],
             colorbrewer[tc.colorScheme][3][2]];

        if((tc.middleValue != undefined && colors.length == 2) ||
           (colors.length == 3 && tc.middleValue == undefined))
                throw Error('For 3-way interpolation, must include middle value attributes to add between min and max.');

        // preparing for 3-way interpolation
        e = tc.middleValue != undefined ? [e[0], tc.middleValue, e[1]] : e;

        var scale = d3.scale
            .linear()
            .domain(e)
            .range(colors);

        // build some intervals in the interpolation range for
        // use in the legend
        var legendDomain = _.range(min, max, (max-min)/5.0);
        legendDomain.push(max); // push the max too

        this.legendParams  = {
            grades: legendDomain,
            colors: legendDomain.map(a => scale(a))
        };

        return scale;
    }

    _manual (tc) {

        var breaks = tc.breaks,
            numBins = breaks.length + 1;

        numBins = Math.max(3, Math.min(numBins, 9));

        var colors = colorbrewer[tc.colorScheme][numBins];

        var scale = d3.scale
            .threshold()
            .domain(breaks)
            .range(colors);

        var grades = scale.range().map(grade => 
            scale.invertExtent(grade).join('-')
        );

        this.legendParams  = {
            grades: grades,
            colors: colors
        };

        return scale;
    }

    _jenks (tc, vals) {

        // force to float
        vals = vals.map((v) => +v);

        var breaks = ss.ckmeans(vals, tc.numBins);

        breaks = breaks.map((vals) => vals[0]).splice(1);

        return this._manual(_.extend({}, tc, {
            breaks: breaks,
            numBins: breaks.length + 1
        }), vals);
    }

    _quantile (tc, vals) {

        // force to float
        vals = vals.map((v) => +v);

        var colors = colorbrewer[tc.colorScheme][tc.numBins];

        var scale = d3.scale
            .quantile()
            .domain(vals)
            .range(colors);

        var grades = scale.range().map(grade => 
            scale.invertExtent(grade).join('-')
        );

        this.legendParams  = {
            grades: grades,
            colors: colors
        };

        return scale;
    }

    _categorical (tc) {

        var scale = function (v) {
            return _.get(tc.categories, v, tc.defaultColor);
        }

        var keys = tc.legendKeys || _.keys(tc.categories);

        this.legendParams = {
            grades: keys,
            colors: keys.map(k => tc.categories[k])
        };

        return scale;
    }

    _autocategorical (tc, vals) {

        var keys = _.uniq(vals);
        // drop empties
        keys = _.without(keys, undefined, null, '');

        const colors = d3
            .scale
            .category20()
            .domain(_.range(20));

        // this gives a stable mapping of strings to one of the 20 colors
        // the string xyzABC will always map to the same color no matter which
        // other categories exist, which is useful for many cases.  there can
        // be collisions now, even for fewer than 20 unique values
        const scale = val => colors(hashStr(val, 20));

        this.legendParams = {
            grades: keys,
            colors: keys.map(k => scale(k))
        };

        return scale;
    }

    // create theme object from a javascript config onject
    // and a vector of data - the return object is useful to
    // pass to getStyle below

    constructor (themeConfig, vals) {

        const tc = themeConfig;

        var scale;

        if(tc.scaleType == 'linear') {

            scale = this._linear(themeConfig, vals);

        } else if(tc.scaleType == 'manual') {

            scale = this._manual(themeConfig);

        } else if(tc.scaleType == 'quantile') {

            scale = this._quantile(themeConfig, vals);

        } else if (tc.scaleType == 'categorical') {

            scale = this._categorical(themeConfig);

        } else if (tc.scaleType == 'autocategorical') {

            scale = this._autocategorical(themeConfig, vals);


        } else if (tc.scaleType == 'jenks') {

            scale = this._jenks(themeConfig, vals);

        } else {

            throw Error('Theme type not supported');
        }

        this.theme = tc;
        this.scale = scale;
    }

    getLegendParams () {
        return _.extend({}, this.legendParams, {
            heading: this.theme.legendName,
            dontFormatLegend: this.theme.dontFormatLegend
        });
    }

    // for use e.g. with setting radius on a circle
    getScaledVal (v) {
        return this.scale(v);
    }

    getStyle (v) {

        var tc = this.theme;
        var scale = this.scale;

        function isNan (v) {
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
}
