/**
 * Contenido de ayuda compartido entre la landing pública (/faq, /contact,
 * /characters) y su versión dentro del dashboard (ajustes › recursos), para
 * que un usuario con sesión no tenga que salir a la pantalla de inicio.
 */

export const FAQ_ITEMS = [
  ['title_what_is', 'text_what_is'],
  ['title_how_create_profile', 'text_how_create_profile'],
  ['title_how_unlock_characters', 'text_how_unlock_characters'],
  ['title_what_are_items', 'text_what_are_items'],
  ['title_can_interact_users', 'text_can_interact_users'],
  ['title_what_is_dashboard', 'text_what_is_dashboard'],
  ['title_what_are_series_cards', 'text_what_are_series_cards'],
  ['title_need_to_pay', 'text_need_to_pay'],
  ['title_how_report_bug', 'text_how_report_bug'],
  ['title_use_without_seen', 'text_use_without_seen'],
  ['title_special_events', 'text_special_events'],
] as const;

const AVATAR = '/landing/characters/avatars';

export const CREW = [
  {
    name: 'Monkey D. Luffy',
    key: 'luffy_text',
    images: [
      `${AVATAR}/luffy-happy-400.webp`,
      `${AVATAR}/luffy-700.webp`,
      `${AVATAR}/luffy-modal.webp`,
    ],
  },
  {
    name: 'Roronoa Zoro',
    key: 'zoro_text',
    images: [
      `${AVATAR}/zoro-happy-400.webp`,
      `${AVATAR}/zoro-700.webp`,
      `${AVATAR}/zoro-modal.webp`,
    ],
  },
  {
    name: 'Sanji',
    key: 'sanji_text',
    images: [
      `${AVATAR}/sanji-happy-400.webp`,
      `${AVATAR}/sanji-700.webp`,
      `${AVATAR}/sanji-modal.webp`,
    ],
  },
  {
    name: 'Nami',
    key: 'nami_text',
    images: [
      `${AVATAR}/nami-happy-400.webp`,
      `${AVATAR}/nami-700.webp`,
      `${AVATAR}/nami-modal.webp`,
    ],
  },
  {
    name: 'Usopp',
    key: 'usopp_text',
    images: [
      `${AVATAR}/usopp-happy-400.webp`,
      `${AVATAR}/usopp-700.webp`,
      `${AVATAR}/usopp-modal.webp`,
    ],
  },
  {
    name: 'Tony Tony Chopper',
    key: 'chopper_text',
    images: [
      `${AVATAR}/chopper-preskip-400.webp`,
      `${AVATAR}/chopper-700.webp`,
      `${AVATAR}/chopper-modal.webp`,
    ],
  },
  {
    name: 'Nico Robin',
    key: 'robin_text',
    images: [
      `${AVATAR}/robin-happy-400.webp`,
      `${AVATAR}/robin-700.webp`,
      `${AVATAR}/robin-modal.webp`,
    ],
  },
  {
    name: 'Brook',
    key: 'brook_text',
    images: [
      `${AVATAR}/brook-preskip-400.webp`,
      `${AVATAR}/brook-700.webp`,
      `${AVATAR}/brook-modal.webp`,
    ],
  },
  {
    name: 'Jinbe',
    key: 'jimbe_text',
    images: [
      `${AVATAR}/jimbe-preskip-400.webp`,
      `${AVATAR}/jimbe-700.webp`,
      `${AVATAR}/jimbe-modal.webp`,
    ],
  },
] as const;
