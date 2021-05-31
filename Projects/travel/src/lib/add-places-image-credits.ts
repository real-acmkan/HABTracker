export default (
  photo: {
    url: string;
    attribution?: string[];
  },
  page: Element
) => {
  if (photo.attribution) {
    const attributionContainer = document.createElement('div');
    attributionContainer.className = 'attribution-container';

    photo.attribution.forEach(attribution => {
      const creditElement = document.createElement('div');
      creditElement.innerHTML = 'Image by ' + attribution;
      const anchorChild = creditElement.firstElementChild as HTMLAnchorElement;
      anchorChild.className = 'attribution-link';
      anchorChild.target = '_blank';
      attributionContainer.appendChild(creditElement);
    });
    page.appendChild(attributionContainer);
  }
};
