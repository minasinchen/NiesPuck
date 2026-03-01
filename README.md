# Nies Puck Website

Statische Website fuer den Kinder-Second-Hand-Laden **Nies Puck** in Lilienthal.

Die Seite ist als leicht bearbeitbares HTML/CSS/JS-Projekt aufgebaut und kann ohne Build-Tool direkt lokal geoeffnet oder ueber einen kleinen lokalen Server getestet werden.

## Projektziel

Die Website praesentiert den Laden mobil und am Desktop mit:

- Startseite mit grossem Hero-Bereich
- Sortiment und saisonalen Highlights
- Kontaktseite mit Karte und Route
- Galerie, Ueber-Seite und rechtlichen Seiten
- wettergesteuerter Saison-Logik fuer Look, Hero-Bild und saisonale Hinweise

## Projektstruktur

```text
NiesPuck/
|- index.html
|- sortiment.html
|- saison.html
|- kontakt.html
|- ueber.html
|- galerie.html
|- social.html
|- so-funktionierts.html
|- impressum.html
|- datenschutz.html
|- 404.html
|- css/
|  \- style.css
|- js/
|  |- main.js
|  \- season.js
\- assets/
   \- img/
```

## Lokal testen

Am einfachsten mit einem lokalen Webserver:

```bash
python -m http.server 8000
```

Dann im Browser:

```text
http://localhost:8000
```

Direktes Oeffnen von `index.html` funktioniert oft auch, aber fuer Bilder, Embeds und wettergesteuerte Requests ist ein lokaler Server zuverlaessiger.

## Wichtige Funktionen

### Wettergesteuerte Saison

Die Datei `js/season.js`:

- laedt Wetterdaten ueber die kostenlose Open-Meteo-API
- bewertet die naechsten Tage fuer Lilienthal
- waehlt daraus einen Saisonmodus wie `winter`, `late-winter`, `early-spring` usw.
- setzt Farben, Hero-Bild und saisonale Texte

Falls die Wetter-API nicht erreichbar ist, wird auf Cache oder Kalendersaison zurueckgefallen.

### Mobile Navigation

- Oben: Burger-Menue fuer die Hauptnavigation
- Unten: feste Schnellnavigation fuer wichtige mobile Einstiege

### Kontakt / Karte

Die Kontaktseite verwendet:

- OpenStreetMap-Embed fuer die Karten-Vorschau
- Google-Maps-Link fuer direkte Routenplanung

## Bilddateien

### Logo

Das Ladenlogo liegt hier:

- `assets/img/NiesPuckLogo.png`

Es wird im Header ueber CSS eingebunden.

### Saison-Hero-Bilder

Diese Bilder werden fuer den Hero-Bereich verwendet:

- `assets/img/hero-spring.jpg`
- `assets/img/hero-summer.jpg`
- `assets/img/hero-autumn.jpg`
- `assets/img/hero-winter.jpg`

### Weitere Inhalte

Weitere verwendete Bilder:

- `assets/img/regina-cordes.jpg`
- `assets/img/tile-kids.jpg`
- `assets/img/tile-brands.jpg`
- `assets/img/tile-toys.jpg`
- `assets/img/tile-adults.jpg`

Hinweis:

- `tile-new.jpg` und `tile-gallery.jpg` werden an mehreren Stellen referenziert. Wenn diese Bilder genutzt werden sollen, sollten sie ebenfalls im Ordner `assets/img/` vorhanden sein.

## Seitenuebersicht

- `index.html`: Startseite mit Hero, saisonalen Highlights und Einstieg
- `sortiment.html`: Uebersicht ueber Kleidung, Marken und Spielzeug
- `saison.html`: Saison-Highlights plus 7-Tage-Wetterblick
- `kontakt.html`: Adresse, Oeffnungszeiten, Karte und Route
- `ueber.html`: Ladenprofil und Inhaberin
- `galerie.html`: Bildwelt mit Lightbox
- `social.html`: Verweis auf Facebook
- `impressum.html`: Impressum
- `datenschutz.html`: Datenschutzhinweise

## Technische Hinweise

- Kein Framework, kein Build-Step
- Reines HTML, CSS und Vanilla JavaScript
- Styling zentral in `css/style.css`
- UI-Helfer in `js/main.js`
- Saison- und Wetterlogik in `js/season.js`

## Pflege und Anpassung

Typische Stellen fuer spaetere Aenderungen:

- Texte und Inhalte direkt in den jeweiligen `.html`-Dateien
- Farben, Layout und mobile Darstellung in `css/style.css`
- Wetterlogik und saisonale Regeln in `js/season.js`
- Navigationsverhalten in `js/main.js`

## Rechtlicher Hinweis

Die Inhalte in `impressum.html` und `datenschutz.html` sind eine technische Grundstruktur und sollten vor Live-Schaltung rechtlich geprueft und mit den echten Pflichtangaben vervollstaendigt werden.
