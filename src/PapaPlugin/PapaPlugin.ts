interface PapaPluginConfig {

}

const defaultConfig: PapaPluginConfig = {

}

export class PapaPlugin<Row> {
    /**
     * Final processed data
     */
    data: Row[] = []

    /**
     * Config for the step process
     */
    config: PapaPluginConfig
    
    constructor(config?: PapaPluginConfig) {
        this.config = {}
        Object.assign(this.config, defaultConfig)
        if (config) {
            Object.assign(this.config, config)
        }

        this.step = this.step.bind(this);
    }

    /**
     * Can be directly specified as step function of papaparse
     */
    step({ data }: { data: Row }) {
        this.data.push(data)
    }
}