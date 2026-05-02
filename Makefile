.PHONY: help lint format check fix clean install dev docs docs-serve docs-build

.DEFAULT_GOAL := help

lint:
	bun run lint

format:
	bun run format

check:
	bunx biome check .

fix:
	bunx biome check --write .

lint-fix:
	bunx biome lint --write .

dev:
	bun run dev

install:
	bun install

clean:
	rm -rf .next
	rm -rf dist
	rm -rf build
	rm -rf node_modules

docs-serve:
	mkdocs serve

docs-build:
	mkdocs build

docs:
	mkdocs serve