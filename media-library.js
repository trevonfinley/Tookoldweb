(function () {
  const fallbackImage = 'assets/images/dj-too-kold-thumb-720.jpg';
  const projectNeoConfig = window.ProjectNeoConfig || {};
  const apiBaseUrl = typeof projectNeoConfig.apiBaseUrl === 'string'
    ? projectNeoConfig.apiBaseUrl.replace(/\/+$/, '')
    : '';

  const localData = window.ProjectNeoMediaData || { mediaItems: [], mixes: [] };

  const mediaTypeLabels = {
    photos: 'Photos',
    videos: 'Videos',
    mixes: 'Mixes',
    flyers: 'Flyers',
    event_recaps: 'Event recaps',
    venue_shots: 'Venue shots',
    promo_images: 'Promo images',
    image: 'Photos',
    video: 'Videos',
    audio: 'Mixes'
  };

  const typeFromStorage = {
    image: 'photos',
    video: 'videos',
    audio: 'mixes'
  };

  const byDisplayOrder = (a, b) => {
    const orderA = Number.isFinite(a.displayOrder) ? a.displayOrder : 999;
    const orderB = Number.isFinite(b.displayOrder) ? b.displayOrder : 999;
    return orderA - orderB || String(a.title || '').localeCompare(String(b.title || ''));
  };

  const text = (value, fallback = '') => (
    typeof value === 'string' && value.trim() ? value.trim() : fallback
  );

  const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

  const firstRelation = (value) => {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  };

  const extractPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const formatType = (type) => mediaTypeLabels[type] || String(type || 'Media').replace(/_/g, ' ');

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds) => {
    const total = Number.parseInt(seconds, 10);
    if (!Number.isFinite(total) || total <= 0) return '';
    const minutes = Math.floor(total / 60);
    const remainder = String(total % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const normalizeMediaItem = (item) => {
    const event = firstRelation(item.events);
    const mediaType = text(item.media_category) || typeFromStorage[item.media_type] || text(item.mediaType, 'photos');
    const fileUrl = text(item.file_url) || text(item.fileUrl) || text(item.url);
    const thumbnailUrl = text(item.thumbnail_url) || text(item.thumbnailUrl) || fileUrl;

    return {
      id: text(item.id, text(item.slug, text(item.title))),
      title: text(item.title, 'Untitled media'),
      description: text(item.description) || text(item.caption),
      mediaType,
      fileUrl,
      thumbnailUrl,
      eventDate: text(item.event_date) || text(item.eventDate) || text(event && event.event_date),
      venue: text(item.venue) || text(item.venue_name) || text(item.venueName),
      tags: list(item.tags),
      featured: Boolean(item.is_featured ?? item.featured),
      displayOrder: Number.parseInt(item.display_order ?? item.displayOrder ?? item.sort_order, 10),
      sourceType: text(item.source_type, text(item.sourceType, fileUrl.startsWith('http') ? 'external' : 'local')),
      storageBucket: text(item.storage_bucket) || text(item.storageBucket),
      storagePath: text(item.storage_path) || text(item.storagePath),
      externalUrl: text(item.external_url) || text(item.externalUrl),
      embedUrl: text(item.embed_url) || text(item.embedUrl),
      provider: text(item.provider),
      altText: text(item.alt_text) || text(item.altText) || text(item.title, 'DJ Too Kold media'),
      layout: text(item.layout)
    };
  };

  const normalizeMix = (item) => ({
    id: text(item.id, text(item.slug, text(item.title))),
    title: text(item.title, 'Untitled mix'),
    description: text(item.description),
    mediaType: 'mixes',
    mixType: text(item.mix_type) || text(item.mixType) || text(item.platform, 'Featured mix'),
    fileUrl: text(item.file_url) || text(item.fileUrl) || text(item.audio_url) || text(item.audioUrl),
    audioUrl: text(item.audio_url) || text(item.audioUrl) || text(item.file_url) || text(item.fileUrl),
    embedUrl: text(item.embed_url) || text(item.embedUrl),
    externalUrl: text(item.external_url) || text(item.externalUrl),
    thumbnailUrl: text(item.thumbnail_url) || text(item.thumbnailUrl) || text(item.cover_image_url) || text(item.coverImageUrl) || fallbackImage,
    coverImageUrl: text(item.cover_image_url) || text(item.coverImageUrl) || text(item.thumbnail_url) || text(item.thumbnailUrl) || fallbackImage,
    eventDate: text(item.recorded_at) || text(item.event_date) || text(item.eventDate),
    venue: text(item.venue),
    durationSeconds: Number.parseInt(item.duration_seconds ?? item.durationSeconds, 10),
    platform: text(item.platform),
    tags: list(item.tags),
    featured: Boolean(item.is_featured ?? item.featured),
    displayOrder: Number.parseInt(item.display_order ?? item.displayOrder ?? item.sort_order, 10),
    sourceType: text(item.source_type) || text(item.sourceType, 'external'),
    provider: text(item.provider) || text(item.platform),
    altText: text(item.alt_text) || text(item.altText) || `${text(item.title, 'DJ Too Kold')} mix cover`
  });

  const createImage = (item, index) => {
    const image = document.createElement('img');
    const src = item.thumbnailUrl || item.fileUrl || item.coverImageUrl || fallbackImage;
    image.src = src;
    if (src.includes('dj-too-kold-thumb-720.jpg') || src.includes('dj-too-kold-hero-1400.jpg')) {
      image.srcset = 'assets/images/dj-too-kold-thumb-720.jpg 720w, assets/images/dj-too-kold-hero-1400.jpg 1400w';
      image.sizes = '(min-width: 760px) 33vw, 100vw';
    }
    image.alt = item.altText || item.title || 'DJ Too Kold media';
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.width = 720;
    image.height = 384;
    if (index === 0) image.setAttribute('fetchpriority', 'high');
    return image;
  };

  const createTags = (tags) => {
    const row = document.createElement('div');
    row.className = 'media-tags';
    list(tags).slice(0, 4).forEach((tag) => {
      const span = document.createElement('span');
      span.textContent = tag;
      row.append(span);
    });
    return row;
  };

  const createMeta = (...values) => {
    const visible = values.filter(Boolean);
    if (!visible.length) return null;
    const meta = document.createElement('p');
    meta.className = 'media-meta';
    meta.textContent = visible.join(' / ');
    return meta;
  };

  const createMediaCard = (item, index) => {
    const article = document.createElement('article');
    article.className = ['media-card', item.layout ? `media-card-${item.layout}` : ''].filter(Boolean).join(' ');

    const visual = document.createElement('div');
    visual.className = 'media-card-visual';
    visual.append(createImage(item, index));

    if (item.mediaType === 'videos') {
      const play = document.createElement('span');
      play.className = 'media-play';
      play.setAttribute('aria-hidden', 'true');
      visual.append(play);
    }

    const body = document.createElement('div');
    body.className = 'media-card-body';

    const label = document.createElement('p');
    label.className = 'mix-label';
    label.textContent = formatType(item.mediaType);

    const title = document.createElement('h3');
    title.textContent = item.title;

    const description = document.createElement('p');
    description.textContent = item.description;

    const meta = createMeta(formatDate(item.eventDate), item.venue);
    body.append(label, title, description);
    if (meta) body.append(meta);
    if (item.tags && item.tags.length) body.append(createTags(item.tags));

    article.append(visual, body);
    return article;
  };

  const createAudioShell = (mix) => {
    if (mix.embedUrl) {
      const frame = document.createElement('iframe');
      frame.className = 'audio-embed';
      frame.src = mix.embedUrl;
      frame.title = `${mix.title} audio embed`;
      frame.loading = 'lazy';
      frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      return frame;
    }

    if (mix.audioUrl) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'metadata';
      audio.src = mix.audioUrl;
      return audio;
    }

    const shell = document.createElement('div');
    shell.className = 'audio-shell';
    shell.setAttribute('role', 'img');
    shell.setAttribute('aria-label', `Audio preview for ${mix.title}`);
    shell.append(document.createElement('span'));
    return shell;
  };

  const createMixCard = (mix, index) => {
    const article = document.createElement('article');
    article.className = 'mix-card media-mix-card';

    const art = document.createElement('div');
    art.className = ['mix-art', index % 3 === 1 ? 'alt' : '', index % 3 === 2 ? 'third' : ''].filter(Boolean).join(' ');
    const image = createImage({ ...mix, thumbnailUrl: mix.coverImageUrl || mix.thumbnailUrl }, index);
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    art.append(image, number);

    const body = document.createElement('div');
    const label = document.createElement('p');
    label.className = 'mix-label';
    label.textContent = mix.mixType;
    const title = document.createElement('h3');
    title.textContent = mix.title;
    const description = document.createElement('p');
    description.textContent = mix.description;
    const meta = createMeta(formatDuration(mix.durationSeconds), mix.venue, mix.platform);

    body.append(label, title, description);
    if (meta) body.append(meta);
    if (mix.tags && mix.tags.length) body.append(createTags(mix.tags));
    body.append(createAudioShell(mix));
    article.append(art, body);
    return article;
  };

  const createVideoCard = (item, index) => {
    const article = document.createElement('article');
    article.className = 'video-card';

    const frameWrap = document.createElement('div');
    frameWrap.className = 'video-frame';

    if (item.embedUrl) {
      const frame = document.createElement('iframe');
      frame.src = item.embedUrl;
      frame.title = `${item.title} video`;
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frameWrap.append(frame);
    } else {
      frameWrap.append(createImage(item, index));
      const play = document.createElement('span');
      play.className = 'media-play';
      play.setAttribute('aria-hidden', 'true');
      frameWrap.append(play);
    }

    const body = document.createElement('div');
    body.className = 'media-card-body';
    const label = document.createElement('p');
    label.className = 'mix-label';
    label.textContent = formatType(item.mediaType);
    const title = document.createElement('h3');
    title.textContent = item.title;
    const description = document.createElement('p');
    description.textContent = item.description;
    const meta = createMeta(formatDate(item.eventDate), item.venue);
    body.append(label, title, description);
    if (meta) body.append(meta);
    article.append(frameWrap, body);
    return article;
  };

  const renderCards = (container, items, createCard) => {
    container.textContent = '';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'media-empty';
      empty.textContent = 'Media is being curated.';
      container.append(empty);
      return;
    }
    items.forEach((item, index) => container.append(createCard(item, index)));
  };

  const renderFeatured = (container, items) => {
    const featured = items.find((item) => item.featured) || items[0];
    container.textContent = '';
    if (!featured) return;

    const article = document.createElement('article');
    article.className = 'media-feature-card';

    const visual = document.createElement('div');
    visual.className = 'media-feature-visual';
    visual.append(createImage({ ...featured, thumbnailUrl: featured.fileUrl || featured.thumbnailUrl }, 0));

    const body = document.createElement('div');
    body.className = 'media-feature-body';
    const label = document.createElement('p');
    label.className = 'eyebrow';
    label.textContent = `Featured ${formatType(featured.mediaType)}`;
    const title = document.createElement('h2');
    title.textContent = featured.title;
    const description = document.createElement('p');
    description.className = 'lead';
    description.textContent = featured.description;
    const meta = createMeta(formatDate(featured.eventDate), featured.venue);
    body.append(label, title, description);
    if (meta) body.append(meta);
    if (featured.tags && featured.tags.length) body.append(createTags(featured.tags));

    article.append(visual, body);
    container.append(article);
  };

  const loadApiCollection = async (path) => {
    if (!apiBaseUrl) return [];
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, { headers: { Accept: 'application/json' } });
      const payload = await response.json().catch(() => null);
      if (!response.ok || (payload && payload.ok === false)) return [];
      return extractPayload(payload);
    } catch (error) {
      console.warn(`Project Neo media API unavailable for ${path}`, error);
      return [];
    }
  };

  const hydrateMedia = async () => {
    const apiItems = await loadApiCollection('/media?limit=60');
    const mediaItems = (apiItems.length ? apiItems : localData.mediaItems).map(normalizeMediaItem).sort(byDisplayOrder);

    const apiMixes = await loadApiCollection('/mixes?limit=24');
    const mixes = (apiMixes.length ? apiMixes : localData.mixes).map(normalizeMix).sort(byDisplayOrder);

    document.querySelectorAll('[data-media-featured]').forEach((container) => {
      renderFeatured(container, mediaItems);
    });

    document.querySelectorAll('[data-media-gallery]').forEach((container) => {
      const limit = Number.parseInt(container.dataset.limit, 10);
      const visible = mediaItems.filter((item) => item.mediaType !== 'mixes');
      renderCards(container, Number.isFinite(limit) ? visible.slice(0, limit) : visible, createMediaCard);
    });

    document.querySelectorAll('[data-video-list]').forEach((container) => {
      const videos = mediaItems.filter((item) => item.mediaType === 'videos');
      renderCards(container, videos, createVideoCard);
    });

    document.querySelectorAll('[data-recap-list]').forEach((container) => {
      const recaps = mediaItems.filter((item) => item.mediaType === 'event_recaps');
      renderCards(container, recaps, createMediaCard);
    });

    document.querySelectorAll('[data-mix-list], [data-mix-preview]').forEach((container) => {
      const limit = Number.parseInt(container.dataset.limit, 10);
      const visible = Number.isFinite(limit) ? mixes.slice(0, limit) : mixes;
      renderCards(container, visible, createMixCard);
    });
  };

  document.addEventListener('DOMContentLoaded', hydrateMedia);
})();
