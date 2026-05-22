# Audyt i deploy

## Rozpoznany framework

Vite + React + TypeScript.

## Build command

```bash
npm run build
```

## Output directory

```text
dist
```

## Czy dodano GitHub Actions

Tak. Dodano workflow:

```text
.github/workflows/deploy.yml
```

Workflow instaluje zależności, uruchamia build i publikuje katalog `dist` na GitHub Pages z użyciem oficjalnych akcji GitHub.

## Czy dodano CNAME

Tak. Dodano:

```text
public/CNAME
```

Treść pliku:

```text
oszukanyhiphopplock.cba.pl
```

Vite kopiuje pliki z `public` do `dist`, więc `CNAME` trafi do katalogu publikowanego na GitHub Pages.

## Jaką domenę wpisać w GitHub Pages

```text
oszukanyhiphopplock.cba.pl
```

## Jaki CNAME ustawić w CBA

```text
pancakesonfire999.github.io
```

Bez `https://`, bez ścieżki repozytorium i bez ukośnika na końcu.

## Co muszę zrobić ręcznie

1. Na GitHubie wejść w `Settings` -> `Pages`.
2. Ustawić `Source` na `GitHub Actions`.
3. Wpisać custom domain: `oszukanyhiphopplock.cba.pl`.
4. W CBA ustawić rekord `CNAME` dla domeny na `pancakesonfire999.github.io`.
5. Poczekać na propagację DNS.
6. Po pozytywnej weryfikacji DNS włączyć `Enforce HTTPS`.

## Znalezione ryzyka prywatności

- W publicznej stopce znajduje się podpis `Wykonanie Kornelia Studio 🌸🌼`. To wygląda na świadomy publiczny credit, nie techniczny wyciek.
- W dokumentacji deploy znajduje się publiczny login GitHub `pancakesonfire999`, bo jest wymagany do konfiguracji CNAME.
- Formularz zawiera pola imię, nazwisko, e-mail i osiedle, ale aktualnie nie wysyła ich na serwer i nie zapisuje ich w repozytorium.
- Strona zapisuje w `localStorage` tylko techniczną informację, że podpis został oddany, oraz lokalny licznik. Nie zapisuje danych osobowych podpisującego.
- Dodano plik polityki prywatności z miejscami do uzupełnienia, ponieważ formularz pokazuje pola danych osobowych, nawet jeśli obecnie ich nie zbiera po stronie serwera.
- Nie znaleziono plików `.env`, tokenów, kluczy API, identyfikatorów analytics, Firebase, Formspree, Netlify ani Cloudflare.
- Nie znaleziono lokalnych ścieżek typu `/Users/...`, nazwy komputera ani prywatnego e-maila autora w kodzie aplikacji.

## Co poprawiono

- Ustawiono `base: "/"` w `vite.config.ts`, żeby strona działała pod custom domeną.
- Dodano workflow GitHub Pages.
- Dodano `public/CNAME`.
- Dodano `public/polityka-prywatnosci.html`.
- Zmieniono link w stopce `Polityka prywatności`, aby prowadził do pliku polityki prywatności.
- Uzupełniono `.gitignore` o pliki środowiskowe, katalogi buildów i katalogi popularnych platform deploy.

## Czy projekt jest gotowy do publikacji

Tak, technicznie projekt jest gotowy do publikacji na GitHub Pages z custom domeną `oszukanyhiphopplock.cba.pl`.

Do wykonania ręcznie pozostaje konfiguracja GitHub Pages w ustawieniach repozytorium oraz rekord CNAME w panelu CBA.
