# Analyzing www.facebook.com 's React components

## Steps

1. Open your favorite browser, navigate to facebook page, and save the page (Command+S / Ctrl+S).

2. Extract data (here I use macOS `grep`), `XXXX_files` is the path to folder you saved from the browser:

    grep --colour=never -o -R "__d('\w*',\[[^]\w]*\]" **XXXX_files** > dependencies.txt

3. Install Graphviz for Python

    virtualenv venv
	
	. venv/bin/activate
	
	pip install graphviz

4. Parse, it will generate graph using the Graphviz library.
Because there are lots of components, rendering should take a few minutes.
Your system PDF viewer should automatically open after rendering is done.

    python parse.py dependencies.txt

The results are saved as `dependency_graph.gv` and `dependency_graph.gv.pdf`.
