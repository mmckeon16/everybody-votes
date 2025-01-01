## Deploying to Google Play Store

```bash
eas build --platform android --profile preview
```

or

```bash
eas build --platform android
```

For locally testing the build

```bash
eas build --platform android --local
```

## For submitting to Google Play Store

```bash
eas submit --platform android
```

And you need to make sure you have configured the `google-services.json` file in the `app/` directory.
Follow these instructions: https://github.com/expo/fyi/blob/main/creating-google-service-account.md
