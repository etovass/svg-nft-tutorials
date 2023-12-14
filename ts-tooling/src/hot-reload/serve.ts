// adapted from https://github.com/w1nt3r-eth/hot-chain-svg/blob/main/src/serve.js

import * as http from 'http'
import * as url from 'url'
import { readFileSync } from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import EventEmitter from 'events'
import { Eta } from 'eta'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const eta = new Eta({})
const DEFAULT_WIDTH = 548

type WebpageData = {
    content?: string
    json?: string
    gas?: number
    tokenId?: number
    showBorder?: boolean
    responsive?: boolean
    width?: number
    errorContent?: null
}

export async function serve(handler, initialTokenId: number) {
    const events = new EventEmitter()

    function requestListener(req, res) {
        if (req.url === '/changes') {
            res.setHeader('Content-Type', 'text/event-stream')
            res.writeHead(200)
            const sendEvent = () => res.write('event: change\ndata:\n\n')
            events.on('change', sendEvent)
            req.on('close', () => events.off('change', sendEvent))
            return
        }

        if (req.url != '/') {
            if (!req.url.startsWith('/?')) {
                res.writeHead(404)
                res.end('Not found: ' + req.url)
                return
            }
        }

        const queryObject = url.parse(req.url, true).query
        let tokenId = parseInt(queryObject.id as string)
        let showBorder = queryObject.showBorder != 'false'
        let responsive = queryObject.responsive == 'true'

        if (Number.isNaN(tokenId)) {
            res.writeHead(302, {
                Location: '/?id=' + initialTokenId,
            })
            res.end()
            return
        }

        res.writeHead(200)
        handler(tokenId).then(
            (result) => {
                webpage({
                    content: result.content,
                    json: result.json
                        ? syntaxHighlightJSON(JSON.stringify(result.json, null, 2))
                        : '',
                    gas: result.gas,
                    tokenId,
                    showBorder,
                    responsive,
                    width: DEFAULT_WIDTH,
                    errorContent: null,
                }).then((response) => {
                    res.end(response)
                })
            },

            (error) => {
                webpage({
                    errorContent: error.message,
                }).then((response) => {
                    res.end(response)
                })
            }
        )
    }

    const server = http.createServer(requestListener)

    server.on('error', (e) => {
        console.log('Error: ', e)
    })
    server.listen(9901, () => {
        console.log('Serving  http://localhost:9901/\n\n')
    })

    return {
        notify: () => events.emit('change'),
    }
}

const indexHtml = readFileSync(path.join(__dirname, 'index.html')).toString()

async function webpage(data: WebpageData) {
    return eta.renderString(indexHtml, data)
}

function syntaxHighlightJSON(json: string) {
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
