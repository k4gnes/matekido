start:
	python3 -m http.server 8000 --directory src

sync-docs:
	mkdir -p src/docs
	cp docs/elso-osztaly.md docs/masodik-osztaly.md src/docs/
