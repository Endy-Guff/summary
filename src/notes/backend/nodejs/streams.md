# Streams в Node.js — конспект

## 1. Что такое стрим и зачем он нужен

**Стрим (поток)** — это способ обрабатывать данные **по частям (чанкам)**, по мере их поступления, а не загружать всё целиком в память. Модуль: `node:stream`.

Аналогия: видео на YouTube. Ты не ждёшь, пока скачается весь фильм, — смотришь сразу, а данные подгружаются кусками.

**Проблема без стримов:**

```js
const fs = require('fs');

// Весь файл целиком загружается в оперативную память
fs.readFile('video.mp4', (err, data) => {
  res.end(data);
});
```

Если файл весит 2 ГБ, то 2 ГБ попадут в память. 100 пользователей одновременно — сервер упадёт. Плюс клиент ничего не получит, пока файл не прочитается полностью.

**То же самое со стримом:**

```js
fs.createReadStream('video.mp4').pipe(res);
```

Файл читается кусками (по умолчанию по 64 КБ), каждый кусок сразу уходит клиенту. В памяти одновременно лежит лишь небольшой буфер.

**Зачем использовать стримы:**

- **Экономия памяти** — можно обработать файл в 10 ГБ на сервере с 512 МБ RAM.
- **Скорость отклика (time to first byte)** — обработка начинается с первого чанка, не дожидаясь конца.
- **Композиция** — стримы соединяются в цепочки, как трубы: прочитать → сжать → зашифровать → записать.

Важно: стримы в Node.js — это наследники `EventEmitter`, то есть они общаются с тобой через события (`data`, `end`, `error` и т.д.).

## 2. Ключевые понятия

| Понятие | Что это |
| --- | --- |
| **Chunk (чанк)** | Один кусок данных, который проходит через стрим за раз. По умолчанию это `Buffer`. |
| **Buffer** | Объект Node.js для сырых байтов (бинарные данные). В консоли выглядит как `<Buffer 48 65 6c 6c 6f>`. Превратить в строку: `chunk.toString()` или указать `encoding: 'utf8'`. |
| **Внутренний буфер** | У каждого стрима есть «очередь», где временно лежат чанки, которые ещё не забрали (Readable) или ещё не записали (Writable). |
| **highWaterMark** | Лимит размера буфера, после которого стрим говорит «хватит, подожди». Для `fs.createReadStream` — 64 КБ, для обычных стримов — 16 КБ, в objectMode — 16 объектов. Это не жёсткий потолок, а порог-сигнал. |
| **Backpressure** | «Обратное давление»: механизм, который тормозит быстрый источник, если получатель не успевает. |

### Backpressure подробнее

Ситуация: читаем с быстрого SSD, а отдаём клиенту с медленным интернетом. Если никто не тормозит чтение, неотправленные данные накапливаются в памяти — и мы вернулись к исходной проблеме.

Как это решается:

1. `writable.write(chunk)` возвращает `true` / `false`.
2. `false` значит «мой буфер переполнен (достиг highWaterMark), перестань писать».
3. Источник ставится на паузу.
4. Когда буфер опустеет, Writable вызывает событие `drain` — можно продолжать.

```js
readable.on('data', (chunk) => {
  const ok = writable.write(chunk);
  if (!ok) {
    readable.pause();                              // стоп, получатель не успевает
    writable.once('drain', () => readable.resume()); // освободился — продолжаем
  }
});
```

Хорошая новость: вручную это писать почти никогда не нужно — `pipe()` и `pipeline()` делают ровно это за тебя ([раздел 5](#5-pipe-и-pipeline)). Но понимать механизм надо: это частый вопрос на собеседованиях.

## 3. Четыре вида стримов

| Вид | Что делает | Примеры из Node.js |
| --- | --- | --- |
| **Readable** | Источник: из него **читают** | `fs.createReadStream`, `req` (входящий HTTP-запрос на сервере), `process.stdin` |
| **Writable** | Приёмник: в него **пишут** | `fs.createWriteStream`, `res` (HTTP-ответ), `process.stdout` |
| **Duplex** | И читает, и пишет; две **независимые** стороны | TCP-сокет (`net.Socket`), WebSocket |
| **Transform** | Duplex, где выход **зависит от входа**: принимает данные, меняет, отдаёт дальше | `zlib.createGzip()`, `crypto.createCipheriv()` |

Разница Duplex и Transform: в сокете то, что ты пишешь, и то, что читаешь, — разные данные (ты отправляешь своё, собеседник своё). В Transform то, что выходит, — это переработанное то, что вошло.

### Readable — читаем файл

```js
const fs = require('fs');

const stream = fs.createReadStream('big.txt', {
  encoding: 'utf8',        // чанки будут строками, а не Buffer
  highWaterMark: 16 * 1024 // размер чанка 16 КБ
});

stream.on('data', (chunk) => console.log('Получен чанк:', chunk.length));
stream.on('end', () => console.log('Файл прочитан'));
stream.on('error', (err) => console.error(err));
```

### Writable — пишем в файл

```js
const out = fs.createWriteStream('log.txt');

out.write('первая строка\n');
out.write('вторая строка\n');
out.end('последняя строка\n'); // end() = «больше ничего не будет»

out.on('finish', () => console.log('Всё записано'));
```

После `end()` вызывать `write()` нельзя — будет ошибка `write after end`.

### Transform — сжимаем файл

```js
const zlib = require('zlib');

fs.createReadStream('big.txt')
  .pipe(zlib.createGzip())               // Transform: вход — текст, выход — сжатые байты
  .pipe(fs.createWriteStream('big.txt.gz'));
```

## 4. События и режимы

### Два режима Readable

- **Paused (на паузе)** — режим по умолчанию сразу после создания. Данные лежат в буфере, пока ты сам не заберёшь их через `stream.read()`.
- **Flowing (текущий)** — данные сами «текут» и приходят в обработчик события `data`.

Переключение в flowing: подписаться на `'data'`, вызвать `.resume()` или `.pipe()`. Обратно в paused: `.pause()`.

Ловушка: если в flowing-режиме никто не слушает `data`, данные теряются. Поэтому не смешивай несколько способов чтения (`data` + `read()` + `pipe` одновременно) — выбери один.

### События Readable

| Событие | Когда срабатывает |
| --- | --- |
| `data` | Пришёл очередной чанк |
| `end` | Данные закончились, всё прочитано |
| `readable` | В буфере есть данные, можно вызывать `read()` (для paused-режима) |
| `error` | Произошла ошибка (например, файла нет) |
| `close` | Стрим и его ресурсы (файловый дескриптор) закрыты |

### События Writable

| Событие | Когда срабатывает |
| --- | --- |
| `drain` | Буфер опустел после `write() === false`, можно писать дальше |
| `finish` | Вызван `end()` и все данные записаны |
| `error` | Ошибка записи |
| `close` | Ресурсы закрыты |
| `pipe` / `unpipe` | К стриму подключили / отключили Readable |

Запомнить: у Readable конец — это `end`, у Writable — `finish`. И **всегда вешай обработчик `error`**: необработанная ошибка в стриме роняет весь процесс Node.js.

## 5. pipe() и pipeline()

### pipe()

`readable.pipe(writable)` — соединяет источник с приёмником «трубой». За тебя он:

- слушает `data` и вызывает `write()`;
- сам управляет backpressure (`pause` / `drain` / `resume`);
- по окончании вызывает `writable.end()`.

`pipe()` возвращает **тот стрим, который ему передали**, поэтому вызовы можно строить цепочкой (середина цепочки — Transform или Duplex):

```js
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));
```

**Главная проблема pipe — ошибки.** Ошибки НЕ передаются по цепочке. Если упадёт средний стрим, остальные не закроются — утечка памяти и файловых дескрипторов. Придётся вешать `.on('error')` на **каждый** стрим вручную.

### pipeline() — современный и рекомендуемый способ

`pipeline()` делает то же, что цепочка `pipe`, но:

- ловит ошибку в **любом** звене в одном месте;
- при ошибке корректно закрывает (destroy) **все** стримы цепочки;
- есть версия на промисах — удобно с `async/await`.

```js
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

async function compress() {
  try {
    await pipeline(
      fs.createReadStream('input.txt'),
      zlib.createGzip(),
      fs.createWriteStream('input.txt.gz')
    );
    console.log('Готово');
  } catch (err) {
    console.error('Ошибка в цепочке:', err);
  }
}
```

Вариант с коллбеком: `const { pipeline } = require('stream')` и последним аргументом `(err) => { ... }`.

**Правило:** `pipe()` — для быстрых экспериментов и простого `stream.pipe(res)`; в реальном коде с несколькими звеньями — `pipeline()`.

### finished()

Если нужно просто узнать, что стрим завершился (успешно или с ошибкой): `await finished(stream)` из `stream/promises`.

## 6. Свои стримы, for await и objectMode

Свой стрим создаётся через классы `Readable`, `Writable`, `Transform` из `node:stream`. Нужно реализовать один метод с подчёркиванием (или передать его в опциях без `_`):

| Класс | Метод | Что в нём делать |
| --- | --- | --- |
| Readable | `_read()` | Отдать данные через `this.push(chunk)`; `this.push(null)` = конец |
| Writable | `_write(chunk, encoding, callback)` | Обработать чанк и вызвать `callback()` (или `callback(err)`) |
| Transform | `_transform(chunk, encoding, callback)` | Преобразовать и вызвать `callback(null, result)` или `this.push(result)` |

### Readable из массива

```js
const { Readable } = require('stream');

// Самый простой способ — из любого итерируемого
const stream = Readable.from(['a', 'b', 'c']);

// Или вручную
let i = 0;
const counter = new Readable({
  read() {
    i++;
    if (i > 5) this.push(null);   // данных больше нет
    else this.push(String(i));
  }
});
```

### Transform: всё в верхний регистр

```js
const { Transform, pipeline } = require('stream');

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
});

pipeline(process.stdin, upper, process.stdout, (err) => {
  if (err) console.error(err);
});
```

### Writable: счётчик байтов

```js
const { Writable } = require('stream');

let total = 0;
const counter = new Writable({
  write(chunk, encoding, callback) {
    total += chunk.length;
    callback(); // обязательно! иначе следующий чанк не придёт
  }
});
```

### for await — читать стрим без событий

Readable — это асинхронный итератор, поэтому его можно перебирать циклом. Backpressure соблюдается автоматически: следующий чанк не придёт, пока тело цикла не закончится.

```js
async function readFile() {
  const stream = fs.createReadStream('big.txt', { encoding: 'utf8' });
  for await (const chunk of stream) {
    console.log(chunk.length);
  }
  console.log('Готово');
}
```

Ошибки ловятся обычным `try/catch`.

### objectMode

По умолчанию стрим принимает только `Buffer` или строки. С `objectMode: true` чанком может быть **любой JS-объект** (кроме `null`). Полезно, когда обрабатываешь записи из БД или строки CSV как объекты. `Readable.from()` включает objectMode сам.

```js
const toJSON = new Transform({
  objectMode: true,
  transform(user, enc, cb) {
    cb(null, JSON.stringify(user) + '\n');
  }
});
```

## 7. На практике + шпаргалка

### Где стримы встречаются в фулстеке

- **HTTP-сервер**: `req` — Readable (тело запроса приходит чанками), `res` — Writable. Когда ты пишешь `res.write()` / `res.end()`, ты уже работаешь со стримом.
- **Отдача файлов и видео**: `fs.createReadStream(path).pipe(res)` вместо `readFile`.
- **Загрузка файлов** на сервер (multer, busboy внутри работают на стримах) и в S3.
- **Обработка больших CSV / логов** построчно (модуль `readline` поверх Readable).
- **Сжатие ответов** (`zlib`) и шифрование (`crypto`).
- **Экспорт из БД**: курсор MongoDB / PostgreSQL отдаёт записи стримом → Transform в CSV → ответ клиенту.
- **Стриминг ответа AI/LLM** и SSR в React (`renderToPipeableStream`).

### Пример: раздача файла сервером

```js
const http = require('http');
const fs = require('fs');
const { pipeline } = require('stream');

http.createServer((req, res) => {
  res.setHeader('Content-Type', 'video/mp4');
  pipeline(fs.createReadStream('video.mp4'), res, (err) => {
    if (err) console.error('Ошибка отдачи:', err.message);
  });
}).listen(3000);
```

### Когда стримы НЕ нужны

Маленький конфиг или JSON на пару КБ — проще `fs.readFile`. Стримы оправданы, когда данных много, они приходят постепенно или их размер заранее неизвестен.

### Шпаргалка

| Хочу | Использую |
| --- | --- |
| Прочитать большой файл | `fs.createReadStream(path)` |
| Записать файл по частям | `fs.createWriteStream(path)` + `write()` / `end()` |
| Соединить стримы с обработкой ошибок | `pipeline()` из `stream/promises` |
| Изменить данные на лету | `new Transform({ transform() {...} })` |
| Перебрать чанки в async-коде | `for await (const chunk of stream)` |
| Сделать стрим из массива / генератора | `Readable.from(iterable)` |
| Передавать объекты, а не байты | `objectMode: true` |
| Понять, что писать больше нельзя | `write()` вернул `false` → ждать `drain` |

### Вопросы для самопроверки

- [ ] Чем стрим лучше `readFile` для файла в 2 ГБ?
- [ ] Чем Duplex отличается от Transform?
- [ ] Что такое backpressure и какие методы/события в нём участвуют?
- [ ] Почему `pipeline()` надёжнее, чем цепочка `.pipe()`?
- [ ] В чём разница между событиями `end` и `finish`?