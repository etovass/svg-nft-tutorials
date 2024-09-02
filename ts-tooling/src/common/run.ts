import { execaCommand } from 'execa'
import fs from 'fs';
import chalk from 'chalk'
import * as path from 'path'
import xmlFormat from 'xml-formatter'
import escapeHtml from 'escape-html'
import { DOMParser } from '@xmldom/xmldom'

import { ContentType, ParsedOutput, parseTestOutput } from './parser'
import { formatNumber } from './utils'

function validateSvgContent(parsedOutput: ParsedOutput) {
    parsedOutput.content.forEach( c => {
        if (c.contentType == ContentType.SVG) {
            validateSvg(c.content);
        }
    })
}

function validateSvg(svg: string) {
    try {
        svg = xmlFormat(svg);
    } catch (e: any) {
        throw new Error((e.message || e) + (e.cause ? '\n' + e.cause : '') + '\n' + escapeHtml(svg));
    }

    let error = '';

    new DOMParser({
        locator: {},
        onError: function (level: any, msg: string) {
            error += msg + '\n';
        },
    }).parseFromString(svg, "image/svg+xml"); // Specify the correct MIME type here

    if (error.length > 0) {
        throw new Error(error + '\n' + escapeHtml(svg));
    }
}
export const FOUNDRY_PROFILE = 'default'

export async function getForgeConfig(contractRootDir: string) {
    const { stdout } = await execaCommand(`forge config --root ${contractRootDir}`, {
        extendEnv: true,
        env: {
            FOUNDRY_PROFILE: FOUNDRY_PROFILE,
        },
    })

    return stdout
}

export async function callTestContract(
    contractRootDir: string,
    testContractName: string,
    testContractMethod: string,
    tokenID: number,
    verbose = false) {

    if (!fs.existsSync(contractRootDir)) {
        throw new Error('Invalid root dir: ' + path.resolve(contractRootDir))
    }    

    let pathToContract = path.join(contractRootDir, testContractName);
    if (!fs.existsSync(pathToContract)) {
        throw new Error('Cannot find test contract: ' + path.resolve(pathToContract))
    }

    const { stdout, command } = await execaCommand(
        `forge test --root ${contractRootDir} --match-path ${testContractName} --match-test ${testContractMethod} -vv`,
        {
            extendEnv: true,
            env: {
                NFT_ID: tokenID.toString(),
                FOUNDRY_PROFILE: FOUNDRY_PROFILE,
            },
        }
    )

    let parsedOutput = parseTestOutput(stdout.toString());

    validateSvgContent(parsedOutput)

    if (verbose) {
        console.log(chalk.bgMagenta(new Date().toISOString()), '\n', command, '\n', stdout)
    } else {
        console.log(
            chalk.gray(new Date().toISOString()),
            '\t' + chalk.green('tokenID:'),
            chalk.white(tokenID),
            '\t' + chalk.green('gas:'),
            chalk.white(formatNumber(parsedOutput.gas))
        )
    }

    return parsedOutput
}
