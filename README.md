# shingo-auth-api

Client library and grpc server for authentication

## Usage
### Server
1. Clone the repository and build with `npm run build`
2. Run with `npm start`

In the future we may have a npm bin install. At that point you can install the server with
`npm i -g @shingo/shingo-auth-api` and run `npx shingo-auth-api-server`
### Client
1. Install the library as a dependency `npm i --save-dev @shingo/shingo-auth-api`
2. Import the `AuthClient` class from the index and instantiate with the server address:
```ts
  import { AuthClient } from '@shingo/shingo-auth-api'
  const client = new SalesforceClient('api.shingo.org:1337')
  client.login({ email: 'blah@blah', password: 'asdf', services: 'some-service' }).then(res => {
    // do something
  })
```
