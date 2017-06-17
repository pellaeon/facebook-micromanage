import sys
from pprint import pprint
from graphviz import Digraph

g = Digraph('G', filename='dependency_graph.gv')
g.attr(compound='true')

files = {}
with open(sys.argv[1]) as f:
    for line in f:
        filename = line.split(':')[0]
        dep = line.split(':')[1]
        dep = dep.replace('__d', '', 1)
        dep+=')'
        tup = eval(dep)
        #pprint(tup)
        if filename not in files:
            files[filename] = []
        files[filename].append(tup)

for filename, tups in files.items():
    with g.subgraph(name=filename) as c:
        for tup in tups:
            for dependee in tup[1]:
                c.edge(dependee, tup[0])

g.view()
