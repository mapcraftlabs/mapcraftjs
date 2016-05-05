import chai from 'chai';
import chaiStats from 'chai-stats';
import _ from 'underscore';
import {Theme} from '../src/index.js'
chai.use(chaiStats);

/* global describe, it */

var expect = chai.expect

describe('theme module', () => {

    const data = _.range(0, 50);
    const config = {
        legendName: 'Fake Data',
        opacity: .9,
        weight: 0,
        outlineColor: '#000000'
    };


    it('should throw an exception', () => {
        expect(() => new Theme(_.extend({}, config, {
            scaleType: undefined
        }), data)).to.throw(Error);
    });


    it('should do a linear theme with 2 colors', () => {

        var theme = new Theme(_.extend({}, config, {
            scaleType: 'linear',
            interpolate: ['#fff5eb', '#7f2704']
        }), data);

        // bottom of the interpolation
        expect(theme.getStyle(0).fillColor).to.equal('#fff5eb');
        // assumes using d3 linear
        expect(theme.getStyle(25).fillColor).to.equal('#be8c75');
        // top of the interpolation
        expect(theme.getStyle(49).fillColor).to.equal('#7f2704');

        expect(theme.legendParams).to.deep.equal({
            grades: [ 0, 9.8, 19.6, 29.400000000000002, 39.2, 49 ],
            colors: [ '#fff5eb', '#e5ccbd', '#cca38f', '#b27960', '#995032', '#7f2704' ] 
        });

        expect(theme.getLegendParams().heading).to.equal(config.legendName);
    });

    it('should do a linear theme with 3 colors', () => {

        // d3 supports an uneven interpolation - e.g. money where
        // zero is significant

        var theme = new Theme(_.extend({}, config, {
            scaleType: 'linear',
            middleValue: 0,
            interpolate: ['#fff5eb', '#ffffff', '#7f2704']
        }), [-5000, 0, 50]);

        // bottom of the interpolation
        expect(theme.getStyle(-5000).fillColor).to.equal('#fff5eb');
        // assumes using d3 linear
        expect(theme.getStyle(0).fillColor).to.equal('#ffffff');
        // top of the interpolation
        expect(theme.getStyle(50).fillColor).to.equal('#7f2704');
    });


    it('should do a quantile theme with 7 colors', () => {

        var theme = new Theme(_.extend({}, config, {
            scaleType: 'quantile',
            colorScheme: 'YlGn',
            numBins: 7
        }), data);

        expect(theme.getStyle(0).fillColor).to.equal('#ffffcc');
        expect(theme.getStyle(8).fillColor).to.equal('#d9f0a3');
        expect(theme.getStyle(25).fillColor).to.equal('#78c679');
        expect(theme.getStyle(49).fillColor).to.equal('#005a32');

        expect(theme.legendParams).to.deep.equal({
            grades: [
                '0-7',
                '7-14',
                '14-21',
                '21-28',
                '28-35',
                '35-42',
                '42-49'
            ], colors: [
                '#ffffcc',
                '#d9f0a3',
                '#addd8e',
                '#78c679',
                '#41ab5d',
                '#238443',
                '#005a32'
            ] 
        });
    });


    it('should have other style attributes', () => {

        var theme = new Theme(_.extend({}, config, {
            scaleType: 'linear',
            interpolate: ['#fff5eb', '#7f2704']
        }), data);

        expect(theme.getStyle(0).weight).to.equal(config.weight);
        expect(theme.getStyle(0).fillOpacity).to.equal(config.opacity);
        expect(theme.getStyle(0).color).to.equal(config.outlineColor);
    });


    it('should work for numbers too', () => {

        var theme = new Theme(_.extend({}, config, {
            scaleType: 'linear',
            interpolate: [0, 1000]
        }), data);

        expect(theme.getScaledVal(0)).to.equal(0);

        expect(theme.getScaledVal(24)).to.be.within(489, 490);
        expect(theme.getScaledVal(49)).to.equal(1000);
    });


    it('should work for categorical theming', () => {

        const categories = {
            'Office': '#ff9999',
            'Hotel': '#ff9933',
            'Retail': '#FF0000',
            'Residential': '#FFFF00',
            'Industrial': '#A020F0',
            'School': '#0000FF',
            'Vacant': '#FFFFFF',
            'Parking': '#666666'
        };

        var theme = new Theme(_.extend({}, config, {
            categories: categories,
            scaleType: 'categorical'
        }), data);

        expect(theme.getStyle('Office').fillColor).to.equal('#ff9999');
        expect(theme.getStyle('School').fillColor).to.equal('#0000FF');

        expect(theme.legendParams).to.deep.equal({
            grades: [
                'Office',
                'Hotel',
                'Retail',
                'Residential',
                'Industrial',
                'School',
                'Vacant',
                'Parking'
            ], colors: [
                '#ff9999',
                '#ff9933',
                '#FF0000',
                '#FFFF00',
                '#A020F0',
                '#0000FF',
                '#FFFFFF',
                '#666666'
            ]
        });
    });


    it('should be transparent for nan values', () => {

        const categories = {
            'Office': '#ff9999',
            'Hotel': undefined
        };

        var theme = new Theme(_.extend({}, config, {
            categories: categories,
            scaleType: 'categorical'
        }), data);

        expect(theme.getStyle('Hotel').fillOpacity).to.equal(0);
    });
});
