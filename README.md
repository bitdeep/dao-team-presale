# TeamSeed

- TeamSeed ftm testnet: `0x18b530114E35bca2221F45Dc272770b4a55753B0`

## How to test

- Start ganache client.
- create a empty `.env` file.
- create a `.secret` file and put any generated private key from ganache.
- run `yarn` to install dependencies.
- To test team seed: `yarn test-ts`

## TeamSeed: User Interaction via frontend app

### Presale
- User is whitelisted by admin before. So, check whitelist if wallet is whitelisted.
- Check if presale is started at presaleStart timestamp.
- Then send FTM value amount to presale, the contract will compute the amount of token and register on token.

### Claim

After, user call call `claim()` to get 50%.

### Release

From time to time user can call `release()` to get released tokens from vest.

---

# CommunityWhitelistRound

- CommunityWhitelistRound `0x77201DF3C5aB5828708Ffcbf5481B8B32cf00ad7`

## How to test

- Start ganache client.
- create a empty `.env` file.
- create a `.secret` file and put any generated private key from ganache.
- run `yarn` to install dependencies.
- To test community seed: `yarn test-cwr`

## TeamSeed: User Interaction via frontend app

### Presale
- User is whitelisted by admin before. So, check whitelist if wallet is whitelisted.
- Check if presale is started at presaleStart timestamp.
- Then send FTM value amount to presale, the contract will compute the amount of token and register on token.

### Claim

After, user call call `claim()` to get 50%.

### Release

From time to time user can call `release()` to get released tokens from vest.
