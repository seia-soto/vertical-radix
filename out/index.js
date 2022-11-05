export class Node{c=[];constructor(key="",structure){this.n=key;if(!structure){return}const queue=structure.c.map(child=>({parent:this,child}));for(;;){const entry=queue.shift();if(!entry){break}const derive=new Node(entry.child.n);for(let i=0;i<entry.child.c.length;i++){queue.push({parent:derive,child:entry.child.c[i]})}entry.parent.add(derive)}}insert(x){const{found,parent,x:part}=this.find(x);if(found){return}const overlaps=parent.overlap(part);if(!overlaps.length){parent.add(new Node(part));return}const edge=Math.min(...overlaps.map(overlap=>overlap.size));const key=part.slice(0,edge);const branch=new Node(key);branch.insert(part.slice(edge));for(let i=0;i<overlaps.length;i++){const removed=parent.remove(overlaps[i].node.n);if(removed){removed.n=removed.n.slice(edge);branch.add(removed)}}parent.add(branch)}delete(x){const{found,parent,x:key}=this.find(x);if(found){parent.remove(key)}}add(child){this.c.push(child)}remove(key){const i=this.c.findIndex(child=>child.n===key);if(i>=0){const[one]=this.c.splice(i,1);return one}}is(x){return this.n===x}find(x){let root=this;let offset=0;for(;;){const node=root.c.find(child=>x.startsWith(child.n));if(!node){return{found:false,node:null,parent:root,x,offset}}if(x.length===node.n.length){return{found:true,node,parent:root,x,offset}}const len=node.n.length;x=x.slice(len);offset+=len;root=node}}overlap(x){const overlaps=[];for(let i=0;i<this.c.length;i++){let found=false;for(let k=x.length;!found&&k>0;k--){if(this.c[i].n.startsWith(x.slice(0,k))){overlaps.push({node:this.c[i],size:k});found=true}}}return overlaps}stringify(beautify){if(beautify){return JSON.stringify(this,null,2)}return JSON.stringify(this)}flatten(prefix=""){const entries=[{prefix,node:this}];for(let i=0;i<entries.length;i++){const entry=entries[i];if(!entry){break}const{prefix:localPrefix,node}=entry;entries.push(...node.c.map(child=>({prefix:localPrefix+node.n,node:child})))}return entries.slice(1)}}export const lookup=(root,x)=>{const entries=[{node:root,prefix:"",offset:0}];const matches=[];while(entries.length){const entry=entries.shift();if(!entry.node.n){const children=entry.node.c.map(child=>({node:child,prefix:entry.prefix,offset:entry.offset}));entries.push(...children);continue}const asterick=x.indexOf("*",entry.offset+1);let border=asterick;if(asterick<0){border=x.length}if(x[entry.offset]!=="*"){const token=x.slice(entry.offset,border);if(token===entry.node.n){matches.push(entry);continue}if(!token.startsWith(entry.node.n)&&!entry.node.n.startsWith(token)){continue}const children1=entry.node.c.map(child=>({node:child,prefix:entry.prefix+entry.node.n,offset:entry.offset+entry.node.n.length-1}));entries.push(...children1);continue}if(!x[entry.offset+1]){matches.push(entry);continue}const token1=x.slice(entry.offset+1,border);const locals=[entry];if(asterick<0){while(locals.length){const local=locals.shift();const children2=local.node.c.map(child=>({node:child,prefix:local.prefix+local.node.n,offset:local.offset}));locals.push(...children2);if(!local.node.c.length&&(local.prefix+local.node.n).endsWith(token1)){matches.push(local)}}continue}while(locals.length){const local1=locals.shift();if((entry.prefix+entry.node.n).includes(token1)){matches.push(entry);continue}const children3=local1.node.c.map(child=>({node:child,prefix:local1.prefix+local1.node.n,offset:local1.offset}));locals.push(...children3)}}return matches};