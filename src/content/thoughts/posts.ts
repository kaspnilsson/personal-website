// Thoughts: the blog at /thoughts. Add a post by adding an entry here and a
// folder at src/content/thoughts/<slug>/ holding body.html (the post body as
// trusted HTML, without the title). Images go in public/assets/thoughts/<slug>/.
export type ThoughtPost = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  description: string;
  readingTime: string;
};

export const thoughtPosts: ThoughtPost[] = [
  {
    slug: "machine-learning-engineer-in-my-pocket",
    title: "I have a machine learning engineer in my pocket",
    date: "2026-11-20",
    description:
      "I built an iPhone keyboard trained on eight years of my own writing without writing a line of its code. Coding agents still work on it regularly.",
    readingTime: "5 min read, plus a technical appendix",
  },
  {
    slug: "own-your-ai-memories",
    title: "Stop Letting AI Companies Monetize Your Memories",
    date: "2026-03-09",
    description:
      "Every model I use reads from and writes to one knowledge graph on my own server, so my context follows me across Claude, GPT, Gemini and the rest.",
    readingTime: "6 min read",
  },
];
