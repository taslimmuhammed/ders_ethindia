import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { goerli } from 'wagmi/chains';

const { chains, publicClient } = configureChains([goerli], [publicProvider()]);

export const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
});