Система скинов
--------------

На этой странице вы найдёте информацию о самостоятельной реализации системы скинов на базе сервиса Ely.by.

Система скинов Ely.by не заменяет, а дополняет официальную систему скинов, тем самым игроки с лицензией не теряют
свои скины, а игроки без лицензии смогут установить себе скин и видеть скины других игроков.

Мы стремимся соответствовать официальной системе скинов и не поддерживаем ушки и HD-скины. Поддержка плащей имеется,
но мы не позволяем игрокам самостоятельно их надевать.

URL-адреса запросов
===================

.. note:: Вы можете найти более подробную информацию о реализации системы скинов в
          `репозитории проекта Chrly <https://github.com/elyby/chrly>`_.

Система скинов располагается по URL :samp:`http://skinsystem.ely.by`. Параметр :samp:`nickname` не чувствителен
к регистру. Для получения информации о текстурах используются следующие 4 обработчика:

.. _skin-request:
.. function:: /skins/{nickname}.png

   Этот URL отвечает за загрузку скинов. В качестве параметра **nickname** необходимо передать ник игрока.
   Расширение :samp:`.png` можно опустить.

.. _cape-request:
.. function:: /cloaks/{nickname}.png

   Этот URL отвечает за загрузку плащей. В качестве параметра **nickname** необходимо передать ник игрока.
   Расширение :samp:`.png` можно опустить.

.. function:: /textures/{nickname}

   По этому URL вы можете получить текстуры для указанного в запросе **nickname**. Результатом является следующий JSON
   документ:

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

   В зависимости от доступных игроку текстур, могут отсутствовать поля :samp:`SKIN` или :samp:`CAPE`.
   Если скин не имеет тонкие руки (:samp:`slim`), то поле :samp:`metadata` также будет отсутствовать.

.. function:: /textures/signed/{nickname}

   Этот запрос используется в нашем `плагине серверной системы скинов <http://ely.by/server-skins-system>`_ для загрузки
   текстур с оригинальной подписью Mojang. Полученные в ответе текстуры могут быть без изменений переданы в
   немодифицированный игровой клиент, т.к. все параметры совпадают с оригинальными. В ответе также будет присутсвовать
   дополнительное property с :samp:`name` равным **ely**.

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

------------------------------------------------------------------------------------------------------------------------

Для сбора аналитической информации об использовании нашего сервера системы скинов мы также ожидаем получения следующих
параметров запроса, передаваемых в качестве дополнительных GET параметров:

:version: Версия протокола, по которому идёт запрос на скины. На данный момент таковой является :samp:`2` версия,
          т.е. вам необходимо указать :samp:`version=2`.

:minecraft_version: Версия Minecraft, с которой идёт запрос.

:authlib_version: Версия используемой Authlib. Этот параметр актуален для версий Minecraft 1.7.6+, когда
                  для загрузки скинов стала использоваться отдельная библиотека, а не реализация внутри игры.

Пример запроса на текстур с передачей параметров выше:

.. code-block:: text

   http://skinsystem.ely.by/textures/erickskrauch?version=2&minecraft_version=1.14.0&authlib_version=1.5.25

Вспомогательные URL
===================

Также запрос скина и плаща можно выполнить, передавая ник через GET параметр. Эта возможность используется для
передачи аналитических параметров на версиях игры до 1.5.2, когда ник просто дополнялся в конец строки, а не
использовалась подстановка :samp:`%s`. Для этого вся строка выстраивается таким образом, чтобы последним параметром
шёл :samp:`name`, после добавления ника к которому получалась валидный запрос на текстуру.

.. function:: /skins?name={nickname}.png

   Смотрите `запрос на получение скина <#skin-request>`_.

.. function:: /cloaks?name={nickname}.png

   Смотрите `запрос на получение плаща <#cape-request>`_.

Пример запросов на текстуры с передачей параметров выше:

.. code-block:: text

   http://skinsystem.ely.by/skins?version=2&minecraft_version=1.5.2&name=erickskrauch.png
   http://skinsystem.ely.by/cloaks?version=2&minecraft_version=1.4.7&name=notch

Старый формат запроса
=====================

В 1 версии протокола системы скинов применялся другой способ загрузки скинов. Все запросы шли по URL
**http://ely.by/minecraft.php** и все данные передавались через GET параметры.

На данный момент любой запрос, выполненный на вышеуказанный URL приведёт к 301 редиректу на
**http://skinsystem.ely.by/minecraft.php**, где запрос будет проксирован на основные запросы.

Этот запрос является fallback роутом, применяемым для обратной совместимости с 1 версией и не рекомендуется для
использования в новых проектах. Тем не менее, он должен быть описан, так как применятся и будет достаточно долго применяться
в связи с долгосрочным переходом на 2 версию протокола системы скинов.

1 версия системы скинов (deprecated)
====================================

.. warning:: Информация в этом разделе является устаревшей и приведена здесь только ради создания иллюзии крутого развития
             проекта. В любом случае вы **не должны** использовать этот протокол, т.к. в один момент он окончательно перестанет
             работать.

На старте проекта применялся URL для загрузки скинов **http://ely.by/minecraft.php**, в который через GET параметры
передавались данные. Сейчас этот URL является устаревшим и планомерно выводится из обращения в пользу 2 версии протокола.

.. function:: /minecraft.php

   Параметры, передаваемые в этот запрос:

   :name: Имя игрока без учёта регистра и без расширения **.png**.

   :type: Тип запрашиваемых данных. Возможные значения: skin и cloack. Изначально была допущена ошибка, из-за которой
          запрос на плащи шёл с значением cloack, вместо cloak. Увы, это так и останется в истории проекта.

   :mine_ver: Версия Minecraft. Точки в версии должны были быть заменены на прочерки, т.е. 1.7.2 должно было быть передано
              как 1_7_2. Хотя могло работать и с точками :)

   :ver: Версия протокола. Обычно передавалось значение 1_0_0, которое, в принципе, ни на что не влияло, но тем не менее
         передавалось. Сейчас применяется для идентификации запроса, проксируемого с 1 версии во 2.
