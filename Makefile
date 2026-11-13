start:
	python3 -m http.server 8000 --directory src

test:
	node src/testLessons.js
	node src/testPlayEngine.js
	node src/testPractice.js
	node src/testDailyQuest.js
	node src/testHints.js
	node src/testAchievements.js
	node src/testParentStats.js
	node src/testAssessment.js
	node src/testMultPrep.js

sync-docs:
	mkdir -p src/docs
	cp docs/elso-osztaly.md docs/masodik-osztaly.md docs/harmadik-osztaly.md docs/negyedik-osztaly.md docs/otodik-osztaly.md docs/hatodik-osztaly.md docs/hetedik-osztaly.md docs/nyolcadik-osztaly.md docs/sugo.md src/docs/
