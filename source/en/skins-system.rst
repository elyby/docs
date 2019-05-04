Skins system
------------

On this page you'll find information about available endpoints of Ely.by's skins system service. You can use any of
them as an secondary or primary source of skins for your project.

Ely.by's skins system service provides `proxying of textures from Minecraft premium users <#textures-proxy>`_,
which means that using this service, your players will see both premium Minecraft users' skins and Ely.by users' skins.

We strive to comply with the official skins system and do not support ears and HD-skins. The system supports capes,
but doesn't allow players to wear them on their own.

If you have suggestions for improving the existing functionality, please
`create a new Issue <https://github.com/elyby/chrly/issues/new>`_ at the
`Chrly project repository <https://github.com/elyby/chrly>`_.

.. note:: You can find more detailed information about the implementation of the skins system server in the
          `Chrly project repository <https://github.com/elyby/chrly>`_.

Requests URLs
=============

The skins system is located at the :samp:`http://skinsystem.ely.by` domain.

In all queries, the :samp:`nickname` param must be replaced by the player's name. The value is case-insensitive.

.. _skin-request:
.. function:: /skins/{nickname}.png

   URL for downloading a skin texture. The :samp:`.png` extension can be omitted. If textures aren't found,
   the server will return a :samp:`404` status response.

.. _cape-request:
.. function:: /cloaks/{nickname}.png

   URL for downloading a cape texture. The :samp:`.png` extension can be omitted. If textures aren't found,
   the server will return a :samp:`404` status response.

.. function:: /textures/{nickname}

   Via this URL you can get textures in the format specified in the :samp:`textures` field of JSON property with the
   same name in response to a
   `request for signed textures <https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape>`_.

   .. code-block:: javascript

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

   Depending on the availability of textures for the player, fields :samp:`SKIN` or :samp:`CAPE` may be absent.
   Unless the skin model is :samp:`slim`, the :samp:`metadata` field will be omitted.

   The server will return an empty response with :samp:`204` status, if textures aren't found.

.. function:: /textures/signed/{nickname}

   This request is used in our `server skins system plugin <http://ely.by/server-skins-system>`_ to load textures with
   the original Mojang's signature. The textures received this way can be transferred to an unmodified game client
   without any changes. The answer will also include additional property with :samp:`name` equal to **ely**.

   .. code-block:: javascript

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

   By default textures proxying isn't used for this query. To enable it, add an additional GET parameter
   :samp:`?proxy=true`.

   The server will return an empty response with :samp:`204` status, if textures aren't found.

------------------------------------------------------------------------------------------------------------------------

You can also pass a range of additional GET parameters while making any of the above requests. They will be used
to analyze the usage of the service by different versions of the game.

:version: The version of the protocol by which skins will be requested. The current version is :samp:`2`,
          i.e. you need to specify :samp:`version=2`.

:minecraft_version: The version of Minecraft that the request is made from.

:authlib_version: The version of the Authlib used. This option is relevant for Minecraft versions 1.7.6+,
                  where a separate library is used to load skins instead of in-game code.

Here is an example of a textures request with parameters described above:

.. code-block:: text

   http://skinsystem.ely.by/textures/erickskrauch?version=2&minecraft_version=1.14.0&authlib_version=1.5.25

Additional URLs
+++++++++++++++

You can also perform a skin and cape request by passing the nickname through the GET parameter. This feature is used
to pass analytical parameters of game versions up to 1.5.2, where the nickname is simply appended to the end of the
line. To do this, the entire string is arranged in such a way that the last parameter is :samp:`name`, after appending
a nickname to which you get a full request string for textures.

.. function:: /skins?name={nickname}.png

   See the `skin request <#skin-request>`_.

.. function:: /cloaks?name={nickname}.png

   See the `cape request <#cape-request>`_.

Examples of requests for textures with parameters from above:

.. code-block:: text

   http://skinsystem.ely.by/skins?version=2&minecraft_version=1.5.2&name=erickskrauch.png
   http://skinsystem.ely.by/cloaks?version=2&minecraft_version=1.4.7&name=notch

.. _textures-proxy:

Textures proxying
=================

Ely.by's skins system service obtains textures from the official skin system in a case where no information about
textures for the requested username was found in the database. The request will also be proxied if a skin entry is
found, but it's default.

To improve the throughput of the proxying algorithm, information about textures is cached in 2 stages:

* Player's names and UUIDs matches are stored
  `for 30 days <https://help.mojang.com/customer/portal/articles/928638#targetText=How%20often%20can%20I%20change%20my%20username%3F>`_.

* Information about textures isn't updated more often than
  `once a minute <https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape>`_.

If you own a Minecraft premium account, but your nickname is busy, please contact our
`support team <http://ely.by/site/contact>`_ and after a short check we'll pass the nickname on to you.

Ready-made implementations
==========================

Ready-made patch implementations and installation instructions can be found at the
`download section of the main Ely.by website <http://ely.by/load>`_.
