/* ======================================================================
   THIS IS THE ONLY FILE YOU NEED TO EDIT.
   Everything on the page (words, dates, photos, videos, colors) is read
   from here. Save the file, refresh the browser, done.

   MEDIA: put photos in  assets/images/  and videos in  assets/videos/,
   then write their file names below, e.g.  "assets/images/us-at-the-beach.jpg"
   Until a file exists, the page shows a pink "your photo goes here" box,
   so you can build it up piece by piece.

   MAGIC WORDS: type these inside any text and they fill themselves in.
       {name}           her name                 {me}            your name
       {months}         6     (months together)  {ordinalMonths} 6th
       {days}           total days together      {startDate}    March 14, 2026
       {age}            24    (needs birthday)   {ordinalAge}    24th
       {year}           this year

   PREVIEW ANOTHER DAY: open index.html?date=2026-11-14 to see how the
   page looks on that day (great for checking the monthsary counter).
   ====================================================================== */

window.SITE_CONFIG = {

  /* 1. THE BASICS ---------------------------------------------------- */
  pageTitle: "For my honey bun",          // text shown on the browser tab
  herName:   "Ashleigh",              // <-- her name or nickname
  yourName:  "Kurt",           // <-- your name
  startDate: "2026-06-02",       // <-- the day you became a couple (YYYY-MM-DD)
                                 //     add a time for an exact counter: "2026-03-14T18:30"
  birthday:  "2006-11-18",                 // <-- her birthday, e.g. "2002-10-25" (optional)


  /* 2. LOOK ---------------------------------------------------------- */
  theme: "ocean",           // "strawberry" | "midnight" | "lavender" | "ocean"
  colors: {},                    // optional tweaks, e.g. { accent: "#e11d48", bg: "#fff1f2" }
  floatingHearts: true,          // soft hearts drifting in the background


  /* 3. MUSIC (optional) ---------------------------------------------- */
  // Plays after she taps the opening button. Put an .mp3 in assets/music/.
  // Remove the file (or set src: "") and the music button simply disappears.
  music: {
    src: "assets/music/music1.mp3",
    title: "Our song",
    volume: 0.5                  // 0 to 1
  },


  /* 4. OPENING SCREEN ------------------------------------------------ */
  gate: {
    enabled: true,               // false = jump straight into the page
    text:    "I made something for you, {name}.",
    button:  "Open it",
    hint:    "sound on, please"  // small handwritten line under the button ("" to hide)
  },


  /* 5. WHICH SECTIONS TO SHOW, AND IN WHAT ORDER ---------------------
     Delete a name to hide that section. Reorder them however you like. */
  sections: ["hero", "counter", "story", "gallery", "video", "reasons", "letter", "finale"],


  /* 6. TOP OF THE PAGE ---------------------------------------------- */
  hero: {
    eyebrow:  "for my favorite person",
    title:    "Happy {ordinalMonths} monthsary, {name}",
    // Optional: a different title that appears ONLY on that day.
    titleOnMonthsary: "",        // e.g. "It's our {ordinalMonths} monthsary!"
    titleOnBirthday:  "",        // e.g. "Happy {ordinalAge} birthday, {name}"
    subtitle: "I built this little corner of the internet just for you. Scroll slowly, there's a lot of us in here.",
    photo:        "assets/videos/video1.mp4",   // a photo OR a video (.mp4 plays silently on loop)
    photoCaption: "us, being us",
    cue:      "scroll"
  },


  /* 7. LIVE COUNTER (needs startDate) -------------------------------- */
  counter: {
    title:    "Time with you",
    subtitle: "and counting, every second",
    since:    "Since {startDate}",
    next:     "{n} {unit} until our next monthsary",   // {unit} becomes day / days
    today:    "Today is our monthsary!"
  },


  /* 8. OUR STORY ------------------------------------------------------
     Copy one { ... }, block to add a memory. Photo or video both work. */
  story: {
    title:    "How we got here",
    subtitle: "a few of my favorite chapters",
    items: [
      {
        date:  "February 7, 2026",
        title: "The day it started",
        text:  "I still remember how nervous I was. I rehearsed what to say the whole way there and then forgot every word the second I saw you.",
        media: "assets/images/image18.jpg",
        caption: "random photo, hii baby <3"
      },
      {
        date:  "February 14, 2026",
        title: "Our first real date",
        text:  "Bad directions, good food, convenient day timing, and a lot of laughs. I knew then that I wanted to see you again.",
        media: "assets/images/image48.jpg",
        caption: "worth getting lost for"
      },
      {
        date:  "April 2026",
        title: "A day of silliness",
        text:  "Nothing big happened. We were just two people being goofy together. I love that about us.",
        media: "assets/images/image8.jpg",
        caption: "that laugh"
      },
      {
        date:  "Last week",
        title: "Cute, and my favorite",
        text:  "Not a special occasion. Just a selfie of you, and how much it made me realize how lucky I am to have you in my life.",
        media: "assets/images/image47.jpg",
        caption: "a regular tuesday"
      }
    ]
  },


  /* 9. PHOTO WALL ---------------------------------------------------
     Tap a photo to open it full screen. Videos work here too.
     Add as many as you like; the wall arranges itself. */
  gallery: {
    title:    "Us, in pictures",
    subtitle: "tap any photo to see it bigger",
    items: [
      { src: "assets/images/image1.jpg"},
      { src: "assets/images/image5.jpg" },
      { src: "assets/images/image36.jpg" },
      { src: "assets/images/image31.jpg" },
      { src: "assets/images/image2.jpg" },
      { src: "assets/images/image3.jpg" },
      { src: "assets/images/image4.jpg" },
      { src: "assets/images/image6.jpg" },
      { src: "assets/images/image7.jpg" },
      { src: "assets/images/image8.jpg" },
      { src: "assets/images/image9.jpg" },
      { src: "assets/images/image11.jpg" },
      { src: "assets/images/image12.jpg" },
      { src: "assets/images/image10.jpg", caption: "plushiessss" },
      { src: "assets/images/image22.jpg" },
      { src: "assets/images/image23.jpg" },
      { src: "assets/images/image24.jpg" },
      { src: "assets/images/image25.jpg" },
      { src: "assets/images/image26.jpg" },
      { src: "assets/images/image27.jpg" },
      { src: "assets/images/image28.jpg" },
      { src: "assets/images/image29.jpg" },
      { src: "assets/images/image30.jpg" },
      { src: "assets/images/image32.jpg" },
      { src: "assets/images/image33.jpg" },
      { src: "assets/images/image34.jpg" },
      { src: "assets/images/image35.jpg" },
      { src: "assets/images/image37.jpg" },
      { src: "assets/images/image38.jpg" },
      { src: "assets/images/image39.jpg" },
      { src: "assets/images/image40.jpg" },
      { src: "assets/images/image41.jpg" },
      { src: "assets/images/image42.jpg" },
      { src: "assets/images/image43.jpg" },
      { src: "assets/images/image44.jpg" },
      { src: "assets/images/image45.jpg" },
      { src: "assets/images/image46.jpg" }
    ]
  },


  /* 10. VIDEOS ------------------------------------------------------
     Any .mp4 from your phone works, wide or vertical. The frame adjusts
     to the video's shape. A YouTube link also works (see README). */
  video: {
    title:    "A little film for you",
    subtitle: "press play",
    items: [
      { src: "assets/videos/video2.mp4", poster: "assets/images/video-poster.jpg", caption: "us, in motion" }
      // add more: { src: "assets/videos/another.mp4", caption: "..." },
    ]
  },


  /* 11. REASONS I LOVE YOU ------------------------------------------
     Each one is a sticky note she can tap to read. Add as many as you want. */
  reasons: {
    title:    "Reasons I love you",
    subtitle: "tap a note",
    noteLabel: "reason no.",
    tapLabel:  "tap to read",
    items: [
      "You laugh with your whole face.",
      "You make even the simplest days feel special.",
      "Even your little quirks make me smile.",
      "You make home feel like a person instead of a place.",
      "You believe in me on the days I forget to.",
      "I feel lucky just having you around.",
      "You make ordinary moments worth remembering.",
      "You make me want to be a better person.",
      "You make me feel like the luckiest person alive.",
      "You're beautiful even when you don't see it yourself.",
      "Because it's you. It's just you, and out of everyone in this world, you're the one I want beside me."
    ]
  },


  /* 12. LETTER ------------------------------------------------------
     Types itself out as she scrolls to it. Tapping the paper skips ahead.
     Each line in body is one paragraph. */
  letter: {
    title:      "A letter for you",
    typewriter: true,            // false = show all the text right away
    typingSpeed: 24,             // milliseconds per letter (higher = slower)
    greeting:   "Dear {name},",
    body: [
      "It has been {months} months and I still get a little excited every time I wake up beside you on vc. I didn't know it could feel this easy to be myself with someone.",
      "Thank you for being patient with me, for the sleep calls, for the way you make me feel seen, and for choosing me again every single day. I don't take any of it for granted.",
      "I can't promise a perfect month or a perfect year. I can promise I'll keep showing up, keep making you laugh, and keep falling for you in new ways."
    ],
    signoff:   "Always yours,",
    signature: "{me}"
  },


  /* 13. THE ENDING --------------------------------------------------- */
  finale: {
    title:   "I love you, {name}.",
    message: "Here's to another month. And another. And another.",

    // The question with a "No" button that runs away (and gives up after a few tries).
    question: {
      enabled:   true,           // false = a single surprise button instead
      text:      "Will you stay and be mine always?",
      yes:       "Yes",
      no:        "No",
      noRelents: "Okay, yes"     // what the "No" button says once it gives up
    },
    button: "Tap for a surprise", // used only when question.enabled is false

    // Shown after she taps Yes (all optional)
    reveal: {
      message: "Best answer. See you tomorrow, and the day after that.",
      media:   "assets/images/art.jpg",
      caption: "forever, minimum"
    }
  },


  /* 14. FOOTER ------------------------------------------------------- */
  footer: "made for you by {me}, {year}"
};
