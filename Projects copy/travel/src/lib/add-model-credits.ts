interface Credit {
  model: {
    name: string;
    link: string;
  };
  license: {
    name: string;
    link: string;
  };
  author: string;
}

export default function (attribution: Credit[], container: HTMLElement) {
  attribution.forEach((entity: Credit) => {
    const {model, author, license} = entity;
    const credit = document.createElement('div');
    container.appendChild(credit);
    credit.innerHTML = `<a class="attribution-link" target="_blank" href=${model.link}>${model.name}</a> by ${author} is licensed under <a class="attribution-link" target="_blank" href=${license.link}>${license.name}</a>`;
  });
}
