import * as colorJson from '../../../nextjs-tooling/nft-viewer/src/app/common/color-json';


/**
 * 
 *  This is done to avoid duplicating files, just having the file in nextjs-tooling is the simplest solution for that
 * 
 */

export function colorJsonConsole(json: any) {
    return colorJson.colorJsonConsole(json);
}

export function colorJsonHtml(json: string) {
    return colorJson.colorJsonHtml(json);
}