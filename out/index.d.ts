export interface INodeStringified {
    n: string;
    c: INodeStringified[];
}
export declare class Node {
    #private;
    n: string;
    c: Node[];
    constructor(key?: string, structure?: INodeStringified);
    insert(x: string): void;
    delete(x: string): void;
    is(x: string): boolean;
    find(x: string): {
        found: boolean;
        at: Node;
        x: string;
    };
    stringify(beautify?: boolean): string;
}
