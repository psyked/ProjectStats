# ProjectStats
This repository is a Node.js project which interacts with the Bitbucket API to retrieve Key Statistics about users and repositories. It recursively retrieves JSON data from the official Bitbucket APIs and collates it, before outputting a JSON file of its own.

As a bonus, there are some other scripts which import the outputted JSON file and re-renders it as a static HTML website suitable for hosting on GitHub pages (or other similar setup.)

## Installing
1. As with all Node.js projects, you'll need to install [Node.js](https://nodejs.org/en/).
2. Download the project, and from the project root directory, run the command `npm install`, which will install all of the project dependencies automatically.

## Running
The script needs to know three key things; the *owner* of the repositories to generate stats for, your Bitbucket *username* and your Bitbucket *password*. For example (from the command line);

```node datacollector/bitbucket.js --owner "mmtdigital" --username "james.f" --password "mysupersecretpassword"```

The script doesn't really output anything until the very end, so if you've got lots of repositories, be prepared for a little wait.  The results will be written to a file named `output.json`.

### Viewing the static website
To quickly view your generated static website locally, use the command below, which will serve your files on http://localhost:8080 by default.

```node local-webserver.js```
