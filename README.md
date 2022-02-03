# TeamPresale

ftm testnet:

- CommunityWhitelistRound `0x77201DF3C5aB5828708Ffcbf5481B8B32cf00ad7`
- TeamSeed: `0x18b530114E35bca2221F45Dc272770b4a55753B0`

# How to test

- Start ganache client.
- create a empty `.env` file.
- create a `.secret` file and put any generated private key from ganache.
- run `yarn` to install dependencies.
- **TeamSeed**: to test team seed: `yarn test-ts`
- **CommunityWhitelistRound**: to test community seed: `yarn test-cwr`
