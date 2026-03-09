# docs

Documentation for the Gasket Gateway project, built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

## Local Preview

Serve the docs locally with live reload using the official Docker image (no host dependencies required):

```bash
docker run --rm -it -p 8000:8000 -v ${PWD}:/docs squidfunk/mkdocs-material
```

Then open [http://localhost:8000](http://localhost:8000).
