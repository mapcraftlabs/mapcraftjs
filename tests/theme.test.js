import chai from 'chai';
import chaiStats from 'chai-stats';
import _ from 'underscore';
import {Theme} from '../src/index.js'
chai.use(chaiStats);

var expect = chai.expect

describe('theme module', () => {

    const data = _.range(0, 50);
	const config = {
        opacity: .9,
        weight: 0,
        outlineColor: '#000000',
        interpolate: ['#fff5eb', '#7f2704']
    };

	it('should throw an exception', () => {
		expect(() => new Theme(_.extend({}, config, {interpolate: undefined}), data)).to.throw(Error);
	});


    it('should do a linear theme with 2 colors', () => {

    	var theme = new Theme(config, data);

    	// bottom of the interpolation
    	expect(theme.getStyle(0).fillColor).to.equal('#fff5eb');
    	// assumes using d3 linear
    	expect(theme.getStyle(25).fillColor).to.equal('#be8c75');
    	// top of the interpolation
    	expect(theme.getStyle(49).fillColor).to.equal('#7f2704');
    });

    it('should have other style attributes', () => {

    	var theme = new Theme(config, data);

    	expect(theme.getStyle(0).weight).to.equal(config.weight);
    	expect(theme.getStyle(0).fillOpacity).to.equal(config.opacity);
    	expect(theme.getStyle(0).color).to.equal(config.outlineColor);
    });

    it('should work for numbers too', () => {

    	var theme = new Theme(
    		_.extend({}, config, {interpolate: [0, 1000]}),
    		data);

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

    	var theme = new Theme(
    		_.extend({}, config, {categorical: categories, interpolate: undefined}),
    		data);

    	expect(theme.getStyle('Office').fillColor).to.equal('#ff9999');
    	expect(theme.getStyle('School').fillColor).to.equal('#0000FF');
    });

    it('should be transparent for nan values', () => {

	    const categories = {
            'Office': '#ff9999',
            'Hotel': undefined
        };

    	var theme = new Theme(
    		_.extend({}, config, {categorical: categories, interpolate: undefined}),
    		data);

    	expect(theme.getStyle('Hotel').fillOpacity).to.equal(0);
    });
});
