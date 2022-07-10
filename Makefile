.PHONY: all
default: all;

# Together with the Dockerfile detect if in the container shell
ifndef SHELL_IN_CONTAINER
    CMD_EXEC := docker-compose -f infrastructure/docker-compose.yml --project-directory $(CURDIR) run solis-cloud-mqtt
endif

build:
	docker-compose -f infrastructure/docker-compose.yml --project-directory $(CURDIR) build --no-cache

clean:
	docker-compose -f infrastructure/docker-compose.yml --project-directory $(CURDIR) down --remove-orphans

shell:
	${CMD_EXEC} sh

install:
	${CMD_EXEC} npm install

update:
	${CMD_EXEC} npm update

all: install shell
