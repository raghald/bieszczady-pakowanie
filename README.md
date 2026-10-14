# Pakowanie w Bieszczady

Lista rzeczy do odhaczania na 3 noce w pensjonacie w Bieszczadach w październiku.

## Jak działa zapisywanie

Odhaczenia zapisują się w `localStorage` przeglądarki. Nie ma serwera ani wspólnej bazy, więc:

- każda osoba otwiera stronę na swoim telefonie i ma własną listę,
- to, co zaznaczy jedna osoba, nie pojawia się u drugiej,
- są dwie stałe listy, Fryderyk i Asieńka, przełączane przyciskami u góry (także na jednym telefonie).

Zapis znika po wyczyszczeniu danych przeglądarki albo w trybie prywatnym.

## Uruchomienie

To statyczna strona bez budowania. Wystarczy otworzyć `index.html` albo włączyć GitHub Pages
(Settings → Pages → Deploy from a branch → `main` / root).

Lokalnie:

```sh
python3 -m http.server 8000
```

## Pliki

- `items.js` – lista rzeczy (kategorie, ilości, podpowiedzi). Każda pozycja ma stałe `id`, więc dopisanie nowych rzeczy nie kasuje zapisanych odhaczeń.
- `store.js` – zapis i odczyt postępu, listy osób.
- `app.js` – interfejs.
- `styles.css` – wygląd, jasny i ciemny motyw.
- `test/store.test.js` – testy logiki zapisu (`node test/store.test.js`).
