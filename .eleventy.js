import htmlmin from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

export default (config) => {
    config.setInputDirectory('src');

    config.addPassthroughCopy('img');
    config.addPassthroughCopy('src/robots.txt');
    config.addPassthroughCopy('src/favicon.ico');

    config.addShortcode('pkg', () => require('../package.json'));
    config.addShortcode('now', () => new Date().toUTCString());

    config.addFilter('jsonify', (items) => {
        const excludes = ['eleventyComputed', 'eleventy', 'page', 'collections', 'pkg', 'permalink'];
        const payload = items.map((item) => item.data).map((data) => omit(data, excludes));
        return JSON.stringify(payload);
    });

    // HTML圧縮
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

    // CSS圧縮
    config.addTemplateFormats('css');
    config.addExtension('css', {
        outputFileExtension: 'css',
        compile: async (inputContent) => async () => inputContent,
    });
    config.addTransform('cleancss', function (content) {
        if ((this.page.outputPath || '').endsWith('.css')) {
            return new CleanCSS().minify(content).styles;
        }
        return content;
    });

    // JS圧縮
    config.addTemplateFormats('js');
    config.addExtension('js', {
        outputFileExtension: 'js',
        compile: async (inputContent) => async () => inputContent,
    });
    config.addTransform('terser', async function (content) {
        if ((this.page.outputPath || '').endsWith('.js')) {
            const minified = await minify(content);
            return minified.code;
        }
        return content;
    });
};

function omit(obj, keys) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}
