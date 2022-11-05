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
		const {found, parent, x: part} = this.find(x);

		if (found) {
			return;
		}

		const overlaps = parent.overlap(part);

		if (!overlaps.length) {
			parent.add(new Node(part));

			return;
		}

		const edge = Math.min(...overlaps.map(overlap => overlap.size));
		const key = part.slice(0, edge);

		const branch = new Node(key);

		branch.insert(part.slice(edge));

		for (let i = 0; i < overlaps.length; i++) {
			const removed = parent.remove(overlaps[i].node.n);

			if (removed) {
				removed.n = removed.n.slice(edge);

				branch.add(removed);
			}
		}

		parent.add(branch);
	}

	delete(x: string) {
		const {found, parent, x: key} = this.find(x);

		if (found) {
			parent.remove(key);
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
		let offset = 0;

		for (; ;) {
			const node = root.c.find(child => x.startsWith(child.n));

			if (!node) {
				return {
					found: false,
					node: null,
					parent: root,
					x,
					offset,
				} as const;
			}

			// Better implementation of `node.is` as we used `startsWith` there.
			if (x.length === node.n.length) {
				return {
					found: true,
					node,
					parent: root,
					x,
					offset,
				} as const;
			}

			const len = node.n.length;

			x = x.slice(len);
			offset += len;
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
		const entries: { prefix: string, node: Node }[] = [{prefix, node: this}];

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];

			if (!entry) {
				break;
			}

			const {prefix: localPrefix, node} = entry;

			entries.push(...node.c.map(child => ({prefix: localPrefix + node.n, node: child})));
		}

		return entries.slice(1);
	}
}

interface ILookupIntermediateElement {
	node: Node,
	prefix: string
	offset: number
}

export const lookup = (root: Node, x: string) => {
	const entries: ILookupIntermediateElement[] = [{node: root, prefix: '', offset: 0}];
	const matches: ILookupIntermediateElement[] = [];

	while (entries.length) {
		// Anti-double check for TypeScript
		const entry = entries.shift() as ILookupIntermediateElement;

		if (!entry.node.n) {
			const children = entry.node.c.map(child => ({
				node: child,
				prefix: entry.prefix,
				offset: entry.offset,
			}));

			entries.push(...children);

			continue;
		}

		const asterick = x.indexOf('*', entry.offset + 1);
		let border = asterick;

		// If there is no more asterick
		if (asterick < 0) {
			// Perform full search
			border = x.length;
		}

		// If current character is not asterick
		if (x[entry.offset] !== '*') {
			// Perform search to asterick
			const token = x.slice(entry.offset, border);

			if (token === entry.node.n) {
				matches.push(entry);

				continue;
			}

			if (
				!token.startsWith(entry.node.n)
				&& !entry.node.n.startsWith(token)
			) {
				continue;
			}

			const children = entry.node.c.map(child => ({
				node: child,
				prefix: entry.prefix + entry.node.n,
				offset: entry.offset + entry.node.n.length - 1,
			}));

			entries.push(...children);

			continue;
		}

		// If current character is asterick
		if (!x[entry.offset + 1]) {
			matches.push(entry);

			continue;
		}

		const token = x.slice(entry.offset + 1, border);
		const locals: ILookupIntermediateElement[] = [entry];

		// If there is no more asterick
		if (asterick < 0) {
			// Perform trailing search
			while (locals.length) {
				const local = locals.shift() as ILookupIntermediateElement;

				const children = local.node.c.map(child => ({
					node: child,
					prefix: local.prefix + local.node.n,
					offset: local.offset,
				}));

				locals.push(...children);

				if (
					!local.node.c.length
					&& (local.prefix + local.node.n).endsWith(token)
				) {
					matches.push(local);
				}
			}

			continue;
		}

		// If there is asterick in future
		// Perform intermediate search
		while (locals.length) {
			// Anti-double check for TypeScript
			const local = locals.shift() as ILookupIntermediateElement;

			if ((entry.prefix + entry.node.n).includes(token)) {
				matches.push(entry);

				continue;
			}

			const children = local.node.c.map(child => ({
				node: child,
				prefix: local.prefix + local.node.n,
				offset: local.offset,
			}));

			locals.push(...children);
		}
	}

	return matches;
};
