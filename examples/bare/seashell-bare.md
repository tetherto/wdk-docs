# Seashell Bare

An example cli wallet used to demo the wallet lib.

⚠️ THIS IS A TEST WALLET ONLY. DON'T RISK REAL FUNDS ⚠️

### Dependencies

* Install [Bare](https://github.com/holepunchto/bare)
* Install [Wallet indexer](https://github.com/tetherto/lib-wallet-indexer)
* Install [Fulcrum Electrum](https://github.com/cculianu/Fulcrum)
* Install [Test tools](https://github.com/tetherto/wallet-lib-test-tools)

### Configuration

All the available config items for config.json

```json
{
    "store_path" :  "./data",
    "network" : "regtest",
    "electrum_host" : "ws://127.0.0.1",
    "electrum_port" : 8002,
    "web3" : "ws://127.0.0.1:8545/",
    "web3_indexer" : "http://127.0.0.1:8008/",
    "web3_indexer_ws" : "http://127.0.0.1:8181/",
    "token_contract" : "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}

```

### Setup

Clone the Lib Wallet repo

```bash
git clone git@github.com:tetherto/lib-wallet.git
cd lib-wallet
```

Install dependencies

```bash
npm install
```

Install Bare dependencies

```bash
cd ./example/bare
npm install
```

Create `config.json` file. This stores the seed phrase.

```bash
echo "{}" > config.json
```

Run the file

```bash
bare ./cli.js
```
