// Lista rzeczy: [kategoria, [[nazwa, ilość, podpowiedź], ...]]
// Każda pozycja ma stały identyfikator (id), żeby zapisane odhaczenia
// przetrwały zmianę kolejności albo dopisanie nowych rzeczy.
// Kategorie z shared: true mają jedną listę dla obu osób i są na końcu, w części „Wspólne”.
window.PACKING_LIST = [
  { id: "szlak-ubranie", name: "Ubranie na szlak", items: [
    { id: "termo-koszulka", name: "Koszulka termoaktywna z długim rękawem", qty: "2" },
    { id: "termo-legginsy", name: "Legginsy termoaktywne", qty: "1" },
    { id: "polar", name: "Polar lub cienka kurtka puchowa", qty: "1" },
    { id: "hardshell", name: "Kurtka przeciwdeszczowa i wiatroszczelna", qty: "1" },
    { id: "spodnie-trek", name: "Spodnie trekkingowe", qty: "2", hint: "druga para na zmianę po błocie" },
    { id: "skarpety-merino", name: "Skarpety trekkingowe (merino)", qty: "4" },
    { id: "czapka", name: "Czapka", qty: "1" },
    { id: "rekawiczki", name: "Rękawiczki", qty: "1" },
    { id: "buff", name: "Buff lub chusta na szyję", qty: "1" },
    { id: "stuptuty", name: "Stuptuty", hint: "przydają się na błotnistych szlakach" }
  ]},
  { id: "obuwie", name: "Obuwie", items: [
    { id: "buty-trek", name: "Wysokie buty trekkingowe z membraną", qty: "1", hint: "rozchodzone" },
    { id: "buty-wieczor", name: "Wygodne buty na wieczór", qty: "1" },
    { id: "raczki", name: "Raczki", hint: "tylko jeśli prognoza mówi o śniegu" }
  ]},
  { id: "wieczor", name: "Ubranie na wieczór i do spania", items: [
    { id: "bielizna", name: "Bielizna", qty: "4" },
    { id: "skarpetki", name: "Zwykłe skarpetki", qty: "3" },
    { id: "tshirt", name: "T-shirt", qty: "2" },
    { id: "bluza", name: "Bluza lub sweter", qty: "1" },
    { id: "spodnie-wygodne", name: "Wygodne spodnie", qty: "1" },
    { id: "pizama", name: "Piżama", qty: "1" }
  ]},
  { id: "plecak", name: "Plecak na szlak", items: [
    { id: "plecak", name: "Plecak 20–30 l", qty: "1" },
    { id: "pokrowiec", name: "Pokrowiec przeciwdeszczowy na plecak", qty: "1" },
    { id: "czolowka", name: "Czołówka i zapasowe baterie", qty: "1" },
    { id: "kijki", name: "Kijki trekkingowe", qty: "1 para" },
    { id: "okulary", name: "Okulary przeciwsłoneczne", qty: "1" },
    { id: "krem-filtr", name: "Krem z filtrem", qty: "1" }
  ]},
  { id: "kosmetyczka", name: "Kosmetyczka", items: [
    { id: "zeby", name: "Szczoteczka i pasta do zębów" },
    { id: "dezodorant", name: "Dezodorant" },
    { id: "krem-rece", name: "Krem do rąk i pomadka", hint: "wiatr wysusza skórę" },
    { id: "recznik", name: "Ręcznik szybkoschnący", qty: "1", hint: "jeśli pensjonat nie zapewnia" },
    { id: "stale-leki", name: "Twoje stałe leki" }
  ]},
  { id: "elektronika", name: "Elektronika", items: [
    { id: "telefon", name: "Telefon i ładowarka" },
    { id: "powerbank", name: "Powerbank z kablem", qty: "1" },
    { id: "mapy-offline", name: "Mapy offline w telefonie", hint: "np. mapa-turystyczna.pl" }
  ]},
  { id: "dokumenty", name: "Dokumenty i pieniądze", items: [
    { id: "dowod", name: "Dowód osobisty" },
    { id: "karta", name: "Karta płatnicza" },
    { id: "gotowka", name: "Gotówka", hint: "nie wszędzie przyjmują kartę" }
  ]},

  // Wspólne: jedna lista dla obu osób
  { id: "wspolne-szlak", name: "Na szlak", shared: true, items: [
    { id: "termos", name: "Termos", qty: "1" },
    { id: "butelka", name: "Butelka na wodę", qty: "1" },
    { id: "przekaski", name: "Przekąski na szlak", hint: "batony, orzechy, czekolada" },
    { id: "mapa", name: "Mapa papierowa", qty: "1" }
  ]},
  { id: "wspolne-rezerwacje", name: "Rezerwacja i bilety", shared: true, items: [
    { id: "rezerwacja", name: "Potwierdzenie rezerwacji pensjonatu" },
    { id: "bilety-bdpn", name: "Bilety do Bieszczadzkiego Parku Narodowego", hint: "kup online" }
  ]},
  { id: "wspolne-kosmetyki", name: "Kosmetyki", shared: true, items: [
    { id: "szampon", name: "Szampon i żel", hint: "sprawdź, czy pensjonat daje" }
  ]},
  { id: "apteczka", name: "Apteczka", shared: true, items: [
    { id: "plastry", name: "Plastry i plastry na otarcia" },
    { id: "przeciwbolowe", name: "Leki przeciwbólowe" },
    { id: "nrc", name: "Folia NRC", qty: "1" },
    { id: "bandaz", name: "Bandaż elastyczny", qty: "1" }
  ]},
  { id: "auto", name: "Do auta", shared: true, items: [
    { id: "prawko", name: "Prawo jazdy i dokumenty auta" },
    { id: "bak", name: "Pełny bak przed wjazdem w góry", hint: "stacji jest mało" }
  ]}
];
