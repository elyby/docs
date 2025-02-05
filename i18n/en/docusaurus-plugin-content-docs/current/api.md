# Ely.by API (Mojang API simulation)

This article contains information about the API compatible with the [Mojang API](http://wiki.vg/Mojang_API) functionality. Please note that this is not a full-fledged API of Ely.by, but only a set of additional requests implemented based on our `[authorization server](./minecraft-auth)`.

## Requests
:::note
The API has no rate limit. We just have a configured fail2ban that will ban especially annoying clients. That’s the way.
:::

This section will describe the requests and their corresponding variants for Mojang API. Base URL for requests is `https://authserver.ely.by`.

### UUID by username at a time {#uuid-by-username}
This request allows you to find out the UUID of a user by their username at a specified point in time. The time is specified via GET parameter at as a Unix timestamp.

> **GET /api/users/profiles/minecraft/\{username\}**
> 
> Where `{username}` is the searched username. It can be passed in any case (in the Mojang API, only strict match).
> Note that the legacy and demo params will never be returned, as these parameters have no alternative in Ely and are specific only for Mojang services.

In case of a successful request you will receive the following response:
```json
{
  "id": "ffc8fdc95824509e8a57c99b940fb996",
  "name": "ErickSkrauch"
}
```

When the passed username isn’t found, you will receive a response with `204` status code and an empty body.

### Username by UUID + history of changes {#username-by-uuid}
This request allows you to find out all usernames used by a user by their UUID.

> **GET /api/user/profiles/\{uuid\}/names**
>
> Where `{uuid}` is a valid UUID. UUID might be written with or without hyphens. If an invalid string is passed, [IllegalArgumentException](#illegal-argument-exception) will be returned with the message `"Invalid uuid format."`.

In case of a successful request you will receive the following response:
```json
[
  {
    "name": "Admin"
  },
  {
    "name": "ErickSkrauch",
    "changedToAt": 1440707723000
  }
]
```

:::note
Since Ely.by doesn’t store the moment of username change only 1 username will always be returned. We may add full support for remembering when a username was changed in the future.
:::

When the passed UUID isn’t found, you will receive a response with `204` status code and an empty body.

### Usernames list to their UUIDs {#usernames-to-uuids}
This request allows you to query a list of users’ UUIDs by their usernames.

> **POST /api/profiles/minecraft**
>
> In the request body or POST parameters you need to pass a valid JSON array of the searched usernames.
> 
> The array must contain no more than 100 usernames, otherwise [IllegalArgumentException](#illegal-argument-exception) will be returned with the message `"Not more than that 100 profile names per call is allowed."`. In case the passed string is an invalid JSON object, the same exception will be returned, but with the text `"Passed array of profile names is an invalid JSON string."`.
> 
> Example of a request body:
> ```json
> ["ErickSkrauch", "EnoTiK", "KmotherfuckerF"]
> ```

In case of a successful request you will receive the following response:
```json
[
  {
    "id": "ffc8fdc95824509e8a57c99b940fb996",
    "name": "ErickSkrauch"
  },
  {
    "id": "b8407ae8218658ef96bb0cb3813acdfd",
    "name": "EnoTiK"
  },
  {
    "id": "39f42ba723de56d98867eabafc5e8e91",
    "name": "KmotherfuckerF"
  }
]
```

The data is returned in the same order they were requested.

If one of the passed usernames isn’t found in the database, no value will be returned for it (it will be skipped). Keep this in mind when parsing the response.

### Profile info by UUID {#profile-by-uuid}
See the `[profile request for the authorization server](./minecraft-auth#profile-request)`.

## Possible errors {#possible-errors}

### IllegalArgumentException {#illegal-argument-exception}
This error occurs when attempting to send data to the server in an incorrect format.

An error example:
```json
{
  "error": "IllegalArgumentException",
  "errorMessage": "Invalid uuid format."
}
```
The `errorMessage` is not always matches Mojang’s strings, but the differences are only apparent to Ely-specific errors. The original requests and the errors expected from them repeat Mojang texts.
