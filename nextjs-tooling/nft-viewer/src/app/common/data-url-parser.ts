
import { Base64 } from 'js-base64';

export function parseDataUrl(dataUrl: string) {
    if (!dataUrl.startsWith("data:")) return null;

    dataUrl = dataUrl.substring(5);

    let firstComma = dataUrl.indexOf(',');

    if (firstComma < 0) return null;

    let data = dataUrl.substring(firstComma + 1);
    
    dataUrl = dataUrl.substring(0, firstComma);

    let firstSemiColumn = dataUrl.indexOf(';');
    let mediaType = "";
    let base64Encoding = false;

    if (firstSemiColumn < 0) {
        mediaType = dataUrl;
        base64Encoding = false;
    } else {
        mediaType = dataUrl.substring(0, firstSemiColumn);
        base64Encoding = dataUrl.indexOf(";base64") >= 0;
    }

    if (base64Encoding && mediaType == "application/json") {
        data = Base64.decode(data);
    }

    if (data.startsWith('%3C')) {
        data = decodeURI(data);
    }

    return {mediaType, data};
}