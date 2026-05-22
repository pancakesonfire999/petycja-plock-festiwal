# Wdrożenie na GitHub Pages

## Rozpoznanie projektu

- Framework: Vite + React + TypeScript.
- Komenda budowania: `npm run build`.
- Katalog wynikowy: `dist`.
- Projekt jest statyczną stroną i nadaje się do publikacji na GitHub Pages.

## Adres publiczny

Strona ma działać pod adresem:

```text
https://pancakesonfire999.github.io/petycja-plock-festiwal/
```

## GitHub Pages

W repozytorium na GitHubie:

1. Wejdź w `Settings` -> `Pages`.
2. W sekcji `Build and deployment` ustaw `Source` na `Deploy from a branch`.
3. Ustaw branch:

```text
gh-pages
```

4. Ustaw folder:

```text
/ (root)
```

5. Usuń custom domain, jeśli nadal jest wpisana.
6. Zapisz.

## Sprawdzenie lokalne

```bash
npm install
npm run build
```

Build produkcyjny pod GitHub Pages:

```bash
npm run build -- --mode github-pages
```

Po buildzie katalogiem publikowanym jest:

```text
dist
```
