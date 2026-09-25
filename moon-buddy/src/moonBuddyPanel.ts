import * as vscode from 'vscode';

export class MoonBuddyPanel {

    public static currentPanel: MoonBuddyPanel | undefined;

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri
    ) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        this.panel.webview.html = this.getWebviewContent();
    }

    public static createOrShow(extensionUri: vscode.Uri) {

        if (MoonBuddyPanel.currentPanel) {
            MoonBuddyPanel.currentPanel.panel.reveal(
                vscode.ViewColumn.Beside
            );
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'moonBuddy',
            '🌙 Moon Buddy',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
        );

        MoonBuddyPanel.currentPanel =
            new MoonBuddyPanel(panel, extensionUri);

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

   private getWebviewContent(): string {

    return `
        <!DOCTYPE html>

        <html>

        <head>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    width: 100vw;
                    height: 100vh;

                    overflow: hidden;

                    font-family: sans-serif;

                    background:
                        radial-gradient(
                            circle at 50% 20%,
                            #293866 0%,
                            #11182f 40%,
                            #080b18 100%
                        );

                    color: white;
                }

                .universe {
                    width: 100%;
                    height: 100%;

                    position: relative;

                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* ---------------- STARS ---------------- */

                .star {
                    position: absolute;

                    color: white;

                    font-size: 12px;

                    animation: twinkle 2s infinite ease-in-out;
                }

                .star:nth-child(1) {
                    top: 12%;
                    left: 15%;
                }

                .star:nth-child(2) {
                    top: 25%;
                    left: 80%;
                    animation-delay: .5s;
                }

                .star:nth-child(3) {
                    top: 65%;
                    left: 12%;
                    animation-delay: 1s;
                }

                .star:nth-child(4) {
                    top: 70%;
                    left: 85%;
                    animation-delay: 1.5s;
                }

                .star:nth-child(5) {
                    top: 40%;
                    left: 70%;
                    animation-delay: .8s;
                }

                .star:nth-child(6) {
                    top: 18%;
                    left: 55%;
                    animation-delay: 1.2s;
                }

                /* ---------------- MOON ---------------- */

                .moon-container {
                    position: absolute;

                    top: 15%;

                    animation: moonFloat 4s infinite ease-in-out;
                }

                .moon {
                    width: 110px;
                    height: 110px;

                    border-radius: 50%;

                    background: #fff4bd;

                    box-shadow:
                        0 0 20px #fff4bd,
                        0 0 50px rgba(255, 244, 189, .3);
                }

                /* ---------------- BUDDY ---------------- */

                .buddy-container {
                    position: relative;

                    margin-top: 40px;

                    text-align: center;

                    animation: buddyFloat 2.5s infinite ease-in-out;
                }

                .buddy {
    font-size: 75px;

    filter:
        drop-shadow(
            0 8px 10px rgba(0, 0, 0, .4)
        );

    transition:
        transform 0.25s ease,
        filter 0.25s ease;
}

.buddy.awake {
    transform: scale(1.12) translateY(-5px);

    filter:
        drop-shadow(
            0 0 15px rgba(155, 231, 255, .7)
        );
}

.buddy.sleeping {
    opacity: .8;
}

                .shadow {
                    width: 80px;
                    height: 15px;

                    margin: 5px auto;

                    border-radius: 50%;

                    background: rgba(0, 0, 0, .25);

                    filter: blur(4px);
                }

                /* ---------------- TEXT ---------------- */

                .title {
                    margin-top: 35px;

                    font-size: 24px;

                    font-weight: 600;

                    letter-spacing: 1px;
                }

                .status {
                    margin-top: 10px;

                    font-size: 14px;

                    opacity: .65;
                }

                .status-dot {
                    display: inline-block;

                    width: 7px;
                    height: 7px;

                    margin-right: 6px;

                    border-radius: 50%;

                    background: #9be7ff;

                    box-shadow:
                        0 0 8px #9be7ff;
                }

                /* ---------------- ANIMATIONS ---------------- */

                @keyframes twinkle {

                    0%, 100% {
                        opacity: .2;
                        transform: scale(.8);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }

                }

                @keyframes moonFloat {

                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-10px);
                    }

                }

                @keyframes buddyFloat {

                    0%, 100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-7px);
                    }

                }

            </style>

        </head>

        <body>

            <div class="universe">

                <div class="star">✦</div>
                <div class="star">✧</div>
                <div class="star">✦</div>
                <div class="star">·</div>
                <div class="star">✧</div>
                <div class="star">✦</div>

                <div class="moon-container">
                    <div class="moon"></div>
                </div>

                <div class="buddy-container">

                    <div id="buddy" class="buddy">
                        😴
                    </div>

                    <div class="shadow"></div>

                    <div class="title">
                        Moon Buddy
                    </div>

                   <div id="status" class="status">
                    <span class="status-dot"></span>
                    Taking a little nap... 😴
                </div>

                </div>

            </div>
<script>

    const buddy = document.getElementById('buddy');
    const status = document.getElementById('status');

    let sleepTimer;

    window.addEventListener('message', event => {

        const message = event.data;

        // User is typing
        if (message.type === 'typing') {

            buddy.textContent = '👀';

            buddy.classList.remove('sleeping');
            buddy.classList.add('awake');

            status.innerHTML =
                '<span class="status-dot"></span>' +
                'Watching you code ✨';

            clearTimeout(sleepTimer);

            sleepTimer = setTimeout(() => {

                buddy.textContent = '😴';

                buddy.classList.remove('awake');
                buddy.classList.add('sleeping');

                status.innerHTML =
                    '<span class="status-dot"></span>' +
                    'Taking a little nap... 😴';

            }, 3000);
        }

        // 20 second coding streak
        if (message.type === 'coding-streak') {

            buddy.textContent = '🥳';

            buddy.classList.remove('sleeping');
            buddy.classList.add('awake');

            status.innerHTML =
                '<span class="status-dot"></span>' +
                "You're on a roll! 🚀";
        }

    });

</script>
        </body>

        </html>
    `;
}
}