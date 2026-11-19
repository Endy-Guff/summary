# Site, Same-site, Origin, Referer, Top-level navigation

> Эти слова путаются, потому что они разной природы. Два из них — **способы описать адрес** (origin, site), один — **сравнение двух адресов** (same-site / same-origin), один — **заголовок запроса** (Referer), и один — **тип перехода** (top-level navigation). Сами по себе они ничего не хранят: хранится только cookie с атрибутом `SameSite`, а он как раз опирается на все остальные понятия.
>
> Аналогия: **origin** — точный номер квартиры, **site** — весь дом. Соседи по дому — same-site, но не same-origin.

---

## Сводная таблица

| Понятие | Что это по природе | Кто задаёт | Хранится? | Зачем нужно |
| --- | --- | --- | --- | --- |
| **Origin** | Понятие + заголовок `Origin` | Вычисляет браузер из URL; заголовок ставит браузер, JS подделать не может | Нет | Граница безопасности: Same-Origin Policy, CORS, localStorage, postMessage |
| **Site** | Понятие (более крупная граница) | Вычисляет браузер из URL по Public Suffix List | Нет | Основа для правил cookie (SameSite) |
| **Same-site / cross-site** | Результат сравнения двух адресов | Браузер; виден в заголовке `Sec-Fetch-Site` | Нет, но влияет на хранимое | Решает, отправлять ли cookie |
| **SameSite** | Атрибут cookie | Сервер в `Set-Cookie` | **Да**, в браузере вместе с cookie | Защита от CSRF |
| **Referer** | Заголовок запроса | Браузер; сайт регулирует через `Referrer-Policy` | Нет | Откуда пришёл пользователь: аналитика, логи, слабая проверка CSRF |
| **Top-level navigation** | Тип перехода (событие) | Действие пользователя или скрипта | Нет | Исключение в правилах `SameSite=Lax` |

---

## Origin

**Origin = схема + хост + порт.** Все три должны совпасть.

`https://app.example.com:443` — это один origin.

- `https://app.example.com` и `http://app.example.com` — разные (схема).
- `https://app.example.com` и `https://api.example.com` — разные (хост).
- `https://example.com` и `https://example.com:8080` — разные (порт).

**Где применяется:** Same-Origin Policy — скрипт с одного origin не может читать ответы и данные другого. CORS — способ сервера разрешить это явно. localStorage, IndexedDB, доступ к DOM iframe — всё разделено по origin.

**Заголовок `Origin`:** браузер сам добавляет его в CORS-запросы и в POST. В нём только `схема://хост:порт`, без пути. Сервер смотрит на него и решает, кому отвечать.

## Site

**Site = схема + «регистрируемый домен»** (eTLD+1, то есть домен, который можно купить).

Для `https://app.shop.example.com` site — это `https://example.com`. Поддомены и порт не важны.

- `https://a.example.com` и `https://b.example.com` — **один site**.
- `https://example.com` и `https://example.org` — разные.
- `http://example.com` и `https://example.com` — разные (современные браузеры учитывают схему, «schemeful same-site»).

**Подвох:** «покупаемость» определяет Public Suffix List. В нём есть `github.io`, `co.uk` и т.п. Поэтому `alice.github.io` и `bob.github.io` — **разные** sites, хотя выглядят как поддомены одного.

## Same-site и same-origin: сравнение двух адресов

Это не адрес, а **ответ на вопрос «свои или чужие?»** про две страницы/запрос.

| Откуда → куда | Same-origin? | Same-site? |
| --- | --- | --- |
| `https://example.com` → `https://example.com/api` | ✅ | ✅ |
| `https://app.example.com` → `https://api.example.com` | ❌ | ✅ |
| `https://example.com` → `https://evil.com` | ❌ | ❌ |
| `https://alice.github.io` → `https://bob.github.io` | ❌ | ❌ |

Правило: **same-origin всегда same-site, но не наоборот.**

Браузер сообщает результат серверу в заголовке `Sec-Fetch-Site`: `same-origin`, `same-site`, `cross-site` или `none` (пользователь сам ввёл адрес / открыл закладку).

## Атрибут cookie SameSite

Сервер пишет: `Set-Cookie: session=abc; SameSite=Lax; Secure`. Браузер сохраняет cookie вместе с этим правилом и при каждом запросе проверяет: запрос same-site или cross-site?

- **Strict** — cookie только в same-site запросах. Даже по ссылке с чужого сайта придёте «не залогиненным».
- **Lax** (по умолчанию, если не указано) — в same-site запросах **и** в cross-site *top-level navigation* методом GET. В фоновые cross-site запросы (iframe, fetch, картинки, POST-формы) не отправляется.
- **None** — отправлять всегда; обязателен `Secure`. Нужно для виджетов, встраиваемых на чужие сайты.

Зачем: CSRF — когда чужой сайт заставляет браузер отправить запрос к вашему сайту с вашими cookie.

## Top-level navigation

**Переход, при котором меняется адрес в адресной строке главной вкладки.** Клик по ссылке, ввод URL, отправка формы, `window.location = ...`.

**Не** top-level: загрузка в iframe, `fetch`/XHR, `<img>`, `<script>` — это подзапросы, адресная строка не меняется.

Заголовки, по которым это видно на сервере: `Sec-Fetch-Mode: navigate` и `Sec-Fetch-Dest: document`.

**Почему важно:** это то самое исключение в `SameSite=Lax`. Пример: вы на `google.com`, кликаете ссылку на `shop.com` — это cross-site, но top-level GET, поэтому cookie `shop.com` с Lax отправится и вы будете залогинены. А если `evil.com` в скрытом iframe или через fetch дёрнет `shop.com` — cookie не уйдёт.

## Referer

**Заголовок запроса с адресом страницы, с которой пришёл запрос.** Пишется с ошибкой — `Referer` (историческая опечатка в спецификации), а политика — правильно: `Referrer-Policy`.

- Ставит **браузер**, не сервер и не cookie.
- Сколько в нём будет, решает сайт-источник через `Referrer-Policy`. По умолчанию (`strict-origin-when-cross-origin`): внутри своего origin — полный URL, на чужой origin — только origin, с HTTPS на HTTP — ничего.
- Применяется: аналитика («пришли из поиска»), логи, защита от хотлинкинга, иногда как дополнительная проверка от CSRF.
- Ненадёжен: может отсутствовать (политика `no-referrer`, расширения, прокси), поэтому строить безопасность только на нём нельзя.

**Referer vs Origin:** Referer — «откуда именно, с какой страницы» (может быть с путём), для аналитики. Origin — «с какого источника», без пути, для решений о безопасности (CORS) и отправляется надёжнее.

## Как всё связано — одной цепочкой

1. Пользователь кликает ссылку на `evil.com`, ведущую на `shop.com` → это **top-level navigation**.
2. Браузер сравнивает **site** источника и цели → **cross-site** (пишет в `Sec-Fetch-Site`).
3. Смотрит на хранимые cookie `shop.com` и их атрибут **SameSite** → Lax + top-level GET = cookie отправляется.
4. В запрос добавляет **Referer** (`https://evil.com/`, урезанный до origin) и, если нужно, **Origin**.
5. Сервер `shop.com` по этим заголовкам может решить, доверять ли запросу.

## Шпаргалка

**Origin** — точный адрес (схема+хост+порт), граница для JS. **Site** — домен целиком, граница для cookie. **Same-site** — сравнение двух адресов. **SameSite** — хранимый атрибут cookie от сервера. **Top-level navigation** — переход в адресной строке, лазейка для Lax. **Referer** — заголовок «откуда пришли», ставит браузер.