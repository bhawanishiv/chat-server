# Chat server

A chat app server using node.js, express and socket.io with test cases

## Features

### Admin APIs (only admin access)

1. API to add users.
2. API to update an existing user.
3. Validation on creation and updation of a user.
4. Test cases for all admin APIs.

### Normal users and admin users

1. API to login.
2. API to logout.
3. Validation on logout and logout APIs.
4. Test cases for all auth APIs.

### Search users  (any user)

1. Paginated API to search users

### Groups (any user)

1. API to create a group.
2. API to delete a group.
3. API to add a users in a group.
4. API to remove a  member from a group.
5. Validation on group creation and deletion.
6. Validation on adding and removing a user/member in a group.

### Group Messages using Socket.io

1. Socket listener Send message in a group.
2. Join a room / channel to get notifications for a group.
3. Like/Dislike a message send in a group.
4. Listener to get updates on a group.
5. Test cases for all above features.

## How to run

1. Do `yarn` to install dependencies
2. Then `yarn dev` to start the chat server in `development` mode.
3. To run a build server, run `yarn build` and then `yarn start`.

## How to test apis

1. Do `yarn` to install dependencies.
2. Then `yarn dev` to run the local dev server.
3. Open a new terminal, and then run `yarn test` to run test on provided apis for this app. Application server should run independently.

## Technologies used

1. Node.js
2. Express
3. MongoDB (with mongoose)
4. Socket.io
5. Mocha, Chai and supertest
6. Babel (to support modules `import`, instead of `require`)
7. Express-Validator
8. Express-Session
