const frontMatter = require('front-matter');
const handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const handlebarsLayouts = require('handlebars-layouts');
const handlebarsHelpersPackage = require('handlebars-helpers');
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');
const handlebarsHelpers = handlebarsHelpersPackage();
const { loadUserConfig, parseSimpleLayout } = require('./utils');

const userConfig = loadUserConfig();
const config = Object.assign({}, {
  data: 'src/markup/data',
  decorators: 'src/markup/decorators',
  helpers: 'src/markup/helpers',
  layouts: 'src/markup/layouts',
  partials: 'src/markup/partials',
}, userConfig);

const wax = handlebarsWax(handlebars)
  .helpers(handlebarsLayouts)
  .helpers(handlebarsHelpers)
  .helpers(`${config.helpers}/**/*.js`)
  .data(`${config.data}/**/*.{json,js}`)
  .decorators(`${config.decorators}/**/*.js`)
  .partials(`${config.layouts}/**/*.{hbs,handlebars,js}`)
  .partials(`${config.partials}/**/*.{hbs,handlebars,js}`);

if (config.helpers instanceof Array) {
    for (let p of config.helpers) {
        wax.helpers(`${p}/**/*.js`);
    }
} else {
    wax.helpers(`${config.helpers}/**/*.js`);
}
if (config.data instanceof Array) {
    for (let p of config.data) {
        wax.data(`${p}/**/*.{json,js}`);
    }
} else {
    wax.data(`${config.data}/**/*.{json,js}`);
}
if (config.decorators instanceof Array) {
    for (let p of config.decorators) {
        wax.decorators(`${p}/**/*.js`);
    }
} else {
    wax.decorators(`${config.decorators}/**/*.js`);
}
if (config.layouts instanceof Array) {
    for (let p of config.layouts) {
        wax.partials(`${p}/**/*.{hbs,handlebars,js}`);
    }
} else {
    wax.partials(`${config.layouts}/**/*.{hbs,handlebars,js}`);
}
if (config.partials instanceof Array) {
    for (let p of config.partials) {
        wax.partials(`${p}/**/*.{hbs,handlebars,js}`);
    }
} else {
    wax.partials(`${config.partials}/**/*.{hbs,handlebars,js}`);
}

class HbsAsset extends HTMLAsset {
  constructor(name, pkg, options) {
    super(name, pkg, options);
    this.wax = wax;
  }

  parse(code) {
    // process any frontmatter yaml in the template file
    const frontmatter = frontMatter(code);

    // process simple layout mapping that does not use handlebars-layouts. i.e {{!< base}}
    const content = parseSimpleLayout(frontmatter.body, config);

    // combine frontmatter data with NODE_ENV variable for use in the template
    const data = Object.assign({}, frontmatter.attributes, { NODE_ENV: process.env.NODE_ENV });

    // compile template into html markup and assign it to this.contents. super.generate() will use this variable.
    this.contents = this.wax.compile(content)(data);

    // Return the compiled HTML
    return super.parse(this.contents);
  }
}

module.exports = HbsAsset;
