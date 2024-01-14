import * as fs from 'fs'
import { Resvg, ResvgRenderOptions } from '@resvg/resvg-js'

export async function convertSvgFileToPNG(svgContent: string, pngFileName: string) {
    const opts: ResvgRenderOptions = {
        background: 'rgba(255, 255, 255, 1)',
        fitTo: {
            mode: 'width',
            value: 512,
        },
        font: {
            loadSystemFonts: true,
        },
    }

    const resvg = new Resvg(svgContent, opts)
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    fs.writeFileSync(pngFileName, pngBuffer)
}
