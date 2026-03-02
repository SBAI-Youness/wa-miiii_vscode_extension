import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Terminal Error Sound extension is now active!');

  const soundProvider = new SoundPlayerProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('wa-miiii-player', soundProvider)
  );

  // Register command to manually activate
  context.subscriptions.push(
    vscode.commands.registerCommand('waMiiii.activatePlayer', () => {
      vscode.commands.executeCommand('wa-miiii-player.focus');
    })
  );

  // Try to auto-activate the player view after a short delay
  setTimeout(() => {
    vscode.commands.executeCommand('wa-miiii-player.focus').then(() => {
      console.log('wa-MIIII engine initialization triggered.');
    });
  }, 2000);

  const disposable = vscode.window.onDidEndTerminalShellExecution(async (event) => {
    const exitCode = event.exitCode;

    if (exitCode !== undefined && exitCode !== 0) {
      const config = vscode.workspace.getConfiguration('waMiiii');
      const enabled = config.get<boolean>('enabled', true);

      if (enabled) {
        console.log(`Command failed with exit code ${exitCode}. Playing sound...`);
        if (!soundProvider.isReady()) {
          console.log('wa-MIIII engine not ready, attempting to re-initialize...');
          vscode.commands.executeCommand('wa-miiii-player.focus');
          setTimeout(() => soundProvider.playSound(), 1000);
        } else {
          soundProvider.playSound();
        }
      }
    }
  });

  context.subscriptions.push(disposable);
}

class SoundPlayerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'log':
          console.log(`[Webview Log] ${message.text}`);
          break;
        case 'error':
          console.error(`[Webview Error] ${message.text}`);
          break;
      }
    });

    console.log('Webview view resolved.');
  }

  public isReady(): boolean {
    return !!this._view;
  }

  public playSound() {
    if (this._view) {
      this._view.webview.postMessage({ command: 'play' });
    } else {
      console.error('Sound player view not ready yet.');
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const soundUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'wa-miiii.wav'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Player</title>
    <style>
        body { padding: 10px; font-family: sans-serif; }
        button { 
            background: #007acc; color: white; border: none; 
            padding: 8px 12px; cursor: pointer; border-radius: 2px;
            font-size: 13px; margin-top: 10px;
        }
        button:hover { background: #0062a3; }
        .status { color: #888; font-size: 11px; margin-top: 5px; }
    </style>
</head>
<body>
    <div>Sound Engine 🔊</div>
    <button id="activate-btn">Click to Enable Audio</button>
    <div id="status" class="status">Waiting for interaction...</div>
    <audio id="error-audio" src="${soundUri}"></audio>
    <script>
        const vscode = acquireVsCodeApi();
        const audio = document.getElementById('error-audio');
        const btn = document.getElementById('activate-btn');
        const status = document.getElementById('status');

        btn.addEventListener('click', () => {
            // Unlocks audio on most browsers
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                btn.style.display = 'none';
                status.innerText = 'Audio System Enabled ✅';
                vscode.postMessage({ command: 'log', text: 'Audio unlocked by user interaction.' });
            }).catch(e => {
                vscode.postMessage({ command: 'error', text: 'Unlock failed: ' + e.message });
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'play') {
                audio.currentTime = 0;
                audio.play().then(() => {
                    vscode.postMessage({ command: 'log', text: 'Playback successful.' });
                }).catch(e => {
                    vscode.postMessage({ command: 'error', text: 'Playback failed: ' + e.message });
                });
            }
        });
        console.log('Sound engine script loaded.');
    </script>
</body>
</html>`;
  }
}

export function deactivate() { }
