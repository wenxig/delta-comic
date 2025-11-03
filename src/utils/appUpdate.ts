import { Octokit } from "@octokit/rest"

export const updateByApk = async () => {
  const octokit = new Octokit
  octokit.rest.repos.getLatestRelease
}