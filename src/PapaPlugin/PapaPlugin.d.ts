interface PapaPluginConfig {
}
export declare class PapaPlugin<Row> {
    data: Row[];
    config: PapaPluginConfig;
    constructor(config?: PapaPluginConfig);
    step({ data }: {
        data: Row;
    }): void;
}
export {};
