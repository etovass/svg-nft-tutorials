import { defineConfig } from '@wagmi/cli'
import { actions, foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/contracts-generated.ts',
  contracts: [],
  plugins: [
    foundry({
      artifacts: "../../tutorial-2-NFT-contract/out",
      include: [
          "NFTManager.sol/**"
      ]
    }),
  ],
})