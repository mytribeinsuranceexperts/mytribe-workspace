#!/bin/bash
# Install all VS Code extensions on Linux server
# Copy this file to the server and run it, or paste the commands below

echo "Installing all VS Code extensions..."

# AI & Code Assistance
code --install-extension anthropic.claude-code
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension openai.chatgpt

# Git & GitHub
code --install-extension eamodio.gitlens
code --install-extension github.vscode-pull-request-github
code --install-extension github.github-vscode-theme

# Python Development
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.black-formatter
code --install-extension ms-python.flake8
code --install-extension ms-python.isort
code --install-extension ms-python.debugpy
code --install-extension ms-python.vscode-python-envs
code --install-extension njpwerner.autodocstring

# JavaScript/TypeScript/Web
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension csstools.postcss
code --install-extension wix.vscode-import-cost

# Testing
code --install-extension hbenl.vscode-test-explorer
code --install-extension littlefoxteam.vscode-python-test-adapter
code --install-extension ms-vscode.test-adapter-converter

# Docker & Containers
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-azuretools.vscode-containers

# Remote Development
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode-remote.remote-ssh-edit
code --install-extension ms-vscode.remote-explorer

# Markdown & Documentation
code --install-extension davidanson.vscode-markdownlint
code --install-extension yzhang.markdown-all-in-one

# Code Quality & Productivity
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension aaron-bond.better-comments
code --install-extension wayou.vscode-todo-highlight

# Configuration Files
code --install-extension redhat.vscode-yaml
code --install-extension tamasfe.even-better-toml

# PowerShell (optional on Linux)
code --install-extension ms-vscode.powershell

# Theme & Icons
code --install-extension pkief.material-icon-theme

echo ""
echo "✅ All extensions installed!"
echo ""
echo "Extension count:"
code --list-extensions | wc -l
echo ""
echo "Please reload VS Code to activate all extensions."
