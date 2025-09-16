install:
	rm -rf node_modules
	npm install

dev:
	npm run dev

build:
	rm -rf dist
	npm run build

pack:
	rm -rf git-to-jira-1.0.0
	npm pack
	
lint:
	npm run lint

lint-fix:
	npm run lint:fix

prettier-check:
	npm run prettier:check

prettier-write:
	npm run prettier:write
