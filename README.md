# hophacks-ethereum-workshop

- solidity contracts/testing in `packages/hophacks-contracts`
- frontend contracts/testing in `packages/hophacks-frontend`


## initial setup

- install node/npm via your systems package manager, e.g. on OSX: `brew install node`

- install a few necessary node packages: `npm install -g truffle ganache-cli create-react-app lerna`

- install project dependencies: `lerna bootstrap`

- link the projects:
```
cd packages/hophacks-contracts
yarn link
cd ./../hophacks-frontend
yarn link hophacks-contracts
```

*see the individual repos for running frontend and setting up solidity dev environment*
