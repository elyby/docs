Авторизация по протоколу OAuth2
-------------------------------

На этой странице вы найдёте информацию о реализации авторизации по протоколу OAuth2 на вашем проекте через сервис
Аккаунты Ely.by. Реализация этого протокола позволяет вашим пользователям производить авторизацию с использованием
своего аккаунта Ely.by.

Регистрация приложения
======================

Для начала вам необходимо `создать новое приложение <https://account.ely.by/dev/applications/new>`_. Выберите в качестве
типа приложения **Веб-сайт**. В качестве *адреса переадресации* можно указать только домен, но для повышения
безопасности лучше использовать полный путь переадресации. Примеры допустимых адресов:

* :samp:`http://site.com`
* :samp:`http://site.com/oauth/ely`
* :samp:`http://site.com/oauth.php?provider=ely`

После успешного добавления приложения вы попадёте на страницу со списком всех ваших приложений. Кликнув по названию
приложения вы увидите его идентификатор ``clientId`` и секрет ``clientSecret``. Они буду использоваться на
следующих шагах.

Инициализация авторизации
=========================

Для инициализации процесса авторизации вам необходимо перенаправить пользователя по следующему URL:

.. code-block:: text

   https://account.ely.by/oauth2/v1?client_id=<clientId>&redirect_uri=<redirectUri>&response_type=code&scope=<scopesList>

.. list-table:: Допустимые параметры запроса
   :widths: 1 1 98
   :header-rows: 1

   * - Параметр
     - Пример значения
     - Описание
   * - *clientId*
     - :samp:`ely`
     - **Обязательное**. ClientId, полученный при регистрации.
   * - *redirect_uri*
     - :samp:`http://site.com/oauth.php`
     - **Обязательное**. Адрес обратной переадресации, совпадающий с адресом, указанным при регистрации приложения
   * - *response_type*
     - :samp:`code`
     - **Обязательное**. Тип ответа. На данный момент поддерживается только ``code``.
   * - *scope*
     - :samp:`account_info account_email`
     - **Обязательное**. Перечень разрешений, доступ к которым вы хотите получить, разделённые пробелом. Смотрите все
       доступные права в `разделе ниже <#available-scopes>`_.
   * - *state*
     - :samp:`isfvubuysdboinsbdfvit`
     - Случайно сгенерированная строка. Используется для увеличения безопасности в качестве идентификатора сессии. Будет
       возвращена в неизменённом виде после завершения авторизации.
   * - *description*
     - :samp:`यो अनुप्रयोग विवरण`
     - Если ваше приложение доступно на нескольких языках, то используя это поле вы можете переопределить стандартное
       описание в соответствии с предпочтительным языком пользователя.
   * - *prompt*
     - :samp:`consent` или :samp:`select_account`
     - Принудительно отобразить запрос прав (``consent``) или принудительно запросить выбор аккаунта
       (``select_account``).
   * - *login_hint*
     - :samp:`erickskrauch` или :samp:`erickskrauch@ely.by`
     - Если у пользователя есть несколько аккаунтов, то указав этот в этом параметре username или email пользователя вы
       автоматически выберете аккаунт за него. Это полезно в случае повторного входа, когда токен истёк.

.. _available_scopes:
.. list-table:: Перечень доступных scopes
   :widths: 1 99
   :header-rows: 0

   * - **account_info**
     - Получение информации о пользователе.
   * - **account_email**
     - В ответе на запрос информации о пользователе будет также присутствовать его email.
   * - **offline_access**
     - Вместе с ``access_token`` вы также получите и ``refresh_token``. Смотрите подробнее
       `соответствующем разделе <#refresh-token-grant>`_.
   * - **minecraft_server_session**
     - ``access_token`` можно будет использовать в качестве сессии для Minecraft.

------------------------------------------------------------------------------------------------------------------------

Сформировав ссылку, разместите её в вашем шаблоне:

.. code-block:: html

   <a href="<ваша_ссылка>">Войти через Ely.by</a>

По нажатию на ссылку, пользователь попадёт на нашу страницу авторизации, откуда после он будет перенаправлен обратно
по адресу, указанному в параметре ``redirect_uri``.

Обратная переадресация выполняется в виде ``<redirect_uri>?code=<код авторизации>&state=<state>`` для успешной
авторизации и ``<redirect_uri?error=<идентификатор ошибки>&error_message=<описание ошибки>`` для неудачной.

Пример успешного и неудачного редиректов:

.. code-block:: text

   http://site.com/oauth/ely.php?code=dkpEEVtXBdIcgdQWak4SOPEpTJIvYa8KIq5cW9GJ&state=ajckasdcjasndckbsadc
   http://site.com/oauth/ely.php?error=access_denied&error_message=The+resource+owner+or+authorization+server+denied+the+request.

.. _authorization-code-grant:

Обмен кода на ключ
==================

После получения кода авторизации (``auth_code``), вам необходимо обменять его на ключ авторизации (``access_key``).
Для этого необходимо выполнить POST запрос на URL:

.. code-block:: text

   https://account.ely.by/api/oauth2/v1/token

И передать туда следующие параметры:

.. list-table::
   :widths: 1 99
   :header-rows: 0

   * - ``client_id``
     - ClientID, полученный при регистрации приложения.
   * - ``client_secret``
     - ClientSecret, полученный при регистрации приложения.
   * - ``redirect_uri``
     - Точный адрес, использованный для переадресации пользователя.
   * - ``grant_type``
     - В данном случае указывается ``authorization_code``.

**Пример реализации обмена на PHP:**

.. code-block:: php

   <?php
   // В этой переменной будут храниться ваши параметры OAuth2
   $oauthParams = [
       'client_id' => 'ely', // Ваш ClientId, полученный при регистрации
       'client_secret' => 'Pk4uCtZw5WVlSUpvteJuTZkVqHXZ6aNtTaLPXa7X', // Ваш ClientSecret, полученный при регистрации
       'redirect_uri' => 'http://someresource.by/oauth/some.php', // Адрес, на который вы ожидаете получить пользователя обратно (текущий url)
       'grant_type' => 'authorization_code',
   ];

   // Если возникла ошибка, то прерываем выполнение скрипта
   if (isset($_GET['error'])) {
       echo $_GET['error_message'];
       return;
   }

   // Выполняем код ниже только если пришёл код авторизации
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

Пояснение к коду:

* Сначала мы объявляем переменную ``$oauthParams``, в которую заносим значения, полученные после регистрации приложения.

* Затем проверяем, не возникла-ли ошибка. В этом случае сразу же прерываем выполнение.

* Формируем POST запрос к форме обмена ``code`` на ``access_token``, передавая необходимые поля.

* Выполняем запрос, получаем ответ, переводим его из JSON в ассоциативный массив.

.. _authorization-code-grant-response:

Ответ сервера
~~~~~~~~~~~~~

В случае успешного запроса в теле ответа будет находиться результат обмена кода авторизации на ``access_token``.
Данные являются JSON документом и могут быть легко интерпретированы средствами используемого языка программирования.

Тело JSON документа содержит следующие поля:

.. code-block:: javascript

   {
       "access_token": "4qlktsEiwgspKEAotazem0APA99Ee7E6jNryVBrZ",
       "refresh_token": "m0APA99Ee7E6jNryVBrZ4qlktsEiwgspKEAotaze", // Представлен только в случае запроса с правами offline_access
       "token_type": "Bearer",
       "expires_in": 86400 // Количество секунд, на которое выдан токен
   }

На этом процедура авторизации закончена. Полученный ``access_token`` может быть использован для получения информации о
пользователе и взаимодействия с нашим API.

Получение информации о пользователе
===================================

Если полученный токен имеет scope ``account_info``, то вы можете запросить информацию об аккаунте пользователя. Для
этого необходимо отправить запрос на URL:

.. code-block:: text

   https://account.ely.by/api/account/v1/info

Для передачи ``access_token`` используется заголовок ``Authorization`` со значением ``Bearer {access_token}``.

**Пример реализации получения информации о пользователе на PHP:**

.. code-block:: php

   <?php
   $accessToken = 'some_access_token_value';

   $curl = curl_init();
   curl_setopt($curl, CURLOPT_URL, 'https://account.ely.by/api/oauth2/v1/token');
   curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($curl, CURLOPT_HTTPHEADER, [
       'Authorization: Bearer ' . $accessToken,
   ]);
   $result = json_decode(curl_exec($curl), true);
   curl_close($curl);

В ответ вы получите JSON документ со следующим содержимым:

.. code-block:: json

   {
       "id": 1,
       "uuid": "ffc8fdc9-5824-509e-8a57-c99b940fb996",
       "username": "ErickSkrauch",
       "registeredAt": 1470566470,
       "profileLink": "http:\/\/ely.by\/u1",
       "preferredLanguage": "be",
       "email": "erickskrauch@ely.by"
   }

Обратите внимание, что поле ``email`` будет присутствовать лишь в том случае, когда был запрошен scope
``account_email``.

.. note:: В ходе дальнейшего развития сервиса, количество возвращаемых полей может увеличиться, но уже существующие
          останутся теми же.

.. _refresh-token-grant:

Обновление токена доступа
=========================

Если при выполнении авторизации вами было запрошено право на получение scope ``offline_access``, то вместе с
``access_token`` вы также получите и ``refresh_token``. Данный токен не истекает и может быть использован для получения
нового токена доступа, когда он истечёт.

Для выполнения операции обновления токена необходимо отправить POST запрос на тот же URL, что использовался и
`при обмене кода на ключ доступа <#authorization-code-grant>`_, но со следующими параметрами:

.. list-table::
   :widths: 1 99
   :header-rows: 0

   * - ``client_id``
     - ClientID, полученный при регистрации приложения.
   * - ``client_secret``
     - ClientSecret, полученный при регистрации приложения.
   * - ``scope``
     - Те же scope, что были запрошены и при получении начального токена доступа. Попытка запросить большее количество
       прав приведёт к ошибке.
   * - ``refresh_token``
     - Непосредственно токен, полученный вместе с начальным токеном доступа.

**Пример реализации обновления токена доступа на PHP:**

.. code-block:: php

   <?php
   // refresh_token, полученный при завершении авторизации
   $refreshToken = 'm0APA99Ee7E6jNryVBrZ4qlktsEiwgspKEAotaze';

   $requestParams = [
       'client_id' => 'ely', // Ваш ClientId, полученный при регистрации
       'client_secret' => 'Pk4uCtZw5WVlSUpvteJuTZkVqHXZ6aNtTaLPXa7X', // Ваш ClientSecret, полученный при регистрации
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

В качестве ответа будет точно такое же тело, какое было получено в результате
`обмена кода на ключ доступа <#authorization-code-grant-response>`_. Поле ``refresh_token`` будет отсутствовать.

Готовые библиотеки
==================

Более простым способом будет использовать уже готовую библиотеку, которой будет необходимо передать лишь регистрационные
параметры. Ниже перечислены библиотеки для различных языков программирования. Вы можете дополнить этот список своей
библиотекой.

* **PHP**:

  - [Official] https://github.com/elyby/league-oauth2-provider

* **Ruby**:

  - [Official] https://github.com/elyby/omniauth-ely

Возможные ошибки
================

Ниже приведены стандартные ошибки, которые вы можете получить в случае неправильной передачи данных на сервер
авторизации. Если вы столкнулись с ошибкой, не описанной в этой документации, пожалуйста, сообщите о ней через
`форму обратной связи <http://ely.by/site/contact>`_.

.. _auth-start-errors:

Ошибки при инициализации авторизации
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Этот раздел описывает ошибки, отображаемые при переадресации пользователя с вашего сайта на нашу страницу инициализации
авторизации.

.. code-block:: text

   Invalid request ({parameter} required).

Данная ошибка означает, что вы передали не все необходимые параметры. Чтобы решить эту ошибку просто добавьте
недостающий параметр.

.. code-block:: text

   Invalid response type '{invalid_response_type_value}'.

Данная ошибка означает, что вы передали неподдерживаемый тип ``response_type``. На данный момент поддерживается только
значение ``code``.

.. code-block:: text

   Invalid scope '{invalid_scope}'.

Ошибка указывает на то, что было запрошено неизвестный ``scope``. Убедитесь, что вы запрашиваете
`поддерживаемые права <#available-scopes>`_.

.. code-block:: text

   Can not find application you are trying to authorize.

Данная ошибка говорит о том, что переданные параметры не соответствуют ни одному из зарегистрированных приложений.
Для решения проблемы исправьте ваши значения ``client_id`` и ``redirect_uri``.

.. _issue-token-errors:

Ошибки при обмене кода на ключ
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

В случае возникновения ошибки вместо ожидаемого ответа с ``200`` статусом вы получите ``40x`` код и следующие 2 поля:

.. code-block:: json

   {
       "error": "invalid_request",
       "error_description": "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed. Check the \"code\" parameter."
   }

В поле ``error`` находится системный идентификатор ошибки, в ``error_description`` — описание ошибки на английском
языке.

**Возможные значения error:**

.. list-table::
   :widths: 1 99
   :header-rows: 0

   * - ``invalid_request``
     - Переданы не все необходимые параметры запроса или значение ``code`` не был найден в базе выданных кодов.
   * - ``unsupported_grant_type``
     - Данная ошибка сигнализирует о том, что вы попытались произвести авторизацию по неизвестному для нашего OAuth2
       сервера типу Grant.
   * - ``invalid_client``
     - Эта ошибка возникает в случае, когда трио значений ``client_id``, ``client_secret`` и ``redirect_uri`` не совпали
       ни с одним из зарегистрированных приложений.

Ошибки при запросе информации о пользователе
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Ответ со статусом ``401`` указывает на то, что заголовок ``Authorization`` не присутствует в запросе или его значение
сформировано неверно. Тело ответа будет следующим:

.. code-block:: json

   {
       "name": "Unauthorized",
       "status": 401,
       "message": "Your request was made with invalid credentials."
   }

Ответ со статусом ``403`` сигнализирует о том, что переданный в заголовке ``Authorization`` токен не содержит scope
``account_info`` или он истёк. Получаемый ответ будет иметь следующий формат:

.. code-block:: json

   {
       "name": "Forbidden",
       "status": 403,
       "message": "You are not allowed to perform this action."
   }

Ошибки при обновлении токена доступа
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

При выполнении обновления токена доступа вам могут встретиться те же ошибки, что и при
`обмене кода на ключ доступа <#issue-token-errors>`_, а также несколько новых:

.. list-table::
   :widths: 1 99
   :header-rows: 0

   * - ``invalid_request``
     - Переданы не все необходимые параметры запроса или значение ``refresh_token`` не был найден в базе выданных
       токенов.
   * - ``invalid_scope``
     - Были перечислены неподдерживаемые scope или запрошено больше, чем было у изначального токена.
