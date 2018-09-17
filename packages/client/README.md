# @shingo/auth-api-client

Client library for @shingo/auth-api-server

## Usage

1. Install the library as a dependency `npm i --save-dev @shingo/auth-api-client`
2. Import the `AuthClient` class from the index and instantiate with the server address:

```ts
import { AuthClient } from '@shingo/shingo-auth-api'
const client = new AuthClient('api.shingo.org:1337')
client
  .login({ email: 'blah@blah', password: 'asdf', services: 'some-service' })
  .then(res => {
    // do something
  })
```
