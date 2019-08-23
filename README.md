# TransportRefund

## Init new environment

### doc

- https://codelabs.developers.google.com/codelabs/clasp/#2
- https://github.com/google/clasp

Make sure that you enabled Apps script api by visiting https://script.google.com/home/usersettings

```bash
npm i @google/clasp -g
clasp login
clasp create --title "myTitle" --rootDir ./code
```

Create the config file and make sure that it is properly configure to fit your needs.

### To upload the code when you're ready

```bash
clasp push
```

### To check on the google UI

```bash
clasp open
```

Do not forget to set up the cron job to run your code.
Select the function "scanFolder" and choose the day of the month you want.
