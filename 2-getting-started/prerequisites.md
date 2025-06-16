# Prerequisites

Before you start using the Wallet Development Kit (WDK), ensure you have the following prerequisites set up in your development environment.

## Development Environment

### Required Software
- **Node.js** (v16 or higher)
  ```bash
  # Check Node.js version
  node --version
  
  # Using nvm (recommended)
  nvm install 16
  nvm use 16
  ```

- **npm** or **yarn**
  ```bash
  # Check npm version
  npm --version
  
  # Check yarn version
  yarn --version
  ```

- **Git**
  ```bash
  # Check git version
  git --version
  ```

### Code Editor
- VS Code
- Or any modern code editor with JavaScript/TypeScript support

## Blockchain Knowledge

### Required Understanding
- Basic blockchain concepts
- Ethereum and EVM fundamentals
- Account abstraction basics
- Gas fees and transaction mechanics

### Recommended Resources
<!-- - [Ethereum Documentation](https://ethereum.org/developers/)
- [Account Abstraction Overview](https://ethereum.org/en/roadmap/account-abstraction/)
- [Arbitrum Documentation](https://docs.arbitrum.io/) -->

## Network Requirements

### Test Networks
- Arbitrum Mainnet
- Ethereum Mainnet
- Access to RPC endpoints

### Required Tokens
- USDT
  - Contract: `0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9`
  - Minimum: Operation amount + Gas fees (estimated in USDT)
  - The paymaster will handle gas fees in USDT

## API Keys and Configuration

### Required API Keys
- RPC Provider API Key
  - [Ankr](https://www.ankr.com/)
  - [Infura](https://infura.io/)
  - [Alchemy](https://www.alchemy.com/)

## Development Setup

### Environment Setup

#### Repository Setup
```bash
# Clone the repository
git clone https://github.com/tetherto/wdk-core.git

# Navigate to the project directory
cd wdk-core
```

#### Environment Configuration

```bash
# Create .env file
touch .env

# Add .env to .gitignore
echo ".env" >> .gitignore

# Add required environment variables
echo "SEED_PHRASE=<seed_phrase>" >> .env
echo "CHAIN_ID=<chain_id>" >> .env
echo "RPC_URL=<your_rpc_url>" >> .env
echo "BUNDLER_URL=<your_bundler_url>" >> .env
echo "PAYMASTER_URL=<your_paymaster_url>" >> .env
echo "PAYMASTER_ADDRESS=<paymaster_contract_address>" >> .env
echo "ENTRY_POINT_ADDRESS=<entry_point_contract_address>" >> .env
```

> **Note**: For development purposes, you can store your seed phrase in the `.env` file. Make sure `.env` is in your `.gitignore` to prevent accidentally committing sensitive data.

## Security Considerations

### Key Management
- Secure storage for private keys
- Environment variable management
- Access control implementation

### Best Practices
- Never commit sensitive data
- Use environment variables
- Implement proper error handling
- Follow security guidelines

## Development Tools

### Recommended Extensions
- ESLint
- Prettier
- Solidity
- GitLens

### Testing Tools
- Jest
- Hardhat
- Ganache

## Next Steps

After setting up your environment:
1. Proceed to the [Quick Start Guide](quick-start.md)
2. Learn about [Core Concepts](../3-core-concepts/README.md)
3. Explore [Advanced Features](../4-advanced-features/README.md)

## Troubleshooting

If you encounter setup issues:
- Check [Troubleshooting Guide](../8-troubleshooting/README.md)
- Visit [Support Channels](../8-troubleshooting/support.md)
- Join our [Discord Community](https://discord.gg/wdk) 