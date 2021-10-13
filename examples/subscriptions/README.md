## Feature Example - Authentication

This project demonstrates how to use GraphQL Subscriptions with KeystoneJS.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a Apollo Sandbox at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

From this sandbox, you may listen for subscription updates `onTick` and `onTaskUpdated`, then try to update a task in the Admin UI and see new realtime update in Apollo!

## Features

This example is based on the `with-auth` one. The `keystone.ts` file has all the needed logic to make subscriptions working. The Task list has been updated to add a hook.