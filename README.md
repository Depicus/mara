# Mara - Web Site Checker

A simple Node.js app which will check to see if a url is available and if not sends out an email alert.

## Getting Started

You'll need a working install of Node.js - full install instructions [here](https://nodejs.org/en/download/).

### Prerequisites

There are currently a few "require" which will download on first run

```
node mara.js
```

the `--allow read` and `--allow-write` are required for db access, `--unstable` was used while testing ctrl-c code but not required and `--allow-net` is required to run the web server and fetch the urls.

## Running Mara

Two things will happen

1. Mara will set up a timed loop to check the urls in the database
2. In the future it will run a web server on http://127.0.0.1:4343

## Deployment

Mara was developed on macOS and runs on a Raspberry Pi 4 in a live environment. There is only one dependancy and that's a working SMTP server, currently we use Postfix on Ubuntu 20.04

## Built With

* [Node.js](https://nodejs.org/) - A secure runtime for JavaScript and TypeScript
* [Visual Studio Code](https://code.visualstudio.com/) - Code editing. Redefined. Free. Built on open source. Runs everywhere.
* [Skeleton CSS](http://getskeleton.com) A dead simple, responsive boilerplate.

## Contributing

Please feel free to clone, star and push.

## Versioning

For the versions available, see the [tags on this repository](https://github.com/mara/tags). 

## Authors

* **Brian Slack** - [Depicus](https://github.com/depicus) @ https://www.depicus.com

## License

This project is licensed under the MIT License.

## Acknowledgments

* Thanks to all the open source developers who make life better






<sub><sup>made with ❤️ by depicus in england</sub></sup>









