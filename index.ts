export interface INodeStringified {
  n: string,
  c: INodeStringified[]
}

export class Node {
	n: string;
	c: Node[] = [];

	constructor(key: string = '', structure?: INodeStringified) {
		this.n = key;

		if (!structure) {
			return;
		}

		const queue: { parent: Node, child: INodeStringified }[] = structure.c.map(child => ({parent: this, child}));

		for (; ;) {
			const entry = queue.shift();

			if (!entry) {
				break;
			}

			const derive = new Node(entry.child.n);

			for (let i = 0; i < entry.child.c.length; i++) {
				queue.push({
					parent: derive,
					child: entry.child.c[i],
				});
			}

			entry.parent.add(derive);
		}
	}

	insert(x: string) {
		const {found, at, x: part} = this.find(x);

		if (found) {
			return;
		}

		const overlaps = at.overlap(part);

		if (!overlaps.length) {
			at.add(new Node(part));

			return;
		}

		const edge = Math.min(...overlaps.map(overlap => overlap.size));
		const key = part.slice(0, edge);

		const parent = new Node(key);

		parent.insert(part.slice(edge));

		for (let i = 0; i < overlaps.length; i++) {
			const removed = at.remove(overlaps[i].node.n);

			if (removed) {
				removed.n = removed.n.slice(edge);

				parent.add(removed);
			}
		}

		at.add(parent);
	}

	delete(x: string) {
		const {found, at, x: key} = this.find(x);

		if (found) {
			at.remove(key);
		}
	}

	add(child: Node) {
		this.c.push(child);
	}

	remove(key: string) {
		const i = this.c.findIndex(child => child.n === key);

		if (i >= 0) {
			const [one] = this.c.splice(i, 1);

			return one;
		}
	}

	is(x: string) {
		return this.n === x;
	}

	find(x: string) {
		let root: Node = this;

		for (; ;) {
			const node = root.c.find(child => x.startsWith(child.n));

			if (!node) {
				return {
					found: false,
					at: root,
					x,
				};
			}

			if (node.is(x)) {
				return {
					found: true,
					at: root,
					x,
				};
			}

			x = x.slice(node.n.length);
			root = node;
		}
	}

	overlap(x: string) {
		const overlaps: { node: Node, size: number }[] = [];

		for (let i = 0; i < this.c.length; i++) {
			let found = false;

			for (let k = x.length; !found && k > 0; k--) {
				if (this.c[i].n.startsWith(x.slice(0, k))) {
					overlaps.push({
						node: this.c[i],
						size: k,
					});

					found = true;
				}
			}
		}

		return overlaps;
	}

	stringify(beautify?: boolean) {
		if (beautify) {
			return JSON.stringify(this, null, 2);
		}

		return JSON.stringify(this);
	}

	flatten(prefix: string = '') {
		const keys: string[] = [];
		const entries: { prefix: string, node: Node }[] = [{prefix, node: this}];

		for (; ;) {
			const entry = entries.shift();

			if (!entry) {
				break;
			}

			const {prefix: localPrefix, node} = entry;

			if (!node.c.length) {
				keys.push(localPrefix + node.n);

				continue;
			}

			entries.push(...node.c.map(child => ({prefix: localPrefix + node.n, node: child})));
		}

		return keys;
	}
}

export type TDescribleNode = { node: Node, from: number, name: string }

// eslint-disable-next-line no-unused-vars
export type TLookupProcessor = (candicates: TDescribleNode[], matches: TDescribleNode[], candicate: TDescribleNode, x: string) => void

export interface ILookupOption {
	offset: number,
}

export const lookup = (
	root: Node,
	x: string,
	processor: TLookupProcessor,
	options: ILookupOption = {
		offset: 0,
	},
) => {
	const matches: TDescribleNode[] = [];
	const candicates: TDescribleNode[] = [{node: root, from: options.offset, name: x.slice(0, options.offset)}];

	for (; ;) {
		const candicate = candicates.shift();

		if (!candicate) {
			break;
		}

		processor(candicates, matches, candicate, x);
	}

	return matches;
};

export const lookupProcessorByPrefixingToken: TLookupProcessor = (candicates, matches, candicate, x) => {
	const {node, from, name} = candicate;
	const part = x.slice(from);

	for (let i = 0; i < node.c.length; i++) {
		if (
			!node.c[i].n.startsWith(part)
			&& !part.startsWith(node.c[i].n)
		) {
			continue;
		}

		const remaining = part.length - node.c[i].n.length;

		if (remaining > 0) {
			candicates.push({node: node.c[i], from: from + remaining, name: name + node.c[i].n});
		} else {
			matches.push({node: node.c[i], from, name: name + node.c[i].n});
		}
	}
};

export const lookupProcessorByTrailingToken: TLookupProcessor = (candicates, matches, candicate, x) => {
	const {node, from, name} = candicate;
	const part = x.slice(from);

	for (let i = 0; i < node.c.length; i++) {
		if (node.c[i].n.endsWith(part)) {
			matches.push({node: node.c[i], from, name: name + node.c[i].n});
		} else if (part.startsWith(node.c[i].n)) {
			candicates.push({node: node.c[i], from: from + node.c[i].n.length, name: name + node.c[i].n});
		} else {
			candicates.push({node: node.c[i], from, name: name + node.c[i].n});
		}
	}
};

export const lookupProcessorByIntermediateToken: TLookupProcessor = (candicates, matches, candicate, x) => {
	const {node, from, name} = candicate;

	for (let i = 0; i < node.c.length; i++) {
		if (
			(!from && node.c[i].n.includes(x))
			|| (from && node.c[i].n.startsWith(x.slice(from)))
		) {
			matches.push({node: node.c[i], from, name: name + node.c[i].n});
		} else {
			candicates.push({node: node.c[i], from, name: name + node.c[i].n});
		}
	}
};
