export default function (domContainer: HTMLElement, rating: number) {
  for (let i = 0, nStars = Math.floor(rating); i < 5; i++) {
    const star = document.createElement('mwc-icon');
    if (i < nStars) {
      star.innerHTML = 'star';
    } else if (i === nStars) {
      const offset = rating - nStars;
      if (offset < 0.25) star.innerHTML = 'star_border';
      else if (offset < 0.75) star.innerHTML = 'star_half';
      else star.innerHTML = 'star';
    } else {
      star.innerHTML = 'star_border';
    }
    star.className = 'star-icon';
    domContainer.appendChild(star);
  }
}
