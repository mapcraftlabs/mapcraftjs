# mapcraftjs

[![travis build](https://img.shields.io/travis/mapcraftlabs/mapcraftjs.svg?style=flat-square)](https://travis-ci.org/mapcraftlabs/planning-tools)
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
 
All the challenge is in the config object for the theme.  Here is a simple example that maps the min/max values in the `data` array to a linear scale between two colors (using d3). 

`opacity` sets the opacity of the shapes, `weight` is the thickness of the outside borders of the shapes, and `outlineColor` is the color of the border.  These other attributes can be added to all themes, although they are often omitted on this page for brevity.

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

You can also do a linear (continuous) interpolation with a color scheme, which uses the first and last colors from the colorbrewer color scheme to interpolate between.

```javascript
{
    scaleType: 'linear',
    colorScheme: 'YlGn'
}
```

#### Manual breaks

Manual breaks allows the user to specify the breakpoints.  In this case you don't have to pass `data` into the theme as the user has full control of the theme.  The color scheme is again from color brewer and the number of bins (colors) will be one greater than the number of breaks.  Note that most colorbrewer color schemes have versions for about 3 to 9 colors, so the number of breaks should generally be between 2 and 8 (whatever colorbrewer has specified for a given color scheme should work).

```javascript
{
    scaleType: 'manual',
    breaks: [4, 8, 20, 40],
    colorScheme: 'YlGn'
}
```

#### Categorical theming

Categorical theming can be used instead of the interpolate attribute by using the categorical theming instead.  In this case, values can be non-numeric, and are mapped to colors by the configuration.  A defaultColor attribute can be added and will be applied to any values which don't exist in the theme.  A full spec might look like this.

```javascript
{
    scaleType: 'categorical',
    defaultColor: '#ABCDEF',
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

#### Auto-categorical theming

Similar to categorical theming, but maps unique values to the random d3 color scheme (d3.category20).  This is an easy way to map all possible values that actually occur in the data to discrete color.

```javascript
{
    scaleType: 'autocategorical'
}
```

#### Quantile theming

Quantile themed maps map each quantile of the input array to a color scheme from [colorbrewer](http://colorbrewer2.org/).  You need to specify both the name of the color scheme (`colorScheme`) and the number of bins (`numBins`) to use.  For quantile theming, the number of bins is equal to the number of quantiles that will be given separate colors.

```javascript
{
    scaleType: 'quantile',
    colorScheme: 'YlGn',
    numBins: 7
}
```

#### Jenks

For natural clustering you can use jenks. This actually uses the simple-statistics method ckmeans, but I figure most people looking for it will look for jenks.

```javascript
{
    scaleType: 'jenks',
    numBins: 5,
    colorScheme: 'YlGn'
}
```
