import { Base64 } from 'js-base64'

export enum ContentType {
    SVG,
    JSON_UTF8,
    JSON_BASE64,
}

export type ParsedOutput = {
    gas: number
    content: string
    contentType: ContentType
    json?: any
}

function getTextBetween(text: string, beginText: string, endText: string): string {
    let beginIndex = text.indexOf(beginText)
    let endIndex = text.lastIndexOf(endText)
    if (beginIndex < 0 || endIndex < 0) return ''

    let subStr = text.substring(beginIndex + beginText.length, endIndex)
    return subStr
}

const PREFIX_JSON_BASE64 = 'data:application/json;base64,'
const PREFIX_JSON_UTF8 = 'data:application/json;utf8,'

const PREFIX_SVG_PURE = 'data:image/svg+xml;<svg'
const PREFIX_SVG_BASE64 = 'data:image/svg+xml;base64,'

function parseJson(json: string) {
    try {
        return JSON.parse(json)
    } catch (e) {
        throw new Error(e.message + '\n' + json)
    }
}

function trim(content: string) {
    return content.substring(0, 30) + '... (' + content.length + ' bytes total)'
}

export function parseOutput(output: string): ParsedOutput {
    let gasString = getTextBetween(output, '<NFT_GAS>', '</NFT_GAS>')
    let gas = parseInt(gasString)

    if (Number.isNaN(gas)) {
        throw new Error('Invalid gas string. Expecting number, got: ' + gasString + '\n' + output)
    }

    let content = getTextBetween(output, '<NFT_OUTPUT>', '</NFT_OUTPUT>').trim()
    let contentType: ContentType
    let json: any = null

    if (content.startsWith('<svg')) {
        contentType = ContentType.SVG
    } else if (content.startsWith(PREFIX_JSON_UTF8)) {
        contentType = ContentType.JSON_UTF8
        let jsonStr = content.substring(PREFIX_JSON_UTF8.length)
        json = parseJson(jsonStr)
    } else if (content.startsWith(PREFIX_JSON_BASE64)) {
        contentType = ContentType.JSON_BASE64
        let jsonStr = Base64.decode(content.substring(PREFIX_JSON_BASE64.length))
        json = parseJson(jsonStr)
    } else {
        throw new Error(
            'Invalid content. Neither SVG, not json/utf8, not json/base64' + '\n' + output
        )
    }

    if (json) {
        if (json.image) {
            content = json.image
            json.image = trim(json.image)
        } else if (json.image_data) {
            content = json.image_data
            json.image_data = trim(json.image_data)
        } else if (json.animation_url) {
            content = json.animation_url
            json.animation_url = trim(json.animation_url)
        } else {
            throw new Error(
                'Invalid JSON. Content must be in image, image_data or animation_url attribute' +
                    '\n' +
                    JSON.stringify(json, null, 4)
            )
        }

        if (content.startsWith(PREFIX_SVG_PURE)) {
            content = content.substring(PREFIX_SVG_PURE.length - 4) // 4 = '<svg'.length
        } else if (content.startsWith(PREFIX_SVG_BASE64)) {
            content = Base64.decode(content.substring(PREFIX_SVG_BASE64.length))
        } else {
            throw new Error('Invalid image format' + '\n' + content)
        }
    }

    return {
        gas,
        content,
        contentType,
        json,
    }
}
