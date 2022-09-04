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

			entry.parent.#add(derive);
		}
	}

	#calculateOverlapPosition(overlaps: string[]) {
		for (let i = 0; ; i++) {
			const diff = overlaps[0][i];

			for (let k = 1; k < overlaps.length; k++) {
				if (overlaps[k][i] !== diff) {
					return i;
				}
			}
		}
	}

	insert(x: string) {
		const {found, at, x: part} = this.find(x);

		if (found) {
			return;
		}

		const overlaps = at.#overlap(part);

		if (!overlaps.length) {
			at.#add(new Node(part));

			return;
		}

		const edge = this.#calculateOverlapPosition([
			...overlaps.map(overlap => overlap.n),
			part,
		]);

		const deriveKey = part.slice(0, edge);
		const deriveNode = new Node(deriveKey);

		// Create branch for part
		deriveNode.#add(new Node(part.slice(edge)));

		// Append branches for overlaps
		for (let i = 0; i < overlaps.length; i++) {
			const overlap = overlaps[i];

			overlap.#shrink(edge);
			deriveNode.#add(overlap);
		}

		at.#add(deriveNode);
	}

	delete(x: string) {
		const {found, at, x: key} = this.find(x);

		if (found) {
			at.#remove(key);
		}
	}

	#add(child: Node) {
		this.c.push(child);
	}

	#remove(key: string) {
		const i = this.c.findIndex(child => child.n === key);

		if (i >= 0) {
			this.c.splice(i, 1);
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

	#overlap(x: string) {
		return this.c
			.filter(child => {
				for (let i = 1; i < x.length; i++) {
					if (child.n.startsWith(x.slice(0, i))) {
						return true;
					}
				}

				return false;
			});
	}

	#shrink(edge: number) {
		this.n = this.n.slice(edge);

		const nodes: Node[] = this.c;

		for (;;) {
			const node = nodes.shift();

			if (!node) {
				break;
			}

			node.n = node.n.slice(edge);
			nodes.push(...node.c);
		}
	}

	stringify(beautify?: boolean) {
		if (beautify) {
			return JSON.stringify(this, null, 2);
		}

		return JSON.stringify(this);
	}
}
