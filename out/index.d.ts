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
        readonly found: false;
        readonly node: any;
        readonly parent: Node;
        readonly x: string;
    } | {
        readonly found: true;
        readonly node: Node;
        readonly parent: Node;
        readonly x: string;
    };
    overlap(x: string): {
        node: Node;
        size: number;
    }[];
    stringify(beautify?: boolean): string;
    flatten(prefix?: string): {
        prefix: string;
        node: Node;
    }[];
}
interface ILookupIntermediateElement {
    node: Node;
    prefix: string;
    offset: number;
}
export declare const lookup: (root: Node, x: string) => ILookupIntermediateElement[];
export {};
