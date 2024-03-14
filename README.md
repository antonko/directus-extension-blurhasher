# Directus Blurhasher

Это расширение для Directus, которое автоматически генерирует blurhash строки для изображений при их загрузке и сохраняет их в базе данных.

При использовании API Directus для работы с коллекцией directus_files, в дополнение к основным полям, будет добавлено поле `blurhash`, в котором будет храниться сгенерированная blurhash строка.

Это расширение было протестировано на версии v10.10.4 Directus, однако оно должно работать и на более ранних версиях.

## Установка

```bash
npm install directus-extension-blurhasher
```

Пример Dockerfile с установленным расширением:

```Dockerfile
FROM directus/directus:10.10.4

USER root
RUN corepack enable
USER node

RUN pnpm install directus-extension-blurhasher
```

## Разработка

Для начала разработки вам необходимо запустить локальную копию Directus с помощью docker-compose.

* Логин: `admin@example.com`
* Пароль: `admin`

```bash
docker-compose up
```

После этого запустите процесс сборки в режиме разработки и следите за изменениями.

```bash
cd blurhasher
npm install
npm run dev
```

Также рекомендуется использовать линтеры и форматирование кода.

```bash
npm run lint
```