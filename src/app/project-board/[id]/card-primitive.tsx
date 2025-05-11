

'use client';

import React from 'react';
import styles from './card.module.scss';
import { State } from './card';
import { Person } from '.';
import {
	type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
type CardProps = {
  item: Person;
  closestEdge: Edge | null;
  state: State;
  ref?: React.Ref<HTMLDivElement>; // React 19 ref prop
};

export const CardPrimitive: React.FC<CardProps> = ({ item,ref }) => {
  const { name, role, userId } = item;

  return (
    <div ref={ref} className={styles.card} data-testid={`item-${userId}`}>
      <div className={styles.name}>{name}</div>
      <div className={styles.role}>{role}</div>
    </div>
  );
};