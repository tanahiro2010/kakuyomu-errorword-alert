const tailwind: HTMLScriptElement = document.createElement('script');
tailwind.src = "//cdn.tailwindcss.com";

const head: HTMLHeadElement = document.head;
head.appendChild(tailwind);