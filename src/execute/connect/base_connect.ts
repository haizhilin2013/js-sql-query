import { Type } from "schema-verify";
import { conConfigVerify } from "../../verify/execute/index";
import { ConnectConfig } from "../../constant/interface";
import ErrMsg from "../../error/execute/index";

class BaseConnect {
    dbConfig: ConnectConfig;
    pool: any;
    constructor(config: ConnectConfig) {
        this.setConfig(config);
    }

    setConfig(config: ConnectConfig): void {
        if (!conConfigVerify(config)) {
            throw new Error(ErrMsg.errorConnectConfig);
        }
        const host: string = config.host;
        const user: string = config.user;
        const password: string = config.password;
        const port: string | number = config.port;
        const database: string = config.database;
        const connectTimeout: number = config.connectTimeout;
        let connectionLimit: number = config.connectionLimit;
        connectionLimit = Type.number.isNatural(connectionLimit)
            ? connectionLimit
            : 1;
        let dbConfig = {
            host,
            user,
            password,
            port,
            database,
            connectTimeout,
            connectionLimit
        };
        this.dbConfig = Type.object.pure(dbConfig);
    }

    loadModule(moduleName): any {
        try {
            return require(moduleName);
        } catch (err) {
            if (err && err.code === "MODULE_NOT_FOUND") {
                throw new Error(`请先安装模块 ${moduleName}`);
            }
            throw err;
        }
    }
}

export default BaseConnect;
