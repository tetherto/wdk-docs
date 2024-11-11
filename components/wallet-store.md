# lib-wallet-store 💼🗃️

A flexible and extensible library for wallet data storage, supporting multiple storage engine implementations.

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Storage Engines](#storage-engines)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

lib-wallet-store provides a consistent interface for wallet data storage, allowing developers to choose or implement the storage engine that best fits their needs. Whether you need in-memory storage, file-based persistence, or distributed data structures, lib-wallet-store offers a unified API to work with various backend technologies.

## ✨ Features

- 🔢 Consistent key-value storage API
- 🔌 Pluggable storage engine architecture
- 🔄 Asynchronous operations
- 🧩 Support for multiple instances
- 🔐 Designed for wallet data management


## 🔧 Usage

Here's a quick example of how to use lib-wallet-store with the Hyperbee engine:

```javascript
const { WalletStoreHyperbee } = require('lib-wallet-store');

async function example() {
  const store = new WalletStoreHyperbee({});
  await store.init();

  await store.put('key1', 'value1');
  const value = await store.get('key1');
  console.log(value); // Outputs: value1

  await store.close();
}

example();
```

## 📘 API

### `WalletStoreHyperbee`

Hyperbee implementation of WalletStore.

#### Constructor

- `new WalletStoreHyperbee(config)`
  - `config.store_path`: (optional) Storage path for Hypercore
  - `config.hyperbee`: (optional) Existing Hyperbee instance
  - `config._cache`: (optional) Custom cache Map instance
  - `config.name`: (optional) Store name, defaults to 'default'

#### Instance Methods

- `init()`
  - Initializes the Hyperbee database

- `close()`
  - Closes the database and cleans up cache

- `newInstance(opts)`
  - Creates a new instance with shared cache
  - `opts.name`: (required) Name for the new instance

- `has(key)`
  - Checks if key exists in store
  - `key`: Key to check

- `get(key)`
  - Retrieves and parses a value
  - `key`: Key to retrieve

- `put(key, val, opts)`
  - Stores a value, converting objects to JSON
  - `key`: Key to store under
  - `val`: Value to store
  - `opts`: (optional) Hyperbee put options

- `delete(key, opts)`
  - Removes a value
  - `key`: Key to delete
  - `opts`: (optional) Hyperbee delete options

- `clear()`
  - Clears all entries

- `import(snapshot)`
  - Imports data from object
  - `snapshot`: Object with key-value pairs

- `some(cb, opts)`
  - Iterates until callback returns true
  - `cb`: `(key: string, value: any) => Promise<boolean>`
  - `opts`: (optional) Hyperbee stream options

- `entries(cb, opts)`
  - Iterates over all entries
  - `cb`: `(key: string, value: any) => Promise<void>`
  - `opts`: (optional) Hyperbee stream options

## 💾 Storage Engines

lib-wallet-store currently supports the following storage engines:

1. [**Hyperbee Engine**](https://github.com/holepunchto/hyperbee): Utilizes the Hyperbee data structure for efficient and distributed storage.

To implement a new storage engine:

1. Create a new class that extends the base `WalletStore` class.
2. Implement the required methods: `init()`, `get()`, `put()`, `delete()`, `clear()`, `close()`, etc.
3. Place your implementation in the project's root directory (e.g., `wallet-store-yourenginename.js`).

## 🛠 Development

To set up the development environment:

1. Clone the repository:
   ```bash
   git clone git@github.com:tetherto/lib-wallet-store.git
   cd lib-wallet-store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start coding! 👨‍💻👩‍💻

## 🧪 Testing

We use the [Brittle](https://github.com/holepunchto/brittle) testing framework for our unit tests.

To run the tests:

1. Make sure you have the testing dependencies installed:
   ```bash
   npm install brittle
   ```

2. Run the tests:
   ```bash
   npm run test
   ```


## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

- Implement new storage engines
- Improve existing implementations
- Add more test cases
- Enhance documentation
