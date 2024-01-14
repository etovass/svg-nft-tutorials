import Watcher from 'watcher'
import * as path from 'path'
import chalk from 'chalk'
import * as toml from 'toml'

import { callTestContract, getForgeConfig, FOUNDRY_PROFILE } from '../common/run'
import { serve } from './serve'

const CMD_PARAMS = process.argv.slice(2)
const FOUNDRY_PROJECT_ROOT_PATH = CMD_PARAMS[0]
const TEST_CONTRACT = CMD_PARAMS[1]
const TEST_METHOD = CMD_PARAMS[2]
const TEST_ID = CMD_PARAMS[3]

export async function main() {
    if (CMD_PARAMS.length != 4) {
        console.log(
            '\nUsage: \n\tnpm run hot-reload -- <FOUNDRY_PROJECT_ROOT_PATH> <TEST_CONTRACT> <TEST_METHOD> <TOKEN_ID>'
        )
        console.log(
            '\nExample: \n\tnpm run hot-reload -- ../tutorial-1-basic-svg-rendering test/BasicSVGRenderer.t.sol testSvgRenderer 123'
        )
        console.log('\n')
        return
    }

    let foundryConfig = toml.parse(await getForgeConfig(FOUNDRY_PROJECT_ROOT_PATH))
    let defaultFoundryProfile = foundryConfig.profile[FOUNDRY_PROFILE]

    let pathsToWatch = [
        path.resolve(path.join(FOUNDRY_PROJECT_ROOT_PATH, defaultFoundryProfile.src || 'src')),
        path.resolve(path.join(FOUNDRY_PROJECT_ROOT_PATH, defaultFoundryProfile.test || 'test')),
        path.resolve(
            path.join(FOUNDRY_PROJECT_ROOT_PATH, defaultFoundryProfile.script || 'script')
        ),
    ]

    const watcher = new Watcher(pathsToWatch, {
        renameDetection: true,
        recursive: true,
        ignoreInitial: true,
        debounce: 10,
    })

    async function handler(tokenId: number) {
        let result = await callTestContract(
            FOUNDRY_PROJECT_ROOT_PATH,
            TEST_CONTRACT,
            TEST_METHOD,
            tokenId,
            true
        )
        return result
    }

    console.log('\n\nStarting (may take several seconds to compile the contracts...)');
    await handler(parseInt(TEST_ID));

    const { notify } = await serve(handler, parseInt(TEST_ID))
    console.log('Watching paths:', pathsToWatch, '\n')

    watcher.on('all', async (event, targetPath, targetPathNext) => {
        console.log('Detected: ', chalk.bgGray(event), ` for ${targetPath}`)
        notify()
    })
}

main()
