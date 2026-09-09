start:
	python3 -m http.server 8000 --directory src

test:
	node src/testLessons.js

sync-docs:
	mkdir -p src/docs
	cp docs/elso-osztaly.md docs/masodik-osztaly.md docs/harmadik-osztaly.md docs/sugo.md src/docs/
