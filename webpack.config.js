const path = require('path');

module.exports =
{
    entry: './client/public/scripts/main.ts',
    module:
    {
        rules:
        [{
            test: /\.tsx?$/,
            exclude: /node_modules/
        }]
    },
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    mode: 'production',
    output:
    {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/client')
    }
};