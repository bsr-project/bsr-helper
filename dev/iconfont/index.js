import IconfontBuilder from 'simple-iconfont-builder'
import path from 'path'

const root = path.resolve()
IconfontBuilder.build(path.resolve(root, 'src/styles/iconfont.css'))