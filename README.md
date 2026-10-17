# ZAM AI demo

## Vercel дээр жинхэнэ chat ажиллуулах

1. Vercel Dashboard → **Add New → Project** дээр GitHub-ийн `zam-ai-demo` repository-г import хийнэ.
2. Framework preset-ийг **Other** хэвээр үлдээгээд Deploy дарна. `api/chat.mjs` нь автоматаар serverless endpoint болно.
3. Project → Settings → Environment Variables дотор дараахыг нэмнэ:
   - `OPENAI_API_KEY` — OpenAI Platform дээр үүсгэсэн API key. Энэ key-г GitHub-д commit хийхгүй, чатад бичихгүй.
   - `OPENAI_MODEL` — optional; default нь `gpt-4.1-mini`.
   - `ALLOWED_ORIGIN` — optional; GitHub Pages ашиглавал `https://batboldgansukh0513-babs.github.io`.
4. Deployments → хамгийн сүүлийн deployment → **Redeploy** хийнэ.
5. ZAM-г Vercel-ийн өгсөн `*.vercel.app` URL-аар нээвэл chat нь `/api/chat` endpoint-тайгаа нэг origin дээр ажиллана.

GitHub Pages URL-г заавал ашиглах бол browser console-оор биш, `index.html`-д `window.ZAM_CHAT_API = 'https://таны-project.vercel.app/api/chat'` гэсэн тохиргоог тусад нь оруулж болно.

