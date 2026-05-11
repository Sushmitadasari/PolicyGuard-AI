export const findPrivacyLinks = () => {
  const keywords = [
    "privacy",
    "terms",
    "policy",
    "cookies",
    "legal",
    "security",
  ];

  const links = [...document.querySelectorAll("a")];

  const matchedLinks = links.filter((link) => {
    const text = link.innerText.toLowerCase();
    const href = link.href.toLowerCase();

    return keywords.some(
      (keyword) =>
        text.includes(keyword) ||
        href.includes(keyword)
    );
  });

  return matchedLinks;
};