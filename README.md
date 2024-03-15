# Directus Blurhasher

This is an extension for [Directus](https://github.com/directus/directus) that automatically generates [blurhash](https://github.com/woltapp/blurhash/) strings for images upon their upload.

Key features:
- Generation and storage of blurhash strings for images upon their upload.
- The ability to set the detail level for generating blurhash strings (Low, Medium, High).
- Generation of blurhash strings for existing images.
- Automatic migration upon extension installation.

In the system collection of illustrations (`directus_files`), in addition to the main fields, a `blurhash` field is added, which will store the generated blurhash string.

## Settings
The following settings are available in the Directus settings section:
- **Generate on restart** - upon the next launch of Directus, blurhash strings will be generated for all existing images (this will be disabled after generation).
- **Detail level** - the level of detail for generating blurhash strings (Low, Medium, High)

The speed of blurhash generation directly depends on the level of detail.

The level of detail affects the number of components used in generating the blurhash string. The higher the level of detail, the more components will be used, and the more detailed the blurhash string will be.

- Low: 3x3 components
- Medium: 6x6 components
- High: 8x8 components

## Requirements

This extension has been tested on Directus version v10.0.0, however, it should work on earlier versions as well.

## Installation

```bash
npm install directus-extension-blurhasher
```

Example Dockerfile with the extension installed:

```Dockerfile
FROM directus/directus:10.10.4

USER root
RUN corepack enable
USER node

RUN pnpm install directus-extension-blurhasher
```

## Development
Start the build process in development mode and a Docker image of Directus for testing.

```bash
cd blurhasher
npm install
npm run dev
```
To launch Directus itself:
    
```bash
docker-compose up
```

- Login: admin@example.com
- Password: admin