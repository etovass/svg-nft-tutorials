import colorizer from 'json-colorizer'

const defaultColors = {
    BRACE: 'gray',
    BRACKET: 'gray',
    COLON: 'gray',
    COMMA: 'gray',
    STRING_KEY: '#8281a6',
    STRING_LITERAL: 'green',
    NUMBER_LITERAL: '#ff8c00',
    BOOLEAN_LITERAL: 'blue',
    NULL_LITERAL: 'magenta',
}

export function colorJsonConsole(json: any) {
    return colorizer(JSON.stringify(json, null, 4), { colors: defaultColors })
}

/**
    Relies on css classes, here are sample

    <style>
        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
        .key { color: rgb(49, 0, 172); }
    </style>
 */
export function colorJsonHtml(json: string) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
            var cls = 'number'
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key'
                } else {
                    cls = 'string'
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean'
            } else if (/null/.test(match)) {
                cls = 'null'
            }
            return '<span class="' + cls + '">' + match + '</span>'
        }
    )
}
