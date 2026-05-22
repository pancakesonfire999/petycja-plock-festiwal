# Wdrożenie GitHub Pages i domena CBA

## Rozpoznanie projektu

- Framework: Vite + React + TypeScript.
- Komenda budowania: `npm run build`.
- Katalog wynikowy: `dist`.
- Projekt jest statyczną stroną i nadaje się do publikacji na GitHub Pages.

## GitHub Pages

1. Wejdź w repozytorium na GitHub.
2. Otwórz `Settings` -> `Pages`.
3. W sekcji `Build and deployment` ustaw `Source` na `GitHub Actions`.
4. W polu `Custom domain` wpisz:

```text
oszukanyhiphopplock.cba.pl
```

5. Zapisz.
6. Poczekaj na sprawdzenie DNS.
7. Gdy będzie dostępne, zaznacz `Enforce HTTPS`.

## DNS w panelu CBA

W panelu CBA:

1. Wejdź w `Domeny`.
2. Wybierz `oszukanyhiphopplock.cba.pl`.
3. Wejdź w `ustawienia DNS` albo `ustawienia zaawansowane`.
4. Ustaw rekord `CNAME` dla `oszukanyhiphopplock.cba.pl` na:

```text
pancakesonfire999.github.io
```

Ważne:

- Nie wpisywać `https://`.
- Nie wpisywać `/nazwa-repo`.
- Nie wpisywać całego adresu GitHub Pages.
- Ma być tylko:

```text
pancakesonfire999.github.io
```

## Wariant awaryjny, jeśli CBA nie pozwala ustawić CNAME dla głównej domeny

1. Utwórz subdomenę, np.:

```text
petycja.oszukanyhiphopplock.cba.pl
```

2. W GitHub Pages ustaw custom domain:

```text
petycja.oszukanyhiphopplock.cba.pl
```

3. W CBA ustaw rekord `CNAME` dla subdomeny `petycja` na:

```text
pancakesonfire999.github.io
```

4. W projekcie zmień plik `public/CNAME` na:

```text
petycja.oszukanyhiphopplock.cba.pl
```

5. Zrób commit i push.

## Sprawdzenie lokalne

```bash
npm install
npm run build
```

Po buildzie sprawdź, czy w katalogu `dist` istnieją:

- `index.html`
- `CNAME`
- `polityka-prywatnosci.html`
- `tresc-petycji.pdf`
