#!/bin/bash
# Install VS Code extensions on Linux server
# Run this after connecting via Remote SSH

echo "Installing VS Code extensions for myTribe Development..."

# Core extensions
code --install-extension anthropic.claude-code
code --install-extension eamodio.gitlens
code --install-extension github.vscode-pull-request-github
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode.remote-explorer

# Python extensions
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.black-formatter
code --install-extension ms-python.flake8
code --install-extension ms-python.isort
code --install-extension ms-python.debugpy
code --install-extension ms-python.vscode-python-envs
code --install-extension njpwerner.autodocstring

# JavaScript/Web extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension csstools.postcss
code --install-extension wix.vscode-import-cost

# Testing extensions
code --install-extension hbenl.vscode-test-explorer
code --install-extension littlefoxteam.vscode-python-test-adapter
code --install-extension ms-vscode.test-adapter-converter

# Docker/Containers
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-azuretools.vscode-containers

# Markdown/Documentation
code --install-extension davidanson.vscode-markdownlint
code --install-extension yzhang.markdown-all-in-one

# Code quality
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension aaron-bond.better-comments
code --install-extension wayou.vscode-todo-highlight

# YAML/TOML
code --install-extension redhat.vscode-yaml
code --install-extension tamasfe.even-better-toml

# Theme
code --install-extension pkief.material-icon-theme
code --install-extension github.github-vscode-theme

# AI assistants (optional - you may want to skip these on server)
# code --install-extension github.copilot
# code --install-extension github.copilot-chat
# code --install-extension openai.chatgpt

# PowerShell (if needed on Linux)
# code --install-extension ms-vscode.powershell

echo "✅ Extension installation complete!"
echo "Restart VS Code to activate all extensions."
