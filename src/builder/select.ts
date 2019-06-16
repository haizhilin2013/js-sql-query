import * as Util from "../util/util";
import Combine from "./combine";
import { KeyValueStr } from "../constant/interface";
import { QueryTypes, DialectTypes } from "../constant/enum";

class Select extends Combine {
    protected selectFields: string[];
    protected fieldsAsMap: KeyValueStr;
    readonly queryType: QueryTypes = QueryTypes.select;
    constructor(dialectType: DialectTypes) {
        super();
        this.selectFields = [];
        this.fieldsAsMap = {};
        this.dialectType = dialectType;
    }

    fields(firstField: string[] | string, ...otherFields: string[]) {
        const selectFields: string[] = Util.safeToArr(this.selectFields);
        const argFields: string[] = Util.argStrArrTrans(
            firstField,
            otherFields
        );
        const result = [].concat(selectFields, argFields);
        this.selectFields = Array.from(new Set(result));
        if (result.includes("*")) {
            this.selectFields = [];
        }
        return this;
    }

    asMap(map: KeyValueStr) {
        let asMap: KeyValueStr = this.fieldsAsMap;
        if (Util.isNotEmptyObj(map)) {
            asMap = Object.assign({}, asMap, map);
        }
        this.fieldsAsMap = asMap;
        return this;
    }

    protected formatFields(): string[] {
        const fields: string[] = Util.safeToArr(this.selectFields);
        const asMap: KeyValueStr = Util.safeToObj(this.fieldsAsMap);
        const result: string[] = [];
        for (const field of fields) {
            const safeField = this.safeKey(field);
            if (Util.isNotEmptyStr(asMap[field])) {
                const safeAsField = this.safeKey(asMap[field]);
                result.push(`${safeField} AS ${safeAsField}`);
            } else {
                result.push(safeField);
            }
        }
        return result;
    }

    protected formatFieldStr(): string {
        const fields: string[] = this.formatFields();
        const funcs: string[] = Util.safeToArr(this.combineFuncs);
        let result: string;
        if (fields.length > 0 || funcs.length > 0) {
            result = [].concat(fields, funcs).join(", ");
        } else {
            result = "*";
        }
        return result;
    }

    build(): string {
        this.checkQuery();
        const type: string = this.queryType;
        const table: string = this.getQueryTable();
        const fieldsStr: string = this.formatFieldStr();
        let query: string = `${type} ${fieldsStr} FROM ${table}`;
        query = this.whereBuild(query);
        query = this.groupBuild(query);
        query = this.havingBuild(query);
        query = this.orderBuild(query);
        query = this.limitBuild(query);
        return query;
    }

    limit(offset: number, step?: number) {
        this.getLimitCase().limit(offset, step);
        return this;
    }

    paging(page: number, size: number) {
        this.getLimitCase().paging(page, size);
        return this;
    }

    findOne() {
        this.getLimitCase().step(1);
        return this;
    }

    checkQuery(): void {
        this._checkQuery();
    }
}

export default Select;
