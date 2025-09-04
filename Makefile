# Makefile for Gitsy

.PHONY: help build dev install clean

help:
	@echo "Usage: make <target>"
	@echo "Targets:"
	@echo "  help:      Show this help message."
	@echo "  install:   Install dependencies."
	@echo "  dev:       Run the application in development mode."
	@echo "  build:     Build the application."
	@echo "  clean:     Clean build artifacts."

install:
	@echo "Installing backend dependencies..."
	go mod tidy
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev:
	@echo "Starting development server..."
	wails dev

build:
	@echo "Building application..."
	./scripts/build.sh

clean:
	@echo "Cleaning build artifacts..."
	rm -rf build/bin
