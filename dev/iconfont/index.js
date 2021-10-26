/**
 * iconfont CSS 生成器 v2.0
 *
 * 执行命令 npm run if //at.alicdn.com/t/font_922838_rcjsxjh53np.css (根据最新样式 替换网址)
 * 根据后面的网址 自动下载 css 和 woff，自动打包成一个 css
 *
 * 取第一个参数：process.argv[2]
 *
 * 因为目前的自动工具还需要手动下载文件，手动复制出 css 和 woff
 * 新增一个图标就要这么搞一遍
 */

const fs = require('fs')
const { resolve } = require('path')
const mimeType = require('mime-types')
const axios = require('axios').default

var postcss = require('postcss')
var csso = require('postcss-csso')

;(async () => {
  const src = process.argv[2]
  if (!src) {
    console.log('请输入线上的 Font class 链接')
    console.log(
      '例如：npm run if //at.alicdn.com/t/font_922838_rcjsxjh53np.css'
    )
    return
  }
  // * 读取样式内容
  const cssContent = await axios
    .get(`https:${process.argv[2]}`)
    .then(res => res.data)
  // 找到字体引入 拿到链接
  const reg = /url\('(\/\/at\.alicdn\.com\/t\/font_[a-z0-9_]+\.woff)\?t=\d+'\) format\('woff'\)/
  const regData = reg.exec(cssContent)
  if (!regData) {
    console.log('读取字体链接失败')
    return
  }

  // 获取到字体 url
  const fontSrc = `${regData[1]}?t=${new Date().getTime()}`
  const fontBuffer = await axios
    .get(`https:${fontSrc}`, {
      responseType: 'arraybuffer'
    })
    .then(res => res.data)

  // 字体 base64
  const fontContent = fontBuffer.toString('base64')

  // 输出文件夹
  const outCssPath = resolve(__dirname, '../../src/styles/iconfont.css')

  // 按换行分割成数组
  const lineArray = cssContent.toString().split('\n')
  // 删除前6行的字体加载 css
  const removedFontCss = lineArray.slice(6, lineArray.length - 1).join('\n')

  // base64 字体
  const fontBase64 = `@font-face {
      font-family: 'iconfont';
      src: url('data:${mimeType.lookup(
        'woff'
      )};charset=utf-8;base64,${fontContent}') format('woff');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    `

  // 压缩
  const compressCss = await postcss([csso])
    .process(removedFontCss)
    .then(result => result.css)

  // 写入文件
  const fd = fs.openSync(outCssPath, 'w')
  fs.writeSync(fd, `${fontBase64}${compressCss}`)
  fs.closeSync(fd)

  console.log(`生成成功：${outCssPath}\n`)
})()
