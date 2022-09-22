# vertical-radix

The derived algorithm from Radix trie with up-and-down relationship.

## API

```typescript
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
```

### `Node.prototype.n: string`

The name of the node.
This does not include parent name, or prefix.

### `Node.prototype.c: Node[]`

This children of the node.

### `Node.prototype.constructorconstructor(key?: string, structure?: INodeStringified)`

Creates new trie. You can strictly specify empty string for root node.

```typescript
const root = new Node();
```

To load from stringified structure using `JSON.stringify`, you may attach stringified object to second parameter.

```typescript
const root = new Node('', {
  key: '',
  children: [],
});
```

### `Node.prototype.insert(x: string): void`

Insert entry to the trie assuming the `Node` is the root entry.

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');
	console.log(root.stringify(true));
})();
/*
{
  "c": [
    {
      "c": [],
      "n": "alpine"
    }
  ],
  "n": ""
}
*/
```

### `Node.prototype.delete(x: string): void`

Delete entry from the trie. If you specify the parent entry, all sub-entries will be removed at the time.

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');
	root.insert('alpha');

	root.delete('alpine');

	console.log(root.stringify(true));
})();
/*
{
  "c": [
    {
      "c": [
        {
          "c": [],
          "n": "ha"
        }
      ],
      "n": "alp"
    }
  ],
  "n": ""
}
*/
```

### `Node.prototype.add(child: Node): void`

> Use `Node.prototype.insert` to build the tree.

Add node to `this` node.

```typescript
(() => {
	const root = new Node();

	root.add(new Node('alpine'));

	console.log(root.stringify(true));
})();
/*
{
  "c": [
    {
      "c": [],
      "n": "alpine"
    }
  ],
  "n": ""
}
*/
```

### `Node.prototype.remove(key: string): void`

> Use `Node.prototype.delete` to clear sub-node inside the tree.

Remove node from `this` node.

```typescript
(() => {
	const root = new Node();

	root.add(new Node('alpine'));
	root.remove('alpine');

	console.log(root.stringify(true));
})();
/*
{
  "c": [],
  "n": ""
}
*/
```

### `Node.prototype.is(x: string): boolean`

Perform strict check with `Node.prototype.key` property.

```typescript
(() => {
	const node = new Node('alpine');

	console.log(node.is('alpine'));
})();
/*
true
*/
```

### `Node.prototype.find(x: string): {found: boolean; at: Node; x: string;}`

Find entry if exists returning the last accessed node and substring of initial `x`.

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');
	root.insert('alpha');

	console.log(root.find('alpha'));
})();
/*
{ found: true, at: Node { c: [ [Node], [Node] ], n: 'alp' }, x: 'ha' }
*/
```

### `overlap(x: string): {node: Node; size: number;}[]`

Find all overlapping entries with its overlap size of the node name or key.

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');

	console.log(root.overlap('alpha'));
})();
/*
[ { node: Node { c: [], n: 'alpine' }, size: 3 } ]
*/
```

### `Node.prototype.stringify(beautify?: boolean): string`

Stringify the tree assuming the `Node` is the root entry.

### `Node.prototype.flatten(prefix?: string): string[]`

Flatten all children names with prefix.

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');
	root.insert('alpha');

	console.log(root.flatten());
})();
/*
[ 'alpha', 'alpine' ]
*/
```

### EXPERIMENTAL `lookup: (root: Node, x: string, processor: TLookupProcessor, options?: ILookupOption) => TDescribleNode[]`

Finds all occurances on based on `TLookupProcessor` typed function.
We provide some functions for basic lookup operation in tree structure.

- (Experimental) `lookupProcessorByPrefixingToken` for `startsWith`
- (Experimental) `lookupProcessorByTrailingToken` for `endsWith`
- (Experimental) `lookupProcessorByIntermediateToken` for `includes`

```typescript
(() => {
	const root = new Node();

	root.insert('alpine');
	root.insert('alpha');

	console.log(lookup(root, 'al', lookupProcessorByPrefixingToken, {offset: 0}));
})();
/*
[ { node: Node { c: [Array], n: 'alp' }, from: 0, name: 'alp' } ]
*/
```
