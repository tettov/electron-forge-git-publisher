import FS from "fs";
import Path from "path";
import { PublisherBase, PublisherOptions } from "@electron-forge/publisher-base";
import simpleGit from "simple-git";

type GitPublisherConfig = Partial<{
    action: "commit" | "push";
    repository: string;
    branch: string;
    releasesPath: string;
    commitMessage: string;
}>;

export default class GitPublisher extends
    PublisherBase<GitPublisherConfig> {

    public name = "git";

    public async publish({ forgeConfig, makeResults,
        setStatusLine }: PublisherOptions) {

        this.config.action ??= "commit";
        this.config.repository ??= process.cwd();
        this.config.releasesPath ??= "./";

        if (!["commit", "push"].includes(this.config.action))
            throw new Error("invalid action: " +
                this.config.action);

        const git = simpleGit(this.config.repository);
        if (this.config.branch != null) {
            setStatusLine("Checking out branch: " +
                this.config.branch);
            await git.checkout(this.config.branch);
        }

        try {
            for (const makeResult of makeResults) {
                const releasesPath = Path.join(this.config.repository,
                    this.config.releasesPath, makeResult.platform,
                    makeResult.arch);
                FS.mkdirSync(releasesPath, { recursive: true });

                const releasePaths = new Array<string>();
                for (const artifactPath of makeResult.artifacts) {
                    setStatusLine("Copying artifact: " +
                        Path.basename(artifactPath));
                    const releasePath = Path.resolve(releasesPath,
                        Path.basename(artifactPath));
                    FS.copyFileSync(artifactPath, releasePath);
                    releasePaths.push(releasePath);
                }

                setStatusLine("Committing release");
                const productInfo =
                    (forgeConfig.packagerConfig.name ??
                        makeResult.packageJSON?.productName ??
                        makeResult.packageJSON?.name ??
                        "<unknown product>") + " " +
                    (forgeConfig.packagerConfig.appVersion ??
                        makeResult.packageJSON?.version ??
                        "<unknown version>");
                const targetInfo = makeResult.platform + "/" + makeResult.arch;
                await git.add(releasePaths)
                    .commit(this.config.commitMessage ??
                        `Publish release: ${productInfo} for ${targetInfo}`);
            }

            if (this.config.action === "push") {
                setStatusLine("Pushing commits");
                await git.push();
            }
        } finally {
            if (this.config.branch != null) {
                setStatusLine("Restoring working tree");
                await git.checkout("-");
            }
        }
        setStatusLine("Done");
    }
}
