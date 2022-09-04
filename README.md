# vertical-radix

The derived algorithm from Radix trie with up-and-down relationship.

## API

```typescript
export interface INodeStringified {
    key: string;
    children: INodeStringified[];
}
export declare class Node {
    #private;
    key: string;
    children: Node[];
    constructor(key?: string, structure?: INodeStringified);
    insert(x: string): void;
    delete(x: string): void;
    is(x: string): boolean;
    find(x: string): {
        found: boolean;
        at: Node;
        x: string;
    };
    stringify(beautify: boolean): string;
}
```

### `Node.prototype.constructorconstructor(key?: string, structure?: INodeStringified)`

Creates new trie. You can strictly specify empty string for root node.

```typescript
const root = new Node('');
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
const root = new Node('');

root.insert('alpine');
```

### `Node.prototype.delete(x: string): void`

Delete entry from the trie. If you specify the parent entry, all sub-entries will be removed at the time.

```typescript
const root = new Node('');

root.insert('alpine');
root.insert('alpha');

// This removes all elements
root.remove('alp');
```

### `Node.prototype.is(x: string): boolean`

Perform strict check with `Node.prototype.key` property.

```typescript
node.is('alpine');

// Or
node.key === 'alpine'
```

### `Node.prototype.find(x: string): {found: boolean; at: Node; x: string;}`

Find entry if exists returning the last accessed node and substring of initial `x`.

```typescript
const root = new Node('');

root.insert('alpine');
root.insert('alpha');

const result = root.find('alpha');
/*
{
  found: true,
  at: Node { children: [ [Node], [Node] ], key: 'alp' },
  x: 'ine'
}
*/
```

### `stringify(beautify: boolean): string`

Stringify the tree assuming the `Node` is the root entry.
