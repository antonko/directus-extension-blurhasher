# Directus Blurhasher

Это расширение для [Directus](https://github.com/directus/directus), которое автоматически генерирует [blurhash](https://github.com/woltapp/blurhash/) строки для изображений при их загрузке.

Основные возможности:
- Генерация и сохранение blurhash строк для изображений при их загрузке.
- Возможность установки уровня детализации для генерации blurhash строк (Low, Medium, High).
- Генерация blurhash строк для уже существующих изображений.
- Автоматическая миграция при установке расширения.

В системную коллекцию с иллюстрациями (`directus_files`), в дополнение к основным полям, добавляется поле `blurhash`, в котором будет храниться сгенерированная blurhash строка.

## Настройки
В разделе настроек Directus доступны следующие параметры:
- **Gegenerate on restart** - при следующем запуске Directus будут сгенерированы blurhash строки для всех существующих изображений (выключится после генерации).
- **Detail level** - уровень детализации для генерации blurhash строк (Low, Medium, High)

Скорость генерации blurhash напрямую зависит от уровня детализации.

Уровень детализации влияет на количество используемых компонентов при генерации blurhash строки. Чем выше уровень детализации, тем больше компонентов будет использовано, и тем более детализированной будет blurhash строка.

- Low: 3x3 компонента
- Medium: 6x6 компонента
- High: 8x8 компонента

## Требования

Это расширение было протестировано на версии v10.0.0 Directus, однако оно должно работать и на более ранних версиях.

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

Запустить процесс сборки в режиме разработки и docker образ Directus для тестирования.

```bash
cd blurhasher
npm install
npm run dev
```
Запуск самого Directus:
```bash
docker-compose up
```

* Логин: `admin@example.com`
* Пароль: `admin`

