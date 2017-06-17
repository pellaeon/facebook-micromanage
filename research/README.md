# Analyzing www.facebook.com 's React components

I hope that by analyzing facebook's react components we can get more insights on what data facebook collects on its users.

Moreover, if we periodically collect this information and compare them, we can track the changes facebook made to their web application over time. And perhaps know how facebook's tracking got more invasive over time.

## Generate a dependency graph of components

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

## Extract a list of components

    grep -oh --colour=never -R "__d('\w*'" **XXXX_files** | cut -c '6-' - | rev | cut -c '2-' | rev | sort | uniq

## Result

There are 2271 unique components as of page saved on 2017/02/25
