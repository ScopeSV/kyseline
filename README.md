# kyseline

---

Cli tool for [Kysely](https://github.com/kysely-org/kysely) Query builder.
This tool can help you create

## Quick start

in the root of your project, add a config file `kyselinecfg.json`

#### Config

```json
{
    "migrationDir": path, // add path to your migrations directory
    "useJsExtension": bool // optional
}
```

if `useJsExtension` is not provided, the tool will scan your project directory for a `tsconfig.json` file. If found, `.ts` will be used, else `.js`

#### Commands

To create a new table migration:

```bash
$ npx kyseline migration:make create_foo_table foo:string bar:integer
```

To add fields to an existing table:

```bash
$ npx kyseline migration:make add_foo_from_foo_table foo:string bar:integer
```

To remove fields from an existing table:

```bash
$ npx kyseline migration:make remove_foo_from_footable foo
```

<!-- ## Deployment

Add additional notes about how to deploy this on a live system -->

<!-- ## Built With

-   [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
-   [Maven](https://maven.apache.org/) - Dependency Management
-   [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds -->

<!-- ## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us. -->

## Versioning

The project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

-   **Stephan Valois** -

<!-- See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
