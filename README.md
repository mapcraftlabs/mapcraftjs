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

All the challenge is in the config object for the theme.  Here is a simple example that maps the min/max values in the `data` array to a linear scale between two colors (using d3).  `opacity` sets the opacity of the shapes, `weight` is the thickness of the outside borders of the shapes, and `outlineColor` is the color of the border.

```javascript
{
    opacity: .9,
    weight: 0,
    outlineColor: '#000000',
    interpolate: ['#fff5eb', '#7f2704']
}
```
