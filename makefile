install:
	rm -rf node_modules
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

lint-fix:
	npm run lint:fix

prettier-check:
	npm run prettier:check

prettier-write:
	npm run prettier:write
