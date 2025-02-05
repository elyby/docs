# Skins system

On this page you’ll find information about available endpoints of Ely.by’s skins system service. You can use any of them as an secondary or primary source of skins for your project.

Ely.by’s skins system service provides [proxying of textures from Minecraft premium users](#textures-proxy), which means that using this service, your players will see both premium Minecraft users’ skins and Ely.by users’ skins.

We strive to comply with the official skins system and do not support ears and HD-skins. The system supports capes, but doesn’t allow players to wear them on their own.

If you have suggestions for improving the existing functionality, please [create a new Issue](https://github.com/elyby/chrly/issues/new) at the [Chrly project repository](https://github.com/elyby/chrly).

:::note
You can find more detailed information about the implementation of the skins system server in the [Chrly project repository](https://github.com/elyby/chrly).
:::

## Requests URLs {#url}
The skins system is located at the `http://skinsystem.ely.by` domain.  
In all queries, the `nickname` param must be replaced by the player’s name. The value is case-insensitive.

### Skin request {#skin-request}
> **GET /skins/\{nickname\}.png**

URL for downloading a skin texture. The `.png` extension can be omitted. If textures aren’t found, the server will return a `404` status response.

### Cloak request {#cape-request}
> **GET /cloaks/\{nickname\}.png**

URL for downloading a cape texture. The `.png` extension can be omitted. If textures aren’t found, the server will return a `404` status response.

### Textures request
> **GET /textures/\{nickname\}**

Via this URL you can get textures in the format specified in the `textures` field of JSON property with the same name in response to [request for signed textures](https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape):
```json
{
  "SKIN": {
    "url": "http://example.com/skin.png",
    "metadata": {
      "model": "slim"
    }
  },
  "CAPE": {
    "url": "http://example.com/cape.png"
  }
}
```
Depending on the availability of textures for the player, fields `SKIN` or `CAPE` may be absent. Unless the skin model is `slim`, the `metadata` field will be omitted.

The server will return an empty response with `204` status, if textures aren’t found.

### Profile request
> **GET /profile/\{nickname\}**

This endpoint is an analog of the [player profile query in the Mojang’s API](https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape), but instead of UUID user is queried by his nickname. Just like in the Mojang’s API, you can append `?unsigned=false` to the URL to get textures with a signature. The response will also include an additional property with `name` ely.

If the user has no textures, they’ll be requested through the Mojang’s API, but the Mojang’s signature will be discarded and textures will be re-signed using [our signature key](#signature-verification-key-request).
```json
{
    "id": "ffc8fdc95824509e8a57c99b940fb996",
    "name": "ErickSkrauch",
    "properties": [
        {
            "name": "textures",
            "signature": "eks3dLJWzod92dLfWH6Z8uc6l3+IvrZtTj3zjwnj0AdVt44ODKoL50N+RabYxf7zF3C7tlJwT1oAtydONrxXUarqUlpVeQzLlfsuqUKBLi0L+/Y9yQLG3AciNqzEWq3hYaOsJrsaJday/hQmKFnpXEFCThTMpSuZhoAZIiH4VG48NhP70U93ejyXF9b1nPYnXP6k7BVB8LYSzcjZfdqY88jQJbbvRzOyX14ZSD0Ma92jceLNKmkTVc2UfRLUNXtQKtVSFUzlAjCXPJW89IIOZTRqLg65qstWwBvn6VuikyUB5EIxM8vuCh7zTkrMOx1v2Q0xIj8YSFcbnBH2bo87SYOIe1bOK57ZEeUJqY6uSgMlWs7dI5D3nmhFptErm72hg55Axdo1xbG4mvnmLYF7SA4yMDSytPPL+kA+sw3pafnvU2IZo38gqJSDOOpkOpdhUoHx85fzRJL8AcLSJiFlCZDl4pSi3cVuKy/xY5ohT/fJ6GEqpbZp3gACymn47zzI42VSh6j1DQnx2wnhqalTv0kE3qpAFpK/htSboQkFCW/bULO3b+vgU87XPlReT7UtH4yGLtixgs5GC8AzBraN8vOMv8TZCX9ab6mBBjOoDJjXa8Tq637TC75GxRHlpAN2jRHYvyp2zJwjUrML3u4eD4osHW+VBfl8D2l3nLJuemQ=",
            "value": "eyJ0aW1lc3RhbXAiOjE2MTQ5MzczMjc0MzcsInByb2ZpbGVJZCI6ImZmYzhmZGM5NTgyNDUwOWU4YTU3Yzk5Yjk0MGZiOTk2IiwicHJvZmlsZU5hbWUiOiJFcmlja1NrcmF1Y2giLCJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly9lbHkuYnkvc3RvcmFnZS9za2lucy82OWM2NzQwZDI5OTNlNWQ2ZjZhN2ZjOTI0MjBlZmMyOS5wbmcifX19"
        },
        {
            "name": "ely",
            "value": "but why are you asking?"
        }
    ]
}
```
The server will return an empty response with `204` status if the nickname wasn’t found locally nor via the Mojang’s API.

### Public Key Request {#signature-verification-key-request}
> **GET /signature-verification-key.der**

This endpoint returns a public key that can be used to verify a texture’s signature. The key is provided in `DER` format, so it can be used directly in the Authlib, without modifying the signature checking algorithm.

> **GET /signature-verification-key.pem**

The same endpoint as the previous one, except that it returns the key in `PEM` format.

### Signed Textures Request
> **GET /textures/signed/\{nickname\}**

This request is used in our [server skins system plugin](https://ely.by/server-skins-system) to load textures with the original Mojang’s signature. The textures received this way can be transferred to an unmodified game client without any changes. The answer will also include additional property with `name` equal to **ely**.
```json
{
  "id": "ffc8fdc95824509e8a57c99b940fb996",
  "name": "ErickSkrauch",
  "properties": [
    {
      "name": "textures",
      "signature": "QH+1rlQJYk8tW+8WlSJnzxZZUL5RIkeOO33dq84cgNoxwCkzL95Zy5pbPMFhoiMXXablqXeqyNRZDQa+OewgDBSZxm0BmkNmwdTLzCPHgnlNYhwbO4sirg3hKjCZ82ORZ2q7VP2NQIwNvc3befiCakhDlMWUuhjxe7p/HKNtmKA7a/JjzmzwW7BWMv8b88ZaQaMaAc7puFQcu2E54G2Zk2kyv3T1Bm7bV4m7ymbL8McOmQc6Ph7C95/EyqIK1a5gRBUHPEFIEj0I06YKTHsCRFU1U/hJpk98xXHzHuULJobpajqYXuVJ8QEVgF8k8dn9VkS8BMbXcjzfbb6JJ36v7YIV6Rlt75wwTk2wr3C3P0ij55y0iXth1HjwcEKsg54n83d9w8yQbkUCiTpMbOqxTEOOS7G2O0ZDBJDXAKQ4n5qCiCXKZ4febv4+dWVQtgfZHnpGJUD3KdduDKslMePnECOXMjGSAOQou//yze2EkL2rBpJtAAiOtvBlm/aWnDZpij5cQk+pWmeHWZIf0LSSlsYRUWRDk/VKBvUTEAO9fqOxWqmSgQRUY2Ea56u0ZsBb4vEa1UY6mlJj3+PNZaWu5aP2E9Unh0DIawV96eW8eFQgenlNXHMmXd4aOra4sz2eeOnY53JnJP+eVE4cB1hlq8RA2mnwTtcy3lahzZonOWc=",
      "value": "eyJ0aW1lc3RhbXAiOjE0ODYzMzcyNTQ4NzIsInByb2ZpbGVJZCI6ImM0ZjFlNTZmNjFkMTQwYTc4YzMyOGQ5MTY2ZWVmOWU3IiwicHJvZmlsZU5hbWUiOiJXaHlZb3VSZWFkVGhpcyIsInRleHR1cmVzIjp7IlNLSU4iOnsidXJsIjoiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS83Mzk1NmE4ZTY0ZWU2ZDhlYzY1NmFkYmI0NDA0ZjhlYmZmMzQxMWIwY2I5MGIzMWNiNDc2ZWNiOTk2ZDNiOCJ9fX0="
    },
    {
      "name": "ely",
      "value": "but why are you asking?"
    }
  ]
}
```
By default textures proxying isn’t used for this query. To enable it, add an additional GET parameter `?proxy=true`.

The server will return an empty response with `204` status, if textures aren’t found.

### Additional parameters
You can also pass a range of additional **GET** parameters while making any of the above requests. They will be used to analyze the usage of the service by different versions of the game.

* `version`: The version of the protocol by which skins will be requested. The current version is `2`, i.e. you need to specify `version=2`.
* `minecraft_version`: The version of Minecraft that the request is made from.
* `authlib_version`: The version of the Authlib used. This option is relevant for Minecraft versions 1.7.6+, where a separate library is used to load skins instead of in-game code.

Here is an example of a textures request with parameters described above:
```url
http://skinsystem.ely.by/textures/erickskrauch?version=2&minecraft_version=1.14.0&authlib_version=1.5.25
```

### Additional URLs
You can also perform a skin and cape request by passing the nickname through the GET parameter. This feature is used to pass analytical parameters of game versions up to 1.5.2, where the nickname is simply appended to the end of the line. To do this, the entire string is arranged in such a way that the last parameter is `name`, after appending a nickname to which you get a full request string for textures.

> **GET /skins?name=\{nickname\}.png**

See the [skin request](#skin-request).

> **GET /cloaks?name=\{nickname\}.png**

See the [cape request](#cape-request).

```url title="Examples of requests for textures with parameters from above"
http://skinsystem.ely.by/skins?version=2&minecraft_version=1.5.2&name=erickskrauch.png
http://skinsystem.ely.by/cloaks?version=2&minecraft_version=1.4.7&name=notch
```

## Textures proxying {#textures-proxy}
Ely.by’s skins system service obtains textures from the official skin system in a case where no information about textures for the requested username was found in the database. The request will also be proxied if a skin entry is found, but it’s default.

To improve the throughput of the proxying algorithm, information about textures is cached in 2 stages:
* Player’s names and UUIDs matches are stored [for 30 days](https://help.minecraft.net/hc/en-us/articles/360034636712-Minecraft-Usernames#article-container:~:text=How%20often%20can%20I%20change%20my%20username%3F).
* Information about textures isn’t updated more often than [once a minute](https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape:~:text=You%20can%20request%20the%20same%20profile%20once%20per%20minute).

If you own a Minecraft premium account, but your nickname is busy, please contact our [support team](https://ely.by/site/contact) and after a short check we’ll pass the nickname on to you.

## Ready-made implementations
Ready-made patch implementations and installation instructions can be found at the [download section of the main Ely.by website](https://ely.by/load).
