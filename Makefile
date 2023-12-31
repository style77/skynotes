.PHONY: help run-api run-web lint lint-api lint-web format format-api format-web

help:
	@echo `make help` - this help

	@echo `make run-api` - run api server
	@echo `make run-web` - run web server

# Running

run-api:
	@echo "Running api server"
	docker compose -f docker-compose.yml up -d

run-web:
	@echo "Running web server"
	cd client && pnpm run dev

# Linting

lint: lint-api lint-web

lint-api:
	@echo "Linting api server"
	flake8 skynotes
	black skynotes --check
	isort skynotes --check-only

lint-web:
	@echo "Linting web server"
	cd client && pnpm run lint

# Formatting

format: format-api format-web

format-api:
	@echo "Formatting api server"
	black skynotes
	isort skynotes

format-web:
	@echo "Formatting web server"
	cd client && pnpm run lint --fix