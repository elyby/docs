Система скинов
--------------

На этой странице вы найдёте информацию о доступных запросах к сервису системы скинов Ely.by. Вы можете использовать любой из них как дополнительный или основной источник скинов для своего проекта.

Сервис системы скинов Ely.by обеспечивает `проксирование текстур владельцев лицензии Minecraft <#textures-proxy>`_, что означает, что при использовании этого сервиса игроки будут видеть как скины премиум пользователей Minecraft, так и скины пользователей сервиса Ely.by.

Мы стремимся соответствовать официальной системе скинов и не поддерживаем ушки и HD-скины. Система поддерживает плащи, но не позволяет игрокам самостоятельно их надевать.

Если у вас есть предложения по развитию существующего функционала, пожалуйста, `создайте новый Issue <https://github.com/elyby/chrly/issues/new>`_ в `репозитории проекта Chrly <https://github.com/elyby/chrly>`_.

.. note:: Вы можете найти более подробную информацию о реализации сервера системы скинов в `репозитории проекта Chrly <https://github.com/elyby/chrly>`_.

URL-адреса запросов
===================

Система скинов размещена на домене ``http://skinsystem.ely.by``.

Во всех запросах параметр ``nickname`` должен быть заменён на ник игрока. Значение не чувствительно к регистру.

.. _skin-request:
.. function:: /skins/{nickname}.png

   URL для загрузки текстуры скина. Расширение ``.png`` опционально. Если текстура не будет найдена, сервер вернёт ответ с ``404`` статусом.

.. _cape-request:
.. function:: /cloaks/{nickname}.png

   URL для загрузки текстуры плаща. Расширение ``.png`` опционально. Если текстура не будет найдена, сервер вернёт ответ с ``404`` статусом.

.. function:: /textures/{nickname}

   По этому URL вы можете получить текстуры в формате, указанному в поле ``textures`` одноимённого property в `ответе на запрос подписанных текстур <https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape>`_:

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

   В зависимости от доступных игроку текстур могут отсутствовать поля ``SKIN`` или ``CAPE``. Если модель скина не является ``slim``, то поле ``metadata`` также будет отсутствовать.

   Если текстуры не будут найдены, сервер вернёт пустой ответ с ``204`` статусом.

.. function:: /profile/{nickname}

   Данный запрос является аналогом запроса `профиля игрока в API Mojang <https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape>`_, только вместо идентификации пользователя по UUID используется его ник. Также, как и в API Mojang, вы можете добавить к запросу ``?unsigned=false``, чтобы получить текстуры с подписью. В ответе также будет присутствовать дополнительное property с ``name`` равным **ely**.

   Если у пользователя нет текстур, то они будут запрошены через прокси Mojang, после чего переподписаны с использованием `нашего ключа подписи <#signature-verification-key-request>`_.

   .. code-block:: javascript

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

   Если запрошенный никнейм не будет найден ни в локальном хранилище, ни у Mojang, сервер вернёт пустой ответ с ``204`` статусом.

.. _signature-verification-key-request:
.. function:: /signature-verification-key.der

   Данный запрос возвращает публичный ключ, который может быть использован для проверки подписи текстур. Ключ предоставляется в формате ``DER``. Этот формат используется внутри Authlib, поэтому ключ может быть в ней использован без модификации алгоритма проверки подписи.

.. function:: /signature-verification-key.pem

   Такой же запрос, что и предыдущий, но возвращает ключ в формате ``PEM``.

.. function:: /textures/signed/{nickname}

   Этот запрос используется в нашем `плагине серверной системы скинов <https://ely.by/server-skins-system>`_ для загрузки текстур с оригинальной подписью Mojang. Полученные в ответе текстуры могут быть без изменений переданы в немодифицированный игровой клиент. В ответе также будет присутствовать дополнительное property с ``name`` равным **ely**.

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

   По умолчанию для этого запроса не применяется проксирование текстур. Чтобы его включить, добавьте дополнительный GET параметр ``?proxy=true``.

   Если текстуры не будут найдены, сервер вернёт пустой ответ с ``204`` статусом.

-------------------------------------------------------------------------------

При совершении любого из вышеописанных запросов вы также можете передать ряд дополнительных GET параметров. Они будут использованы для анализа использования сервиса разными версиями игры.

:version: Версия протокола, по которому идёт запрос на скины. На данный момент это версия ``2`` , т.е. вам необходимо указать ``version=2``.

:minecraft_version: Версия Minecraft, с которой идёт запрос.

:authlib_version: Версия используемой Authlib. Этот параметр актуален для версий Minecraft 1.7.6+, где для загрузки скинов стала использоваться отдельная библиотека, а не внутриигровой код.

Пример запроса текстур с передачей вышеописанных параметров:

.. code-block:: text

   http://skinsystem.ely.by/textures/erickskrauch?version=2&minecraft_version=1.14.0&authlib_version=1.5.25

Вспомогательные URL
+++++++++++++++++++

Также запрос скина и плаща можно выполнить, передавая ник через GET параметр. Эта возможность используется для передачи аналитических параметров в версиях игры до 1.5.2, когда ник просто добавлялся в конец строки. Для этого вся строка выстраивается таким образом, чтобы последним параметром шёл ``name``, после добавления ника к которому получался полный запрос на текстуру.

.. function:: /skins?name={nickname}.png

   Смотрите `запрос на получение скина <#skin-request>`_.

.. function:: /cloaks?name={nickname}.png

   Смотрите `запрос на получение плаща <#cape-request>`_.

Пример запросов на текстуры с передачей параметров выше:

.. code-block:: text

   http://skinsystem.ely.by/skins?version=2&minecraft_version=1.5.2&name=erickskrauch.png
   http://skinsystem.ely.by/cloaks?version=2&minecraft_version=1.4.7&name=notch

.. _textures-proxy:

Проксирование текстур
=====================

Сервис системы скинов Ely.by получает текстуры из официальной системы скинов в случае, если в базе данных не было найдено информации о текстурах для запрошенного имени пользователя. Также запрос будет проксирован, если запись о скине будет найдена, но он будет стандартным.

Для улучшения пропускной способности проксирующего алгоритма, информация о текстурах кешируется в 2 стадии:

* Соответствие ника и UUID хранится в `течение 30 дней <https://help.minecraft.net/hc/en-us/articles/360034636712-Minecraft-Usernames#article-container:~:text=How%20often%20can%20I%20change%20my%20username%3F>`_.

* Информация о текстурах обновляется не чаще `раза в минуту <https://wiki.vg/Mojang_API#UUID_-.3E_Profile_.2B_Skin.2FCape:~:text=You%20can%20request%20the%20same%20profile%20once%20per%20minute>`_.

Если вы владеете лицензионным аккаунтом Minecraft, но ваш ник занят, пожалуйста, обратитесь в `службу поддержки <https://ely.by/site/contact>`_ и после небольшой проверки мы передадим ник в ваше пользование.

Готовые реализации
==================

Готовые реализации патчей и инструкции по их установке могут быть найдены в `разделе загрузок на главном сайте Ely.by <https://ely.by/load>`_.
