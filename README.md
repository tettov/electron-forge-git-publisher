# Electron Forge Git Publisher

A publisher for **Electron Forge** that copies artifacts to a local Git repository, creates commits, and optionally pushes them to a remote branch.

Please note that the publisher does not have any knowledge of the repository's state and does not perform any checks. It simply executes the specified Git operations.

## Configuration

**forge.config.js**
```js
{
    publishers: [
        {
            name: "electron-forge-git-publisher",
            config: {
                action: "commit", // "commit" or "push" - specifies whether to push commits to the remote branch. Defaults to "commit".
                repository: "./git-repository", // Path to the local repository. Defaults to process.cwd().
                branch: "main", // Name of an existing branch to check out. Uses the current branch if not specified.
                releasesPath: "./releases", // Path to the releases directory within the repository. Defaults to the repository root.
                commitMessage: "Publish release" // A custom commit message used instead of the autogenerated ones.
            }
        }
    ]
}
```
