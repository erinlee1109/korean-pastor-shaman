// Price menu. Each card: colour chip, name, blurb, what's included, offering button.
import { COPY } from '../data/copy.js';
import { SERVICES } from '../data/services.js';
import { wonWords } from '../lib/ko.js';
import { zipLists, priceEntry } from '../lib/i18n.js';
import { stripe, chip } from '../render/motifs.js';

export default {
  id: 'services',
  mount(root, { t, go }) {
    const card = (s, i) => {
      const closed = s.status !== 'open';
      const tag = s.status === 'soldout' ? COPY.services.soldout : s.status === 'restricted' ? COPY.services.restricted : null;
      const includes = zipLists(s.includes);
      return `
        <article class="service ${closed ? 'is-closed' : ''}" data-id="${s.id}">
          ${stripe({ height: 10 })}
          <div class="service-body">
            ${s.badge ? `<span class="badge">${t(s.badge, {}, { inline: true })}</span>` : ''}
            <h2>${chip(i)}<span>${t(s.name)}</span></h2>
            <p class="blurb">${t(s.blurb)}</p>
            ${includes.length ? `<ul>${includes.map((x) => `<li>${t(x, {}, { inline: true })}</li>`).join('')}</ul>` : ''}
            <button class="btn price ${s.id === 'gift' ? 'btn-dark' : ''}" ${closed ? 'disabled' : ''} data-pay="${s.id}">
              ${t(priceEntry(s.price, wonWords))}
              ${tag ? `<span class="tag">${t(tag, {}, { inline: true })}</span>` : ''}
            </button>
          </div>
        </article>`;
    };
    root.innerHTML = `
      ${stripe({ height: 18, cls: 'edge-stripe' })}
      <section class="screen screen-services">
        <p class="kicker">${t(COPY.services.kicker, {}, { inline: true })}</p>
        <h1 class="display display-sm">${t(COPY.services.title)}</h1>
        <div class="services">${SERVICES.map(card).join('')}</div>
        <p class="fineprint">${t(COPY.services.note)}</p>
      </section>`;
    root.querySelectorAll('[data-pay]').forEach((b) => {
      b.onclick = () => {
        const s = SERVICES.find((x) => x.id === b.dataset.pay);
        if (s.flow) go(s.flow, { serviceId: s.id, flow: s.flow, signals: null, diagnosis: null });
      };
    });
  },
};
