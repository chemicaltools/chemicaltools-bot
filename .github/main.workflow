workflow "Build and deploy on push" {
  resolves = [
    "yarn exec semantic-release",
  ]
  on = "push"
}

action "yarn test" {
  uses = "Borales/actions-yarn@master"
  needs = ["yarn install"]
  args = "test"
}

action "yarn install" {
  uses = "Borales/actions-yarn@master"
  args = "install"
}

action "yarn coverage" {
  uses = "Borales/actions-yarn@master"
  needs = ["yarn test"]
  args = "coverage"
  secrets = ["CODECOV_TOKEN"]
}

action "yarn exec semantic-release" {
  uses = "Borales/actions-yarn@master"
  needs = ["yarn coverage"]
  args = "exec semantic-release"
  secrets = ["GH_TOKEN", "NPM_TOKEN"]
}
