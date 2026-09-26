import { useCallback, useMemo, useState } from "react";
import { useMe } from "../../api/auth";
import type { Build } from "../../api/build";
import type { Project } from "../../api/projects";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";
import { slug } from "../../mocks/generatedFiles";
import ChooseRepoStep, { type RepoChoice } from "./ChooseRepoStep";
import { commitHistory } from "./commits";
import ConnectAccountStep from "./ConnectAccountStep";
import { useGitHub, usernameFrom } from "./githubStore";
import RepoOverview from "./RepoOverview";
import RepoSetupProgress from "./RepoSetupProgress";

type GitHubDialogProps = {
  project: Project;
  build: Build | undefined;
  onClose: () => void;
};

/** Connect GitHub, choose a repository, then keep it in sync. Each step is simulated. */
export default function GitHubDialog({ project, build, onClose }: GitHubDialogProps) {
  const me = useMe();
  const { account, repo, setAccount, setRepo } = useGitHub(project.id);
  const [choice, setChoice] = useState<RepoChoice | null>(null);
  const toast = useToast();
  const developer = project.view_mode === "developer";
  const username = usernameFrom(me.data?.name ?? "architect user");
  const fileCount = build ? 14 + build.steps.length * 2 : 0;

  const commits = useMemo(() => (repo ? commitHistory(project.name, repo, build) : []), [project.name, repo, build]);

  const connect = useCallback(
    (name: string) => {
      setAccount({ username: name, connectedAt: new Date().toISOString() });
      toast("GitHub connected");
    },
    [setAccount, toast],
  );

  const finishSetup = useCallback(() => {
    if (!choice) return;
    const now = new Date().toISOString();
    setRepo({
      owner: choice.owner,
      name: choice.name,
      private: choice.private,
      mode: choice.mode,
      branch: choice.mode === "created" ? "main" : "architect/main",
      linkedAt: now,
      lastSyncedAt: now,
      autoPush: true,
      // An existing repository has a teammate's commit that isn't in Architect yet.
      remoteCommits: choice.mode === "linked" ? 1 : 0,
      pulled: [],
    });
    setChoice(null);
    toast(choice.mode === "created" ? "Repository created" : "Repository linked");
  }, [choice, setRepo, toast]);

  let title = "GitHub";
  let description: string | undefined;
  let body;
  if (!account) {
    title = "Connect GitHub";
    description = developer
      ? "Push this project to a repository and keep it in sync."
      : "Keep a copy of your app's code on GitHub, so your team can work on it too.";
    body = <ConnectAccountStep username={username} onConnected={connect} onCancel={onClose} />;
  } else if (choice) {
    title = choice.mode === "created" ? "Creating your repository" : "Linking your repository";
    body = <RepoSetupProgress choice={choice} fileCount={fileCount} onDone={finishSetup} />;
  } else if (!repo) {
    title = "Choose a repository";
    description = `Connected as ${account.username}.`;
    body = (
      <ChooseRepoStep
        username={account.username}
        defaultName={slug(project.name)}
        developer={developer}
        onChoose={setChoice}
        onCancel={onClose}
      />
    );
  } else {
    title = developer ? "Repository" : "Saved to GitHub";
    description = `Connected as ${account.username}.`;
    body = (
      <RepoOverview repo={repo} commits={commits} developer={developer} onChange={setRepo} onDisconnect={() => setRepo(null)} />
    );
  }

  return (
    <Modal title={title} description={description} onClose={onClose} dismissible={!choice}>
      {body}
    </Modal>
  );
}
