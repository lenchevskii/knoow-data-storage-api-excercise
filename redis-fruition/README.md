# Coding Exercise: Data Storage API (Node.js) :turtle::rocket:

Implement a small HTTP service in Node.js to store objects organized by repository.
Clients of this service should be able to GET, PUT, and DELETE objects.

## Expectations

This exercise gives you an opportunity to build a service on your own time, rather than an in-person test where you code on a whiteboard.

We respect your time, and don't expect you to spend more time than you want to complete this exercise. We value focused, high-quality code over code that is optimized for all possible edge cases.

## General Requirements

* The service should de-duplicate data objects by repository.
* Data objects should be able to be reverted to any previous version.
* When an object is downloaded, only the latest version should be returned.
* Deleting a data object should remove all versions of the data object.
* The included tests should pass and not be modified. Adding additional tests is encouraged.
* The service should implement the API as described below.
* The data can be persisted in memory, on disk, or wherever you like.
* External dependencies can be used, but are not required.

## API

### Upload an Object

```
PUT /data/{repository}
```

#### Response

```
Status: 201 Created
{
  "oid": "2845f5a412dbdfacf95193f296dd0f5b2a16920da5a7ffa4c5832f223b03de96",
  "version": 1,
  "size": 1234
}
```

### Publish a new version of an Object

```
PUT /data/{repository}/{objectID}
```

#### Response

```
Status: 201 Created
{
  "oid": "2845f5a412dbdfacf95193f296dd0f5b2a16920da5a7ffa4c5832f223b03de96",
  "version": 2,
  "size": 4567
}
```

### Revert to a previous version of an Object

```
PUT /data/{repository}/{objectID}/{version}
```

#### Response

```
Status: 200 OK
{
  "oid": "2845f5a412dbdfacf95193f296dd0f5b2a16920da5a7ffa4c5832f223b03de96",
  "version": 1,
  "size": 1234
}
```

### Download an Object

```
GET /data/{repository}/{objectID}
```

#### Response

```
Status: 200 OK
{object data}
```

Objects that are not on the server will return a `404 Not Found`.

### Delete an Object

```
DELETE /data/{repository}/{objectID}
```

#### Response

```
Status: 200 OK
```

## Getting started and Testing

This exercise requires a recent version of Node.js. Get started by installing dependencies:

```sh
npm install
```

Write your server implementation in `server.js`. Then run the tests:

```sh
npm test
```

Or run them continuously as you work:

```sh
npm run test-watch
```

Once you have a working implementation, open a pull request that includes your changes.

## Suggestions

* Your code will be read by humans, so organize it sensibly.
* Use this repository to store your work. Committing just the final solution is *ok* but we'd love to see your incremental progress. We suggest taking a look at [GitHub flow](https://guides.github.com/introduction/flow/) to structure your commits.
* [Submit a pull request](https://help.github.com/articles/creating-a-pull-request/) once you are happy with your work.
* Treat this pull request as if you’re at work submitting it to your colleagues, or to an open source project. The body of the pull request can be used to describe your reasoning and any assumptions or tradeoffs in your implementation.
