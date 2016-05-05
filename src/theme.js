import d3 from 'd3';
import _ from 'underscore';
import colorbrewer from 'colorbrewer';


export class Theme {

    _linear (tc, vals) {

        var scale;

        // force to float
        vals = vals.map((v) => +v);

        // get min and max
        var e = d3.extent(vals);
        var min = e[0], max = e[1];

        if((tc.middleValue != undefined && tc.interpolate.length == 2) ||
           (tc.interpolate.length == 3 && tc.middleValue == undefined))
                throw Error('For 3-way interpolation, must include middle value attributes to add between min and max.');

        // preparing for 3-way interpolation
        e = tc.middleValue != undefined ? [e[0], tc.middleValue, e[1]] : e;

        scale = d3.scale
            .linear()
            .domain(e)
            .range(tc.interpolate);

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

    _quantile (tc, vals) {

        var scale;

        // force to float
        vals = vals.map((v) => +v);

        var colors = colorbrewer[tc.colorScheme][tc.numBins];

        scale = d3.scale
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
            return tc.categories[v];
        }

        var keys = tc.legendKeys || _.keys(tc.categories);

        this.legendParams = {
            grades: keys,
            colors: keys.map(k => tc.categories[k])
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

        } else if(tc.scaleType == 'quantile') {

            scale = this._quantile(themeConfig, vals);

        } else if (tc.scaleType == 'categorical') {

            scale = this._categorical(themeConfig);

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