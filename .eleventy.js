import htmlmin from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

export default (config) => {
    config.setInputDirectory('src');

    config.addPassthroughCopy('img');
    config.addPassthroughCopy('src/robots.txt');
    config.addPassthroughCopy('src/favicon.ico');

    config.addGlobalData('env', () => {
        return {
            isDevelopment: process.env.NODE_ENV == 'development',
            isProduction: process.env.NODE_ENV == 'production',
            neostatHostName: process.env.NEOSTAT_HOST_NAME,
        };
    });

    config.addGlobalData('version', async () => {
        const pkg = await import('./package.json', { with: { type: 'json' } });
        return pkg.default.version;
    });

    config.addGlobalData('buildDate', () =>
        new Date()
            .toISOString()
            .replace('T', ' ')
            .replace(/\.\d+Z$/, ' GMT')
    );

    config.addFilter('jsonify', (items) => {
        const excludes = [
            'eleventyComputed',
            'eleventy',
            'page',
            'collections',
            'permalink',
            'pkg',
            'version',
            'buildDate',
            'env',
        ];
        const payload = items.map((item) => item.data).map((data) => omit(data, excludes));
        return JSON.stringify(payload);
    });

    // .jsファイルも11tyの処理対象とするが、Liquidは使用しない
    config.addTemplateFormats('js');
    config.addExtension('js', {
        outputFileExtension: 'js',
        compile: passthrough,
    });

    // .cssファイルも11tyの処理対象とするが、Liquidは使用しない
    config.addTemplateFormats('css');
    config.addExtension('css', {
        outputFileExtension: 'css',
        compile: passthrough,
    });

    config.addTransform('後処理:圧縮', async function (content) {
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

        if ((this.page.outputPath || '').endsWith('.js')) {
            return (await minify(content)).code;
        }

        if ((this.page.outputPath || '').endsWith('.css')) {
            return new CleanCSS().minify(content).styles;
        }

        return content;
    });
};

function omit(obj, keys) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}

async function passthrough(content) {
    return async () => content;
}
