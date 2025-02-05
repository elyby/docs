# Authorization via OAuth2 protocol
On this page you’ll find how to implement OAuth2 authorization on your project through the Ely.by Accounts service. The implementation of this protocol will allow your users to authorize using their Ely.by account.

## Application registration {#app-registration}
First you need to [create a new application](https://account.ely.by/dev/applications/new). Select **Website** as the application type. For the Redirect URI you can get away with just specifying the domain, but to increase security it’s advised to use the full redirect path. Here are examples of valid addresses:
* `https://example.com`
* `https://example.com/oauth/ely`
* `https://example.com/oauth.php?provider=ely`

After a successful creation of an application, you’ll be taken to the page containing a list of all your applications. If you click on the name of an application you’ll see its `clientId` identifier and its `clientSecret` secret. They’ll become important in later steps.

## Authorization initiation {#auth-init}
To initiate the authorization flow, you’ll have to redirect the user to the following URL:
```url
https://account.ely.by/oauth2/v1?client_id=<clientId>&redirect_uri=<redirectUri>&response_type=code&scope=<scopesList>
```

After creating the link, place it in your template:
```html
<a href="<your_link>">Login using Ely.by</a>
```
After clicking on the URL a user will be redirected to our login page after which they’ll be redirected back to the address specified in the `redirect_uri` parameter.

Reverse redirection returns as `<redirect_uri>?code=<auth_code>&state=<state>` for a successful authorization and `<redirect_uri>?error=<error_identifier>&error_message=<error_description>` for a failed one.

Examples of successful and unsuccessful redirects:
```url
https://example.com/oauth/ely.php?code=dkpEEVtXBdIcgdQWak4SOPEpTJIvYa8KIq5cW9GJ&state=ajckasdcjasndckbsadc
https://example.com/oauth/ely.php?error=access_denied&error_message=The+resource+owner+or+authorization+server+denied+the+request.
```

### Valid query parameters {#auth-init-params}
| **Parameter**      | **Example value**                     | **Description**                                                                                                                                                                     |
|--------------------|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *clientId*        | `ely`                                  | **Required**. ClientId that was received during registration.                                                                                                                         |
| *redirect_uri*    | `http://site.com/oauth.php`            | **Required**. Return-forwarding address, which matches the address specified during the application registration. приложения.                                                                    |
| *response_type*   | `code`                                 | **Required**. Response type. At the moment, only `code` is supported.                                                                                                    |
| *scope*           | `account_info account_email`           | **Required**. The list of permissions that you want to access, separated by spaces. See all available permissions in the [section below](#available-scopes).              |
| *state*           | `isfvubuysdboinsbdfvit`                | Randomly generated string. Used as a session identifier to increase security. Will be returned unchanged after authorization is completed.  |
| *description*     | `यो अनुप्रयोग विवरण`                  | If your application is available in several languages, you can use this field to override the default description in accordance with user’s preferred language. |
| *prompt*          | `consent` или `select_account`         | Forcibly display the request for permissions (`consent`) or forcibly request an account selection (`select_account`).                                                                 |
| *login_hint*      | `erickskrauch` или `erickskrauch@ely.by` | If a user has several accounts, then specifying username or user email in this parameter will automatically select corresponding account. This is useful in a case of re-login after the token has expired. |

### List of available scopes {#available-scopes}

| **Scope**                    | **Description**                                                                                                                                                       |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **account_info**             | Get user information.                                                                                                                             |
| **account_email**            | Response to a request for user information will also contain user’s E-mail address.                                                                               |
| **offline_access**           | With an access_token you will also recieve a refresh_token. See more at [the corresponding section](#refresh-token).                                |
| **minecraft_server_session** | It will be possible to use `access_token` as a session identifier for the Minecraft.                                                                                        |

## Exchange auth code for a access key {#access_key}
After receiving an authorization code (`auth_code`), you’ll need to exchange it for an authorization key (`access_key`). To do this, you must perform a POST request to the URL:
```url
https://account.ely.by/api/oauth2/v1/token
```
And pass in following parameters:
* **client_id**: ClientID that was received during registration.
* **client_secret**: ClientSecret that was received during application registration.
* **redirect_uri**: The exact URI that was used for user redirection.
* **grant_type**: In this case, `authorization_code` should be used.
* **code**: Authorization code received in GET params after successful redirect.

```php title="An example of the exchange in PHP"
<?php
// This variable stores your OAuth2 parameters.
$oauthParams = [
    'client_id' => 'ely', // Your ClientId received during registration.
    'client_secret' => 'Pk4uCtZw5WVlSUpvteJuTZkVqHXZ6aNtTaLPXa7X', // Your ClientSecret received at registration.
    'redirect_uri' => 'http://someresource.by/oauth/some.php', // The address you expect to get the user back to (current url).
    'grant_type' => 'authorization_code',
];

// If an error occurs, abort the script execution.
if (isset($_GET['error'])) {
    echo $_GET['error_message'];
    return;
}

// Execute the code below only if the authorization code is received.
if (!is_null($_GET['code'])) {
    $oauthParams['code'] = $_GET['code'];

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, 'https://account.ely.by/api/oauth2/v1/token');
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($oauthParams));
    $out = json_decode(curl_exec($curl), true);
    curl_close($curl);
}
```
:::info[Notes to the code]
First, we declare the `$oauthParams` variable which will store the values that we got after registering the application.
Then we check if there was an error. In which case, we immediately stop the execution.
Then we create a POST request to exchange the `code` for an `access_token`, passing all required fields in the process.
Then we execute the request, get the answer and parse it from JSON into the associative array.
:::

### Server response {#access_key_result}
In case of a successful request, the response body will contain the result of exchanging the authorization code for an `access_token`. Data is a JSON document and can be easily interpreted by tools of a used programming language.
The JSON document body will contain the following fields:
```json
{
    "access_token": "4qlktsEiwgspKEAotazem0APA99Ee7E6jNryVBrZ",
    "refresh_token": "m0APA99Ee7E6jNryVBrZ4qlktsEiwgspKEAotaze", // Presented only in case of a request with offline_access rights
    "token_type": "Bearer",
    "expires_in": 86400 // Number of seconds for which the token is issued
}
```
At this process authorization procedure is over. The resulting `access_token` can be used to obtain user information and to interact with our API.

## Getting user information {#get-user-info}
If the received token has the `account_info` scope, then you can request information about the user’s account. To do it, you have to send a request to the URL:
```url
https://account.ely.by/api/account/v1/info
```
To send `access_token`, the `Authorization` header is used with the value of `Bearer {access_token}`.

```php title="An example of getting user information in PHP"
<?php
$accessToken = 'some_access_token_value';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'https://account.ely.by/api/account/v1/info');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $accessToken,
]);
$result = json_decode(curl_exec($curl), true);
curl_close($curl);
```
In response, you will receive a JSON document with the following contents:
```json
{
    "id": 1,
    "uuid": "ffc8fdc9-5824-509e-8a57-c99b940fb996",
    "username": "ErickSkrauch",
    "registeredAt": 1470566470,
    "profileLink": "http:\/\/ely.by\/u1",
    "preferredLanguage": "be",
    "email": "erickskrauch@ely.by"
}
```
Note that the email field will only be present when the account_email scope has been requested.
:::note
In the future, the number of returned fields may increase, but existing ones will remain the same.
:::

## Refreshing access token {#refresh-token}
If you have requested the scope `offline_access` during authorization, then along with your `access_token` you’ll also get `refresh_token`. This token doesn’t expire and can be used to obtain a new access token when that one expires.

To perform a token update, you have to send a POST request to the same URL that was used for exchanging the auth code for an access token, but with the next parameters:

| **Parameter**    | **Description**                                                                                                                            |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `client_id`     | ClientID that was received during registration.                                                                                        |
| `client_secret` | ClientSecret that was received during application registration.                                                                                    |
| `scope`         | The same scopes that were obtained for the initial access token. An attempt to extend this list will cause an error. |
| `refresh_token` | The token itself that was obtained along with the access token.                                                                   |

```php title="Example of a token refreshing in PHP"
<?php
// refresh_token received at authorization completion
$refreshToken = 'm0APA99Ee7E6jNryVBrZ4qlktsEiwgspKEAotaze';

$requestParams = [
    'client_id' => 'ely', // Your ClientId received during registration
    'client_secret' => 'Pk4uCtZw5WVlSUpvteJuTZkVqHXZ6aNtTaLPXa7X', // Your ClientSecret received at registration
    'scope' => 'account_info account_email',
    'refresh_token' => $refreshToken,
    'grant_type' => 'refresh_token',
];

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, 'https://account.ely.by/api/oauth2/v1/token');
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($requestParams));
$result = json_decode(curl_exec($curl), true);
curl_close($curl);
```
The answer will have exactly the same body as the result of [exchanging auto code for an access token](#access_key_result). The `refresh_token` field will be absent.

## Available libraries {#libraries}
A simpler way is to use a ready-made library, to which you’ll only have to provide registration parameters. Listed below are libraries for various programming languages. You can extend this list by providing your own library.
* **PHP**:
  * [Official] https://github.com/elyby/league-oauth2-provider
* **Ruby**:
  * [Official] https://github.com/elyby/omniauth-ely

## Possible errors {#errors}
Below are the typical errors that you may receive after transmitting incorrect data to the authorization server. If you encounter an error that is not described in this documentation, please report it via [feedback form](https://ely.by/site/contact).

### Errors during authorization initiation {#errors-init-auth}
This section describes the errors displayed when a user is redirected from your site to our authorization initiation page.

```
Invalid request ({parameter} required).
```
This error means that you did not pass all the required parameters. To solve this error just add the missing parameter.

```
Invalid response type '{invalid_response_type_value}'.
```
This error indicates that you passed an unsupported type of response_type. Currently, the only supported value is `code`.

```
Invalid scope '{invalid_scope}'.
```
The error indicates that an unknown `scope` was requested. Make sure you request [supported scopes](#available-scopes).

```
Can not find application you are trying to authorize.
```
This error indicates that the passed parameters do not correspond to any of the registered applications. To solve the problem, fix your `client_id` and `redirect_uri` values.

### Errors when exchanging code for a key {#issue-token-errors}
If an error occurs, instead of the expected response with the `200` status, you will receive a `40x` code and the following 2 fields:
```json
{
    "error": "invalid_request",
    "error_description": "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed. Check the \"code\" parameter."
}
```
The `error` field contains the system error identifier, and `error_description` describes the error in English language.

#### Possible error values
* `invalid_request`: Not all the required request parameters were passed or the `code` value was not found in the issued codes database.
* `unsupported_grant_type`: This error indicates that you tried to authorize using an unknown for our OAuth2 server Grant-type.
* `invalid_client`: This error occurs when the trio of values `client_id`, `client_secret` and `redirect_uri` didn’t match with any of the registered applications.

### Errors when requesting user information {#errors-request-user}
Response status `401` indicates that the `Authorization` header is not present in the request or its value formed incorrectly. The response body will be as follows:
```json
{
    "name": "Unauthorized",
    "status": 401,
    "message": "Your request was made with invalid credentials."
}
```

A response with the `403` status indicates that the token transferred in the `Authorization` header does not contain the `account_info` scope or it has expired. The response will be in the following format:
```json
{
    "name": "Forbidden",
    "status": 403,
    "message": "You are not allowed to perform this action."
}
```

### Errors while updating access token {#errors-renewing-token}
When updating the access token you may encounter the same errors from [exchanging auth code for an access token](#issue-token-errors), as well as several new ones:
* `invalid_request`: Not all the required request parameters were passed or the `refresh_token` value wasn’t found in the issued tokens database.
* `invalid_scope`: The unsupported scope was listed or requested more scopes than the original token had.
