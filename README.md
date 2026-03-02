# Terminal Error Sound

This VS Code extension plays a short sound whenever a command fails in your integrated terminal.

## Features

- **Auditory Feedback**: Hear immediately when a command returns a non-zero exit code.
- **Cross-Platform**: Works on Windows, macOS, and Linux.
- **Customizable**: Easily enable or disable the sound via settings.

## Getting Started

1. Install the extension.
2. Open any integrated terminal in VS Code.
3. Run a command that fails (e.g., `ls non_existent_file`).
4. You will hear an error sound!

## Settings

- `terminalErrorSound.enabled`: Toggle the error sound on or off (default: `true`).

## Requirements

- **VS Code 1.93.0** or later.
- **Shell Integration**: Must be enabled (default in recent VS Code versions).
- **Audio Output**: A working audio device and a terminal that supports shell integration (Bash, Zsh, PowerShell, etc.).

## Publishing

To package the extension for distribution:

```bash
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file which can be installed in VS Code via the "Extensions: Install from VSIX..." command.