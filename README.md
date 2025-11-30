# Adventskalender | Snake Spiel

Ein einfaches Snake-Spiel für den Browser, implementiert mit TypeScript und HTML.
Täglich gibt es hier neue Aufgaben und Lösungen am Folgetag.

Voraussetzungen:
- Web-Entwicklungsumgebung, GIT, NodeJS lokal installiert
- Kenntnisse über grundlegende Webentwicklung (inkl. Verwendung des Browser-Debuggers)

## Tür 1

### Übersicht / Ziel:

- Spiel lokal starten
- Fehlerbehebung
- Funktion "Kollision mit dem Spielrand" implementieren

### Installation

1. Klone das Repository

Öffne VScode oder eine beliebige andere Entwicklungsumgebung in einem neuen Projektordner und klone das Repository.

2. Installiere die Abhängigkeiten:

```bash
npm install
```

3. Starte den lokalen Server:

```bash
npm run dev
```

Der Server läuft auf `http://localhost:8080` und öffnet automatisch den Browser.

### Erklärung zur bestehenden Entwicklung

- index.html ist der Container für das Spiel, sie gibt die grobe Seitenstruktur vor.
- game.ts steuert die gesamte Spiellogik
- package.json: der Task "dev" startet den lokalen HTTP server und parallel dazu einen Watch-Task, der nach jeder Änderung der Typescript Datei sofort die Javascript Datei erstellt, sodass sie im Browser verwendet werden kann. (Seite aktualisieren - F5, um die Änderungen in den Browser zu laden)

### Aufgaben

- Leider beendet sich das Spiel immer sofort. Finde heraus, woran es liegt und behebe das Problem.

    **Ergebnis:** Wenn der Fehler behoben ist, sollte die Snake sich mit den Pfeiltasten bewegen lassen, das Futter kann bereits aufgenommen werden und die Punkte werden gezählt. Das Spiel wird beendet, wenn die Snake mit sich selbst kollidiert.

    **Lösung:** Zeile 147 - Hier wird geprüft, ob die Snake mit sich selbst kollidiert (Kopf -> Schwanz).
    Wir müssen den Kopf (index = 0) bei dieser Prüfung aber ausschließen, weil das Ergebnis sonst immer wahr ist

- Im nächsten Schritt soll die Kollision mit dem Spielrand implementiert werden. Wenn die Snake den Rand verlassen würde, soll das Spiel beendet werden.

    **Ergebnis:** Nun solltest du ein lauffähiges Spiel haben, das ordentlich beendet wird und auch wieder neugestartet werden kann. 

    **Lösung:** Zeile 141 - 144

## Tür 2

### Aufgaben

Der Beginn einer neuen Runde soll mit einem Countdown-Overlay dargestellt werden.

- Das notwendige HTML und CSS wird bereits mitgeliefert. Ebenso ein paar grundlegende Erweiterungen an der Spiellogik.
- Du sollst die JS Funktion 'setInterval' hierfür verwenden und die Methode startCountdown ausprägen, siehe "TODO"

Mehr dazu hier: https://developer.mozilla.org/de/docs/Web/API/Window/setInterval

**Ergebnis:** Das Spiel beginnt beim Start oder Neustart immer mit dem Countdown-Overlay. Im Anschluss beginnt sich die Snake zu bewegen und der Spieler kann die Steuerung übernehmen.

## Tür 3

### Aufgaben

Das Spiel soll nun etwas interessanter gestaltet werden.

Die Idee (Food Timer): Das Futter soll nach einer zufälligen Zeit verschwinden und an einem neuen Ort auftauchen. So, dass man es nicht immer erreichen kann. 

Setze eine Unter- und Obergrenze (Zeit) für einen Zufallstimer und platziere das Futter an eine neue Stelle, wenn der Timer abgelaufen ist. Danach soll der Timer zurückgesetzt werden, eine neue Zufallszahl erstellt werden und bei Ablauf das Futter wieder neu platziert werden (und so weiter). Denk daran, wenn die Snake das Futter nimmt, dann sollte der Timer auch zurückgesetzt werden.

## Beschreibung des Spiels

### Spielregeln

- Bewege die Schlange mit den Pfeiltasten
- Sammle das rote Futter, um Punkte zu sammeln
- Vermeide Kollisionen mit den Wänden und dir selbst
- Die Schlange wird länger, wenn du Futter sammelst

### Steuerung

- **Pfeiltasten**: Bewege die Schlange
- **Leertaste**: Neustart nach Game Over