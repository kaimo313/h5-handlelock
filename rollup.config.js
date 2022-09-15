// 用于es6转es5
import { babel } from '@rollup/plugin-babel';
// 用于代码压缩
import { terser } from 'rollup-plugin-terser';

const config = {
    input: "./src/index.js",
    output: [
        {
            file: './lib/kaimo-handlock-umd.js',
            format: 'umd',
            name: 'KaimoHandlock'
            // 当入口文件有export时，'umd'格式必须指定name
            // 这样，在通过<script>标签引入时，才能通过name访问到export的内容。
        },
        {
            file: './lib/kaimo-handlock-es.js',
            format: 'es'
        },
        {
            file: './lib/kaimo-handlock-cjs.js',
            format: 'cjs'
        }
    ],
    plugins: [
        babel({
            babelHelpers: 'bundled' // 建议显式配置此选项（即使使用其默认值），以便对如何将这些 babel 助手插入代码做出明智的决定。
        }),
        terser()
    ]
}

export default config;