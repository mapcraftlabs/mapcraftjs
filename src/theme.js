import d3 from 'd3';
import _ from 'underscore';


export class Theme {

    _interpolate (tc, vals) {

        var scale;

        // force to float
        vals = vals.map((v) => +v);

        // get min and max
        var e = d3.extent(vals);
        var min = e[0], max = e[1];

        scale = d3.scale
            .linear()
            .domain(e)
            .range(tc.interpolate);

        // build some intervals in the interpolation range for
        // use in the legend
        var legendDomain = _.range(min, max, (max-min)/5.0);
        legendDomain.push(max); // push the max too

        this.legendParams  = {
            dontFormatLegend: tc.dontFormatLegend,
            grades: legendDomain,
            colors: legendDomain.map(a => scale(a)),
            heading: tc.legendName
        };

        return scale;
    }

    _categorical (tc, vals) {

        var scale = function (v) {
            return tc.categorical[v];
        }

        var keys = tc.legendKeys || _.keys(tc.categorical);

        this.legendParams = {
            dontFormatLegend: tc.dontFormatLegend,
            grades: keys,
            colors: keys.map(k => tc.categorical[k]),
            heading: tc.legendName
        };

        return scale;
    }

    // create theme object from a javascript config onject
    // and a vector of data - the return object is useful to
    // pass to getStyle below

    constructor (themeConfig, vals) {

        const tc = themeConfig;

        var scale;

        if(tc.interpolate) { // interpolate between two colors

            scale = this._interpolate(themeConfig, vals);

        } else if (tc.categorical) {

            scale = this._categorical(themeConfig, vals);

        } else {

            throw Error('Theme type not supported');
        }

        this.theme = tc;
        this.scale = scale;
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