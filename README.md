# planning-tools
A set of Javascript libraries useful in writing planning tools

[![travis build](https://img.shields.io/travis/mapcraftlabs/planning-tools.svg?style=flat-square)](https://travis-ci.org/mapcraftlabs/planning-tools)
[![codecov coverage](https://img.shields.io/codecov/c/github/mapcraftlabs/planning-tools.svg?style=flat-square)](https://codecov.io/github/mapcraftlabs/planning-tools)

## Themes

The first module we've added is a theming module, designed to take a vector of values and turn it into Leaflet styling objects for each element in the vector.

The API is pretty simple.  Just run 

`var theme = new Theme(config, data);`

to create the theme (where config is a javascript object and data is a vector of values) and then

`var style = theme.getStyle(val);`

to get a Leaflet theme JSON object suitable for calling [layer.getStyle(style)](http://leafletjs.com/reference.html#path-setstyle).  You can also call

`var scaledVal = theme.getScaledVal(val);`

to get the actual scaled value if you don't want a style object.

#### Linear theming
 
All the challenge is in the config object for the theme.  Here is a simple example that maps the min/max values in the `data` array to a linear scale between two colors (using d3).  `opacity` sets the opacity of the shapes, `weight` is the thickness of the outside borders of the shapes, and `outlineColor` is the color of the border.

```javascript
{
    opacity: .9,
    weight: 0,
    outlineColor: '#000000',
    scaleType: 'linear',
    interpolate: ['#fff5eb', '#7f2704']
}
```

You can use `interpolate: [500, 5000]` instead of using colors if you want the outcome to be integers instead of colors.  This can be used, e.g. to determine the radius of circles in the map.  *The resulting style objects will not work in Leaflet - just use `getScaledVal`*.

NaN values and undefined values will be themed as transparent.

You can also do a 3-way interpolation, for instance so that the number zero is always set to a certain color, with the middleValue attribute.

```javascript
{
    scaleType: 'linear',
    middleValue: 0,
    interpolate: ['#fff5eb', '#ffffff', '#7f2704']
}
```

#### Categorical theming

Categorical theming can be used instead of the interpolate attribute by using the categorical theming instead.  In this case, values can be non-numeric, and are mapped to colors by the configuration.  A full spec might look like this.

```javascript
{
    opacity: .9,
    weight: 0,
    outlineColor: '#000000',
    scaleType: 'categorical',
    categories: {
        'Office': '#ff9999',
        'Hotel': '#ff9933',
        'Retail': '#FF0000',
        'Residential': '#FFFF00',
        'Industrial': '#A020F0',
        'School': '#0000FF',
        'Vacant': '#FFFFFF',
        'Parking': '#666666'
    }
}
```

#### Quantile theming

Quantile themed maps map each quantile of the input array to a color scheme from [colorbrewer](http://colorbrewer2.org/).  You need to specify both the name of the color scheme (`colorScheme`) and the number of bins (`numBins`) to use.  For quantile theming, the number of bins is equal to the number of quantiles that will be given separate colors.

```javascript
{
    opacity: .9,
    weight: 0,
    outlineColor: '#000000',
    scaleType: 'quantile',
    colorScheme: 'YlGn',
    numBins: 7
}
```
