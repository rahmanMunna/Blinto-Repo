# Regenerating the PDF

`Google-OAuth-Setup-Guide.pdf` is rendered from `google-oauth-setup.html`.
Edit the HTML, then re-run (Windows, headless Chrome — Edge works too):

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="E:\DeepChain Dev\Blinto-Repo\docs\Google-OAuth-Setup-Guide.pdf" \
  "file:///E:/DeepChain%20Dev/Blinto-Repo/docs/google-oauth-setup.html"
```

Page size, margins and page breaks are controlled by the `@page` rule and the
`.page-break` class in the HTML's `<style>` block.
