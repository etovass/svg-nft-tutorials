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

export function colorJson(json: any) {
    return colorizer(JSON.stringify(json, null, 4), { colors: defaultColors })
}
