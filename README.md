[![npm version](https://badge.fury.io/js/strapi-provider-upload-webp-wrapper.svg?icon=si%3Anpm)](https://badge.fury.io/js/strapi-provider-upload-webp-wrapper)

# strapi-provider-upload-webp-wrapper

## How it's works
This provider only create a wrapper between the uploaded file and another provider, this wrapper convert the image files to webp and then delivery it to the actual provider.

## Requirements
**Strapi** > v5.0.0

## Installation

```bash
# using yarn
yarn add strapi-provider-upload-webp-wrapper

# using npm
npm install strapi-provider-upload-webp-wrapper --save

# using pnpm
pnpm add strapi-provider-upload-webp-wrapper
```

## Configuration

- `provider` defines the name of the provider, in this case `strapi-provider-upload-webp-wrapper`
- `providerOptions.mimeTypes` The mime types that will be converted to webp. if not provide the following formats will be accepted. `['image/png', 'image/jpeg', 'image/jpg']`
- `providerOptions.sharpOptions` Sharp options: [See options](https://sharp.pixelplumbing.com/api-output#webp)
- `providerOptions.redirect` is the configuration passed down to the effective provider.

See the [documentation about using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) for information on installing and using a provider. To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Configuration

`./config/plugins.js` or `./config/plugins.ts` for TypeScript projects:

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-webp-wrapper",
      providerOptions: {
        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        sharpOptions: {
          quality: 50,
          smartSubsample: true
        },
        redirect: {
          provider: 'local',
          providerOptions: { sizeLimit: 2 * 1000 * 1000 }
        }
      }
    },
  },
  // ...
});
```
This configuration convert the requested mime types to wepb and delivery it to the local provider to be stored.