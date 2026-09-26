import * as vscode from 'vscode';

type MoonBuddyMood = 'error' | 'coding' | 'sleeping';

interface MoonBuddyState {
    mood: MoonBuddyMood;
    seconds: number;
}

export class MoonBuddyPanel {

    public static currentPanel: MoonBuddyPanel | undefined;

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        initialState: MoonBuddyState
    ) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.webview.html = this.getWebviewContent(initialState);
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        initialState: MoonBuddyState
    ) {

        if (MoonBuddyPanel.currentPanel) {
            MoonBuddyPanel.currentPanel.panel.reveal(
                vscode.ViewColumn.Beside
            );
            MoonBuddyPanel.currentPanel.panel.webview.postMessage({
                type: 'state',
                ...initialState
            });
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'moonBuddy',
            'Moon Buddy',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(
                        extensionUri,
                        'src',
                        'webview'
                    )
                ]
            }
        );

        MoonBuddyPanel.currentPanel =
            new MoonBuddyPanel(panel, extensionUri, initialState);

        panel.onDidDispose(() => {
            MoonBuddyPanel.currentPanel = undefined;
        });
    }

    public static sendMessage(message: unknown) {

        if (!MoonBuddyPanel.currentPanel) {
            return;
        }

        MoonBuddyPanel.currentPanel.panel.webview.postMessage(
            message
        );
    }

    private getWebviewContent(initialState: MoonBuddyState): string {

        const webview = this.panel.webview;

        const idlePath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'pets',
            'cat-idle.png'
        );

        const sleepingPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'pets',
            'cat-sleeping.png'
        );

        const codingPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'pets',
            'cat-coding.png'
        );

        const fixedPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'pets',
            'cat-fixed.png'
        );

        const errorPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'pets',
            'cat-error.png'
        );

        const cssPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'style.css'
        );

        const jsPath = vscode.Uri.joinPath(
            this.extensionUri,
            'src',
            'webview',
            'script.js'
        );

        const idleUri = webview.asWebviewUri(idlePath);
        const sleepingUri = webview.asWebviewUri(sleepingPath);
        const codingUri = webview.asWebviewUri(codingPath);
        const fixedUri = webview.asWebviewUri(fixedPath);
        const errorUri = webview.asWebviewUri(errorPath);
        const cssUri = webview.asWebviewUri(cssPath);
        const jsUri = webview.asWebviewUri(jsPath);
        const nonce = getNonce();

        const moodImage = initialState.mood === 'error'
            ? errorUri
            : initialState.mood === 'coding'
                ? codingUri
                : sleepingUri;

        const statusText = initialState.mood === 'error'
            ? 'Something looks wrong...'
            : initialState.mood === 'coding'
                ? 'Working with you...'
                : 'Taking a little nap...';

        const formattedTime =
            `${String(Math.floor(initialState.seconds / 60)).padStart(2, '0')}:` +
            String(initialState.seconds % 60).padStart(2, '0');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"
    >
    <title>Moon Buddy</title>
    <link rel="stylesheet" href="${cssUri}">
</head>
<body>
    <main class="universe" aria-label="Moon Buddy coding companion">
        <div class="stars" aria-hidden="true">
            <span class="star"></span>
            <span class="star"></span>
            <span class="star"></span>
            <span class="star"></span>
            <span class="star"></span>
            <span class="star"></span>
        </div>

        <div class="moon-container" aria-hidden="true">
            <div class="moon"></div>
        </div>

        <section class="buddy-container">
            <div id="buddy" class="buddy ${initialState.mood}">
                <img
                    id="buddy-image"
                    src="${moodImage}"
                    data-idle="${idleUri}"
                    data-sleeping="${sleepingUri}"
                    data-coding="${codingUri}"
                    data-fixed="${fixedUri}"
                    data-error="${errorUri}"
                    alt="Moon Buddy"
                >
            </div>

            <div class="shadow" aria-hidden="true"></div>

            <h1 class="title">Moon Buddy</h1>

            <div id="status" class="status" role="status" aria-live="polite">
                <span class="status-dot" aria-hidden="true"></span>
                <span id="status-text">${statusText}</span>
            </div>

            <div id="coding-time" aria-label="Coding time">${formattedTime}</div>
        </section>
    </main>

    <script nonce="${nonce}" src="${jsUri}"></script>
</body>
</html>`;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
