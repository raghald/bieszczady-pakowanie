# Pakowanie w Bieszczady

Lista rzeczy do odhaczania na 3 noce w pensjonacie w Bieszczadach w październiku.

## Jak działa zapisywanie

Są dwie stałe listy, Fryderyk i Asieńka, przełączane przyciskami u góry. Odhaczenia są wspólne:
to, co zaznaczy się na jednym telefonie, po kilku sekundach widać na drugim.

- Stan trzyma funkcja `api/state.js` na Vercelu, w bazie Upstash Redis podłączonej do projektu
  (Vercel → Storage). Funkcja czyta zmienne `KV_REST_API_URL` i `KV_REST_API_TOKEN`
  (albo `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
- Każde odhaczenie to osobne pole w bazie, więc dwie osoby klikające naraz nie nadpisują sobie zmian.
- Telefon trzyma kopię w `localStorage`, więc lista działa też bez zasięgu. Zmiany czekają w kolejce
  i wysyłają się po powrocie połączenia.
- Lista nie ma logowania: każdy, kto zna adres, może ją zobaczyć i odhaczać.

## Uruchomienie

Strona jest statyczna, bez budowania; Vercel wdraża ją z gałęzi `main` razem z funkcją z `api/`.
Bez serwera (np. `python3 -m http.server 8000` albo GitHub Pages) lista działa tylko lokalnie
na danym telefonie.

## Pliki

- `items.js` – lista rzeczy (kategorie, ilości, podpowiedzi). Każda pozycja ma stałe `id`, więc dopisanie nowych rzeczy nie kasuje zapisanych odhaczeń.
- `store.js` – kopia lokalna, kolejka niewysłanych zmian, łączenie ze stanem z serwera.
- `api/state.js` – funkcja na Vercelu: odczyt i zapis wspólnego stanu w Upstash Redis.
- `app.js` – interfejs.
- `styles.css` – wygląd, jasny i ciemny motyw.
- `test/` – testy (`node test/store.test.js && node test/api.test.js`).
