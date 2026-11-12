# Monthsary / Birthday Site

A one-page, scrolling scrapbook for your girlfriend. Photos and videos become taped-down
polaroids, the story lines up as a timeline, and a live counter ticks away the time you've
been together. Everything is driven by **one file** (`js/config.js`), so you never touch the code.

No install, no build step, no accounts. It's plain HTML, CSS and JavaScript.

## 1. Try it right now

Unzip the folder and double-click `index.html`. It opens in your browser with pink
"your photo goes here" boxes where your media will go.

Tip: open it on your phone-sized window too (or send it to your phone), because she will
most likely see it there.

## 2. Make it yours (3 steps)

1. **Add your files**
   - Photos go in `assets/images/`
   - Videos go in `assets/videos/`
   - A song goes in `assets/music/`
2. **Open `js/config.js` in any text editor** (Notepad, VS Code, anything).
   Change her name, your name, the date you got together, and the words.
   Point each `src` / `media` / `photo` to your file names, for example
   `"assets/images/beach-day.jpg"`.
3. **Save and refresh the browser.**

You can do it piece by piece. Any file that doesn't exist yet just shows the pink placeholder.

## What's on the page

| Section | What it does |
|---|---|
| Opening screen | "I made something for you" with an Open button. Music starts when she taps it. |
| Hero | Big greeting plus a hero photo (or video). Title fills in the month count itself, e.g. "Happy 6th monthsary, Bea". |
| Counter | Live months / days / hours / minutes / seconds since `startDate`, plus days until your next monthsary. |
| Our story | Memories as polaroids with a date, title and text. Add as many as you like. |
| Photo wall | Masonry wall of photos and videos. Tap one for a full-screen viewer (swipe or arrow keys). |
| Videos | Wide or vertical phone videos, sized automatically. YouTube links work too. |
| Reasons | Sticky notes she taps to flip and read. |
| Letter | Types itself out as she scrolls to it. Tapping the paper skips ahead. |
| Finale | "Will you stay with me for another month?" The No button runs away, then gives up. Yes sets off confetti and shows a final photo and message. |

Delete a name from `sections` in the config to hide a section, or reorder the names to reorder the page.

## Magic words

Type these inside any text in `config.js` and they fill themselves in:

| Word | Becomes |
|---|---|
| `{name}` | her name |
| `{me}` | your name |
| `{months}` / `{ordinalMonths}` | 6 / 6th (whole months together) |
| `{days}` | total days together |
| `{startDate}` | March 14, 2026 |
| `{age}` / `{ordinalAge}` | 24 / 24th (needs `birthday`) |
| `{year}` | this year |

### Birthday version

Set `birthday: "2002-10-25"` and use a title like `"Happy {ordinalAge} birthday, {name}"`.
You can also keep the monthsary title as the default and set `titleOnBirthday` /
`titleOnMonthsary`. Those only appear **on that exact day**, so one site covers both occasions.

### Preview another date

Add `?date=YYYY-MM-DD` to the address to pretend it's that day:

```
index.html?date=2026-11-14
```

Use it to check how the counter, the day-of titles and the "today is our monthsary" line look.

## Look and feel

- `theme`: `"strawberry"`, `"midnight"`, `"lavender"` or `"ocean"`.
- `colors`: tweak any color, e.g. `colors: { accent: "#e11d48" }`. Names you can override:
  `bg`, `bg2`, `ink`, `muted`, `accent`, `accent2`, `paper`, `paper-ink`, `tape`, `shadow`,
  `note-1` ... `note-4`.
- `floatingHearts: false` turns off the drifting background hearts.
- The page respects the "reduce motion" setting on phones and computers.

## Media tips (these save the most headaches)

- **Photos:** JPG, PNG or WebP. iPhone **HEIC** photos won't show in most browsers, so convert to JPG first.
  Shrink to about 1600 px on the long side (under 1 MB each) so the page loads fast on mobile data.
- **Videos:** use **.mp4** (H.264 + AAC). iPhone `.mov` files often fail in Chrome, so convert them.
  Keep each under roughly 50 MB.
- **YouTube:** paste a YouTube link as the `src` and it embeds. This only works when the site is served
  from a web address (see sharing below), not when opened as a file from your computer.
- **Music:** `.mp3`. Browsers block sound until someone taps, which is why it starts on the Open button.
  Videos with sound pause the song automatically and resume after.
- Keep file names simple: lowercase, no spaces (`beach-day.jpg`).

## Sharing it with her

Opening `index.html` on your own computer only works on your computer. To send her a link, upload the
whole folder to a free static host, for example:

- **Netlify Drop** (drag the folder into the page, get a link in seconds)
- **Cloudflare Pages**, **Vercel**, or **GitHub Pages**

Two things to know:

1. **Anyone with the link can open it**, and your photos are part of the site. Don't post the link
   publicly, and avoid putting the project in a public GitHub repository if the photos are private.
2. Test the link on her kind of phone and with mobile data before the big day.

Alternatives with no hosting: open it on your phone or laptop and show her in person (best for the
"Open it" moment), or screen-record the walkthrough.

## Files

```
index.html          page shell (don't need to edit)
css/style.css       the scrapbook look (optional tweaks)
js/config.js        <-- YOUR WORDS, DATES AND FILE NAMES GO HERE
js/app.js           builds the page from the config (don't need to edit)
assets/images/      your photos
assets/videos/      your videos
assets/music/       your song
```

## Troubleshooting

- **A photo shows the pink box:** the file name in `config.js` doesn't match the real file name
  (check spelling, capital letters, and the extension `.jpg` vs `.jpeg`).
- **Blank page:** a comma or quote went missing in `config.js`. Open the browser's developer tools
  (F12, Console tab) and it will point to the line.
- **No sound:** check the song file exists, and tap the round music button (bottom-right).
- **Fonts look plain:** the handwriting and heading fonts load from Google Fonts, so they need
  internet the first time. Everything else works offline.
