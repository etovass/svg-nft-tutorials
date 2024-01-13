import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

import { homedir } from 'os'
import { callTestContract, getForgeConfig, FOUNDRY_PROFILE } from '../common/run.ts'
import { formatNumber } from '../common/utils.ts'
import { fileURLToPath } from 'url'
import { convertSvgFileToPNG } from './svg-to-png.ts'
import { colorJsonConsole } from '../common/color-json.ts'
import { Content } from '../common/parser.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CMD_PARAMS = process.argv.slice(2)
const FOUNDRY_PROJECT_ROOT_PATH = CMD_PARAMS[0]
const TEST_CONTRACT = CMD_PARAMS[1]
const TEST_METHOD = CMD_PARAMS[2]
const START_ID = CMD_PARAMS[3]
const END_ID = CMD_PARAMS[4]

const GAS_WARNING_THRESHOLD = 25_000_000
const GAS_ERROR_THRESHOLD = 30_000_000

let occurences = {}

function processJSON(json: any) {
    if (!json) return

    let attributes = json.attributes

    if (!attributes) return

    for (let i = 0; i < attributes.length; i++) {
        let attr = attributes[i].trait_type
        let value = attributes[i].value

        processAttribute(attr, value)
    }
}

function processAttribute(attr: string, value: string) {
    if (!occurences[attr]) {
        occurences[attr] = {}
    }

    if (!occurences[attr][value]) {
        occurences[attr][value] = 0
    }

    occurences[attr][value]++
}

function addPercentages(json: any) {
    Object.keys(json).forEach((attrName) => {
        let count = 0
        let attrEl = json[attrName]

        Object.keys(attrEl).forEach((option) => {
            count += attrEl[option]
        })

        Object.keys(attrEl).forEach((option) => {
            let value = attrEl[option] as number
            attrEl[option] = value + ' (' + ((value / count) * 100).toFixed(2) + '%)'
        })
    })
}

function saveSingleContent(svgFolder: string, pngFolder: string, tokenId: number, contentElement: Content) {
    let preffix = contentElement.label;

    if (preffix) {
        preffix += '-';
    } else {
        preffix = "";
    }


    let svgFile = path.join(svgFolder, preffix + tokenId + '.svg')
    console.log('saving ', svgFile)
    fs.writeFileSync(svgFile, contentElement.content)

    let pngFile = path.join(pngFolder, preffix + tokenId + '.png')
    console.log('saving ', pngFile)
    convertSvgFileToPNG(contentElement.content, pngFile)
}

export async function main() {
    if (CMD_PARAMS.length != 5) {
        console.log(
            '\nUsage: \n\tnpm run qa-collection -- <FOUNDRY_PROJECT_ROOT_PATH> <TEST_CONTRACT> <TEST_METHOD> <START_ID> <END_ID'
        )
        console.log(
            '\nExample: \n\tnpm run qa-collection -- ../tutorial-2-NFT-contract/ test/NFTManager.t.sol testSvgRenderer 0 100'
        )
        console.log('\n')
        return
    }

    let startId = parseInt(START_ID)
    let endId = parseInt(END_ID)

    let minGas = Number.MAX_VALUE
    let maxGas = Number.MIN_VALUE

    let warnings = []
    let errors = []

    let tmpRootDir = path.join(__dirname, '../../../tmp-svg-nft-qa')
    if (!fs.existsSync(tmpRootDir)) {
        fs.mkdirSync(tmpRootDir)
    }
    const tempFolder = fs.mkdtempSync(path.join(tmpRootDir, '/tmp'))
    const pngFolder = path.join(tempFolder, '/png')
    fs.mkdirSync(pngFolder)
    const jsonFolder = tempFolder + '/json'
    fs.mkdirSync(jsonFolder)
    const svgFolder = tempFolder + '/svg'
    fs.mkdirSync(svgFolder)

    console.log('Saving to', tempFolder)
    console.log('========================')

    for (let tokenId = startId; tokenId <= endId; tokenId++) {
        console.log(chalk.blueBright(`Processing item: ${tokenId}`))

        let result = await callTestContract(
            FOUNDRY_PROJECT_ROOT_PATH,
            TEST_CONTRACT,
            TEST_METHOD,
            tokenId,
            false
        )

        minGas = Math.min(minGas, result.gas)
        maxGas = Math.max(maxGas, result.gas)

        if (result.gas >= GAS_ERROR_THRESHOLD) {
            errors.push(tokenId)
        } else if (result.gas >= GAS_WARNING_THRESHOLD) {
            warnings.push(tokenId)
        }


        // save JSON file
        if (result.json) {
            let jsonFile = path.join(jsonFolder, tokenId + '.json')
            console.log('saving ', jsonFile)
            fs.writeFileSync(jsonFile, JSON.stringify(result.json, null, 4))

            processJSON(result.json)
        }

        result.content.forEach( c => {
            saveSingleContent(svgFolder, pngFolder, tokenId, c);
        })
    }

    console.log('------------------------------------')
    console.log('Min gas: ', formatNumber(minGas))
    console.log('Max gas: ', formatNumber(maxGas))
    console.log()

    if (errors.length > 0) {
        console.log(
            chalk.red(
                `ERROR!!! The following items are exceeding max conract limit of ${formatNumber(
                    GAS_ERROR_THRESHOLD
                )}: ` + JSON.stringify(errors)
            )
        )
    }
    if (warnings.length > 0) {
        console.log(
            chalk.yellow(
                `WARNING! The following items are exceeding max conract limit of ${formatNumber(
                    GAS_WARNING_THRESHOLD
                )}: ` + JSON.stringify(warnings)
            )
        )
    }

    addPercentages(occurences)

    console.log('Occurences: ')
    console.log(colorJsonConsole(occurences))

    let occurencesFile = path.join(tempFolder, 'occurences.json')
    console.log('saving ', occurencesFile)
    fs.writeFileSync(occurencesFile, JSON.stringify(occurences, null, 4))
}

main()
