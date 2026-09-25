import * as vscode from 'vscode';
import { MoonBuddyPanel } from './moonBuddyPanel';

let codingTimer: NodeJS.Timeout | undefined;
let codingSeconds = 0;
let isCoding = false;

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand(
        'moon-buddy.open',
        () => {
            MoonBuddyPanel.createOrShow(context.extensionUri);
        }
    );

    context.subscriptions.push(disposable);

    const typingListener =
        vscode.workspace.onDidChangeTextDocument(() => {

            MoonBuddyPanel.sendMessage({
                type: 'typing'
            });

            // Start the coding timer only once
            if (!isCoding) {

                isCoding = true;
                codingSeconds = 0;

                codingTimer = setInterval(() => {

                    codingSeconds++;

                    console.log(
                        `Moon Buddy coding time: ${codingSeconds}s`
                    );

                    if (codingSeconds >= 20) {

                        MoonBuddyPanel.sendMessage({
                            type: 'coding-streak'
                        });

                    }

                }, 1000);
            }
        });

    context.subscriptions.push(typingListener);
}

export function deactivate() {

    if (codingTimer) {
        clearInterval(codingTimer);
    }
}