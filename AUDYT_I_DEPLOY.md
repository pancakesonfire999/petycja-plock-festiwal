# Audyt i deploy

## Rozpoznany framework

Vite + React + TypeScript.

## Build command

```bash
npm run build
```

Do publikacji pod adresem repozytorium GitHub Pages:

```bash
npm run build -- --mode github-pages
```

## Output directory

```text
dist
```

## Czy dodano GitHub Actions

Nie. Publikacja odbywa się przez gałąź `gh-pages`, bez GitHub Actions.

## Czy dodano CNAME

Nie. Custom domain z CBA została wycofana. Strona korzysta z domyślnego adresu GitHub Pages.

## Adres strony

```text
https://pancakesonfire999.github.io/petycja-plock-festiwal/
```

## Co muszę zrobić ręcznie

1. Na GitHubie wejść w `Settings` -> `Pages`.
2. Ustawić `Source` na `Deploy from a branch`.
3. Wybrać branch `gh-pages`.
4. Wybrać folder `/ (root)`.
5. Usunąć custom domain `oszukanyhiphopplock.cba.pl`, jeśli nadal jest wpisana.

## Znalezione ryzyka prywatności

- W publicznej stopce znajduje się podpis `Wykonanie Kornelia Studio 🌸🌼`. To wygląda na świadomy publiczny credit, nie techniczny wyciek.
- W dokumentacji deploy znajduje się publiczny login GitHub `pancakesonfire999`, bo jest częścią adresu GitHub Pages.
- Formularz zawiera pola imię, nazwisko, e-mail i osiedle, ale aktualnie nie wysyła ich na serwer i nie zapisuje ich w repozytorium.
- Strona zapisuje w `localStorage` tylko techniczną informację, że podpis został oddany, oraz lokalny licznik. Nie zapisuje danych osobowych podpisującego.
- Dodano plik polityki prywatności z miejscami do uzupełnienia.
- Nie znaleziono plików `.env`, tokenów, kluczy API, identyfikatorów analytics, Firebase, Formspree, Netlify ani Cloudflare.
- Nie znaleziono lokalnych ścieżek typu `/Users/...`, nazwy komputera ani prywatnego e-maila autora w kodzie aplikacji.

## Co poprawiono

- Przywrócono `base` dla GitHub Pages pod ścieżkę `/petycja-plock-festiwal/`.
- Usunięto `public/CNAME`.
- Zaktualizowano dokumentację wdrożenia i audyt pod adres GitHub Pages.

## Czy projekt jest gotowy do publikacji

Tak. Projekt jest gotowy do publikacji pod domyślnym adresem GitHub Pages.
