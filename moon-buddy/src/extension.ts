import * as vscode from 'vscode';
import { MoonBuddyPanel } from './moonBuddyPanel';

let codingTimer: NodeJS.Timeout | undefined;
let idleTimer: NodeJS.Timeout | undefined;
let errorTimer: NodeJS.Timeout | undefined;
let codingSeconds = 0;

let isCoding = false;
let hasCodeError = false;

const errorRevealDelay = 1500;

function activeEditorHasError(): boolean {
    const activeEditor = vscode.window.activeTextEditor;

    return activeEditor !== undefined &&
        vscode.languages.getDiagnostics(activeEditor.document.uri).some(
            diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Error
        );
}

function applyErrorState(errorFound: boolean): void {
    if (errorFound === hasCodeError) {
        return;
    }

    hasCodeError = errorFound;
    MoonBuddyPanel.sendMessage({
        type: errorFound ? 'error' : 'fixed'
    });
}

function updateErrorState(): void {
    clearTimeout(errorTimer);
    errorTimer = undefined;

    applyErrorState(activeEditorHasError());
}

function scheduleErrorStateUpdate(): void {
    clearTimeout(errorTimer);

    errorTimer = setTimeout(() => {
        errorTimer = undefined;
        applyErrorState(activeEditorHasError());
    }, errorRevealDelay);
}

export function activate(context: vscode.ExtensionContext) {

    const runListener =
        vscode.debug.onDidStartDebugSession(() => {

            MoonBuddyPanel.sendMessage({
                type: 'debug-started'
            });

            console.log(
                'Moon Buddy detected a debug session starting'
            );
        });

    context.subscriptions.push(
        runListener
    );

    const disposable = vscode.commands.registerCommand(
        'moon-buddy.open',
        () => {
            MoonBuddyPanel.createOrShow(
                context.extensionUri,
                {
                    mood: hasCodeError ? 'error' : isCoding ? 'coding' : 'sleeping',
                    seconds: codingSeconds
                }
            );
        }
    );

    context.subscriptions.push(disposable);

    const typingListener =
        vscode.workspace.onDidChangeTextDocument(() => {

            MoonBuddyPanel.sendMessage({
                type: 'typing'
            });

            scheduleErrorStateUpdate();

            if (!isCoding) {

                isCoding = true;
                codingTimer = setInterval(() => {

                    codingSeconds++;

                    console.log(
                        `Moon Buddy coding session: ${codingSeconds}s`
                    );

                    MoonBuddyPanel.sendMessage({
                        type: 'coding-time',
                        seconds: codingSeconds
                    });

                    if (codingSeconds === 600) {

                        MoonBuddyPanel.sendMessage({
                            type: 'coding-achievement',
                            minutes: 10
                        });

                    }

                    if (codingSeconds === 1200) {

                        MoonBuddyPanel.sendMessage({
                            type: 'coding-achievement',
                            minutes: 20
                        });

                    }

                }, 1000);
            }

            clearTimeout(idleTimer);

            idleTimer = setTimeout(() => {

                isCoding = false;

                if (codingTimer) {

                    clearInterval(codingTimer);
                    codingTimer = undefined;
                }

                MoonBuddyPanel.sendMessage({
                    type: hasCodeError ? 'error' : 'idle'
                });

                console.log(
                    'Moon Buddy coding session paused'
                );

            }, 3000);

        });

    context.subscriptions.push(
        typingListener
    );

    const diagnosticListener =
        vscode.languages.onDidChangeDiagnostics(scheduleErrorStateUpdate);

    context.subscriptions.push(
        diagnosticListener
    );

    const activeEditorListener =
        vscode.window.onDidChangeActiveTextEditor(updateErrorState);

    context.subscriptions.push(activeEditorListener);

    updateErrorState();
}

export function deactivate() {

    if (codingTimer) {
        clearInterval(codingTimer);
    }

    if (idleTimer) {
        clearTimeout(idleTimer);
    }

    if (errorTimer) {
        clearTimeout(errorTimer);
    }

}
