
# Setting up Bitcoin Core and Fulcrum

This guide will walk you through the process of setting up a Bitcoin regtest network and Fulcrum, an SPV server for Bitcoin.

the library `bitcoin-core.js` uses local bitcoin and electrum node for testing.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting up Bitcoin Core in Regtest Mode](#setting-up-bitcoin-core-in-regtest-mode)
3. [Configuring Bitcoin Core](#configuring-bitcoin-core)
4. [Starting Bitcoin Core in Regtest Mode](#starting-bitcoin-core-in-regtest-mode)
5. [Generating Initial Blocks](#generating-initial-blocks)
6. [Setting up Fulcrum](#setting-up-fulcrum)
7. [Configuring Fulcrum](#configuring-fulcrum)
8. [Starting Fulcrum](#starting-fulcrum)
9. [Testing the Setup](#testing-the-setup)

## Prerequisites

- Bitcoin Core (version 0.21.0 or later)
- Fulcrum (latest version)
- Basic knowledge of command-line operations

## Setting up Bitcoin Core in Regtest Mode

Learn about [Bitcoin Regtest](https://developer.bitcoin.org/examples/testing.html)

1. Download and install Bitcoin Core from the official website: https://bitcoincore.org/en/download/

2. Create a directory for your regtest data:

```bash
mkdir ~/bitcoin-regtest
```

## Configuring Bitcoin Core

Create a configuration file for Bitcoin Core:

```bash
vim ~/.bitcoin/bitcoin.conf
```

Add the following lines to the configuration file:


```
server=1
rpcuser=user
rpcpassword=password
regtest=1
debug=1
zmqpubrawblock=tcp://0.0.0.0:28334
zmqpubrawtx=tcp://0.0.0.0:28335
zmqpubhashblock=tcp://0.0.0.0:28336
datadir=./bitcoin-regtest
txindex=1
dnsseed=0
upnp=0
[regtest]
rpcbind=0.0.0.0
rpcallowip=0.0.0.0/0
rpcport=18443
listenonion=0
fallbackfee=0.0003
connect=localhost
```

Save and close the file.

## Starting Bitcoin Core in Regtest Mode

Start Bitcoin Core in regtest mode:

```bash
bitcoind --regtest
```


## Create new wallet

Create a new internal regtest wallet

```bash
bitcoin-cli -regtest createwallet main
```


## Generating Initial Blocks

Generate some initial blocks to work with:

```bash
bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)
```

This command generates 101 blocks and sends the block reward to a new address.

## Setting up Fulcrum

1. Download and compile Fulcrum from the official repository: https://github.com/cculianu/Fulcrum

2. Follow the compilation instructions in the Fulcrum README.

## Configuring Fulcrum

Create a configuration file for Fulcrum:

```bash
vim ~/fulcrum.conf
```

Add the following lines to the configuration file:

```
datadir = /path/to/fulcrum/data
bitcoind = 127.0.0.1:18443
rpcuser = your_rpc_username
rpcpassword = your_rpc_password
tcp = 127.0.0.1:50001
```

Adjust the paths and credentials as needed.

## Starting Fulcrum

Start Fulcrum:

```bash
./Fulcrum ~/fulcrum.conf
```

## Testing the Setup

1. Ensure Bitcoin Core is running in regtest mode.
2. Ensure Fulcrum is running and connected to your Bitcoin Core regtest node.
3. Use a compatible wallet (e.g., Electrum) to connect to your Fulcrum server (usually at 127.0.0.1:50001).

You should now have a working Bitcoin regtest network with Fulcrum as an SPV server.

Remember to stop both Bitcoin Core and Fulcrum when you're done testing:

```bash
bitcoin-cli -regtest stop
./Fulcrum --stop
```

This setup allows you to experiment with Bitcoin transactions and smart contracts in a controlled environment without using real Bitcoin or connecting to the main network.