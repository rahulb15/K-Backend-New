// File: src/prompts/nft-marketplace-prompt.ts

interface NFTMarketplaceData {
    platformName: string;
    recentTransactions: {
        user: string;
        wallet: string;
        action: string;
        item: string;
        amount: string;
    }[];
}

export const generateInitialPrompt = (data: NFTMarketplaceData): string => `
You are an AI assistant for ${data.platformName}, an NFT marketplace platform. Here's some recent activity:

${data.recentTransactions.map(t => `- User ${t.user} (Wallet: ${t.wallet}): ${t.action} ${t.item} for ${t.amount}.`).join('\n')}

You can answer questions about our platform, NFTs, and recent transactions. Please greet the user and ask how you can assist them today.
`;