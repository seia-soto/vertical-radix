export interface INodeStringified {
    n: string;
    c: INodeStringified[];
}
export declare class Node {
    n: string;
    c: Node[];
    constructor(key?: string, structure?: INodeStringified);
    insert(x: string): void;
    delete(x: string): void;
    add(child: Node): void;
    remove(key: string): Node;
    is(x: string): boolean;
    find(x: string): {
        found: boolean;
        at: Node;
        x: string;
    };
    overlap(x: string): {
        node: Node;
        size: number;
    }[];
    stringify(beautify?: boolean): string;
    flatten(prefix?: string): string[];
}
export declare type TDescribleNode = {
    node: Node;
    from: number;
    name: string;
};
export declare type TLookupProcessor = (candicates: TDescribleNode[], matches: TDescribleNode[], candicate: TDescribleNode, x: string) => void;
export interface ILookupOption {
    offset: number;
}
export declare const lookup: (root: Node, x: string, processor: TLookupProcessor, options?: ILookupOption) => TDescribleNode[];
export declare const lookupProcessorByPrefixingToken: TLookupProcessor;
export declare const lookupProcessorByTrailingToken: TLookupProcessor;
export declare const lookupProcessorByIntermediateToken: TLookupProcessor;
