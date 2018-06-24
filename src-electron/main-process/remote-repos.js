const git = require('isomorphic-git')
const fs = require('fs')
const path = require('path')
const GitUrlParse = require('git-url-parse')

export const Repo = {
  clone: async function (address, destination) {
    const name = GitUrlParse(address).name
    const repoPath = path.join(destination, name)
    await git.clone({
      fs,
      dir: repoPath,
      url: address
    })
    console.log(name + ' cloned')
    return name
  },
  pull: async function (dir) {
    const repo = {fs, dir: dir}
    console.log(dir)
    await git.pull({
      ...repo
    })
    console.log(dir + 'pulled')
  }
}
