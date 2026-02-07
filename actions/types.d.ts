declare module '@tenderly/actions' {
  export interface Context {
    secrets: { get(key: string): string };
    storage: {
      getStr(key: string): Promise<string>;
      putStr(key: string, value: string): Promise<void>;
    };
    gateways: {
      getGateway(network: string): string;
    };
  }

  export interface TransactionEvent {
    hash: string;
    from: string;
    to: string;
    logs: Array<{
      address: string;
      topics: string[];
      data: string;
    }>;
    network: string;
    blockNumber: number;
  }

  export type Event = TransactionEvent;

  export type ActionFn = (context: Context, event: Event) => Promise<void>;

  export enum Network {
    MAINNET = '1',
    SEPOLIA = '11155111',
    BASE = '8453',
    BASE_SEPOLIA = '84532',
  }
}
