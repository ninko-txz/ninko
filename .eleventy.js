import htmlmin from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

export default (config) => {
    config.setInputDirectory('src');

    config.addPassthroughCopy('img');
    config.addPassthroughCopy('src/robots.txt');
    config.addPassthroughCopy('src/favicon.ico');

    config.addShortcode('pkg', () => require('../package.json'));
    config.addShortcode('now', () =>
        new Date()
            .toISOString()
            .replace('T', ' ')
            .replace(/\.\d+Z$/, ' GMT')
    );

    config.addGlobalData('env', () => {
        return {
            isDevelopment: process.env.NODE_ENV == 'development',
            isProduction: process.env.NODE_ENV == 'production',
            neostatHostName: process.env.NEOSTAT_HOST_NAME,
        };
    });

    config.addFilter('jsonify', (items) => {
        const excludes = ['eleventyComputed', 'eleventy', 'page', 'collections', 'pkg', 'permalink', 'env'];
        const payload = items.map((item) => item.data).map((data) => omit(data, excludes));
        return JSON.stringify(payload);
    });

    // Liquidでパース後、 HTML圧縮
    config.addTransform('htmlmin', function (content) {
        if ((this.page.outputPath || '').endsWith('.html')) {
            let minified = htmlmin.minify(content, {
                collapseWhitespace: true,
                removeComments: true,
                useShortDoctype: true,
                removeRedundantAttributes: true,
                sortAttributes: true,
                sortClassName: true,
            });
            return minified;
        }
        return content;
    });

    // Liquidでパース後、JS圧縮
    config.addTransform('jsmin', async function (content) {
        if ((this.page.outputPath || '').endsWith('.js')) {
            return (await minify(content)).code;
        }
        return content;
    });

    // Liquidを介さずにCSS圧縮
    config.addTemplateFormats('css');
    config.addExtension('css', {
        outputFileExtension: 'css',
        compile: async (inputContent) => {
            const outputContent = new CleanCSS().minify(inputContent).styles;
            return async () => outputContent;
        },
    });

    // Liquidを介さずにJS圧縮
    config.addTemplateFormats('js');
    config.addExtension('js', {
        outputFileExtension: 'js',
        compile: async (inputContent) => {
            const outputContent = (await minify(inputContent)).code;
            return async () => outputContent;
        },
    });
};

function omit(obj, keys) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}
