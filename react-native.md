# Using WDK in React Native

WDK can be used in React Native projects with the help of Node.js polyfills. This guide shows you how to set up your environment and use WDK in a React Native app.

---

## 1. Install Required Polyfills
Install the following packages:

```bash
npm install expo-crypto stream-browserify @craftzdog/react-native-buffer \
react-native-tcp-socket react-native-tls react-native-url-polyfill \
stream-http https-browserify http2-wrapper browserify-zlib path-browserify nice-grpc-web
```

---

## 2. Configure Metro Bundler
Create or update `metro.config.js` in your project root:

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve('expo-crypto'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  net: require.resolve('react-native-tcp-socket'),
  tls: require.resolve('react-native-tls'),
  url: require.resolve('react-native-url-polyfill'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  http2: require.resolve('http2-wrapper'),
  zlib: require.resolve('browserify-zlib'),
  path: require.resolve('path-browserify'),
  'nice-grpc': require.resolve('nice-grpc-web'),
};

module.exports = config;
```

---

## 3. Minimal Usage Example

```jsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import WdkManager from 'wdk-core';

export default function App() {
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function getAddress() {
      const seedPhrase = 'your twelve word seed phrase goes here';
      const config = {
        ethereum: {
          chainId: 1,
          blockchain: 'ethereum',
          rpcUrl: 'https://arbitrum.drpc.org',
        },
      };
      const wdk = new WdkManager(seedPhrase, config);
      const ethAddress = await wdk.getAddress('ethereum', 0);
      setAddress(ethAddress);
    }
    getAddress();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Your Ethereum address:</Text>
      <Text selectable>{address}</Text>
    </View>
  );
}
```

---

## 4. Caveats & Tips
- Some polyfills may require additional setup or linking (see their documentation).
- For production, always use secure key storage (e.g., Expo SecureStore, react-native-keychain).
- Performance may vary depending on device and polyfill implementation.
- If you encounter issues, see the [Troubleshooting](getting-started.md#troubleshooting) section or open an issue.

---

For general setup, see [Getting Started](getting-started.md). For API usage, see the [API Reference](api-reference.md). 