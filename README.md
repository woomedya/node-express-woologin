# Node Express Woologin

Library for client applications for using WooUser SSO system.

## Installation

Use the npm to install foobar.

```bash
npm install woologin
```

## Usage
#### Authorization

```nodejs
const woologin = require("node-express-woologin");

router.post('/list', woologin.auth, async (req, res) => {
   ...
})
```

#### User Router

```nodejs
const woologin = require("node-express-woologin");

app.use('/user', woologin.userRouter);

/**
 * Will be awailable after set
 * http://localhost:5000/user/sso
 * http://localhost:5000/user/logout
 * http://localhost:5000/user/verify 
 */

```

## License
[MIT](https://choosealicense.com/licenses/mit/)