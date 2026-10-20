import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { accessTo, canSeeTab, type Viewer } from './access.js';

const ownerId = '000000000000000000000001';

const owner = {
  _id: new ObjectId(ownerId),
  privacy: {
    showPosts: true,
    showLikes: false,
    showBookmarked: true,
    showComments: true,
  },
};

const anonymous: Viewer = { kind: 'anonymous' };
const other: Viewer = {
  kind: 'user',
  id: '000000000000000000000002',
  role: 'user',
};
const self: Viewer = { kind: 'user', id: ownerId, role: 'user' };
const admin: Viewer = {
  kind: 'user',
  id: '000000000000000000000003',
  role: 'admin',
};

describe('accessTo', () => {
  it.each([
    ['un anónimo', 'public', anonymous],
    ['otro usuario', 'public', other],
    ['el dueño', 'full', self],
    ['un admin', 'full', admin],
  ] as const)('%s tiene acceso %s al perfil', (_, expected, viewer) => {
    expect(accessTo(viewer, ownerId)).toBe(expected);
  });
});

describe('canSeeTab', () => {
  it.each([
    ['un anónimo', false, anonymous],
    ['otro usuario', false, other],
    ['el dueño', true, self],
    ['un admin', true, admin],
  ] as const)('en una pestaña privada, %s la ve: %s', (_, expected, viewer) => {
    expect(canSeeTab(viewer, owner, 'showLikes')).toBe(expected);
  });

  it.each([
    ['un anónimo', anonymous],
    ['otro usuario', other],
    ['el dueño', self],
    ['un admin', admin],
  ] as const)('una pestaña visible la ve %s', (_, viewer) => {
    expect(canSeeTab(viewer, owner, 'showPosts')).toBe(true);
  });
});
